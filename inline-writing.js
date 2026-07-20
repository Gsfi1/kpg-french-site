(() => {
  const FIELD_MIN_HEIGHT = 118;

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
    root.querySelectorAll(".prompt-box > details").forEach((details) => {
      details.open = true;
    });

    root.querySelectorAll(".activity-card").forEach((card) => {
      if (card.tagName === "DETAILS") card.open = true;

      const answerBlock = card.querySelector(".activity-answer-block");
      if (!answerBlock) return;

      answerBlock.classList.remove("inline-answer-floating");
      answerBlock.classList.add("inline-answer-fixed");
      prepareField(answerBlock);
    });
  }

  function startActivityAnswerFields() {
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startActivityAnswerFields, { once: true });
  } else {
    startActivityAnswerFields();
  }
})();
