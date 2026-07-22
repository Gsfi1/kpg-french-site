from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


CONTEXT_IMAGE_HELPERS = r'''  function contextImageTitle(imageIndex) {
    return `\u0395\u03b9\u03ba\u03cc\u03bd\u03b1 \u03ba\u03b5\u03b9\u03bc\u03ad\u03bd\u03bf\u03c5 ${imageIndex + 1}`;
  }

  function explicitVisualChoiceCue(text) {
    return /\b(?:relie|reliez|relier|associe|associez|associer|correspondre|de quelles photos|quelle carte|quelles? images?|quels? documents?|messages? ci-dessous|documents? ci-dessous|photos? parle|cartes?\s*\([A-H]\s*-\s*[A-H]\)|en trop|atelier|ateliers|observez|regardez)\b/i.test(text)
      || /(?:\u03a4\u03b1\u03af\u03c1\u03b9\u03b1\u03be\u03b5|\u0391\u03bd\u03c4\u03b9\u03c3\u03c4\u03bf\u03af\u03c7\u03b9\u03c3\u03b5|\u0393\u03b9\u03b1 \u03c0\u03bf\u03b9\u03b5\u03c2 \u03c6\u03c9\u03c4\u03bf\u03b3\u03c1\u03b1\u03c6\u03af\u03b5\u03c2|\u03a0\u03bf\u03b9\u03b1 \u03ba\u03ac\u03c1\u03c4\u03b1|\u03a3\u03b5 \u03c0\u03bf\u03b9\u03bf \u03b5\u03c1\u03b3\u03b1\u03c3\u03c4\u03ae\u03c1\u03b9)/i.test(text);
  }

  function textComprehensionCue(text) {
    return /\b(?:Vrai|Faux|Ce n[\u2019']est pas dit|texte|article)\b/i.test(text)
      || /(?:\u03a3\u03c9\u03c3\u03c4\u03cc|\u039b\u03ac\u03b8\u03bf\u03c2|\u0394\u03b5\u03bd \u03c4\u03bf \u03bb\u03ad\u03b5\u03b9|\u03ba\u03b5\u03af\u03bc\u03b5\u03bd\u03bf)/i.test(text);
  }

  function imagesAreActivityOptions(card, imageCount) {
    const text = `${card.querySelector(".activity-title")?.textContent ?? ""}\n${card.querySelector(".prompt-text.activity-text")?.textContent ?? ""}`;
    if (explicitVisualChoiceCue(text)) return true;
    if (textComprehensionCue(text)) return false;
    if (trailingNumberedItemLabels(text).length === imageCount) return true;
    if (visualOptionLabels(text, imageCount).length === imageCount) return true;
    return false;
  }

  function imagesAreContextForActivity(card, imageEntries) {
    return imageEntries.length > 0 && !imagesAreActivityOptions(card, imageEntries.length);
  }

'''


CONTEXT_IMAGE_CSS = r'''
.activity-media-grid.activity-context-media {
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 12px;
  padding: 0 10px 12px;
}

.activity-context-image-card {
  border-color: rgba(29, 79, 159, 0.16);
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 8px 18px rgba(19, 28, 50, 0.04);
}

.activity-context-media .activity-image {
  max-height: 360px;
  background: #fff;
}

.activity-context-media .activity-image-card figcaption {
  display: none;
}
'''


def patch_inline_writing() -> None:
    path = ROOT / "inline-writing.js"
    text = path.read_text(encoding="utf-8")

    if "function imagesAreContextForActivity" not in text:
        text = text.replace(
            "    const imageTitles = activityImageTitles(card, imageEntries.length);\n"
            '    const signature = `${imageEntries.map((entry) => entry.src).join("|")}::${imageTitles.join(",")}`;',
            "    const contextMode = imagesAreContextForActivity(card, imageEntries);\n"
            "    const imageTitles = contextMode ? [] : activityImageTitles(card, imageEntries.length);\n"
            '    const signature = `${contextMode ? "context" : "choices"}::${imageEntries.map((entry) => entry.src).join("|")}::${imageTitles.join(",")}`;',
            1,
        )
        text = text.replace(
            "    imageGrid.dataset.syncedImageSignature = signature;\n"
            '    imageGrid.textContent = "";',
            "    imageGrid.dataset.syncedImageSignature = signature;\n"
            '    imageGrid.classList.toggle("activity-context-media", contextMode);\n'
            '    imageGrid.textContent = "";',
            1,
        )
        text = text.replace(
            '      const imageTitle = imageTitles[imageIndex] ?? `${IMAGE_TITLE_PREFIX} ${imageIndex + 1}`;',
            '      const imageTitle = contextMode ? contextImageTitle(imageIndex) : imageTitles[imageIndex] ?? `${IMAGE_TITLE_PREFIX} ${imageIndex + 1}`;',
            1,
        )
        text = text.replace(
            '      figure.className = "activity-image-card";',
            '      figure.className = contextMode ? "activity-image-card activity-context-image-card" : "activity-image-card";',
            1,
        )
        text = text.replace(
            "      imageButton.append(image);\n"
            "      figure.append(imageButton, caption);\n"
            "      imageGrid.append(figure);",
            "      imageButton.append(image);\n"
            "      if (contextMode) {\n"
            "        figure.append(imageButton);\n"
            "      } else {\n"
            "        figure.append(imageButton, caption);\n"
            "      }\n"
            "      imageGrid.append(figure);",
            1,
        )
        text = text.replace(
            "  function syncImagesForPromptPanel(panel, sourceImages, paperId, source) {",
            CONTEXT_IMAGE_HELPERS + "  function syncImagesForPromptPanel(panel, sourceImages, paperId, source) {",
            1,
        )

    path.write_text(text, encoding="utf-8")


def patch_styles() -> None:
    path = ROOT / "styles.css"
    text = path.read_text(encoding="utf-8")
    if ".activity-media-grid.activity-context-media" not in text:
        text = text.replace(
            ".image-lightbox[hidden] {\n",
            CONTEXT_IMAGE_CSS.strip() + "\n\n.image-lightbox[hidden] {\n",
            1,
        )
    path.write_text(text, encoding="utf-8")


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    if "styles.css?v=4" not in text:
        text = text.replace("styles.css?v=3", "styles.css?v=4", 1)
        text = text.replace('href="styles.css"', 'href="styles.css?v=4"', 1)
    if "inline-writing.js?v=27" not in text:
        text = text.replace("inline-writing.js?v=26", "inline-writing.js?v=27", 1)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    patch_inline_writing()
    patch_styles()
    patch_index()


if __name__ == "__main__":
    main()
