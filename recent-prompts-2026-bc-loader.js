(() => {
  if (window.__kpgRecentPrompts2026BCLoading) return;
  window.__kpgRecentPrompts2026BCLoading = true;

  function setStatus(status) {
    const nextStatus = {
      ...status,
      updatedAt: new Date().toISOString()
    };
    window.__kpgRecentPrompts2026BCStatus = nextStatus;
    if (document.documentElement) {
      document.documentElement.dataset.kpgBcPhase = String(nextStatus.phase || "");
      document.documentElement.dataset.kpgBcChunks = String(nextStatus.loadedChunks ?? "");
      document.documentElement.dataset.kpgBcMessage = String(nextStatus.message || "");
      document.documentElement.dataset.kpgBcHasB = String(nextStatus.hasB ?? "");
      document.documentElement.dataset.kpgBcHasC = String(nextStatus.hasC ?? "");
      document.documentElement.dataset.kpgBcSourceLength = String(nextStatus.sourceLength ?? "");
    }
  }

  setStatus({ phase: "starting", loadedChunks: 0 });

  const paperIds = new Set(["2026-05-b", "2026-05-c"]);
  const chunkUrls = [
    "recent-prompts-2026-bc.gz.b64.01.txt?v=1",
    "recent-prompts-2026-bc.gz.b64.02.txt?v=1",
    "recent-prompts-2026-bc.gz.b64.03.txt?v=1",
    "recent-prompts-2026-bc.gz.b64.04.txt?v=1",
    "recent-prompts-2026-bc.gz.b64.05.txt?v=1",
    "recent-prompts-2026-bc.gz.b64.06.txt?v=1",
    "recent-prompts-2026-bc.gz.b64.07.txt?v=1",
    "recent-prompts-2026-bc.gz.b64.08.txt?v=1",
    "recent-prompts-2026-bc.gz.b64.09.txt?v=1",
    "recent-prompts-2026-bc.gz.b64.10.txt?v=1",
    "recent-prompts-2026-bc.gz.b64.11.txt?v=1"
  ];

  async function decodeGzipBase64(base64Text) {
    const binary = atob(base64Text.replace(/\s+/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    if (!("DecompressionStream" in window)) {
      throw new Error("DecompressionStream is not available in this browser.");
    }

    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"));
    const decoded = await new Response(stream).arrayBuffer();
    return new TextDecoder("utf-8").decode(decoded);
  }

  function refreshSelectedPaper() {
    const select = document.querySelector("#paperSelect");
    if (select && paperIds.has(select.value)) {
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    document.dispatchEvent(
      new CustomEvent("kpg:recent-prompts-ready", {
        detail: { paperIds: Array.from(paperIds) }
      })
    );
  }

  async function loadChunks() {
    const chunks = [];
    for (const url of chunkUrls) {
      setStatus({
        phase: "fetching",
        loadedChunks: chunks.length,
        currentUrl: url
      });
      const chunk = await fetch(url, { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error(`Could not load ${url}`);
        return response.text();
      });
      chunks.push(chunk);
    }
    return chunks;
  }

  loadChunks()
    .then((chunks) => {
      setStatus({
        phase: "decoding",
        loadedChunks: chunks.length
      });
      return decodeGzipBase64(chunks.join(""));
    })
    .then((source) => {
      setStatus({
        phase: "evaluating",
        sourceLength: source.length,
        hasB: source.includes("2026-05-b"),
        hasC: source.includes("2026-05-c")
      });
      (0, eval)(source);
      setStatus({
        phase: "ready",
        hasB: Boolean(window.paperPrompts?.["2026-05-b"]),
        hasC: Boolean(window.paperPrompts?.["2026-05-c"])
      });
      refreshSelectedPaper();
    })
    .catch((error) => {
      setStatus({
        phase: "error",
        message: String(error?.message || error),
        stack: String(error?.stack || "")
      });
      console.error("Could not load KPG 2026 B/C prompts.", error);
    });
})();
