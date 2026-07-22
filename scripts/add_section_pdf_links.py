from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


SETUP_RESOURCES_BLOCK = r'''function setupResources(node, paper) {
  const resources = paper.resources ?? paperAssets[paper.id] ?? [];
  const select = node.querySelector(".resource-select");
  const openLink = node.querySelector(".resource-open");
  const openLinkTop = node.querySelector(".resource-open-top");

  select.innerHTML = "";

  if (resources.length === 0) {
    select.disabled = true;
    const option = document.createElement("option");
    option.textContent = "\u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03b5\u03b9 \u03b5\u03bd\u03c3\u03c9\u03bc\u03b1\u03c4\u03c9\u03bc\u03ad\u03bd\u03bf \u03b1\u03c1\u03c7\u03b5\u03af\u03bf";
    option.value = "";
    select.append(option);
    renderSectionResourceLinks(node, paper, resources, openLink, openLinkTop);
    bindSectionResourceLinks(node, paper, resources, openLink, openLinkTop);
    return;
  }

  resources.forEach((resource, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = resourceLabel(resource);
    select.append(option);
  });

  const renderResource = () => {
    const resource = resources[Number(select.value) || 0];
    renderSectionResourceLinks(node, paper, resources, openLink, openLinkTop, resource);
  };

  select.addEventListener("change", renderResource);
  bindSectionResourceLinks(node, paper, resources, openLink, openLinkTop);
  select.value = "0";
  renderResource();
}

function bindSectionResourceLinks(node, paper, resources, openLink, openLinkTop) {
  const update = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    renderSectionResourceLinks(node, paper, resources, openLink, openLinkTop, null, target);
  };

  node.querySelector(".fill-panel")?.addEventListener("focusin", update);
  node.querySelector(".fill-panel")?.addEventListener("click", update);
}

function renderSectionResourceLinks(node, paper, resources, openLink, openLinkTop, fallbackResource = null, activeTarget = null) {
  const resource = sectionResourceFor(node, paper, resources, activeTarget) ?? fallbackResource ?? resources[0] ?? {
    kind: "page",
    href: paper.url
  };

  openLink.href = resource.href;
  openLinkTop.href = resource.href;
  openLink.textContent = resourceActionLabel(resource);
  openLinkTop.textContent = resourceActionLabel(resource);
}

function sectionResourceFor(node, paper, resources, activeTarget = null) {
  const activePromptBox = activeTarget?.closest?.(".prompt-box") ?? node.querySelector(".prompt-box:not(.is-empty)");
  const activeDetails = activeTarget?.closest?.(".prompt-box > details") ?? activePromptBox?.querySelector("details");
  const promptLink = activeDetails?.querySelector(":scope > .prompt-link");

  if (promptLink?.getAttribute("href")) {
    return {
      kind: "section-pdf",
      href: promptLink.getAttribute("href")
    };
  }

  const section = activePromptBox?.dataset.prompt ?? "section1";
  const sectionNumber = section.match(/\d+/)?.[0] ?? "1";
  const sectionPdf = resources.find((resource) => sectionResourceMatches(resource, sectionNumber));
  if (sectionPdf) {
    return {
      ...sectionPdf,
      kind: "section-pdf"
    };
  }

  return null;
}

function sectionResourceMatches(resource, sectionNumber) {
  const href = (resource.href ?? "").toLowerCase();
  if (!href.endsWith(".pdf")) return false;
  if (!href.includes(`epr${sectionNumber}`)) return false;
  if (href.includes("reponses") || href.includes("script")) return false;
  return true;
}

'''


def replace_function_block(text: str, start: str, end: str, replacement: str) -> str:
    start_index = text.index(start)
    end_index = text.index(end, start_index)
    return text[:start_index] + replacement + text[end_index:]


def patch_app() -> None:
    path = ROOT / "app.js"
    text = path.read_text(encoding="utf-8")

    text = text.replace(
        "  setupResources(node, paper);\n  setupPrompts(node, paper);",
        "  setupPrompts(node, paper);\n  setupResources(node, paper);",
        1,
    )

    if "function bindSectionResourceLinks(" not in text:
        text = replace_function_block(
            text,
            "function setupResources(node, paper) {",
            "function setupPrompts(node, paper) {",
            SETUP_RESOURCES_BLOCK,
        )

    if 'resource.kind === "section-pdf"' not in text:
        text = text.replace(
            'function resourceActionLabel(resource) {\n  if (resource.kind === "audio")',
            'function resourceActionLabel(resource) {\n  if (resource.kind === "section-pdf") return "\\u0386\\u03bd\\u03bf\\u03b9\\u03b3\\u03bc\\u03b1 PDF \\u03b5\\u03bd\\u03cc\\u03c4\\u03b7\\u03c4\\u03b1\\u03c2";\n  if (resource.kind === "audio")',
            1,
        )

    path.write_text(text, encoding="utf-8")


def patch_index() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    if "app.js?v=6" not in text:
        text = text.replace("app.js?v=5", "app.js?v=6", 1)
        text = text.replace("app.js?v=4", "app.js?v=6", 1)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    patch_app()
    patch_index()


if __name__ == "__main__":
    main()
