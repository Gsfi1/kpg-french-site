from __future__ import annotations

from pathlib import Path


INDEX = Path(__file__).resolve().parents[1] / "index.html"

REPLACEMENTS = {
    "styles.css?v=2": "styles.css?v=3",
    "inline-writing.css?v=12": "inline-writing.css?v=13",
    "paper-images-2026.js?v=1": "paper-images-2026.js?v=2",
    "app.js?v=4": "app.js?v=5",
    "inline-writing.js?v=12": "inline-writing.js?v=13",
}


def main() -> None:
    text = INDEX.read_text(encoding="utf-8")
    for old, new in REPLACEMENTS.items():
        if new in text:
            continue
        if old not in text:
            raise RuntimeError(f"Could not bump {old}")
        text = text.replace(old, new, 1)
    INDEX.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
