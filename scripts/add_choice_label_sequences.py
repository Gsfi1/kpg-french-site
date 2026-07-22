from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


CHOICE_LABEL_SEQUENCE_HELPER = r'''function findChoiceLabelSequenceMatches(sourceText) {
    const matches = [];
    const pattern = /(^|[ \t])((?:[A-F]\.[ \t]*){2,6})(?=$|\r?\n)/gm;
    let match;

    while ((match = pattern.exec(sourceText)) !== null) {
      const token = match[2];
      const choices = Array.from(token.matchAll(/[A-F](?=\.)/g)).map((choiceMatch) => choiceMatch[0]);
      if (choices.length < 2) continue;

      matches.push({
        type: "choiceGroup",
        token,
        index: match.index + match[1].length,
        choices
      });
    }

    return matches;
  }

  '''


CHOICE_HEADER_LINE_HELPER = r'''function findChoiceHeaderLineMatches(sourceText) {
    const matches = [];
    const labelMap = {
      Α: "A",
      Β: "B",
      Γ: "C",
      Δ: "D",
      Ε: "E",
      Ζ: "F"
    };
    const linePattern = /[^\n]*(?:\n|$)/g;
    let block = [];

    const flushBlock = () => {
      if (block.length === 0) return;

      const labels = block.flatMap((line) => line.labels);
      const uniqueLabels = new Set(labels);
      const shouldRemove = uniqueLabels.size >= 2 && (block.length > 1 || labels.length > 1);
      if (shouldRemove) {
        matches.push({
          type: "remove",
          token: block.map((line) => line.token).join(""),
          index: block[0].index
        });
      }

      block = [];
    };

    let match;
    while ((match = linePattern.exec(sourceText)) !== null) {
      const token = match[0];
      if (!token) break;

      const content = token.replace(/\r?\n$/, "");
      const labelMatches = Array.from(content.matchAll(/[A-FΑΒΓΔΕΖ]\.?/g));
      const isChoiceOnlyLine = labelMatches.length > 0 && content.replace(/[A-FΑΒΓΔΕΖ]\.?/g, "").trim() === "";

      if (isChoiceOnlyLine) {
        block.push({
          token,
          index: match.index,
          labels: labelMatches.map((labelMatch) => labelMap[labelMatch[0].replace(".", "")] ?? labelMatch[0].replace(".", ""))
        });
      } else {
        flushBlock();
      }
    }

    flushBlock();

    return matches;
  }

  '''


def patch_inline_js() -> None:
    path = ROOT / "inline-writing.js"
    text = path.read_text(encoding="utf-8")

    if "  function findChoiceLabelSequenceMatches(" not in text:
        text = text.replace(
            "  function lineStartAt(text, index) {",
            "  " + CHOICE_LABEL_SEQUENCE_HELPER + "function lineStartAt(text, index) {",
            1,
        )

    if "  function findChoiceHeaderLineMatches(" not in text:
        text = text.replace(
            "  function lineStartAt(text, index) {",
            "  " + CHOICE_HEADER_LINE_HELPER + "function lineStartAt(text, index) {",
            1,
        )
    elif "const labelMap = {" not in text:
        start = text.index("  function findChoiceHeaderLineMatches(")
        end = text.index("  function lineStartAt(text, index) {", start)
        text = text[:start] + "  " + CHOICE_HEADER_LINE_HELPER + text[end:]

    text = text.replace(
        "      if (/[\\u25a1\\uf0a8]/.test(line)) continue;",
        "      if (/[\\u25a1\\uf0a8\\u2751]/.test(line)) continue;",
        1,
    )

    line_skip = "      if (/\\b[A-F]\\.(?:\\s*[A-F]\\.){1,5}\\s*$/.test(line)) continue;"
    if line_skip not in text:
        text = text.replace(
            "      if (/[\\u25a1\\uf0a8\\u2751]/.test(line)) continue;",
            "      if (/[\\u25a1\\uf0a8\\u2751]/.test(line)) continue;\n" + line_skip,
            1,
        )

    if "      ...findChoiceLabelSequenceMatches(sourceText)," not in text:
        text = text.replace(
            '''      ...findWritableBlankMatches(sourceText),
      ...findChoiceSquareMatches(sourceText),
      ...findGeneratedChoiceGroupMatches(sourceText)''',
            '''      ...findWritableBlankMatches(sourceText),
      ...findChoiceSquareMatches(sourceText),
      ...findChoiceLabelSequenceMatches(sourceText),
      ...findGeneratedChoiceGroupMatches(sourceText)''',
            1,
        )

    if "const blankMatches = findWritableBlankMatches(sourceText);" not in text:
        text = text.replace(
            '''  function findInlineWritableMatches(sourceText) {
    const orderedMatches = [
      ...findWritableBlankMatches(sourceText),
      ...findChoiceSquareMatches(sourceText),
      ...findChoiceLabelSequenceMatches(sourceText),
      ...findGeneratedChoiceGroupMatches(sourceText)
    ].sort((left, right) => left.index - right.index || right.token.length - left.token.length);''',
            '''  function findInlineWritableMatches(sourceText) {
    const blankMatches = findWritableBlankMatches(sourceText);
    const squareMatches = findChoiceSquareMatches(sourceText);
    const labelSequenceMatches = findChoiceLabelSequenceMatches(sourceText);
    const generatedChoiceMatches = findGeneratedChoiceGroupMatches(sourceText);
    const removeMatches = [...squareMatches, ...labelSequenceMatches, ...generatedChoiceMatches].some((match) => match.type === "choiceGroup" || match.type === "choice")
      ? findChoiceHeaderLineMatches(sourceText)
      : [];

    const orderedMatches = [
      ...blankMatches,
      ...squareMatches,
      ...labelSequenceMatches,
      ...generatedChoiceMatches,
      ...removeMatches
    ].sort((left, right) => left.index - right.index || right.token.length - left.token.length);''',
            1,
        )

    if '        } else if (match.type === "remove") {' not in text:
        text = text.replace(
            '''        } else if (match.type === "choice") {
          choiceNumber += 1;
          const fieldKey = `${prefix}${INLINE_CHOICE_TOKEN}${choiceNumber}`;
          textBlock.append(createInlineChoiceField(textBlock, fieldKey, match.optionLabel, choiceNumber));
        } else {''',
            '''        } else if (match.type === "choice") {
          choiceNumber += 1;
          const fieldKey = `${prefix}${INLINE_CHOICE_TOKEN}${choiceNumber}`;
          textBlock.append(createInlineChoiceField(textBlock, fieldKey, match.optionLabel, choiceNumber));
        } else if (match.type === "remove") {
          // Remove standalone A/B/C header rows once the choices are interactive.
        } else {''',
            1,
        )

    path.write_text(text, encoding="utf-8")


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    if "inline-writing.js?v=19" not in text:
        text = text.replace("inline-writing.js?v=18", "inline-writing.js?v=19", 1)
        text = text.replace("inline-writing.js?v=17", "inline-writing.js?v=19", 1)
        text = text.replace("inline-writing.js?v=16", "inline-writing.js?v=19", 1)
        text = text.replace("inline-writing.js?v=15", "inline-writing.js?v=19", 1)
        text = text.replace("inline-writing.js?v=14", "inline-writing.js?v=19", 1)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    patch_inline_js()
    patch_index()


if __name__ == "__main__":
    main()
