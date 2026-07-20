(() => {
  function directChildrenWithClass(element, className) {
    return Array.from(element.children).find((child) => child.classList.contains(className));
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

      const title = answerBlock.querySelector("span");
      if (title) title.textContent = "Η απάντησή μου πάνω στο τεστ";

      const field = answerBlock.querySelector(".activity-answer");
      if (field) {
        field.rows = Math.max(Number(field.getAttribute("rows") || 0), 5);
        field.placeholder = "Πάτησε εδώ και γράψε απευθείας πάνω στο τεστ.";
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
