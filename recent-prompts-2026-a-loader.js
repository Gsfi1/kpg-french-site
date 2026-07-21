(() => {
  if (window.__kpgRecentPrompts2026ALoading) return;
  window.__kpgRecentPrompts2026ALoading = true;

  const chunkUrls = [
    "recent-prompts-2026-a.gz.b64.1.txt?v=1",
    "recent-prompts-2026-a.gz.b64.2.txt?v=1"
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
    if (select?.value === "2026-05-a") {
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    document.dispatchEvent(
      new CustomEvent("kpg:recent-prompts-ready", {
        detail: { paperId: "2026-05-a" }
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
      console.error("Could not load KPG 2026 A prompts.", error);
    });
})();
