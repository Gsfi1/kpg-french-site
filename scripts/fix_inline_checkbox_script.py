from __future__ import annotations

from pathlib import Path


SCRIPT = Path(__file__).with_name("add_inline_checkboxes.py")


def main() -> None:
    text = SCRIPT.read_text(encoding="utf-8")
    text = text.replace("(\x00s*)", "([ \\t]*)")
    SCRIPT.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
