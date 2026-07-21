(() => {
  const FIELD_MIN_HEIGHT = 118;
  const DEFAULT_PROMPT_PAPER_ID = "2014-05-a";
  const STORAGE_KEY = "kpgFrenchAnswers.v1";
  const CUSTOM_KEY = "kpgFrenchCustomPapers.v1";
  const OFFICIAL_SOURCE_URL = "https://rcel2.enl.uoa.gr/kpg/gr_past_papers_fr.htm";
  const INLINE_FIELD_TOKEN = "_blank_";
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
        if (!fieldKey.includes(INLINE_FIELD_TOKEN)) return;

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
    const pattern = /\b(?:Page|PAGE)\s+(\d{1,2})\b/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const pageNumber = Number(match[1]);
      if (Number.isFinite(pageNumber) && !pages.includes(pageNumber)) {
        pages.push(pageNumber);
      }
    }

    return pages;
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

  function inferActivityImageGroups(activityCards) {
    let carryPage = null;
    let leadingPage = null;

    return activityCards.map((card, index) => {
      const text = card.querySelector(".prompt-text.activity-text")?.textContent ?? "";
      let pages = pageNumbersInText(text);

      if (leadingPage && !pages.includes(leadingPage)) {
        pages = [leadingPage, ...pages];
      }

      const trailingPage = trailingNextPageHeader(text);
      if (trailingPage && pages.length > 1) {
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
      return;
    }

    const signature = imageEntries.map((entry) => entry.src).join("|");
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
    imageGrid.textContent = "";

    imageEntries.forEach((imageEntry, imageIndex) => {
      const imageTitle = `${IMAGE_TITLE_PREFIX} ${imageIndex + 1}`;
      const figure = document.createElement("figure");
      figure.className = "activity-image-card";

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
      figure.append(imageButton, caption);
      imageGrid.append(figure);
    });
  }

  function syncImagesForPromptPanel(panel, sourceImages) {
    const activityCards = Array.from(panel.querySelectorAll(".activity-card"));
    if (activityCards.length === 0) return;

    const groups = inferActivityImageGroups(activityCards);
    groups.forEach((group) => {
      const assignedImages = [];
      group.pages.forEach((pageNumber) => {
        if (ownerIndexForPage(groups, pageNumber) !== group.index) return;
        assignedImages.push(...(sourceImages[String(pageNumber)] ?? []));
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

          syncImagesForPromptPanel(panel, sourceImages);
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
    const matches = sourceText.matchAll(/(?:\.{3,}|\u2026+|_{3,}|[\u25a1\uf0a8]{2,})/g);

    return Array.from(matches).filter((match) => {
      const token = match[0];
      const index = match.index ?? 0;
      const previous = index > 0 ? sourceText[index - 1] : "";
      const next = sourceText[index + token.length] || "";

      if (/^[.\u2026]+$/.test(token)) {
        return Boolean(next && !/\s/.test(next) && (!previous || /\s/.test(previous)));
      }

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

  function enhanceInlineBlanks(root = document) {
    root.querySelectorAll(".prompt-text.activity-text").forEach((textBlock, blockIndex) => {
      if (textBlock.dataset.inlineBlanksReady) return;

      const sourceText = textBlock.textContent ?? "";
      const blankMatches = findWritableBlankMatches(sourceText);

      if (blankMatches.length === 0) {
        textBlock.dataset.inlineBlanksReady = "none";
        return;
      }

      const prefix = inlineFieldPrefix(textBlock, blockIndex);
      let lastIndex = 0;

      textBlock.textContent = "";
      textBlock.dataset.inlineBlanksReady = "true";

      blankMatches.forEach((match, blankIndex) => {
        const token = match[0];
        const index = match.index ?? 0;
        const fieldKey = `${prefix}${INLINE_FIELD_TOKEN}${blankIndex + 1}`;

        if (index > lastIndex) {
          textBlock.append(document.createTextNode(sourceText.slice(lastIndex, index)));
        }

        textBlock.append(createInlineBlankField(textBlock, fieldKey, token, blankIndex + 1));
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
    observer.observe(paperList, { childList: true });

    const paperSelect = document.querySelector("#paperSelect");
    if (paperSelect) {
      paperSelect.addEventListener("change", () => {
        setTimeout(() => enhanceActivityAnswerFields(paperList), 0);
        setTimeout(() => enhanceActivityAnswerFields(paperList), 150);
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
