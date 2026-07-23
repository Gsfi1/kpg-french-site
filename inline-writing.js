(() => {
  const FIELD_MIN_HEIGHT = 118;
  const DEFAULT_PROMPT_PAPER_ID = "2014-05-a";
  const STORAGE_KEY = "kpgFrenchAnswers.v1";
  const CUSTOM_KEY = "kpgFrenchCustomPapers.v1";
  const OFFICIAL_SOURCE_URL = "https://rcel2.enl.uoa.gr/kpg/gr_past_papers_fr.htm";
  const INLINE_FIELD_TOKEN = "_blank_";
  const INLINE_CHOICE_TOKEN = "_choice_";
  const INLINE_MATCH_TOKEN = "_match_";
  const IMAGE_TITLE_PREFIX = "\u0395\u03b9\u03ba\u03cc\u03bd\u03b1";
  const VISUAL_ACTIVITY_PATTERN =
    /\b(?:photo|photos|image|images|carte|cartes|dessin|dessins|affiche|affiches|illustration|illustrations|document|documents|message|messages|texte|article|s[eé]rie|colonne|colonnes|ci-dessous|ci-apr[eè]s|observez|regardez)\b/i;

  let allowStorageReplace = false;

  function autoGrow(field) {
    field.style.height = "auto";
    field.style.height = `${Math.max(FIELD_MIN_HEIGHT, field.scrollHeight)}px`;
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function readAnswers() {
    return readJson(STORAGE_KEY, {});
  }

  function writeAnswers(nextAnswers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAnswers));
  }

  function paperIdFor(node) {
    return node.closest(".paper-card")?.dataset.id || document.querySelector(".paper-card")?.dataset.id || "";
  }

  function readInlineAnswer(paperId, fieldKey) {
    const paperAnswers = readAnswers()[paperId];
    return paperAnswers?.[fieldKey] ?? "";
  }

  function writeInlineAnswer(paperId, fieldKey, value) {
    if (!paperId || !fieldKey) return;

    const answers = readAnswers();
    answers[paperId] = {
      ...(answers[paperId] ?? {}),
      [fieldKey]: value
    };
    writeAnswers(answers);
  }

  function isInlineFieldKey(fieldKey) {
    return fieldKey.includes(INLINE_FIELD_TOKEN)
      || fieldKey.includes(INLINE_CHOICE_TOKEN)
      || fieldKey.includes(INLINE_MATCH_TOKEN);
  }

  function allowFullStorageReplace(duration = 1600) {
    allowStorageReplace = true;
    window.setTimeout(() => {
      allowStorageReplace = false;
    }, duration);
  }

  function mergeInlineAnswers(incoming) {
    if (!incoming || typeof incoming !== "object") return incoming;

    const current = readAnswers();
    Object.entries(current).forEach(([paperId, paperAnswers]) => {
      if (!paperAnswers || typeof paperAnswers !== "object") return;

      Object.entries(paperAnswers).forEach(([fieldKey, fieldValue]) => {
        if (!isInlineFieldKey(fieldKey)) return;

        if (!incoming[paperId] || typeof incoming[paperId] !== "object") {
          incoming[paperId] = {};
        }

        if (!Object.prototype.hasOwnProperty.call(incoming[paperId], fieldKey)) {
          incoming[paperId][fieldKey] = fieldValue;
        }
      });
    });

    return incoming;
  }

  function installStorageGuard() {
    if (!("Storage" in window) || window.__kpgInlineStorageGuardReady) return;

    window.__kpgInlineStorageGuardReady = true;
    const originalSetItem = Storage.prototype.setItem;

    Storage.prototype.setItem = function guardedSetItem(key, value) {
      if (this === localStorage && key === STORAGE_KEY && !allowStorageReplace) {
        try {
          const incoming = mergeInlineAnswers(JSON.parse(value));
          return originalSetItem.call(this, key, JSON.stringify(incoming));
        } catch {
          return originalSetItem.call(this, key, value);
        }
      }

      return originalSetItem.call(this, key, value);
    };
  }

  function downloadJson(payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kpg-gallika-apantiseis.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function installFreshExportHandler() {
    const exportButton = document.querySelector("#exportBtn");
    if (!exportButton || exportButton.dataset.inlineExportReady) return;

    exportButton.dataset.inlineExportReady = "true";
    exportButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        downloadJson({
          exportedAt: new Date().toISOString(),
          source: OFFICIAL_SOURCE_URL,
          answers: readAnswers(),
          customPapers: readJson(CUSTOM_KEY, [])
        });
      },
      true
    );
  }

  function installReplaceBypass() {
    const clearButton = document.querySelector("#clearBtn");
    if (clearButton && !clearButton.dataset.inlineClearReady) {
      clearButton.dataset.inlineClearReady = "true";
      clearButton.addEventListener("click", () => allowFullStorageReplace(), true);
    }

    const importFile = document.querySelector("#importFile");
    if (importFile && !importFile.dataset.inlineImportReady) {
      importFile.dataset.inlineImportReady = "true";
      importFile.addEventListener("change", () => allowFullStorageReplace(5000), true);
    }
  }

  function prepareField(answerBlock) {
    const title = answerBlock.querySelector("span");
    if (title) title.textContent = "Απάντηση";

    const field = answerBlock.querySelector(".activity-answer");
    if (!field) return;

    field.rows = 4;
    field.placeholder = "Γράψε την απάντησή σου εδώ";

    if (!field.dataset.inlineAnswerReady) {
      field.dataset.inlineAnswerReady = "true";
      field.addEventListener("input", () => autoGrow(field));
    }

    requestAnimationFrame(() => autoGrow(field));
  }

  function hideRemovedPanels() {
    document.querySelectorAll(".stats-block").forEach((panel) => {
      panel.hidden = true;
      panel.style.setProperty("display", "none", "important");
    });
  }

  function pageNumbersInText(text) {
    const pages = [];
    const addPage = (pageNumber) => {
      if (Number.isFinite(pageNumber) && !pages.includes(pageNumber)) {
        pages.push(pageNumber);
      }
    };
    const rangePattern = /\bpages?\s+(\d{1,2})\s*(?:\u00e0|a|\u2013|\u2014|-|to)\s*(\d{1,2})\b/gi;
    const singlePattern = /\bpage\s+(\d{1,2})\b/gi;
    let match;

    while ((match = rangePattern.exec(text)) !== null) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      const step = start <= end ? 1 : -1;
      for (let pageNumber = start; pageNumber !== end + step; pageNumber += step) {
        addPage(pageNumber);
      }
    }

    while ((match = singlePattern.exec(text)) !== null) {
      addPage(Number(match[1]));
    }

    return pages;
  }

  function orderedUnique(values) {
    const result = [];
    values.forEach((value) => {
      if (value === null || value === undefined || value === "") return;
      const number = Number(value);
      if (Number.isFinite(number) && number > 0 && !result.includes(number)) result.push(number);
    });
    return result;
  }

  function activityKeysFor(card) {
    const keys = [];
    const text = `${card.querySelector(".activity-title")?.textContent ?? ""}\n${card.querySelector(".prompt-text.activity-text")?.textContent ?? ""}`;
    const pattern = /\bACTIVIT\S*\s+(\d+(?:\.\d+)?)/gi;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (!keys.includes(match[1])) keys.push(match[1]);
    }

    return keys;
  }

  function imageActivityKeys(entry) {
    if (Array.isArray(entry.activities)) return entry.activities.map(String);
    if (entry.activity) return [String(entry.activity)];
    return [];
  }

  function imageMatchesActivity(entry, activityKeys) {
    return imageActivityKeys(entry).some((key) => activityKeys.includes(key));
  }

  function inferredOralPageNumbers(paperId, source, activityKeys) {
    if (!/epr4/i.test(source ?? "") || !/consignes/i.test(source ?? "")) return [];

    const pages = [];
    const addPage = (pageNumber) => {
      if (Number.isFinite(pageNumber) && !pages.includes(pageNumber)) pages.push(pageNumber);
    };

    activityKeys.forEach((key) => {
      const [major, minor] = key.split(".").map(Number);
      if (!Number.isFinite(major)) return;

      if (paperId === "2026-05-a" || paperId === "2026-05-b") {
        if (major === 2 && minor >= 1 && minor <= 4) addPage(4 + minor);
        if (major === 3 && minor >= 1 && minor <= 4) addPage(8 + minor);
        return;
      }

      if (paperId === "2026-05-c") {
        const mapping = {
          "1.1": [5],
          "1.2": [5],
          "1.3": [5],
          "2.1": [6],
          "2.2": [6],
          "2.3": [7],
          "2.4": [8],
          "3.1": [9],
          "3.2": [10],
          "3.3": [11],
          "3.4": [12]
        };
        (mapping[key] ?? []).forEach(addPage);
      }
    });

    return pages;
  }

    function storedPageNumbers(card) {
    const raw = card.dataset.pdfPages ?? "";
    return raw
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0);
  }

  function trailingNextPageHeader(text) {
    const match = text.match(/\n\s*Page\s+(\d{1,2})\s*\n[^\n]*\s*$/);
    if (!match) return null;

    const pageNumber = Number(match[1]);
    return Number.isFinite(pageNumber) ? pageNumber : null;
  }

  function collectPaperCards(root = document) {
    const cards = [];
    if (root.matches?.(".paper-card")) cards.push(root);
    root.querySelectorAll?.(".paper-card").forEach((card) => cards.push(card));
    if (cards.length === 0) {
      document.querySelectorAll(".paper-card").forEach((card) => cards.push(card));
    }

    return [...new Set(cards)];
  }

  function directPromptPanels(promptBox) {
    return Array.from(promptBox.children).filter((child) => child.tagName === "DETAILS");
  }

  function inferActivityImageGroups(activityCards, paperId, source) {
    let carryPage = null;
    let leadingPage = null;

    return activityCards.map((card, index) => {
      const text = card.querySelector(".prompt-text.activity-text")?.textContent ?? "";
      const storedPages = storedPageNumbers(card);
      const activityKeys = activityKeysFor(card);
      let pages = storedPages.length > 0 ? [...storedPages] : pageNumbersInText(text);
      pages = orderedUnique([
        ...pages,
        ...pageNumbersInText(card.querySelector(".activity-title")?.textContent ?? ""),
        ...inferredOralPageNumbers(paperId, source, activityKeys)
      ]);

      if (leadingPage && !pages.includes(leadingPage)) {
        pages = [leadingPage, ...pages];
      }

      const trailingPage = trailingNextPageHeader(text);
      if (storedPages.length === 0 && trailingPage && pages.length > 1) {
        const trailingIndex = pages.lastIndexOf(trailingPage);
        if (trailingIndex > 0) {
          pages.splice(trailingIndex, 1);
          leadingPage = trailingPage;
        } else {
          leadingPage = null;
        }
      } else {
        leadingPage = null;
      }

      if (pages.length === 0 && carryPage) {
        pages = [carryPage];
      }

      if (pages.length > 0) {
        carryPage = pages[pages.length - 1];
      }

      const title = card.querySelector(".activity-title")?.textContent ?? "";
      const visualScore = VISUAL_ACTIVITY_PATTERN.test(`${title}\n${text}`) ? 1 : 0;

      return {
        card,
        index,
        pages,
        activityKeys,
        visualScore,
        answerable: Boolean(card.querySelector(".activity-answer-block"))
      };
    });
  }

  function ownerIndexForPage(groups, pageNumber) {
    const candidates = groups.filter((group) => group.pages.includes(pageNumber));
    if (candidates.length === 0) return -1;

    const answerable = candidates.filter((group) => group.answerable);
    const pool = answerable.length > 0 ? answerable : candidates;
    const visual = pool.filter((group) => group.visualScore > 0);
    const ranked = (visual.length > 0 ? visual : pool)
      .slice()
      .sort((left, right) => right.visualScore - left.visualScore || left.index - right.index);

    return ranked[0]?.index ?? -1;
  }

  function renderSyncedImages(card, imageEntries) {
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
    const { groups, clearLineIndex } = contextImageLineGroups(textBlock.textContent ?? "", imageEntries);
    groups.forEach((group) => {
      const block = document.createElement("div");
      block.className = `activity-context-inline-media ${contextImageBlockClass(group.entries)}`;
      const firstEntry = group.entries[0]?.entry;
      const width = contextImageCssWidth(firstEntry);
      if (width) block.style.setProperty("--context-image-width", width);
      group.entries.forEach(({ entry, index }) => {
        block.append(createSyncedImageFigure(entry, contextImageTitle(index), true));
      });
      insertContextBlockAfterLine(textBlock, group.lineIndex, block);
    });

    if (groups.some((group) => contextImageBlockClass(group.entries).includes("float")) && clearLineIndex >= 0) {
      const clear = document.createElement("div");
      clear.className = "activity-context-clear";
      insertContextBlockAfterLine(textBlock, clearLineIndex, clear);
    }

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

    const groups = targets.reduce((acc, target) => {
      const previous = acc[acc.length - 1];
      if (previous && previous.lineIndex === target.lineIndex) {
        previous.entries.push(target);
      } else {
        acc.push({ lineIndex: target.lineIndex, entries: [target] });
      }
      return acc;
    }, []);

    return {
      groups,
      clearLineIndex: contentEnd - 1
    };
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
    const layout = contextImageLayout(entry);
    if (layout === "wide") return Math.max(0, contentStart - 1);
    if (layout === "float-left" || layout === "float-right") {
      return clampLine(contentStart, contentStart - 1, contentEnd - 1);
    }

    const pdfY = Number(entry.pdfY);
    if (Number.isFinite(pdfY)) {
      if (pdfY < 0.28) return Math.max(0, contentStart - 1);
      if (pdfY < 0.44) return contentStart;

      const ratio = (pdfY - 0.28) / 0.5;
      return clampLine(Math.round(contentStart + ratio * Math.max(1, contentEnd - contentStart)), contentStart, contentEnd - 1);
    }

    if (index === 0) return Math.max(0, contentStart - 1);
    if (index === 1) return contentStart;

    const available = Math.max(1, contentEnd - contentStart - 1);
    return clampLine(contentStart + Math.round(((index - 1) * available) / Math.max(1, imageEntries.length - 2)), contentStart, contentEnd - 1);
  }

  function clampLine(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function contextImageLayout(entry) {
    const x = Number(entry?.pdfX);
    const w = Number(entry?.pdfW);
    const h = Number(entry?.pdfH);

    if (Number.isFinite(w) && (w >= 0.62 || (Number.isFinite(h) && h <= 0.08))) return "wide";
    if (Number.isFinite(w) && w <= 0.46) {
      if (!Number.isFinite(x) || x <= 0.38) return "float-left";
      if (x >= 0.48) return "float-right";
    }

    return "block";
  }

  function contextImageBlockClass(entries) {
    if (entries.length !== 1) return "activity-context-inline-grid";

    const layout = contextImageLayout(entries[0]?.entry);
    if (layout === "wide") return "activity-context-inline-wide";
    if (layout === "float-left") return "activity-context-inline-float-left";
    if (layout === "float-right") return "activity-context-inline-float-right";
    return "activity-context-inline-block";
  }

  function contextImageCssWidth(entry) {
    const width = Number(entry?.pdfW);
    if (!Number.isFinite(width)) return "";

    const percent = Math.max(24, Math.min(92, Math.round(width * 100)));
    return `${percent}%`;
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

  function activityImageTitles(card, imageCount) {
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

  function contextImageTitle(imageIndex) {
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

  function syncImagesForPromptPanel(panel, sourceImages, paperId, source) {
    const activityCards = Array.from(panel.querySelectorAll(".activity-card"));
    if (activityCards.length === 0) return;

    const groups = inferActivityImageGroups(activityCards, paperId, source);
    groups.forEach((group) => {
      group.card.dataset.pdfPages = group.pages.join(",");

      const assignedImages = [];
      group.pages.forEach((pageNumber) => {
        const pageImages = sourceImages[String(pageNumber)] ?? [];
        const taggedImages = pageImages.some((entry) => imageActivityKeys(entry).length > 0);

        if (taggedImages && group.activityKeys.length > 0) {
          assignedImages.push(...pageImages.filter((entry) => imageMatchesActivity(entry, group.activityKeys)));
          return;
        }

        if (!taggedImages && ownerIndexForPage(groups, pageNumber) === group.index) {
          assignedImages.push(...pageImages);
        }
      });

      renderSyncedImages(group.card, assignedImages);
    });
  }

    function syncActivityImages(root = document) {
    collectPaperCards(root).forEach((paperCard) => {
      const paperId = paperCard.dataset.id;
      const imagesBySource = window.paperImages?.[paperId];
      const promptsBySection = window.paperPrompts?.[paperId];
      if (!paperId || !imagesBySource || !promptsBySection) return;

      paperCard.querySelectorAll(".prompt-box").forEach((promptBox) => {
        const section = promptBox.dataset.prompt;
        const entries = promptsBySection[section];
        if (!Array.isArray(entries)) return;

        directPromptPanels(promptBox).forEach((panel, entryIndex) => {
          const source = entries[entryIndex]?.source;
          const sourceImages = imagesBySource[source];
          if (!sourceImages) return;

          syncImagesForPromptPanel(panel, sourceImages, paperId, source);
        });
      });
    });
  }

  function convertActivityDetails(root = document) {
    root.querySelectorAll("details.activity-card").forEach((details) => {
      if (details.dataset.visibleActivityReady) return;

      const section = document.createElement("section");
      section.className = details.className;
      section.dataset.visibleActivityReady = "true";

      const summary = details.querySelector(":scope > summary");
      const title = document.createElement("h5");
      title.className = "activity-title";
      title.textContent = summary?.textContent?.trim() || "Activité";
      section.append(title);

      Array.from(details.childNodes).forEach((child) => {
        if (child === summary) return;
        section.append(child);
      });

      details.replaceWith(section);
    });
  }

  function chooseEmbeddedPromptPaper() {
    const select = document.querySelector("#paperSelect");
    if (!select || select.dataset.defaultPromptPaperReady) return;

    const target = Array.from(select.options).find((option) => option.value === DEFAULT_PROMPT_PAPER_ID);
    if (!target) return;

    if (select.value === DEFAULT_PROMPT_PAPER_ID) {
      select.dataset.defaultPromptPaperReady = "true";
      return;
    }

    select.dataset.defaultPromptPaperReady = "true";
    select.value = DEFAULT_PROMPT_PAPER_ID;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function findWritableBlankMatches(sourceText) {
    const matches = sourceText.matchAll(/(?:\.{3,}|\u2026+|_{3,}|[\u25a1\uf0a8\u2751]{2,})/g);

    return Array.from(matches).filter((match) => {
      const token = match[0];
      const index = match.index ?? 0;
      const previous = index > 0 ? sourceText[index - 1] : "";
      const next = sourceText[index + token.length] || "";

      if (/^[.\u2026]+$/.test(token) && isLeadingChoiceEllipsis(sourceText, index)) {
        return false;
      }

      if (/^[.\u2026]+$/.test(token)) {
        return Boolean(next && !/\s/.test(next) && (!previous || /\s/.test(previous)));
      }

      return true;
    }).map((match) => ({
      type: "blank",
      token: match[0],
      index: match.index ?? 0
    }));
  }

  function findChoiceSquareMatches(sourceText) {
    const matches = [];
    const pattern = /\b([A-F])\.?([ \t]*)[\u25a1\uf0a8\u2751]/g;
    let match;

    while ((match = pattern.exec(sourceText)) !== null) {
      const index = match.index + match[0].length - 1;
      matches.push({
        type: "choice",
        token: sourceText[index],
        index,
        optionLabel: match[1]
      });
    }

    return matches;
  }

  function findChoiceLabelSequenceMatches(sourceText) {
    const matches = [];
    const pattern = /(^|[ \t])((?:[A-F]\.[ \t]*){2,6})(?=$|\r?\n)/gm;
    let match;

    while ((match = pattern.exec(sourceText)) !== null) {
      const token = match[2];
      const choices = Array.from(token.matchAll(/[A-F](?=\.)/g)).map((choiceMatch) => choiceMatch[0]);
      if (choices.length < 2) continue;

      matches.push({
        type: "choiceGroup",
        token,
        index: match.index + match[1].length,
        choices
      });
    }

    return matches;
  }

  function findChoiceHeaderLineMatches(sourceText) {
    const matches = [];
    const labelMap = {
      Α: "A",
      Β: "B",
      Γ: "C",
      Δ: "D",
      Ε: "E",
      Ζ: "F"
    };
    const linePattern = /[^\n]*(?:\n|$)/g;
    let block = [];

    const flushBlock = () => {
      if (block.length === 0) return;

      const labels = block.flatMap((line) => line.labels);
      const uniqueLabels = new Set(labels);
      const shouldRemove = uniqueLabels.size >= 2 && (block.length > 1 || labels.length > 1);
      if (shouldRemove) {
        matches.push({
          type: "remove",
          token: block.map((line) => line.token).join(""),
          index: block[0].index
        });
      }

      block = [];
    };

    let match;
    while ((match = linePattern.exec(sourceText)) !== null) {
      const token = match[0];
      if (!token) break;

      const content = token.replace(/\r?\n$/, "");
      const labelMatches = Array.from(content.matchAll(/[A-FΑΒΓΔΕΖ]\.?/g));
      const isChoiceOnlyLine = labelMatches.length > 0 && content.replace(/[A-FΑΒΓΔΕΖ]\.?/g, "").trim() === "";

      if (isChoiceOnlyLine) {
        block.push({
          token,
          index: match.index,
          labels: labelMatches.map((labelMatch) => labelMap[labelMatch[0].replace(".", "")] ?? labelMatch[0].replace(".", ""))
        });
      } else {
        flushBlock();
      }
    }

    flushBlock();

    return matches;
  }

  function lineStartAt(text, index) {
    return text.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
  }

  function isLeadingChoiceEllipsis(text, index) {
    const prefix = text.slice(lineStartAt(text, index), index);
    return /^\s*\d+[a-z]\.\s*$/i.test(prefix);
  }

  function choiceLabelsForText(text) {
    const labels = [];
    const firstItem = text.search(/^\s*\d+[a-z]\./im);
    const headerText = firstItem >= 0 ? text.slice(0, firstItem) : text;
    const choiceLinePattern = /^\s*([A-F](?:\s+[A-F]){1,5})\s*$/gm;
    let match;

    while ((match = choiceLinePattern.exec(headerText)) !== null) {
      match[1].split(/\s+/).forEach((label) => {
        if (!labels.includes(label)) labels.push(label);
      });
    }

    if (labels.length === 0) {
      const rangeMatch = text.match(/\b([A-F])\s*-\s*([A-F])\b/);
      if (rangeMatch) {
        const start = rangeMatch[1].charCodeAt(0);
        const end = rangeMatch[2].charCodeAt(0);
        for (let code = start; code <= end; code += 1) {
          labels.push(String.fromCharCode(code));
        }
      }
    }

    return labels;
  }

  function shouldGenerateChoiceRows(text) {
    return /\b(?:croix|cochez|relie|associe|case)\b/i.test(text) || /Σημείωσε\s+με\s+x/i.test(text);
  }

  function findGeneratedChoiceGroupMatches(sourceText) {
    if (!shouldGenerateChoiceRows(sourceText)) return [];

    const choices = choiceLabelsForText(sourceText);
    if (choices.length < 2) return [];

    const matches = [];
    const itemPattern = /^\s*\d+[a-z]\.\s+.+$/gmi;
    let match;

    while ((match = itemPattern.exec(sourceText)) !== null) {
      const line = match[0];
      if (/[\u25a1\uf0a8\u2751]/.test(line)) continue;
      if (/\b[A-F]\.(?:\s*[A-F]\.){1,5}\s*$/.test(line)) continue;
      matches.push({
        type: "choiceGroup",
        token: "",
        index: match.index + line.length,
        choices
      });
    }

    return matches;
  }

  function shouldGenerateMatchingFields(text) {
    const hasMatchingVerb = /\b(?:correspondre|associe|associez|associer|relie|reliez|relier|rubrique|rubriques)\b/i.test(text);
    const hasExtraVisualOption = /\ben\s+trop\b/i.test(text)
      && /\b(?:carte|cartes|atelier|ateliers|message|messages|photo|photos|image|images|titre|titres|texte|textes|document|documents)\b/i.test(text);
    const hasGreekMatching = /αντιστοίχισε|αντιστοιχισε|αντιστοίχιση|αντιστοιχιση|ταίριαξε|ταιριαξε/i.test(text);

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

    const bareItemPattern = /(^|[ \t\n])(\d{1,2}[a-z])(?=\s|$)/gm;
    while ((match = bareItemPattern.exec(sourceText)) !== null) {
      addMatch(match.index + match[1].length + match[2].length, match[2]);
    }

    return matches.length >= 2 ? matches : [];
  }

  function findInlineWritableMatches(sourceText) {
    const blankMatches = findWritableBlankMatches(sourceText);
    const matchingMatches = findMatchingItemMatches(sourceText);
    const squareMatches = matchingMatches.length > 0 ? [] : findChoiceSquareMatches(sourceText);
    const labelSequenceMatches = matchingMatches.length > 0 ? [] : findChoiceLabelSequenceMatches(sourceText);
    const generatedChoiceMatches = matchingMatches.length > 0 ? [] : findGeneratedChoiceGroupMatches(sourceText);
    const removeMatches = [...squareMatches, ...labelSequenceMatches, ...generatedChoiceMatches].some((match) => match.type === "choiceGroup" || match.type === "choice")
      ? findChoiceHeaderLineMatches(sourceText)
      : [];

    const orderedMatches = [
      ...blankMatches,
      ...matchingMatches,
      ...squareMatches,
      ...labelSequenceMatches,
      ...generatedChoiceMatches,
      ...removeMatches
    ].sort((left, right) => left.index - right.index || right.token.length - left.token.length);

    let lastEnd = -1;
    return orderedMatches.filter((match) => {
      if (match.index < lastEnd) return false;
      lastEnd = match.index + match.token.length;
      return true;
    });
  }

    function inlineFieldPrefix(textBlock, fallbackIndex) {
    const answerField = textBlock.closest(".activity-card")?.querySelector(".activity-answer");
    if (answerField?.dataset.field) return answerField.dataset.field;

    const promptBox = textBlock.closest(".prompt-box");
    const card = textBlock.closest(".activity-card");
    const cards = Array.from((promptBox ?? document).querySelectorAll(".activity-card"));
    const cardIndex = cards.indexOf(card);
    const section = promptBox?.dataset.prompt || "section";
    return `${section}_inline_${cardIndex >= 0 ? cardIndex + 1 : fallbackIndex + 1}`;
  }

  function blankWidth(token) {
    return Math.min(280, Math.max(84, token.length * 12));
  }

  function createInlineBlankField(textBlock, fieldKey, token, blankNumber) {
    const paperId = paperIdFor(textBlock);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "answer-field inline-answer-slot";
    input.dataset.field = fieldKey;
    input.value = readInlineAnswer(paperId, fieldKey);
    input.autocomplete = "off";
    input.spellcheck = false;
    input.style.inlineSize = `${blankWidth(token)}px`;
    input.setAttribute("aria-label", `Απάντηση για κενό ${blankNumber}`);

    const save = () => writeInlineAnswer(paperIdFor(input) || paperId, fieldKey, input.value);
    input.addEventListener("input", save);
    input.addEventListener("change", save);

    return input;
  }

  function isCheckedValue(value) {
    return value === true || value === "true" || value === "1" || value === "x";
  }

  function createInlineChoiceField(textBlock, fieldKey, optionLabel, choiceNumber) {
    const paperId = paperIdFor(textBlock);
    const label = document.createElement("label");
    label.className = "inline-choice-slot";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "answer-field inline-choice-checkbox";
    input.dataset.field = fieldKey;
    input.checked = isCheckedValue(readInlineAnswer(paperId, fieldKey));
    input.setAttribute("aria-label", `Choice ${optionLabel || choiceNumber}`);

    const save = () => writeInlineAnswer(paperIdFor(input) || paperId, fieldKey, input.checked);
    input.addEventListener("change", save);

    label.append(input);
    return label;
  }

  function createInlineMatchingField(textBlock, fieldKey, itemLabel, matchNumber) {
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

  function createInlineChoiceGroup(textBlock, prefix, rowNumber, choices) {
    const group = document.createElement("span");
    group.className = "inline-choice-group";

    choices.forEach((choice) => {
      const option = document.createElement("label");
      option.className = "inline-choice-option";
      option.append(document.createTextNode(`${choice}.`));

      const fieldKey = `${prefix}${INLINE_CHOICE_TOKEN}${rowNumber}_${choice}`;
      const checkbox = createInlineChoiceField(textBlock, fieldKey, choice, rowNumber);
      const input = checkbox.querySelector("input");

      input.addEventListener("change", () => {
        if (!input.checked) return;

        group.querySelectorAll(".inline-choice-checkbox").forEach((otherInput) => {
          if (otherInput === input) return;
          otherInput.checked = false;
          writeInlineAnswer(paperIdFor(otherInput), otherInput.dataset.field, false);
        });
      });

      option.append(checkbox);
      group.append(document.createTextNode(" "), option);
    });

    return group;
  }

  function hasInlineWritableFields(textBlock) {
    return Boolean(textBlock.querySelector(".inline-answer-slot, .inline-choice-checkbox, .inline-match-slot"));
  }

  function enhanceInlineBlanks(root = document) {
    root.querySelectorAll(".prompt-text.activity-text").forEach((textBlock, blockIndex) => {
      const card = textBlock.closest(".activity-card");
      if (card && !card.querySelector(".activity-answer-block")) {
        textBlock.dataset.inlineBlanksReady = "none";
        return;
      }

      const readyState = textBlock.dataset.inlineBlanksReady;
      if (readyState && (readyState !== "true" || hasInlineWritableFields(textBlock))) return;

      const sourceText = textBlock.textContent ?? "";
      const inlineMatches = findInlineWritableMatches(sourceText);
      const hasWritableMatches = inlineMatches.some((match) => match.type !== "remove");

      if (inlineMatches.length === 0 || !hasWritableMatches) {
        textBlock.dataset.inlineBlanksReady = "none";
        return;
      }

      const prefix = inlineFieldPrefix(textBlock, blockIndex);
      let lastIndex = 0;
      let blankNumber = 0;
      let choiceNumber = 0;
      let choiceGroupNumber = 0;
      let matchNumber = 0;

      textBlock.textContent = "";
      textBlock.dataset.inlineBlanksReady = "true";

      inlineMatches.forEach((match) => {
        const { token, index } = match;

        if (index > lastIndex) {
          textBlock.append(document.createTextNode(sourceText.slice(lastIndex, index)));
        }

        if (match.type === "choiceGroup") {
          choiceGroupNumber += 1;
          textBlock.append(createInlineChoiceGroup(textBlock, prefix, choiceGroupNumber, match.choices));
        } else if (match.type === "choice") {
          choiceNumber += 1;
          const fieldKey = `${prefix}${INLINE_CHOICE_TOKEN}${choiceNumber}`;
          textBlock.append(createInlineChoiceField(textBlock, fieldKey, match.optionLabel, choiceNumber));
        } else if (match.type === "matching") {
          matchNumber += 1;
          const fieldKey = `${prefix}${INLINE_MATCH_TOKEN}${match.itemLabel || matchNumber}`;
          textBlock.append(createInlineMatchingField(textBlock, fieldKey, match.itemLabel, matchNumber));
        } else if (match.type === "remove") {
          // Remove standalone A/B/C header rows once the choices are interactive.
        } else {
          blankNumber += 1;
          const fieldKey = `${prefix}${INLINE_FIELD_TOKEN}${blankNumber}`;
          textBlock.append(createInlineBlankField(textBlock, fieldKey, token, blankNumber));
        }

        lastIndex = index + token.length;
      });

      if (lastIndex < sourceText.length) {
        textBlock.append(document.createTextNode(sourceText.slice(lastIndex)));
      }
    });
  }

    function enhanceActivityAnswerFields(root = document) {
    convertActivityDetails(root);

    root.querySelectorAll(".prompt-box > details").forEach((details) => {
      details.open = true;
    });

    root.querySelectorAll(".activity-card").forEach((card) => {
      const answerBlock = card.querySelector(".activity-answer-block");
      if (!answerBlock) return;

      answerBlock.classList.remove("inline-answer-floating");
      answerBlock.classList.add("inline-answer-fixed");
      prepareField(answerBlock);
    });

    syncActivityImages(root);
    enhanceInlineBlanks(root);
  }

  function startActivityAnswerFields() {
    installStorageGuard();
    installFreshExportHandler();
    installReplaceBypass();
    hideRemovedPanels();
    chooseEmbeddedPromptPaper();
    enhanceActivityAnswerFields();

    const paperList = document.querySelector("#paperList");
    if (!paperList) return;

    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        enhanceActivityAnswerFields(paperList);
      });
    });
    observer.observe(paperList, { childList: true, subtree: true, characterData: true });

    const paperSelect = document.querySelector("#paperSelect");
    if (paperSelect) {
      paperSelect.addEventListener("change", () => {
        [0, 150, 800, 2000, 5000, 9000].forEach((delay) => {
          setTimeout(() => enhanceActivityAnswerFields(paperList), delay);
        });
      });
    }

    let refreshes = 0;
    const refreshTimer = setInterval(() => {
      hideRemovedPanels();
      chooseEmbeddedPromptPaper();
      enhanceActivityAnswerFields(paperList);
      refreshes += 1;
      if (refreshes >= 12) clearInterval(refreshTimer);
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startActivityAnswerFields, { once: true });
  } else {
    startActivityAnswerFields();
  }
})();
