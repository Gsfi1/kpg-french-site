from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def patch_between(text: str, start: str, end: str, replacement: str, label: str) -> str:
    start_index = text.find(start)
    end_index = text.find(end, start_index)
    if start_index < 0 or end_index < 0:
        raise RuntimeError(f"Could not patch {label}")
    return text[:start_index] + replacement + text[end_index:]


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise RuntimeError(f"Could not patch {label}")
    return text.replace(old, new, 1)


def bump_once(text: str, old: str, new: str) -> str:
    if new in text:
        return text
    return text.replace(old, new, 1)


INLINE_MATCH_HELPERS = r'''function findWritableBlankMatches(sourceText) {
    const matches = sourceText.matchAll(/(?:\.{3,}|\u2026+|_{3,}|[\u25a1\uf0a8\u2751]{2,})/g);

    return Array.from(matches).filter((match) => {
      const token = match[0];
      const index = match.index ?? 0;
      const previous = index > 0 ? sourceText[index - 1] : "";
      const next = sourceText[index + token.length] || "";

      if (/^[.\u2026]+$/.test(token)) {
        return Boolean(next && !/\s/.test(next) && (!previous || /\s/.test(previous)));
      }

      return true;
    }).map((match) => ({
      type: "blank",
      token: match[0],
      index: match.index ?? 0
    }));
  }

  function findChoiceSquareMatches(sourceText) {
    const matches = [];
    const pattern = /\b([A-F])\.?([ \t]*)[\u25a1\uf0a8\u2751]/g;
    let match;

    while ((match = pattern.exec(sourceText)) !== null) {
      const index = match.index + match[0].length - 1;
      matches.push({
        type: "choice",
        token: sourceText[index],
        index,
        optionLabel: match[1]
      });
    }

    return matches;
  }

  function findInlineWritableMatches(sourceText) {
    const orderedMatches = [
      ...findWritableBlankMatches(sourceText),
      ...findChoiceSquareMatches(sourceText)
    ].sort((left, right) => left.index - right.index || right.token.length - left.token.length);

    let lastEnd = -1;
    return orderedMatches.filter((match) => {
      if (match.index < lastEnd) return false;
      lastEnd = match.index + match.token.length;
      return true;
    });
  }

  '''


CHOICE_FIELDS = r'''function isCheckedValue(value) {
    return value === true || value === "true" || value === "1" || value === "x";
  }

  function createInlineChoiceField(textBlock, fieldKey, optionLabel, choiceNumber) {
    const paperId = paperIdFor(textBlock);
    const label = document.createElement("label");
    label.className = "inline-choice-slot";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "answer-field inline-choice-checkbox";
    input.dataset.field = fieldKey;
    input.checked = isCheckedValue(readInlineAnswer(paperId, fieldKey));
    input.setAttribute("aria-label", `Choice ${optionLabel || choiceNumber}`);

    const save = () => writeInlineAnswer(paperIdFor(input) || paperId, fieldKey, input.checked);
    input.addEventListener("change", save);

    label.append(input);
    return label;
  }

  '''


ENHANCE_INLINE = r'''function enhanceInlineBlanks(root = document) {
    root.querySelectorAll(".prompt-text.activity-text").forEach((textBlock, blockIndex) => {
      if (textBlock.dataset.inlineBlanksReady) return;

      const sourceText = textBlock.textContent ?? "";
      const inlineMatches = findInlineWritableMatches(sourceText);

      if (inlineMatches.length === 0) {
        textBlock.dataset.inlineBlanksReady = "none";
        return;
      }

      const prefix = inlineFieldPrefix(textBlock, blockIndex);
      let lastIndex = 0;
      let blankNumber = 0;
      let choiceNumber = 0;

      textBlock.textContent = "";
      textBlock.dataset.inlineBlanksReady = "true";

      inlineMatches.forEach((match) => {
        const { token, index } = match;

        if (index > lastIndex) {
          textBlock.append(document.createTextNode(sourceText.slice(lastIndex, index)));
        }

        if (match.type === "choice") {
          choiceNumber += 1;
          const fieldKey = `${prefix}${INLINE_CHOICE_TOKEN}${choiceNumber}`;
          textBlock.append(createInlineChoiceField(textBlock, fieldKey, match.optionLabel, choiceNumber));
        } else {
          blankNumber += 1;
          const fieldKey = `${prefix}${INLINE_FIELD_TOKEN}${blankNumber}`;
          textBlock.append(createInlineBlankField(textBlock, fieldKey, token, blankNumber));
        }

        lastIndex = index + token.length;
      });

      if (lastIndex < sourceText.length) {
        textBlock.append(document.createTextNode(sourceText.slice(lastIndex)));
      }
    });
  }

  '''


CHOICE_CSS = r'''
.activity-writing-sheet .inline-choice-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  min-height: 18px;
  margin: 0 5px 0 2px;
  vertical-align: -3px;
  cursor: pointer;
}

.activity-writing-sheet .inline-choice-checkbox {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--blue);
  cursor: pointer;
}

.activity-writing-sheet .inline-choice-checkbox:focus-visible {
  outline: 2px solid rgba(212, 61, 75, 0.75);
  outline-offset: 2px;
}
'''


def patch_inline_js() -> None:
    path = ROOT / "inline-writing.js"
    text = path.read_text(encoding="utf-8")

    text = replace_once(
        text,
        '  const INLINE_FIELD_TOKEN = "_blank_";',
        '  const INLINE_FIELD_TOKEN = "_blank_";\n  const INLINE_CHOICE_TOKEN = "_choice_";',
        "choice token",
    )

    if "function isInlineFieldKey(fieldKey)" not in text:
        text = replace_once(
            text,
            "    writeAnswers(answers);\n  }\n\n  function allowFullStorageReplace",
            "    writeAnswers(answers);\n  }\n\n  function isInlineFieldKey(fieldKey) {\n    return fieldKey.includes(INLINE_FIELD_TOKEN) || fieldKey.includes(INLINE_CHOICE_TOKEN);\n  }\n\n  function allowFullStorageReplace",
            "inline field helper",
        )

    text = replace_once(
        text,
        "        if (!fieldKey.includes(INLINE_FIELD_TOKEN)) return;",
        "        if (!isInlineFieldKey(fieldKey)) return;",
        "storage guard",
    )

    text = patch_between(
        text,
        "  function findWritableBlankMatches(sourceText) {",
        "  function inlineFieldPrefix(textBlock, fallbackIndex) {",
        "  " + INLINE_MATCH_HELPERS,
        "inline writable matches",
    )

    if "  function createInlineChoiceField(" not in text:
        text = replace_once(
            text,
            "    return input;\n  }\n\n  function enhanceInlineBlanks",
            "    return input;\n  }\n\n  " + CHOICE_FIELDS + "function enhanceInlineBlanks",
            "choice field creator",
        )

    text = patch_between(
        text,
        "  function enhanceInlineBlanks(root = document) {",
        "  function enhanceActivityAnswerFields(root = document) {",
        "  " + ENHANCE_INLINE,
        "enhance inline blanks",
    )

    path.write_text(text, encoding="utf-8")


def patch_css() -> None:
    path = ROOT / "inline-writing.css"
    text = path.read_text(encoding="utf-8")
    if ".inline-choice-slot" not in text:
        text = text.replace(
            "\n.activity-writing-sheet .activity-media-grid {",
            CHOICE_CSS + "\n.activity-writing-sheet .activity-media-grid {",
            1,
        )
    path.write_text(text, encoding="utf-8")


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    text = bump_once(text, "inline-writing.css?v=13", "inline-writing.css?v=14")
    text = bump_once(text, "inline-writing.css?v=12", "inline-writing.css?v=14")
    text = bump_once(text, "inline-writing.js?v=13", "inline-writing.js?v=14")
    text = bump_once(text, "inline-writing.js?v=12", "inline-writing.js?v=14")
    path.write_text(text, encoding="utf-8")


def main() -> None:
    patch_inline_js()
    patch_css()
    patch_index()


if __name__ == "__main__":
    main()
