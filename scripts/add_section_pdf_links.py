from __future__ import annotations

import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


SETUP_RESOURCES_BLOCK = r'''function setupResources(node, paper) {
  const resources = paper.resources ?? paperAssets[paper.id] ?? [];
  const select = node.querySelector(".resource-select");
  const openLink = node.querySelector(".resource-open");
  const openLinkTop = node.querySelector(".resource-open-top");

  select.innerHTML = "";

  if (resources.length === 0) {
    select.disabled = true;
    const option = document.createElement("option");
    option.textContent = "\u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03b5\u03b9 \u03b5\u03bd\u03c3\u03c9\u03bc\u03b1\u03c4\u03c9\u03bc\u03ad\u03bd\u03bf \u03b1\u03c1\u03c7\u03b5\u03af\u03bf";
    option.value = "";
    select.append(option);
    renderSectionResourceLinks(node, paper, resources, openLink, openLinkTop);
    bindSectionResourceLinks(node, paper, resources, openLink, openLinkTop);
    return;
  }

  resources.forEach((resource, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = resourceLabel(resource);
    select.append(option);
  });

  const renderResource = () => {
    const resource = resources[Number(select.value) || 0];
    renderSectionResourceLinks(node, paper, resources, openLink, openLinkTop, resource);
  };

  select.addEventListener("change", renderResource);
  bindSectionResourceLinks(node, paper, resources, openLink, openLinkTop);
  select.value = "0";
  renderResource();
}

function bindSectionResourceLinks(node, paper, resources, openLink, openLinkTop) {
  const update = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    renderSectionResourceLinks(node, paper, resources, openLink, openLinkTop, null, target);
  };

  node.querySelector(".fill-panel")?.addEventListener("focusin", update);
  node.querySelector(".fill-panel")?.addEventListener("click", update);
}

function renderSectionResourceLinks(node, paper, resources, openLink, openLinkTop, fallbackResource = null, activeTarget = null) {
  const resource = sectionResourceFor(node, paper, resources, activeTarget) ?? fallbackResource ?? resources[0] ?? {
    kind: "page",
    href: paper.url
  };

  openLink.href = resource.href;
  openLinkTop.href = resource.href;
  openLink.textContent = resourceActionLabel(resource);
  openLinkTop.textContent = resourceActionLabel(resource);
}

function sectionResourceFor(node, paper, resources, activeTarget = null) {
  const activePromptBox = activeTarget?.closest?.(".prompt-box") ?? node.querySelector(".prompt-box:not(.is-empty)");
  const activeDetails = activeTarget?.closest?.(".prompt-box > details") ?? activePromptBox?.querySelector("details");
  const promptLink = activeDetails?.querySelector(":scope > .prompt-link");
  const section = activePromptBox?.dataset.prompt ?? "section1";
  const sectionNumber = section.match(/\d+/)?.[0] ?? "1";
  const sectionPdf = resources.find((resource) => sectionResourceMatches(resource, sectionNumber));
  if (sectionPdf) {
    return {
      ...sectionPdf,
      kind: "section-pdf"
    };
  }

  const promptHref = promptLink?.getAttribute("href") ?? "";
  if (promptHref) {
    return {
      kind: promptHref.toLowerCase().endsWith(".zip") ? "zip" : "section-pdf",
      href: promptHref
    };
  }

  return null;
}

function sectionResourceMatches(resource, sectionNumber) {
  const href = (resource.href ?? "").toLowerCase();
  if (!href.endsWith(".pdf")) return false;
  if (!href.includes(`epr${sectionNumber}`)) return false;
  if (href.includes("reponses") || href.includes("script")) return false;
  return true;
}

function promptHrefForEntry(paper, section, entry) {
  const href = entry.href ?? "";
  if (!href) return "";

  const localPdf = localPromptPdfHref(paper, section, entry);
  if (href.toLowerCase().endsWith(".zip") && localPdf) return localPdf;
  return href;
}

function localPromptPdfHref(paper, section, entry) {
  const source = (entry.source ?? "").trim();
  if (!source.toLowerCase().endsWith(".pdf")) return "";

  const sectionNumber = section?.match(/\d+/)?.[0] ?? "";
  if (sectionNumber && !source.toLowerCase().includes(`epr${sectionNumber}`)) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(source)) return source;
  if (source.includes("/") || source.includes("\\")) return source.replace(/\\/g, "/");
  return `assets/exams/${paper.id}/${source}`;
}

'''


PROMPT_LINK_HELPERS = r'''function promptHrefForEntry(paper, section, entry) {
  const href = entry.href ?? "";
  if (!href) return "";

  const localPdf = localPromptPdfHref(paper, section, entry);
  if (href.toLowerCase().endsWith(".zip") && localPdf) return localPdf;
  return href;
}

function localPromptPdfHref(paper, section, entry) {
  const source = (entry.source ?? "").trim();
  if (!source.toLowerCase().endsWith(".pdf")) return "";

  const sectionNumber = section?.match(/\d+/)?.[0] ?? "";
  if (sectionNumber && !source.toLowerCase().includes(`epr${sectionNumber}`)) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(source)) return source;
  if (source.includes("/") || source.includes("\\")) return source.replace(/\\/g, "/");
  return `assets/exams/${paper.id}/${source}`;
}

'''


SECTION_RESOURCE_FOR_BLOCK = r'''function sectionResourceFor(node, paper, resources, activeTarget = null) {
  const activePromptBox = activeTarget?.closest?.(".prompt-box") ?? node.querySelector(".prompt-box:not(.is-empty)");
  const activeDetails = activeTarget?.closest?.(".prompt-box > details") ?? activePromptBox?.querySelector("details");
  const promptLink = activeDetails?.querySelector(":scope > .prompt-link");
  const section = activePromptBox?.dataset.prompt ?? "section1";
  const sectionNumber = section.match(/\d+/)?.[0] ?? "1";
  const sectionPdf = resources.find((resource) => sectionResourceMatches(resource, sectionNumber));
  if (sectionPdf) {
    return {
      ...sectionPdf,
      kind: "section-pdf"
    };
  }

  const promptHref = promptLink?.getAttribute("href") ?? "";
  if (promptHref) {
    return {
      kind: promptHref.toLowerCase().endsWith(".zip") ? "zip" : "section-pdf",
      href: promptHref
    };
  }

  return null;
}

'''


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


INLINE_IMAGE_TITLE_HELPERS = r'''  function activityImageTitles(card, imageCount) {
    const text = card.querySelector(".prompt-text.activity-text")?.textContent ?? "";
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


INLINE_MATCHING_HELPERS = r'''  function shouldGenerateMatchingFields(text) {
    const hasMatchingVerb = /\b(?:correspondre|associe|associez|associer|relie|reliez|relier|rubrique|rubriques)\b/i.test(text);
    const hasExtraVisualOption = /\ben\s+trop\b/i.test(text)
      && /\b(?:carte|cartes|atelier|ateliers|message|messages|photo|photos|image|images|titre|titres|texte|textes|document|documents)\b/i.test(text);
    const hasGreekMatching = /αντιστοιχ|αντιστοίχ|ταιριαξ|ταίριαξ/i.test(text);

    return hasMatchingVerb || hasExtraVisualOption || hasGreekMatching;
  }

  function findMatchingItemMatches(sourceText) {
    if (!shouldGenerateMatchingFields(sourceText)) return [];

    const matches = [];
    const seen = new Set();
    const addMatch = (index, itemLabel) => {
      const key = `${index}:${itemLabel}`;
      if (seen.has(key)) return;
      seen.add(key);
      matches.push({
        type: "matching",
        token: "",
        index,
        itemLabel
      });
    };

    const numberedPattern = /(^|[ \t\n])(\d{1,2}[a-z]?)([.)])(?=\s|$)/gim;
    let match;
    while ((match = numberedPattern.exec(sourceText)) !== null) {
      addMatch(match.index + match[1].length + match[2].length + match[3].length, match[2]);
    }

    const itemPattern = /\bItem\s+(\d{1,2}[a-z]?)\b/gi;
    while ((match = itemPattern.exec(sourceText)) !== null) {
      addMatch(match.index + match[0].length, match[1]);
    }

    return matches.length >= 2 ? matches : [];
  }

'''


INLINE_MATCHING_FIELD_HELPER = r'''  function createInlineMatchingField(textBlock, fieldKey, itemLabel, matchNumber) {
    const paperId = paperIdFor(textBlock);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "answer-field inline-match-slot";
    input.dataset.field = fieldKey;
    input.value = readInlineAnswer(paperId, fieldKey);
    input.maxLength = 4;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = "A";
    input.setAttribute("aria-label", `Αντιστοίχιση για ${itemLabel || matchNumber}`);

    const normalize = () => {
      input.value = input.value.toUpperCase().replace(/\s+/g, "").slice(0, 4);
    };
    const save = () => {
      normalize();
      writeInlineAnswer(paperIdFor(input) || paperId, fieldKey, input.value);
    };

    input.addEventListener("input", save);
    input.addEventListener("change", save);

    return input;
  }

'''


INLINE_MATCHING_CSS = r'''
.activity-writing-sheet .inline-match-slot {
  inline-size: 42px;
  min-inline-size: 42px;
  block-size: 28px;
  margin: 0 10px 0 5px;
  padding: 2px 6px;
  border: 1px solid rgba(29, 79, 159, 0.38);
  border-radius: 6px;
  background: #fff;
  color: #10203f;
  font: inherit;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
  vertical-align: middle;
  box-shadow: inset 0 -2px 0 rgba(29, 79, 159, 0.12);
}

.activity-writing-sheet .inline-match-slot:focus {
  outline: 2px solid rgba(29, 79, 159, 0.36);
  outline-offset: 1px;
  border-color: rgba(29, 79, 159, 0.76);
  box-shadow: 0 0 0 3px rgba(29, 79, 159, 0.1);
}

'''


def replace_function_block(text: str, start: str, end: str, replacement: str) -> str:
    start_index = text.index(start)
    end_index = text.index(end, start_index)
    return text[:start_index] + replacement + text[end_index:]


def patch_app() -> None:
    path = ROOT / "app.js"
    text = path.read_text(encoding="utf-8")

    text = text.replace(
        "  setupResources(node, paper);\n  setupPrompts(node, paper);",
        "  setupPrompts(node, paper);\n  setupResources(node, paper);",
        1,
    )

    if "function bindSectionResourceLinks(" not in text:
        text = replace_function_block(
            text,
            "function setupResources(node, paper) {",
            "function setupPrompts(node, paper) {",
            SETUP_RESOURCES_BLOCK,
        )

    if (
        "function sectionResourceFor(" in text
        and 'const promptHref = promptLink?.getAttribute("href") ?? "";' not in text
    ):
        text = replace_function_block(
            text,
            "function sectionResourceFor(node, paper, resources, activeTarget = null) {",
            "function sectionResourceMatches(resource, sectionNumber) {",
            SECTION_RESOURCE_FOR_BLOCK,
        )

    if "function promptHrefForEntry(" not in text:
        text = text.replace(
            "function setupPrompts(node, paper) {",
            PROMPT_LINK_HELPERS + "function setupPrompts(node, paper) {",
            1,
        )

    if "const promptHref = promptHrefForEntry(paper, section, entry);" not in text:
        text = text.replace(
            '''      if (entry.href) {
        const link = document.createElement("a");
        link.className = "prompt-link";
        link.href = entry.href;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = promptLinkText(entry.href);
        details.append(link);
      }''',
            '''      const promptHref = promptHrefForEntry(paper, section, entry);
      if (promptHref) {
        const link = document.createElement("a");
        link.className = "prompt-link";
        link.href = promptHref;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = promptLinkText(promptHref);
        details.append(link);
      }''',
            1,
        )

    if 'resource.kind === "section-pdf"' not in text:
        text = text.replace(
            'function resourceActionLabel(resource) {\n  if (resource.kind === "audio")',
            'function resourceActionLabel(resource) {\n  if (resource.kind === "section-pdf") return "\\u0386\\u03bd\\u03bf\\u03b9\\u03b3\\u03bc\\u03b1 PDF \\u03b5\\u03bd\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1\\u03c2";\n  if (resource.kind === "audio")',
            1,
        )

    if "const imageTitles = activityImageTitles(activity, imageEntries.length);" not in text:
        text = text.replace(
            "          imageEntries.forEach((imageEntry, imageIndex) => {\n"
            "            const imageTitle = `\u0395\u03b9\u03ba\u03cc\u03bd\u03b1 ${imageIndex + 1}`;",
            "          const imageTitles = activityImageTitles(activity, imageEntries.length);\n\n"
            "          imageEntries.forEach((imageEntry, imageIndex) => {\n"
            "            const imageTitle = imageTitles[imageIndex] ?? `\\u0395\\u03b9\\u03ba\\u03cc\\u03bd\\u03b1 ${imageIndex + 1}`;",
            1,
        )

    if "function activityImageTitles(activity, imageCount)" not in text:
        text = text.replace(
            "function activityPageNumbers(text) {",
            APP_IMAGE_TITLE_HELPERS + "function activityPageNumbers(text) {",
            1,
        )

    path.write_text(text, encoding="utf-8")


def patch_inline_writing() -> None:
    path = ROOT / "inline-writing.js"
    text = path.read_text(encoding="utf-8")

    if 'const INLINE_MATCH_TOKEN = "_match_";' not in text:
        text = text.replace(
            '  const INLINE_CHOICE_TOKEN = "_choice_";',
            '  const INLINE_CHOICE_TOKEN = "_choice_";\n  const INLINE_MATCH_TOKEN = "_match_";',
            1,
        )

    if "fieldKey.includes(INLINE_MATCH_TOKEN)" not in text:
        text = text.replace(
            "    return fieldKey.includes(INLINE_FIELD_TOKEN) || fieldKey.includes(INLINE_CHOICE_TOKEN);",
            "    return fieldKey.includes(INLINE_FIELD_TOKEN)\n"
            "      || fieldKey.includes(INLINE_CHOICE_TOKEN)\n"
            "      || fieldKey.includes(INLINE_MATCH_TOKEN);",
            1,
        )

    if "const imageTitles = activityImageTitles(card, imageEntries.length);" not in text:
        text = text.replace(
            '    const signature = imageEntries.map((entry) => entry.src).join("|");',
            '    const imageTitles = activityImageTitles(card, imageEntries.length);\n'
            '    const signature = `${imageEntries.map((entry) => entry.src).join("|")}::${imageTitles.join(",")}`;',
            1,
        )

        text = text.replace(
            "      const imageTitle = `${IMAGE_TITLE_PREFIX} ${imageIndex + 1}`;",
            "      const imageTitle = imageTitles[imageIndex] ?? `${IMAGE_TITLE_PREFIX} ${imageIndex + 1}`;",
            1,
        )

    if "function activityImageTitles(card, imageCount)" not in text:
        text = text.replace(
            "  function syncImagesForPromptPanel(panel, sourceImages, paperId, source) {",
            INLINE_IMAGE_TITLE_HELPERS + "  function syncImagesForPromptPanel(panel, sourceImages, paperId, source) {",
            1,
        )

    if "function findMatchingItemMatches(sourceText)" not in text:
        text = text.replace(
            "  function findInlineWritableMatches(sourceText) {",
            INLINE_MATCHING_HELPERS + "  function findInlineWritableMatches(sourceText) {",
            1,
        )

    if "const matchingMatches = findMatchingItemMatches(sourceText);" not in text:
        text = text.replace(
            "    const blankMatches = findWritableBlankMatches(sourceText);\n"
            "    const squareMatches = findChoiceSquareMatches(sourceText);\n"
            "    const labelSequenceMatches = findChoiceLabelSequenceMatches(sourceText);\n"
            "    const generatedChoiceMatches = findGeneratedChoiceGroupMatches(sourceText);",
            "    const blankMatches = findWritableBlankMatches(sourceText);\n"
            "    const matchingMatches = findMatchingItemMatches(sourceText);\n"
            "    const squareMatches = matchingMatches.length > 0 ? [] : findChoiceSquareMatches(sourceText);\n"
            "    const labelSequenceMatches = matchingMatches.length > 0 ? [] : findChoiceLabelSequenceMatches(sourceText);\n"
            "    const generatedChoiceMatches = matchingMatches.length > 0 ? [] : findGeneratedChoiceGroupMatches(sourceText);",
            1,
        )
        text = text.replace(
            "      ...blankMatches,\n"
            "      ...squareMatches,",
            "      ...blankMatches,\n"
            "      ...matchingMatches,\n"
            "      ...squareMatches,",
            1,
        )

    if "function createInlineMatchingField(textBlock, fieldKey, itemLabel, matchNumber)" not in text:
        text = text.replace(
            "  function createInlineChoiceGroup(textBlock, prefix, rowNumber, choices) {",
            INLINE_MATCHING_FIELD_HELPER + "  function createInlineChoiceGroup(textBlock, prefix, rowNumber, choices) {",
            1,
        )

    if "let matchNumber = 0;" not in text:
        text = text.replace(
            "      let choiceGroupNumber = 0;",
            "      let choiceGroupNumber = 0;\n      let matchNumber = 0;",
            1,
        )

    if "createInlineMatchingField(textBlock, fieldKey, match.itemLabel, matchNumber)" not in text:
        text = text.replace(
            "        } else if (match.type === \"remove\") {\n"
            "          // Remove standalone A/B/C header rows once the choices are interactive.",
            "        } else if (match.type === \"matching\") {\n"
            "          matchNumber += 1;\n"
            "          const fieldKey = `${prefix}${INLINE_MATCH_TOKEN}${match.itemLabel || matchNumber}`;\n"
            "          textBlock.append(createInlineMatchingField(textBlock, fieldKey, match.itemLabel, matchNumber));\n"
            "        } else if (match.type === \"remove\") {\n"
            "          // Remove standalone A/B/C header rows once the choices are interactive.",
            1,
        )

    path.write_text(text, encoding="utf-8")


def patch_inline_writing_css() -> None:
    path = ROOT / "inline-writing.css"
    text = path.read_text(encoding="utf-8")
    if ".inline-match-slot" not in text:
        text = text.replace(
            ".activity-writing-sheet .inline-choice-group {",
            INLINE_MATCHING_CSS + ".activity-writing-sheet .inline-choice-group {",
            1,
        )
    path.write_text(text, encoding="utf-8")


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    if "app.js?v=8" not in text:
        text = text.replace("app.js?v=7", "app.js?v=8", 1)
        text = text.replace("app.js?v=6", "app.js?v=8", 1)
        text = text.replace("app.js?v=5", "app.js?v=8", 1)
        text = text.replace("app.js?v=4", "app.js?v=8", 1)
    if "inline-writing.js?v=20" not in text:
        text = text.replace("inline-writing.js?v=19", "inline-writing.js?v=20", 1)
        text = text.replace("inline-writing.js?v=14", "inline-writing.js?v=20", 1)
        text = text.replace("inline-writing.js?v=13", "inline-writing.js?v=20", 1)
        text = text.replace("inline-writing.js?v=12", "inline-writing.js?v=20", 1)
    if "inline-writing.js?v=21" not in text:
        text = text.replace("inline-writing.js?v=20", "inline-writing.js?v=21", 1)
    if "inline-writing.css?v=16" not in text:
        text = text.replace("inline-writing.css?v=15", "inline-writing.css?v=16", 1)
        text = text.replace("inline-writing.css?v=14", "inline-writing.css?v=16", 1)
        text = text.replace("inline-writing.css?v=13", "inline-writing.css?v=16", 1)
        text = text.replace("inline-writing.css?v=12", "inline-writing.css?v=16", 1)
    path.write_text(text, encoding="utf-8")


def copy_extracted_section_pdfs() -> None:
    tmp_root = ROOT / ".tmp-2026-images"
    if not tmp_root.exists():
        return

    for pdf_dir in tmp_root.glob("*/pdfs"):
        paper_id = pdf_dir.parent.name
        target_dir = ROOT / "assets" / "exams" / paper_id
        target_dir.mkdir(parents=True, exist_ok=True)

        for pdf_path in pdf_dir.glob("*.pdf"):
            shutil.copy2(pdf_path, target_dir / pdf_path.name)


def main() -> None:
    patch_app()
    patch_inline_writing()
    patch_inline_writing_css()
    patch_index()
    copy_extracted_section_pdfs()


if __name__ == "__main__":
    main()
