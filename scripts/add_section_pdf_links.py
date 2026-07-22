from __future__ import annotations

import shutil
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
  const section = activePromptBox?.dataset.prompt ?? "section1";
  const sectionNumber = section.match(/\d+/)?.[0] ?? "1";
  const sectionPdf = resources.find((resource) => sectionResourceMatches(resource, sectionNumber));
  if (sectionPdf) {
    return {
      ...sectionPdf,
      kind: "section-pdf"
    };
  }

  const promptHref = promptLink?.getAttribute("href") ?? "";
  if (promptHref) {
    return {
      kind: promptHref.toLowerCase().endsWith(".zip") ? "zip" : "section-pdf",
      href: promptHref
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

function promptHrefForEntry(paper, section, entry) {
  const href = entry.href ?? "";
  if (!href) return "";

  const localPdf = localPromptPdfHref(paper, section, entry);
  if (href.toLowerCase().endsWith(".zip") && localPdf) return localPdf;
  return href;
}

function localPromptPdfHref(paper, section, entry) {
  const source = (entry.source ?? "").trim();
  if (!source.toLowerCase().endsWith(".pdf")) return "";

  const sectionNumber = section?.match(/\d+/)?.[0] ?? "";
  if (sectionNumber && !source.toLowerCase().includes(`epr${sectionNumber}`)) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(source)) return source;
  if (source.includes("/") || source.includes("\\")) return source.replace(/\\/g, "/");
  return `assets/exams/${paper.id}/${source}`;
}

'''


PROMPT_LINK_HELPERS = r'''function promptHrefForEntry(paper, section, entry) {
  const href = entry.href ?? "";
  if (!href) return "";

  const localPdf = localPromptPdfHref(paper, section, entry);
  if (href.toLowerCase().endsWith(".zip") && localPdf) return localPdf;
  return href;
}

function localPromptPdfHref(paper, section, entry) {
  const source = (entry.source ?? "").trim();
  if (!source.toLowerCase().endsWith(".pdf")) return "";

  const sectionNumber = section?.match(/\d+/)?.[0] ?? "";
  if (sectionNumber && !source.toLowerCase().includes(`epr${sectionNumber}`)) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(source)) return source;
  if (source.includes("/") || source.includes("\\")) return source.replace(/\\/g, "/");
  return `assets/exams/${paper.id}/${source}`;
}

'''


SECTION_RESOURCE_FOR_BLOCK = r'''function sectionResourceFor(node, paper, resources, activeTarget = null) {
  const activePromptBox = activeTarget?.closest?.(".prompt-box") ?? node.querySelector(".prompt-box:not(.is-empty)");
  const activeDetails = activeTarget?.closest?.(".prompt-box > details") ?? activePromptBox?.querySelector("details");
  const promptLink = activeDetails?.querySelector(":scope > .prompt-link");
  const section = activePromptBox?.dataset.prompt ?? "section1";
  const sectionNumber = section.match(/\d+/)?.[0] ?? "1";
  const sectionPdf = resources.find((resource) => sectionResourceMatches(resource, sectionNumber));
  if (sectionPdf) {
    return {
      ...sectionPdf,
      kind: "section-pdf"
    };
  }

  const promptHref = promptLink?.getAttribute("href") ?? "";
  if (promptHref) {
    return {
      kind: promptHref.toLowerCase().endsWith(".zip") ? "zip" : "section-pdf",
      href: promptHref
    };
  }

  return null;
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

    if (
        "function sectionResourceFor(" in text
        and 'const promptHref = promptLink?.getAttribute("href") ?? "";' not in text
    ):
        text = replace_function_block(
            text,
            "function sectionResourceFor(node, paper, resources, activeTarget = null) {",
            "function sectionResourceMatches(resource, sectionNumber) {",
            SECTION_RESOURCE_FOR_BLOCK,
        )

    if "function promptHrefForEntry(" not in text:
        text = text.replace(
            "function setupPrompts(node, paper) {",
            PROMPT_LINK_HELPERS + "function setupPrompts(node, paper) {",
            1,
        )

    if "const promptHref = promptHrefForEntry(paper, section, entry);" not in text:
        text = text.replace(
            '''      if (entry.href) {
        const link = document.createElement("a");
        link.className = "prompt-link";
        link.href = entry.href;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = promptLinkText(entry.href);
        details.append(link);
      }''',
            '''      const promptHref = promptHrefForEntry(paper, section, entry);
      if (promptHref) {
        const link = document.createElement("a");
        link.className = "prompt-link";
        link.href = promptHref;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = promptLinkText(promptHref);
        details.append(link);
      }''',
            1,
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
    if "app.js?v=7" not in text:
        text = text.replace("app.js?v=6", "app.js?v=7", 1)
        text = text.replace("app.js?v=5", "app.js?v=7", 1)
        text = text.replace("app.js?v=4", "app.js?v=7", 1)
    path.write_text(text, encoding="utf-8")


def copy_extracted_section_pdfs() -> None:
    tmp_root = ROOT / ".tmp-2026-images"
    if not tmp_root.exists():
        return

    for pdf_dir in tmp_root.glob("*/pdfs"):
        paper_id = pdf_dir.parent.name
        target_dir = ROOT / "assets" / "exams" / paper_id
        target_dir.mkdir(parents=True, exist_ok=True)

        for pdf_path in pdf_dir.glob("*.pdf"):
            shutil.copy2(pdf_path, target_dir / pdf_path.name)


def main() -> None:
    patch_app()
    patch_index()
    copy_extracted_section_pdfs()


if __name__ == "__main__":
    main()
