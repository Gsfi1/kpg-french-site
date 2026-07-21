(() => {
  const FIELD_MIN_HEIGHT = 118;
  const DEFAULT_PROMPT_PAPER_ID = "2014-05-a";
  const STORAGE_KEY = "kpgFrenchAnswers.v1";
  const CUSTOM_KEY = "kpgFrenchCustomPapers.v1";
  const OFFICIAL_SOURCE_URL = "https://rcel2.enl.uoa.gr/kpg/gr_past_papers_fr.htm";
  const INLINE_FIELD_TOKEN = "_blank_";

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
