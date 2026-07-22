from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


INLINE_WRITABLE_HELPER = (
    "  function hasInlineWritableFields(textBlock) {\n"
    "    return Boolean(textBlock.querySelector(\".inline-answer-slot, .inline-choice-checkbox, .inline-match-slot\"));\n"
    "  }\n\n"
)


PROMPT_FONT_CSS = r'''
.fill-jump {
  display: none !important;
}

.prompt-box > details:not(:has(.activity-answer-block)),
.prompt-box .activity-card:not(:has(.activity-answer-block)) {
  display: none !important;
}

.paper-card,
.prompt-box,
.prompt-text,
.activity-writing-sheet,
.activity-writing-sheet .prompt-text,
.activity-title,
.section-label {
  font-family: var(--app-font) !important;
  letter-spacing: 0 !important;
  word-spacing: normal;
  font-kerning: normal;
  text-rendering: optimizeLegibility;
}

.activity-writing-sheet .prompt-text {
  font-size: 0.95rem;
  line-height: 1.55;
}
'''


HIDE_NON_ANSWER_CARDS_HELPER = r'''  function hideNonAnswerPromptCards(root = document) {
    root.querySelectorAll(".prompt-box > details, .prompt-box .activity-card").forEach((card) => {
      if (card.querySelector(".activity-answer-block")) return;
      card.hidden = true;
      card.style.setProperty("display", "none", "important");
    });
  }

'''


def patch_cleanup() -> None:
    path = ROOT / "page-header-cleanup.js"
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        'if (!textBlock.querySelector(".inline-answer-slot")) {',
        'if (!textBlock.querySelector(".inline-answer-slot, .inline-choice-checkbox")) {',
        1,
    )
    if "function hideNonAnswerPromptCards" not in text:
        text = text.replace(
            "  function startCleanup() {",
            HIDE_NON_ANSWER_CARDS_HELPER + "  function startCleanup() {",
            1,
        )
    text = text.replace(
        "    cleanTrailingHeaders(target);\n",
        "    cleanTrailingHeaders(target);\n    hideNonAnswerPromptCards(target);\n",
        1,
    )
    text = text.replace(
        "          cleanTrailingHeaders(paperList);\n",
        "          cleanTrailingHeaders(paperList);\n          hideNonAnswerPromptCards(paperList);\n",
        1,
    )
    path.write_text(text, encoding="utf-8")


def patch_prompt_font_css() -> None:
    path = ROOT / "inline-writing.css"
    text = path.read_text(encoding="utf-8")
    if ".fill-jump" not in text:
        text = text.rstrip() + "\n\n" + PROMPT_FONT_CSS.strip() + "\n"
    path.write_text(text, encoding="utf-8")


def patch_inline_reprocess() -> None:
    path = ROOT / "inline-writing.js"
    text = path.read_text(encoding="utf-8")

    if "function hasInlineWritableFields(textBlock)" not in text:
        if "  function cleanTrailingPageHeaders(root = document) {" in text:
            text = text.replace(
                "  function cleanTrailingPageHeaders(root = document) {",
                INLINE_WRITABLE_HELPER + "  function cleanTrailingPageHeaders(root = document) {",
                1,
            )
        else:
            text = text.replace(
                "  function enhanceInlineBlanks(root = document) {",
                INLINE_WRITABLE_HELPER + "  function enhanceInlineBlanks(root = document) {",
                1,
            )

    text = text.replace(
        '      if (textBlock.dataset.inlineBlanksReady === "true") return;',
        '      if (textBlock.dataset.inlineBlanksReady === "true" && hasInlineWritableFields(textBlock)) return;',
        1,
    )

    text = text.replace(
        '      if (textBlock.dataset.inlineBlanksReady) return;\n\n'
        '      const sourceText = textBlock.textContent ?? "";\n'
        '      const inlineMatches = findInlineWritableMatches(sourceText);\n\n'
        '      if (inlineMatches.length === 0) {',
        '      const readyState = textBlock.dataset.inlineBlanksReady;\n'
        '      if (readyState && (readyState !== "true" || hasInlineWritableFields(textBlock))) return;\n\n'
        '      const sourceText = textBlock.textContent ?? "";\n'
        '      const inlineMatches = findInlineWritableMatches(sourceText);\n'
        '      const hasWritableMatches = inlineMatches.some((match) => match.type !== "remove");\n\n'
        '      if (inlineMatches.length === 0 || !hasWritableMatches) {',
        1,
    )

    if "const bareItemPattern = /(^|[ \\t\\n])(\\d{1,2}[a-z])(?=\\s|$)/gm;" not in text:
        text = text.replace(
            "    const itemPattern = /\\bItem\\s+(\\d{1,2}[a-z]?)\\b/gi;\n"
            "    while ((match = itemPattern.exec(sourceText)) !== null) {\n"
            "      addMatch(match.index + match[0].length, match[1]);\n"
            "    }\n\n"
            "    return matches.length >= 2 ? matches : [];",
            "    const itemPattern = /\\bItem\\s+(\\d{1,2}[a-z]?)\\b/gi;\n"
            "    while ((match = itemPattern.exec(sourceText)) !== null) {\n"
            "      addMatch(match.index + match[0].length, match[1]);\n"
            "    }\n\n"
            "    const bareItemPattern = /(^|[ \\t\\n])(\\d{1,2}[a-z])(?=\\s|$)/gm;\n"
            "    while ((match = bareItemPattern.exec(sourceText)) !== null) {\n"
            "      addMatch(match.index + match[1].length + match[2].length, match[2]);\n"
            "    }\n\n"
            "    return matches.length >= 2 ? matches : [];",
            1,
        )

    text = text.replace(
        "    const hasGreekMatching = /αντιστοιχ|αντιστοίχ|ταιριαξ|ταίριαξ/i.test(text);",
        "    const hasGreekMatching = /αντιστοίχισε|αντιστοιχισε|αντιστοίχιση|αντιστοιχιση|ταίριαξε|ταιριαξε/i.test(text);",
        1,
    )

    if 'card && !card.querySelector(".activity-answer-block")' not in text:
        text = text.replace(
            '    root.querySelectorAll(".prompt-text.activity-text").forEach((textBlock, blockIndex) => {\n'
            '      const readyState = textBlock.dataset.inlineBlanksReady;',
            '    root.querySelectorAll(".prompt-text.activity-text").forEach((textBlock, blockIndex) => {\n'
            '      const card = textBlock.closest(".activity-card");\n'
            '      if (card && !card.querySelector(".activity-answer-block")) {\n'
            '        textBlock.dataset.inlineBlanksReady = "none";\n'
            '        return;\n'
            '      }\n\n'
            '      const readyState = textBlock.dataset.inlineBlanksReady;',
            1,
        )

    text = text.replace(
        "    observer.observe(paperList, { childList: true });",
        "    observer.observe(paperList, { childList: true, subtree: true, characterData: true });",
        1,
    )

    text = text.replace(
        '        setTimeout(() => enhanceActivityAnswerFields(paperList), 0);\n'
        '        setTimeout(() => enhanceActivityAnswerFields(paperList), 150);',
        '        [0, 150, 800, 2000, 5000, 9000].forEach((delay) => {\n'
        '          setTimeout(() => enhanceActivityAnswerFields(paperList), delay);\n'
        '        });',
        1,
    )

    path.write_text(text, encoding="utf-8")


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    text = re.sub(
        r'[ \t]*<a class="ghost-button fill-jump" href="#fill-here">.*?</a>\r?\n',
        "",
        text,
        count=1,
    )
    if "page-header-cleanup.js?v=10" not in text:
        text = text.replace("page-header-cleanup.js?v=9", "page-header-cleanup.js?v=10", 1)
    if "page-header-cleanup.js?v=11" not in text:
        text = text.replace("page-header-cleanup.js?v=10", "page-header-cleanup.js?v=11", 1)
    if "inline-writing.css?v=17" not in text:
        text = text.replace("inline-writing.css?v=16", "inline-writing.css?v=17", 1)
        text = text.replace("inline-writing.css?v=15", "inline-writing.css?v=17", 1)
        text = text.replace("inline-writing.css?v=14", "inline-writing.css?v=17", 1)
    if "inline-writing.js?v=26" not in text:
        text = text.replace("inline-writing.js?v=25", "inline-writing.js?v=26", 1)
        text = text.replace("inline-writing.js?v=24", "inline-writing.js?v=26", 1)
        text = text.replace("inline-writing.js?v=23", "inline-writing.js?v=26", 1)
        text = text.replace("inline-writing.js?v=22", "inline-writing.js?v=26", 1)
        text = text.replace("inline-writing.js?v=21", "inline-writing.js?v=26", 1)
        text = text.replace("inline-writing.js?v=20", "inline-writing.js?v=26", 1)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    patch_cleanup()
    patch_prompt_font_css()
    patch_inline_reprocess()
    patch_index()


if __name__ == "__main__":
    main()
