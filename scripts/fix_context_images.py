from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


APP_IMAGE_TITLE_HELPERS = r'''function activityImageTitles(activity, imageCount) {
  const text = activity?.text ?? "";
  const numberedLabels = trailingNumberedItemLabels(text);
  if (numberedLabels.length === imageCount) return numberedLabels;

  const optionLabels = visualOptionLabels(text, imageCount);
  if (optionLabels.length === imageCount) return optionLabels;

  return [];
}

function trailingNumberedItemLabels(text) {
  const footerIndex = text.search(/\n\s*Nivea(?:u|ux)\b/i);
  const body = footerIndex >= 0 ? text.slice(0, footerIndex) : text;
  const lines = body
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const labelLines = [];

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index].replace(/\s+/g, " ");
    if (/^(?:\d{1,2}[a-z]?\s*[.)]\s*)+$/i.test(line)) {
      labelLines.unshift(line);
      continue;
    }

    if (labelLines.length > 0) break;
  }

  return labelLines.join(" ").match(/\d{1,2}[a-z]?/gi) ?? [];
}

function visualOptionLabels(text, imageCount) {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (!/^(?:[A-H]\s*[.)]?\s*)+$/i.test(line)) continue;

    const labels = line.match(/[A-H]/gi) ?? [];
    if (labels.length === imageCount) return labels.map((label) => label.toUpperCase());
  }

  return [];
}

'''


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


INLINE_CONTEXT_RENDERING = r'''  function renderSyncedImages(card, imageEntries) {
    let imageGrid = card.querySelector(".activity-media-grid");

    if (imageEntries.length === 0) {
      imageGrid?.remove();
      removeInlineContextImages(card);
      return;
    }

    const contextMode = imagesAreContextForActivity(card, imageEntries);
    if (contextMode) {
      imageGrid?.remove();
      renderInlineContextImages(card, imageEntries);
      return;
    }

    removeInlineContextImages(card);

    const imageTitles = activityImageTitles(card, imageEntries.length);
    const signature = `choices::${imageEntries.map((entry) => entry.src).join("|")}::${imageTitles.join(",")}`;
    if (imageGrid?.dataset.syncedImageSignature === signature) return;

    if (!imageGrid) {
      imageGrid = document.createElement("div");
      imageGrid.className = "activity-media-grid";

      const sheet = card.querySelector(".activity-writing-sheet") ?? card;
      const answerBlock = sheet.querySelector(".activity-answer-block");
      if (answerBlock) {
        sheet.insertBefore(imageGrid, answerBlock);
      } else {
        sheet.append(imageGrid);
      }
    }

    imageGrid.dataset.syncedImageSignature = signature;
    imageGrid.classList.remove("activity-context-media");
    imageGrid.textContent = "";

    imageEntries.forEach((imageEntry, imageIndex) => {
      const imageTitle = imageTitles[imageIndex] ?? `${IMAGE_TITLE_PREFIX} ${imageIndex + 1}`;
      imageGrid.append(createSyncedImageFigure(imageEntry, imageTitle, false));
    });
  }

  function createSyncedImageFigure(imageEntry, imageTitle, contextMode) {
    const figure = document.createElement("figure");
    figure.className = contextMode ? "activity-image-card activity-context-image-card" : "activity-image-card";

    const imageButton = document.createElement("button");
    imageButton.className = "activity-image-button";
    imageButton.type = "button";
    imageButton.setAttribute("aria-label", `Open ${imageTitle}`);

    const image = document.createElement("img");
    image.className = "activity-image";
    image.src = imageEntry.src;
    image.alt = imageTitle;
    image.loading = "lazy";

    const caption = document.createElement("figcaption");
    caption.textContent = imageTitle;

    imageButton.addEventListener("click", () => {
      if (typeof window.openImageLightbox === "function") {
        window.openImageLightbox(imageEntry.src, imageTitle);
        return;
      }

      window.open(imageEntry.src, "_blank", "noopener");
    });

    imageButton.append(image);
    if (contextMode) {
      figure.append(imageButton);
    } else {
      figure.append(imageButton, caption);
    }

    return figure;
  }

  function removeInlineContextImages(card) {
    card.querySelectorAll(".activity-context-inline-media").forEach((block) => block.remove());
    const textBlock = card.querySelector(".prompt-text.activity-text");
    if (textBlock) {
      delete textBlock.dataset.contextImageSignature;
    }
  }

  function renderInlineContextImages(card, imageEntries) {
    const textBlock = card.querySelector(".prompt-text.activity-text");
    if (!textBlock) return;

    const signature = `context-inline::${imageEntries.map((entry) => entry.src).join("|")}`;
    if (textBlock.dataset.contextImageSignature === signature && textBlock.querySelector(".activity-context-inline-media")) {
      return;
    }

    removeInlineContextImages(card);
    const groups = contextImageLineGroups(textBlock.textContent ?? "", imageEntries);
    groups.forEach((group) => {
      const block = document.createElement("div");
      block.className = "activity-context-inline-media";
      group.entries.forEach(({ entry, index }) => {
        block.append(createSyncedImageFigure(entry, contextImageTitle(index), true));
      });
      insertContextBlockAfterLine(textBlock, group.lineIndex, block);
    });

    textBlock.dataset.contextImageSignature = signature;
  }

  function contextImageLineGroups(text, imageEntries) {
    const lines = text.split(/\n/);
    const contentStart = firstContextContentLine(lines);
    const contentEnd = firstQuestionLine(lines, contentStart);
    const spanEnd = Math.max(contentStart + 1, contentEnd);
    const targets = imageEntries.map((entry, index) => ({
      entry,
      index,
      lineIndex: contextImageTargetLine(entry, index, imageEntries, contentStart, spanEnd)
    }));

    return targets.reduce((groups, target) => {
      const previous = groups[groups.length - 1];
      if (previous && previous.lineIndex === target.lineIndex) {
        previous.entries.push(target);
      } else {
        groups.push({ lineIndex: target.lineIndex, entries: [target] });
      }
      return groups;
    }, []);
  }

  function firstContextContentLine(lines) {
    const instructionPattern = /\b(?:Mets une croix|Pour chaque item|bonne case|feuille de r(?:e|\u00e9)ponses|ATTENTION)\b/i;
    const greekInstructionPattern = /(?:\u03a3\u03b7\u03bc\u03b5\u03af\u03c9\u03c3\u03b5|\u03ba\u03bf\u03c5\u03c4\u03ac\u03ba\u03b9|\u03a0\u03a1\u039f\u03a3\u039f\u03a7\u0397)/i;
    let instructionEnd = -1;

    lines.forEach((line, index) => {
      if (instructionPattern.test(line) || greekInstructionPattern.test(line)) {
        instructionEnd = index;
      }
    });

    let contentStart = instructionEnd >= 0 ? instructionEnd + 1 : 0;
    while (contentStart < lines.length && !lines[contentStart].trim()) {
      contentStart += 1;
    }

    return Math.min(contentStart, Math.max(0, lines.length - 1));
  }

  function firstQuestionLine(lines, fromLine) {
    const questionIndex = lines.findIndex((line, index) => index > fromLine && /^\s*\d{1,2}[a-z]?\s*[.)]/i.test(line));
    if (questionIndex >= 0) return questionIndex;

    const footerIndex = lines.findIndex((line, index) => index > fromLine && /^\s*Nivea(?:u|ux)\b/i.test(line));
    return footerIndex >= 0 ? footerIndex : lines.length;
  }

  function contextImageTargetLine(entry, index, imageEntries, contentStart, contentEnd) {
    const positioned = imageEntries.filter((item) => Number.isFinite(Number(item.pdfY)));
    if (positioned.length >= 2) {
      const minY = Math.min(...positioned.map((item) => Number(item.pdfY)));
      const maxY = Math.max(...positioned.map((item) => Number(item.pdfY)));
      if (maxY > minY) {
        const ratio = (Number(entry.pdfY) - minY) / (maxY - minY);
        return clampLine(Math.round(contentStart - 1 + ratio * Math.max(1, contentEnd - contentStart)), contentStart - 1, contentEnd - 1);
      }
    }

    if (index === 0) return Math.max(0, contentStart - 1);
    if (index === 1) return contentStart;

    const available = Math.max(1, contentEnd - contentStart - 1);
    return clampLine(contentStart + Math.round(((index - 1) * available) / Math.max(1, imageEntries.length - 2)), contentStart, contentEnd - 1);
  }

  function clampLine(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function insertContextBlockAfterLine(textBlock, lineIndex, block) {
    if (lineIndex < 0) {
      textBlock.prepend(block);
      return;
    }

    const walker = document.createTreeWalker(textBlock, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest(".activity-context-inline-media")
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
    });

    let remainingBreaks = lineIndex + 1;
    let node = walker.nextNode();
    let lastTextNode = null;

    while (node) {
      lastTextNode = node;
      const value = node.nodeValue ?? "";
      for (let index = 0; index < value.length; index += 1) {
        if (value[index] !== "\n") continue;
        remainingBreaks -= 1;
        if (remainingBreaks === 0) {
          const insertOffset = index + 1;
          if (insertOffset < value.length) {
            const after = node.splitText(insertOffset);
            after.parentNode?.insertBefore(block, after);
          } else {
            node.parentNode?.insertBefore(block, node.nextSibling);
          }
          return;
        }
      }
      node = walker.nextNode();
    }

    if (lastTextNode?.parentNode) {
      lastTextNode.parentNode.insertBefore(block, lastTextNode.nextSibling);
    } else {
      textBlock.append(block);
    }
  }

'''


BASE_CONTEXT_CSS = r'''
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


INLINE_CONTEXT_CSS = r'''
.prompt-text .activity-context-inline-media {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  margin: 8px 0 10px;
  white-space: normal;
}

.prompt-text .activity-context-inline-media .activity-image-card {
  min-width: 0;
}

.prompt-text .activity-context-inline-media .activity-image {
  max-height: 300px;
  background: #fff;
}
'''


def patch_between(text: str, start: str, end: str, replacement: str, label: str) -> str:
    start_index = text.find(start)
    end_index = text.find(end, start_index + len(start))
    if start_index < 0 or end_index < 0:
        raise RuntimeError(f"Could not patch {label}")
    return text[:start_index] + replacement + text[end_index:]


def write_if_changed(path: Path, text: str) -> None:
    if path.read_text(encoding="utf-8") != text:
        path.write_text(text, encoding="utf-8")


def patch_inline_writing() -> None:
    path = ROOT / "inline-writing.js"
    text = path.read_text(encoding="utf-8")

    text = patch_between(
        text,
        "  function renderSyncedImages(card, imageEntries) {",
        "  function activityImageTitles(card, imageCount) {",
        INLINE_CONTEXT_RENDERING,
        "inline context image rendering",
    )

    if "function imagesAreContextForActivity" not in text:
        text = text.replace(
            "  function syncImagesForPromptPanel(panel, sourceImages, paperId, source) {",
            CONTEXT_IMAGE_HELPERS + "  function syncImagesForPromptPanel(panel, sourceImages, paperId, source) {",
            1,
        )

    double_sync = (
        "    syncActivityImages(root);\n"
        "    cleanTrailingPageHeaders(root);\n"
        "    enhanceInlineBlanks(root);\n"
        "    syncActivityImages(root);"
    )
    single_sync = (
        "    syncActivityImages(root);\n"
        "    cleanTrailingPageHeaders(root);\n"
        "    enhanceInlineBlanks(root);"
    )
    if double_sync not in text:
        text = text.replace(single_sync, double_sync, 1)

    write_if_changed(path, text)


def patch_styles() -> None:
    path = ROOT / "styles.css"
    text = path.read_text(encoding="utf-8")
    if ".activity-media-grid.activity-context-media" not in text:
        text = text.replace(".image-lightbox[hidden] {\n", BASE_CONTEXT_CSS.strip() + "\n\n.image-lightbox[hidden] {\n", 1)
    if ".activity-context-inline-media" not in text:
        text = text.replace(".image-lightbox[hidden] {\n", INLINE_CONTEXT_CSS.strip() + "\n\n.image-lightbox[hidden] {\n", 1)
    write_if_changed(path, text)


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    text = re.sub(r'href="styles\.css(?:\?v=\d+)?"', 'href="styles.css?v=5"', text)
    text = re.sub(r'src="paper-images-2026\.js(?:\?v=\d+)?"', 'src="paper-images-2026.js?v=3"', text)
    text = re.sub(r'src="app\.js(?:\?v=\d+)?"', 'src="app.js?v=9"', text)
    text = re.sub(r'src="inline-writing\.js(?:\?v=\d+)?"', 'src="inline-writing.js?v=28"', text)
    prompt_scripts = (
        '    <script src="recent-prompts-2026-a.js?v=2"></script>\n'
        '    <script src="recent-prompts-2026-b.js?v=2"></script>\n'
        '    <script src="recent-prompts-2026-c.js?v=2"></script>\n'
    )
    if "recent-prompts-2026-a.js" not in text:
        text = re.sub(
            r'(    <script src="app\.js(?:\?v=\d+)?"></script>\n)',
            prompt_scripts + r'\1',
            text,
            count=1,
        )
    write_if_changed(path, text)


def patch_app() -> None:
    path = ROOT / "app.js"
    text = path.read_text(encoding="utf-8")
    if "function activityImageTitles(activity, imageCount)" not in text:
        text = text.replace(
            "function activityImagesFor(paperId, source, activity) {",
            APP_IMAGE_TITLE_HELPERS + "function activityImagesFor(paperId, source, activity) {",
            1,
        )
    write_if_changed(path, text)


def main() -> None:
    patch_app()
    patch_inline_writing()
    patch_styles()
    patch_index()


if __name__ == "__main__":
    main()
