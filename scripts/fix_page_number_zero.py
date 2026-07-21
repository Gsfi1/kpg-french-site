from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text(encoding="utf-8")
    if new in text:
        return
    if old not in text:
        raise RuntimeError(f"Could not patch {label} in {path}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def main() -> None:
    app_js = ROOT / "app.js"
    inline_js = ROOT / "inline-writing.js"

    replace_once(
        app_js,
        """  values.forEach((value) => {
    const number = Number(value);
    if (Number.isFinite(number) && !result.includes(number)) result.push(number);
  });""",
        """  values.forEach((value) => {
    if (value === null || value === undefined || value === "") return;
    const number = Number(value);
    if (Number.isFinite(number) && number > 0 && !result.includes(number)) result.push(number);
  });""",
        "app orderedUnique",
    )

    replace_once(
        app_js,
        "  return markers.filter((marker) => Number.isFinite(marker.page));",
        "  return markers.filter((marker) => Number.isFinite(marker.page) && marker.page > 0);",
        "app page markers",
    )

    replace_once(
        inline_js,
        """    values.forEach((value) => {
      const number = Number(value);
      if (Number.isFinite(number) && !result.includes(number)) result.push(number);
    });""",
        """    values.forEach((value) => {
      if (value === null || value === undefined || value === "") return;
      const number = Number(value);
      if (Number.isFinite(number) && number > 0 && !result.includes(number)) result.push(number);
    });""",
        "inline orderedUnique",
    )

    replace_once(
        inline_js,
        "      .filter((page) => Number.isFinite(page));",
        "      .filter((page) => Number.isFinite(page) && page > 0);",
        "inline stored pages",
    )


if __name__ == "__main__":
    main()
