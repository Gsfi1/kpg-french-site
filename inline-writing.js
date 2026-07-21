(() => {
  const FIELD_MIN_HEIGHT = 118;
  const DEFAULT_PROMPT_PAPER_ID = "2014-05-a";

  function autoGrow(field) {
    field.style.height = "auto";
    field.style.height = `${Math.max(FIELD_MIN_HEIGHT, field.scrollHeight)}px`;
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
    if (!target || select.value === DEFAULT_PROMPT_PAPER_ID) {
      select.dataset.defaultPromptPaperReady = "true";
      return;
    }

    select.dataset.defaultPromptPaperReady = "true";
    select.value = DEFAULT_PROMPT_PAPER_ID;
    select.dispatchEvent(new Event("change", { bubbles: true }));
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
  }

  function startActivityAnswerFields() {
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
