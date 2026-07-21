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


def patch_inline_js() -> None:
    path = ROOT / "inline-writing.js"
    text = path.read_text(encoding="utf-8")

    if "  function findChoiceLabelSequenceMatches(" not in text:
        text = text.replace(
            "  function lineStartAt(text, index) {",
            "  " + CHOICE_LABEL_SEQUENCE_HELPER + "function lineStartAt(text, index) {",
            1,
        )

    line_skip = "      if (/\\b[A-F]\\.(?:\\s*[A-F]\\.){1,5}\\s*$/.test(line)) continue;"
    if line_skip not in text:
        text = text.replace(
            "      if (/[\\u25a1\\uf0a8]/.test(line)) continue;",
            "      if (/[\\u25a1\\uf0a8]/.test(line)) continue;\n" + line_skip,
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

    path.write_text(text, encoding="utf-8")


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    if "inline-writing.js?v=16" not in text:
        text = text.replace("inline-writing.js?v=15", "inline-writing.js?v=16", 1)
        text = text.replace("inline-writing.js?v=14", "inline-writing.js?v=16", 1)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    patch_inline_js()
    patch_index()


if __name__ == "__main__":
    main()
