from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise RuntimeError(f"Could not patch {label}")
    return text.replace(old, new, 1)


CHOICE_ROW_HELPERS = r'''function lineStartAt(text, index) {
    return text.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
  }

  function isLeadingChoiceEllipsis(text, index) {
    const prefix = text.slice(lineStartAt(text, index), index);
    return /^\s*\d+[a-z]\.\s*$/i.test(prefix);
  }

  function choiceLabelsForText(text) {
    const labels = [];
    const firstItem = text.search(/^\s*\d+[a-z]\./im);
    const headerText = firstItem >= 0 ? text.slice(0, firstItem) : text;
    const choiceLinePattern = /^\s*([A-F](?:\s+[A-F]){1,5})\s*$/gm;
    let match;

    while ((match = choiceLinePattern.exec(headerText)) !== null) {
      match[1].split(/\s+/).forEach((label) => {
        if (!labels.includes(label)) labels.push(label);
      });
    }

    if (labels.length === 0) {
      const rangeMatch = text.match(/\b([A-F])\s*-\s*([A-F])\b/);
      if (rangeMatch) {
        const start = rangeMatch[1].charCodeAt(0);
        const end = rangeMatch[2].charCodeAt(0);
        for (let code = start; code <= end; code += 1) {
          labels.push(String.fromCharCode(code));
        }
      }
    }

    return labels;
  }

  function shouldGenerateChoiceRows(text) {
    return /\b(?:croix|cochez|relie|associe|case)\b/i.test(text) || /Σημείωσε\s+με\s+x/i.test(text);
  }

  function findGeneratedChoiceGroupMatches(sourceText) {
    if (!shouldGenerateChoiceRows(sourceText)) return [];

    const choices = choiceLabelsForText(sourceText);
    if (choices.length < 2) return [];

    const matches = [];
    const itemPattern = /^\s*\d+[a-z]\.\s+.+$/gmi;
    let match;

    while ((match = itemPattern.exec(sourceText)) !== null) {
      const line = match[0];
      if (/[\u25a1\uf0a8\u2751]/.test(line)) continue;
      if (/\b[A-F]\.(?:\s*[A-F]\.){1,5}\s*$/.test(line)) continue;
      matches.push({
        type: "choiceGroup",
        token: "",
        index: match.index + line.length,
        choices
      });
    }

    return matches;
  }

  '''


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


CHOICE_GROUP_CREATOR = r'''function createInlineChoiceGroup(textBlock, prefix, rowNumber, choices) {
    const group = document.createElement("span");
    group.className = "inline-choice-group";

    choices.forEach((choice) => {
      const option = document.createElement("label");
      option.className = "inline-choice-option";
      option.append(document.createTextNode(`${choice}.`));

      const fieldKey = `${prefix}${INLINE_CHOICE_TOKEN}${rowNumber}_${choice}`;
      const checkbox = createInlineChoiceField(textBlock, fieldKey, choice, rowNumber);
      const input = checkbox.querySelector("input");

      input.addEventListener("change", () => {
        if (!input.checked) return;

        group.querySelectorAll(".inline-choice-checkbox").forEach((otherInput) => {
          if (otherInput === input) return;
          otherInput.checked = false;
          writeInlineAnswer(paperIdFor(otherInput), otherInput.dataset.field, false);
        });
      });

      option.append(checkbox);
      group.append(document.createTextNode(" "), option);
    });

    return group;
  }

  '''


CHOICE_GROUP_CSS = r'''
.activity-writing-sheet .inline-choice-group {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 5px;
  margin-left: 8px;
  white-space: normal;
}

.activity-writing-sheet .inline-choice-option {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #10203f;
  font-weight: 800;
  cursor: pointer;
}
'''


def patch_inline_js() -> None:
    path = ROOT / "inline-writing.js"
    text = path.read_text(encoding="utf-8")

    text = replace_once(
        text,
        '''      if (/^[.\\u2026]+$/.test(token)) {
        return Boolean(next && !/\\s/.test(next) && (!previous || /\\s/.test(previous)));
      }''',
        '''      if (/^[.\\u2026]+$/.test(token) && isLeadingChoiceEllipsis(sourceText, index)) {
        return false;
      }

      if (/^[.\\u2026]+$/.test(token)) {
        return Boolean(next && !/\\s/.test(next) && (!previous || /\\s/.test(previous)));
      }''',
        "choice ellipsis filter",
    )

    if "  function findGeneratedChoiceGroupMatches(" not in text:
      text = text.replace("  function findInlineWritableMatches(sourceText) {", "  " + CHOICE_ROW_HELPERS + "function findInlineWritableMatches(sourceText) {", 1)

    if "  function findChoiceLabelSequenceMatches(" not in text:
      text = text.replace("  function lineStartAt(text, index) {", "  " + CHOICE_LABEL_SEQUENCE_HELPER + "function lineStartAt(text, index) {", 1)

    if "      ...findChoiceLabelSequenceMatches(sourceText)," not in text:
      current_generated = '''      ...findWritableBlankMatches(sourceText),
      ...findChoiceSquareMatches(sourceText),
      ...findGeneratedChoiceGroupMatches(sourceText)'''
      current_basic = '''      ...findWritableBlankMatches(sourceText),
      ...findChoiceSquareMatches(sourceText)'''
      next_matches = '''      ...findWritableBlankMatches(sourceText),
      ...findChoiceSquareMatches(sourceText),
      ...findChoiceLabelSequenceMatches(sourceText),
      ...findGeneratedChoiceGroupMatches(sourceText)'''

      if current_generated in text:
        text = text.replace(current_generated, next_matches, 1)
      else:
        text = replace_once(text, current_basic, next_matches, "generated choice matches")

    if "  function createInlineChoiceGroup(" not in text:
      text = text.replace("  function enhanceInlineBlanks(root = document) {", "  " + CHOICE_GROUP_CREATOR + "function enhanceInlineBlanks(root = document) {", 1)

    text = replace_once(
        text,
        "      let choiceNumber = 0;",
        "      let choiceNumber = 0;\n      let choiceGroupNumber = 0;",
        "choice group counter",
    )

    text = replace_once(
        text,
        '''        if (match.type === "choice") {
          choiceNumber += 1;
          const fieldKey = `${prefix}${INLINE_CHOICE_TOKEN}${choiceNumber}`;
          textBlock.append(createInlineChoiceField(textBlock, fieldKey, match.optionLabel, choiceNumber));
        } else {''',
        '''        if (match.type === "choiceGroup") {
          choiceGroupNumber += 1;
          textBlock.append(createInlineChoiceGroup(textBlock, prefix, choiceGroupNumber, match.choices));
        } else if (match.type === "choice") {
          choiceNumber += 1;
          const fieldKey = `${prefix}${INLINE_CHOICE_TOKEN}${choiceNumber}`;
          textBlock.append(createInlineChoiceField(textBlock, fieldKey, match.optionLabel, choiceNumber));
        } else {''',
        "choice group render",
    )

    path.write_text(text, encoding="utf-8")


def patch_css() -> None:
    path = ROOT / "inline-writing.css"
    text = path.read_text(encoding="utf-8")
    if ".inline-choice-group" not in text:
        text = text.replace("\n.activity-writing-sheet .activity-media-grid {", CHOICE_GROUP_CSS + "\n.activity-writing-sheet .activity-media-grid {", 1)
    path.write_text(text, encoding="utf-8")


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    if "inline-writing.css?v=15" not in text:
        text = text.replace("inline-writing.css?v=14", "inline-writing.css?v=15", 1)
    if "inline-writing.js?v=16" not in text:
        text = text.replace("inline-writing.js?v=15", "inline-writing.js?v=16", 1)
        text = text.replace("inline-writing.js?v=14", "inline-writing.js?v=16", 1)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    patch_inline_js()
    patch_css()
    patch_index()


if __name__ == "__main__":
    main()
