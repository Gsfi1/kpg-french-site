(() => {
  const POSITION_KEY = "kpgFrenchInlinePositions.v1";

  function readPositions() {
    try {
      return JSON.parse(localStorage.getItem(POSITION_KEY)) ?? {};
    } catch {
      return {};
    }
  }

  function writePositions(positions) {
    localStorage.setItem(POSITION_KEY, JSON.stringify(positions));
  }

  function directChildrenWithClass(element, className) {
    return Array.from(element.children).find((child) => child.classList.contains(className));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function placeAnswer(answerBlock, sheet, x, y, shouldFocus = true) {
    const blockWidth = answerBlock.offsetWidth || Math.min(520, sheet.clientWidth - 24);
    const blockHeight = answerBlock.offsetHeight || 180;
    const left = clamp(x, 12, Math.max(12, sheet.clientWidth - blockWidth - 12));
    const top = clamp(y, 12, Math.max(12, sheet.scrollHeight - blockHeight - 12));

    answerBlock.style.left = `${Math.round(left)}px`;
    answerBlock.style.top = `${Math.round(top)}px`;
    sheet.classList.add("has-inline-answer");

    const field = answerBlock.querySelector(".activity-answer");
    const fieldKey = field?.dataset.field;
    if (fieldKey) {
      const positions = readPositions();
      positions[fieldKey] = { x: Math.round(left), y: Math.round(top) };
      writePositions(positions);
    }

    if (shouldFocus && field) field.focus();
  }

  function applySavedOrDefaultPosition(answerBlock, sheet) {
    const field = answerBlock.querySelector(".activity-answer");
    const saved = field?.dataset.field ? readPositions()[field.dataset.field] : null;

    requestAnimationFrame(() => {
      if (saved) {
        placeAnswer(answerBlock, sheet, saved.x, saved.y, false);
        return;
      }

      const text = sheet.querySelector(".activity-text");
      const textBottom = text ? text.offsetTop + Math.min(text.offsetHeight, 160) : 72;
      placeAnswer(answerBlock, sheet, 18, textBottom + 12, false);
    });
  }

  function enhanceInlineAnswers(root = document) {
    root.querySelectorAll(".activity-card").forEach((card) => {
      const summary = card.querySelector("summary");
      const answerBlock = card.querySelector(".activity-answer-block");
      if (!summary || !answerBlock) return;

      let sheet = directChildrenWithClass(card, "activity-writing-sheet");
      if (!sheet) {
        sheet = document.createElement("div");
        sheet.className = "activity-writing-sheet";

        let next = summary.nextSibling;
        while (next) {
          const current = next;
          next = next.nextSibling;
          sheet.append(current);
        }

        card.append(sheet);
      }

      if (!answerBlock.classList.contains("inline-answer-floating")) {
        answerBlock.classList.add("inline-answer-floating");
        const title = answerBlock.querySelector("span");
        if (title) title.textContent = "Απάντηση";

        const field = answerBlock.querySelector(".activity-answer");
        if (field) {
          field.rows = Math.max(Number(field.getAttribute("rows") || 0), 4);
          field.placeholder = "Γράψε εδώ";
        }

        applySavedOrDefaultPosition(answerBlock, sheet);
      }

      if (!sheet.dataset.inlineWritingReady) {
        sheet.dataset.inlineWritingReady = "true";
        sheet.addEventListener("click", (event) => {
          if (event.target.closest("textarea, input, select, button, a, summary, .inline-answer-floating")) return;

          const activeAnswer = sheet.querySelector(".inline-answer-floating");
          if (!activeAnswer) return;

          const rect = sheet.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top + sheet.scrollTop;
          placeAnswer(activeAnswer, sheet, x, y - 22);
        });
      }
    });
  }

  function startInlineWriting() {
    enhanceInlineAnswers();
    const paperList = document.querySelector("#paperList");
    if (!paperList) return;

    const observer = new MutationObserver(() => enhanceInlineAnswers(paperList));
    observer.observe(paperList, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startInlineWriting, { once: true });
  } else {
    startInlineWriting();
  }
})();
