(() => {
  function cleanTrailingHeaders(root = document) {
    root.querySelectorAll(".prompt-text.activity-text").forEach((textBlock) => {
      if (textBlock.querySelector(".inline-answer-slot")) return;

      const sourceText = textBlock.textContent ?? "";
      const cleanText = sourceText.replace(/\n\s*Page\s+\d{1,2}\s*\n[^\n]*\s*$/, "").trimEnd();
      if (cleanText !== sourceText) {
        textBlock.textContent = cleanText;
      }
    });
  }

  function startCleanup() {
    const paperList = document.querySelector("#paperList");
    const target = paperList ?? document;

    cleanTrailingHeaders(target);

    if (paperList) {
      let scheduled = false;
      const observer = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          cleanTrailingHeaders(paperList);
        });
      });
      observer.observe(paperList, { childList: true, subtree: true });
    }

    const paperSelect = document.querySelector("#paperSelect");
    if (paperSelect) {
      paperSelect.addEventListener("change", () => {
        setTimeout(() => cleanTrailingHeaders(target), 0);
        setTimeout(() => cleanTrailingHeaders(target), 150);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startCleanup, { once: true });
  } else {
    startCleanup();
  }
})();
