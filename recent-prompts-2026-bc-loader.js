(() => {
  if (window.__kpgRecentPrompts2026BCLoading) return;
  window.__kpgRecentPrompts2026BCLoading = true;

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

  Promise.all(
    chunkUrls.map((url) =>
      fetch(url, { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error(`Could not load ${url}`);
        return response.text();
      })
    )
  )
    .then((chunks) => decodeGzipBase64(chunks.join("")))
    .then((source) => {
      (0, eval)(source);
      refreshSelectedPaper();
    })
    .catch((error) => {
      console.error("Could not load KPG 2026 B/C prompts.", error);
    });
})();
