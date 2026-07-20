(() => {
  const FIELD_MIN_HEIGHT = 118;

  function directChildrenWithClass(element, className) {
    return Array.from(element.children).find((child) => child.classList.contains(className));
  }

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

  function enhanceActivityAnswerFields(root = document) {
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

      answerBlock.classList.remove("inline-answer-floating");
      answerBlock.classList.add("inline-answer-fixed");
      prepareField(answerBlock);
    });
  }

  function startActivityAnswerFields() {
    enhanceActivityAnswerFields();
    const paperList = document.querySelector("#paperList");
    if (!paperList) return;

    const observer = new MutationObserver(() => enhanceActivityAnswerFields(paperList));
    observer.observe(paperList, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startActivityAnswerFields, { once: true });
  } else {
    startActivityAnswerFields();
  }
})();
