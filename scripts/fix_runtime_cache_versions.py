from __future__ import annotations

from pathlib import Path


INDEX = Path(__file__).resolve().parents[1] / "index.html"


def replace_or_keep(text: str, old: str, new: str) -> str:
    if new in text:
        return text
    return text.replace(old, new, 1)


def main() -> None:
    text = INDEX.read_text(encoding="utf-8")
    text = replace_or_keep(text, "app.js?v=4", "app.js?v=5")
    text = replace_or_keep(text, "inline-writing.css?v=13", "inline-writing.css?v=14")
    text = replace_or_keep(text, "inline-writing.js?v=13", "inline-writing.js?v=14")
    INDEX.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
