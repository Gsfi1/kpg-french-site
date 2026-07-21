(() => {
  if (window.__kpgRecentPrompts2026BCLoading) return;
  window.__kpgRecentPrompts2026BCLoading = true;

  const paperIds = ["2026-05-b", "2026-05-c"];
  const paperIdSet = new Set(paperIds);
  const chunkUrls = Array.from({ length: 11 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return `recent-prompts-2026-bc.chunk.${number}.js?v=1`;
  });

  function setStatus(status = {}) {
    const root = document.documentElement;
    if (!root) return;

    if (status.phase != null) root.dataset.kpgBcPhase = String(status.phase);
    if (status.loadedChunks != null) root.dataset.kpgBcChunks = String(status.loadedChunks);
    if (status.message != null) root.dataset.kpgBcMessage = String(status.message);
    if (status.sourceLength != null) root.dataset.kpgBcSourceLength = String(status.sourceLength);
    if (status.hasB != null) root.dataset.kpgBcHasB = String(Boolean(status.hasB));
    if (status.hasC != null) root.dataset.kpgBcHasC = String(Boolean(status.hasC));
  }

  function loadScript(url, index) {
    setStatus({ phase: "loading-script", loadedChunks: index, message: "" });

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = false;
      script.dataset.kpgBcChunk = String(index + 1);
      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error(`Could not load ${url}`)),
        { once: true }
      );
      document.head.append(script);
    });
  }

  async function loadChunks() {
    window.__kpgBcInlineChunks = [];

    for (let index = 0; index < chunkUrls.length; index += 1) {
      await loadScript(chunkUrls[index], index);
    }

    const chunks = window.__kpgBcInlineChunks || [];
    const loadedChunks = chunks.filter(Boolean).length;

    if (
      chunks.length !== chunkUrls.length ||
      chunks.some((chunk) => typeof chunk !== "string" || chunk.length === 0)
    ) {
      throw new Error(`Loaded ${loadedChunks}/${chunkUrls.length} prompt chunks`);
    }

    return chunks;
  }

  async function decodeGzipBase64(base64) {
    if (typeof DecompressionStream !== "function") {
      throw new Error("This browser cannot decompress the prompt bundle");
    }

    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }

  function refreshSelectedPaper() {
    const select = document.querySelector("#paperSelect");
    if (!select || !paperIdSet.has(select.value)) return;

    const event = new Event("change", { bubbles: true });
    select.dispatchEvent(event);
    setTimeout(() => select.dispatchEvent(new Event("change", { bubbles: true })), 120);
  }

  setStatus({ phase: "start", loadedChunks: 0, message: "" });

  loadChunks()
    .then((chunks) => {
      setStatus({ phase: "decoding", loadedChunks: chunks.length, message: "" });
      return decodeGzipBase64(chunks.join(""));
    })
    .then((source) => {
      setStatus({
        phase: "evaluating",
        loadedChunks: chunkUrls.length,
        sourceLength: source.length,
        hasB: source.includes("2026-05-b"),
        hasC: source.includes("2026-05-c"),
        message: "",
      });

      (0, eval)(source);

      setStatus({
        phase: "ready",
        loadedChunks: chunkUrls.length,
        sourceLength: source.length,
        hasB: Boolean(window.paperPrompts?.["2026-05-b"]),
        hasC: Boolean(window.paperPrompts?.["2026-05-c"]),
        message: "",
      });
      refreshSelectedPaper();
    })
    .catch((error) => {
      setStatus({
        phase: "error",
        loadedChunks: (window.__kpgBcInlineChunks || []).filter(Boolean).length,
        message: error?.message || String(error),
      });
    });
})();
