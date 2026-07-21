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


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    if "page-header-cleanup.js?v=10" not in text:
        text = text.replace("page-header-cleanup.js?v=9", "page-header-cleanup.js?v=10", 1)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    patch_cleanup()
    patch_index()


if __name__ == "__main__":
    main()
