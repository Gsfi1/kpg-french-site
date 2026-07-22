from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def patch_cleanup() -> None:
    path = ROOT / "page-header-cleanup.js"
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        'if (!textBlock.querySelector(".inline-answer-slot")) {',
        'if (!textBlock.querySelector(".inline-answer-slot, .inline-choice-checkbox")) {',
        1,
    )
    path.write_text(text, encoding="utf-8")


def patch_inline_reprocess() -> None:
    path = ROOT / "inline-writing.js"
    text = path.read_text(encoding="utf-8")

    if "function hasInlineWritableFields(textBlock)" not in text:
        text = text.replace(
            "  function cleanTrailingPageHeaders(root = document) {",
            "  function hasInlineWritableFields(textBlock) {\n"
            "    return Boolean(textBlock.querySelector(\".inline-answer-slot, .inline-choice-checkbox, .inline-match-slot\"));\n"
            "  }\n\n"
            "  function cleanTrailingPageHeaders(root = document) {",
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

    path.write_text(text, encoding="utf-8")


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    if "page-header-cleanup.js?v=10" not in text:
        text = text.replace("page-header-cleanup.js?v=9", "page-header-cleanup.js?v=10", 1)
    if "inline-writing.js?v=22" not in text:
        text = text.replace("inline-writing.js?v=21", "inline-writing.js?v=22", 1)
        text = text.replace("inline-writing.js?v=20", "inline-writing.js?v=22", 1)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    patch_cleanup()
    patch_inline_reprocess()
    patch_index()


if __name__ == "__main__":
    main()
