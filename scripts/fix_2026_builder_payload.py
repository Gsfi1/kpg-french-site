from __future__ import annotations

import base64
import re
from pathlib import Path


SCRIPT = Path(__file__).with_name("build_2026_images.py")


PATCH_INLINE_JS = r'''def patch_inline_js() -> None:
    path = ROOT / "inline-writing.js"
    text = path.read_text(encoding="utf-8")
    inline_helper_end = "  function storedPageNumbers(card) {"
    if inline_helper_end not in text:
        inline_helper_end = "  function collectPaperCards(root = document) {"
    text = patch_between(text, "  function pageNumbersInText(text) {", inline_helper_end, "  " + INLINE_PAGE_HELPERS, "inline page helpers")
    if "  function storedPageNumbers(card) {" not in text:
        stored_helper = r"""function storedPageNumbers(card) {
    const raw = card.dataset.pdfPages ?? "";
    return raw
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value));
  }

  function trailingNextPageHeader(text) {
    const match = text.match(/\n\s*Page\s+(\d{1,2})\s*\n[^\n]*\s*$/);
    if (!match) return null;

    const pageNumber = Number(match[1]);
    return Number.isFinite(pageNumber) ? pageNumber : null;
  }

  """
        text = text.replace("  function collectPaperCards(root = document) {", "  " + stored_helper + "function collectPaperCards(root = document) {", 1)
    text = text.replace("  function inferActivityImageGroups(activityCards) {", "  function inferActivityImageGroups(activityCards, paperId, source) {")
    text = text.replace(
        '      const storedPages = storedPageNumbers(card);\n      let pages = storedPages.length > 0 ? [...storedPages] : pageNumbersInText(text);',
        '      const storedPages = storedPageNumbers(card);\n      const activityKeys = activityKeysFor(card);\n      let pages = storedPages.length > 0 ? [...storedPages] : pageNumbersInText(text);\n      pages = orderedUnique([\n        ...pages,\n        ...pageNumbersInText(card.querySelector(".activity-title")?.textContent ?? ""),\n        ...inferredOralPageNumbers(paperId, source, activityKeys)\n      ]);',
    )
    text = text.replace(
        '      let pages = pageNumbersInText(text);',
        '      const storedPages = storedPageNumbers(card);\n      const activityKeys = activityKeysFor(card);\n      let pages = storedPages.length > 0 ? [...storedPages] : pageNumbersInText(text);\n      pages = orderedUnique([\n        ...pages,\n        ...pageNumbersInText(card.querySelector(".activity-title")?.textContent ?? ""),\n        ...inferredOralPageNumbers(paperId, source, activityKeys)\n      ]);',
        1,
    )
    text = text.replace(
        "      if (trailingPage && pages.length > 1) {",
        "      if (storedPages.length === 0 && trailingPage && pages.length > 1) {",
        1,
    )
    text = text.replace("        pages,\n        visualScore,", "        pages,\n        activityKeys,\n        visualScore,")
    sync_start = "  function syncImagesForPromptPanel(panel, sourceImages) {"
    if sync_start not in text:
        sync_start = "  function syncImagesForPromptPanel(panel, sourceImages, paperId, source) {"
    text = patch_between(text, sync_start, "  function syncActivityImages(root = document) {", "  " + INLINE_SYNC_IMAGES, "inline image sync")
    text = text.replace("          syncImagesForPromptPanel(panel, sourceImages);", "          syncImagesForPromptPanel(panel, sourceImages, paperId, source);")
    write_if_changed(path, text)


'''


def patch_pdf_image_positions(source: str) -> str:
    if '"pdfY"' in source:
        return source

    old = 'entry = {"src": rel, "alt": f"{source_name} - page {page.page_number}, image {len(kept) + 1}"}'
    new = '''pdf_x = float(image["x0"]) / float(page.width)
                    pdf_y = float(image["top"]) / float(page.height)
                    pdf_w = float(image["x1"] - image["x0"]) / float(page.width)
                    pdf_h = float(image["bottom"] - image["top"]) / float(page.height)
                    entry = {
                        "src": rel,
                        "alt": f"{source_name} - page {page.page_number}, image {len(kept) + 1}",
                        "pdfX": round(pdf_x, 4),
                        "pdfY": round(pdf_y, 4),
                        "pdfW": round(pdf_w, 4),
                        "pdfH": round(pdf_h, 4),
                    }'''

    if old not in source:
        raise RuntimeError("Could not patch image PDF positions")

    return source.replace(old, new, 1)


def main() -> None:
    wrapper = SCRIPT.read_text(encoding="utf-8")
    match = re.search(r'_PAYLOAD = """(.+?)"""', wrapper, re.S)
    if not match:
        raise RuntimeError("Could not find builder payload")

    source = base64.b64decode(match.group(1)).decode("utf-8")
    start = source.find("def patch_inline_js() -> None:")
    end = source.find("def patch_site_files() -> None:", start)
    if start < 0 or end < 0:
        raise RuntimeError("Could not find patch_inline_js block")

    source = source[:start] + PATCH_INLINE_JS + source[end:]
    source = patch_pdf_image_positions(source)
    payload = base64.b64encode(source.encode("utf-8")).decode("ascii")
    SCRIPT.write_text(
        'import base64\n\n'
        f'_PAYLOAD = """{payload}"""\n'
        'exec(compile(base64.b64decode(_PAYLOAD).decode("utf-8"), "build_2026_images_payload.py", "exec"))\n',
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
