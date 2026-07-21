(() => {
  function cleanTrailingHeaders(root = document) {
    root.querySelectorAll(".prompt-text.activity-text").forEach((textBlock) => {
      const sourceText = textBlock.textContent ?? "";
      const cleanText = sourceText.replace(/\n\s*Page\s+\d{1,2}\s*\n[^\n]*\s*$/, "").trimEnd();
      if (cleanText === sourceText) return;

      if (!textBlock.querySelector(".inline-answer-slot")) {
        textBlock.textContent = cleanText;
        return;
      }

      let remaining = sourceText.length - cleanText.length;
      Array.from(textBlock.childNodes)
        .reverse()
        .some((node) => {
          if (remaining <= 0) return true;
          if (node.nodeType !== Node.TEXT_NODE) return false;

          const text = node.textContent ?? "";
          if (text.length <= remaining) {
            remaining -= text.length;
            node.remove();
            return false;
          }

          node.textContent = text.slice(0, text.length - remaining);
          remaining = 0;
          return true;
        });
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

(() => {
  function loadRecentPromptOverrides() {
    if (!document.querySelector("script[data-recent-prompts-2026-a]")) {
      const script = document.createElement("script");
      script.src = "recent-prompts-2026-a-loader.js?v=2";
      script.dataset.recentPrompts2026A = "true";
      script.addEventListener("load", () => {
        const select = document.querySelector("#paperSelect");
        if (select?.value === "2026-05-a") {
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      document.head.append(script);
    }

    if (!document.querySelector("script[data-recent-prompts-2026-bc]")) {
      const script = document.createElement("script");
      script.src = "recent-prompts-2026-bc-loader.js?v=3";
      script.dataset.recentPrompts2026Bc = "true";
      script.addEventListener("load", () => {
        const select = document.querySelector("#paperSelect");
        if (select?.value === "2026-05-b" || select?.value === "2026-05-c") {
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      document.head.append(script);
    }
  }

  const EMPTY_STATE_CLASS = "paper-empty-state";
  let userPickedPaper = false;

  function ensurePlaceholder(select) {
    let placeholder = Array.from(select.options).find((option) => option.value === "");

    if (!placeholder) {
      placeholder = document.createElement("option");
      placeholder.value = "";
      select.prepend(placeholder);
    }

    placeholder.textContent = "\u0394\u03b9\u03ac\u03bb\u03b5\u03be\u03b5 \u03b8\u03ad\u03bc\u03b1";
    placeholder.hidden = true;
  }

  function renderEmptyState() {
    const paperList = document.querySelector("#paperList");
    if (!paperList) return;

    if (
      paperList.children.length === 1 &&
      paperList.firstElementChild?.classList.contains(EMPTY_STATE_CLASS)
    ) {
      return;
    }

    paperList.innerHTML = `
      <article class="${EMPTY_STATE_CLASS} empty-state">
        <p class="eyebrow">\u0391\u03c1\u03c7\u03b9\u03ba\u03ae</p>
        <h3>\u0394\u03b9\u03ac\u03bb\u03b5\u03be\u03b5 \u03b8\u03ad\u03bc\u03b1 \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03be\u03b5\u03ba\u03b9\u03bd\u03ae\u03c3\u03b5\u03b9\u03c2</h3>
        <p>\u038c\u03c4\u03b1\u03bd \u03b5\u03c0\u03b9\u03bb\u03ad\u03be\u03b5\u03b9\u03c2 \u03b5\u03be\u03b5\u03c4\u03b1\u03c3\u03c4\u03b9\u03ba\u03ae, \u03b8\u03b1 \u03b1\u03bd\u03bf\u03af\u03be\u03b5\u03b9 \u03b5\u03b4\u03ce \u03bc\u03cc\u03bd\u03bf \u03c4\u03bf \u03b1\u03bd\u03c4\u03af\u03c3\u03c4\u03bf\u03b9\u03c7\u03bf \u03b8\u03ad\u03bc\u03b1.</p>
      </article>
    `;
  }

  function clearInitialPaper() {
    if (userPickedPaper) return;

    const select = document.querySelector("#paperSelect");
    if (!select) return;

    ensurePlaceholder(select);
    select.value = "";

    const summary = document.querySelector("#selectedPaperSummary");
    if (summary) {
      summary.textContent = "\u0394\u03b9\u03ac\u03bb\u03b5\u03be\u03b5 \u03b8\u03ad\u03bc\u03b1 \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03b1\u03bd\u03bf\u03af\u03be\u03b5\u03b9 \u03b1\u03c0\u03cc \u03ba\u03ac\u03c4\u03c9.";
    }

    renderEmptyState();
  }

  function startEmptyScreen() {
    const select = document.querySelector("#paperSelect");
    if (!select) {
      setTimeout(startEmptyScreen, 50);
      return;
    }

    select.addEventListener(
      "change",
      () => {
        userPickedPaper = Boolean(select.value);
        if (!userPickedPaper) setTimeout(clearInitialPaper, 0);
      },
      true
    );

    const paperList = document.querySelector("#paperList");
    if (paperList) {
      const observer = new MutationObserver(() => {
        if (!userPickedPaper) requestAnimationFrame(clearInitialPaper);
      });
      observer.observe(paperList, { childList: true });
    }

    [0, 40, 120, 260, 520, 900, 1400, 2100, 3000, 4200].forEach((delay) => {
      setTimeout(clearInitialPaper, delay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        loadRecentPromptOverrides();
        startEmptyScreen();
      },
      { once: true }
    );
  } else {
    loadRecentPromptOverrides();
    startEmptyScreen();
  }
})();
