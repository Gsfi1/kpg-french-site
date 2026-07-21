const STORAGE_KEY = "kpgFrenchAnswers.v1";
const CUSTOM_KEY = "kpgFrenchCustomPapers.v1";

const officialSourceUrl = "https://rcel2.enl.uoa.gr/kpg/gr_past_papers_fr.htm";
const paperAssets = window.paperAssets ?? {};
const paperPrompts = window.paperPrompts ?? {};
const paperImages = window.paperImages ?? {};
const recentPapers = window.recentPapers ?? [];

const officialPapers = [
  {
    id: "2014-05-a",
    session: "Μάιος 2014",
    title: "Επίπεδο Α",
    levels: ["Α"],
    type: "ZIP",
    url: "https://www.minedu.gov.gr/publications/docs2014/kpg_fr_A_mai2014.zip",
    source: "ΥΠΑΙΘΑ"
  },
  {
    id: "2014-05-b",
    session: "Μάιος 2014",
    title: "Επίπεδο Β",
    levels: ["Β"],
    type: "ZIP",
    url: "https://www.minedu.gov.gr/publications/docs2014/kpg_fr_B_mai2014.zip",
    source: "ΥΠΑΙΘΑ"
  },
  {
    id: "2014-05-c",
    session: "Μάιος 2014",
    title: "Επίπεδο Γ",
    levels: ["Γ"],
    type: "ZIP",
    url: "https://www.minedu.gov.gr/publications/docs2014/kpg_fr_C_mai2014.zip",
    source: "ΥΠΑΙΘΑ",
    note: "Ο σύνδεσμος προέρχεται από την επίσημη λίστα ΚΠΓ."
  },
  {
    id: "2013-11-b",
    session: "Νοέμβριος 2013",
    title: "Επίπεδο Β",
    levels: ["Β"],
    type: "ZIP",
    url: "https://www.minedu.gov.gr/publications/docs2013/KPG_112013_gallika_b.zip",
    source: "ΥΠΑΙΘΑ"
  },
  {
    id: "2013-11-c",
    session: "Νοέμβριος 2013",
    title: "Επίπεδο Γ",
    levels: ["Γ"],
    type: "Σελίδα",
    url: officialSourceUrl,
    source: "ΚΠΓ",
    note: "Στην επίσημη λίστα εμφανίζεται στην ίδια γραμμή με το επίπεδο Β."
  },
  {
    id: "2013-08-c1-c2",
    session: "Αύγουστος 2013",
    title: "Δείγμα εξετάσεων Γ1-Γ2",
    levels: ["Γ"],
    type: "ZIP",
    url: "https://www.minedu.gov.gr/publications/docs2013/Kpg_FR_c1_c2.zip",
    source: "ΥΠΑΙΘΑ",
    note: "Δείγμα εξετάσεων επιπέδου Γ1-Γ2."
  },
  {
    id: "2013-05-all",
    session: "Μάιος 2013",
    title: "Όλα τα επίπεδα",
    levels: ["Α", "Β", "Γ"],
    type: "Σελίδα",
    url: "https://kpg.auth.gr/index.php/el/kpg/france/theeks.html",
    source: "ΑΠΘ"
  },
  {
    id: "2012-05-11-all",
    session: "Μάιος-Νοέμβριος 2012",
    title: "Όλα τα επίπεδα",
    levels: ["Α", "Β", "Γ"],
    type: "Σελίδα",
    url: "https://kpg.auth.gr/index.php/el/kpg/france/theeks/83-lankpg/219-2012fr.html",
    source: "ΑΠΘ"
  },
  {
    id: "2011-05-11-all",
    session: "Μάιος-Νοέμβριος 2011",
    title: "Όλα τα επίπεδα",
    levels: ["Α", "Β", "Γ"],
    type: "Σελίδα",
    url: "https://kpg.auth.gr/index.php/el/kpg/france/theeks/83-lankpg/86-themaeksfr.html",
    source: "ΑΠΘ"
  },
  {
    id: "2010-05-11-all",
    session: "Μάιος-Νοέμβριος 2010",
    title: "Όλα τα επίπεδα",
    levels: ["Α", "Β", "Γ"],
    type: "Σελίδα",
    url: "https://kpg.auth.gr/index.php/el/map/83-lankpg/209-2010fr.html",
    source: "ΑΠΘ"
  },
  {
    id: "2009-05-11-all",
    session: "Μάιος-Νοέμβριος 2009",
    title: "Όλα τα επίπεδα",
    levels: ["Α", "Β", "Γ"],
    type: "Σελίδα",
    url: "https://kpg.auth.gr/index.php/el/kpg/france/theeks/83-lankpg/214-2009fr.html",
    source: "ΑΠΘ"
  },
  {
    id: "2008-05-11-all",
    session: "Μάιος-Νοέμβριος 2008",
    title: "Όλα τα επίπεδα",
    levels: ["Α", "Β", "Γ"],
    type: "Σελίδα",
    url: "https://kpg.auth.gr/index.php/el/kpg/france/theeks/83-lankpg/215-2008fr.html",
    source: "ΑΠΘ"
  }
];

const paperList = document.querySelector("#paperList");
const paperSelect = document.querySelector("#paperSelect");
const selectedPaperSummary = document.querySelector("#selectedPaperSummary");
const template = document.querySelector("#paperTemplate");
const searchInput = document.querySelector("#searchInput");
const onlyOpen = document.querySelector("#onlyOpen");
const addCustomBtn = document.querySelector("#addCustomBtn");
const customForm = document.querySelector("#customForm");
const cancelCustomBtn = document.querySelector("#cancelCustomBtn");
const exportBtn = document.querySelector("#exportBtn");
const importFile = document.querySelector("#importFile");
const printBtn = document.querySelector("#printBtn");
const clearBtn = document.querySelector("#clearBtn");
const totalCount = document.querySelector("#totalCount");
const doneCount = document.querySelector("#doneCount");
const progressBar = document.querySelector("#progressBar");

let answers = readJson(STORAGE_KEY, {});
let customPapers = readJson(CUSTOM_KEY, []);
let selectedPaperId = "";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function allPapers() {
  return [...recentPapers, ...officialPapers, ...customPapers];
}

function activeLevel() {
  return document.querySelector("input[name='level']:checked")?.value ?? "all";
}

function matchesFilters(paper) {
  const level = activeLevel();
  const query = searchInput.value.trim().toLocaleLowerCase("el-GR");
  const answer = answers[paper.id] ?? {};
  const haystack = [
    paper.session,
    paper.title,
    paper.levels.join(" "),
    paper.source,
    answer.answers,
    answer.writing,
    answer.notes
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("el-GR");

  if (level !== "all" && !paper.levels.includes(level)) return false;
  if (onlyOpen.checked && answer.status === "done") return false;
  if (query && !haystack.includes(query)) return false;
  return true;
}

function render() {
  const papers = allPapers();
  const filtered = papers.filter(matchesFilters);
  syncPaperSelector(filtered);
  renderSelectedPaper(filtered);
  updateStats(papers);
}

function syncPaperSelector(filtered) {
  const hasSelectedPaper = filtered.some((paper) => paper.id === selectedPaperId);

  if (!hasSelectedPaper) {
    selectedPaperId = filtered[0]?.id ?? "";
  }

  paperSelect.innerHTML = "";

  if (filtered.length === 0) {
    const option = document.createElement("option");
    option.textContent = "Δεν βρέθηκαν θέματα";
    option.value = "";
    paperSelect.append(option);
    paperSelect.disabled = true;
    selectedPaperSummary.textContent = "Άλλαξε τα φίλτρα για να εμφανιστεί θέμα.";
    return;
  }

  filtered.forEach((paper) => {
    const option = document.createElement("option");
    option.value = paper.id;
    option.textContent = `${paper.session} - ${paper.title} (${paper.levels.join("/")})`;
    paperSelect.append(option);
  });

  paperSelect.disabled = false;
  paperSelect.value = selectedPaperId;
  selectedPaperSummary.textContent =
    filtered.length === 1
      ? "1 θέμα διαθέσιμο. Τα υπόλοιπα είναι κρυμμένα."
      : `${filtered.length} θέματα διαθέσιμα. Άλλαξε επιλογή για να ανοίξει άλλο.`;
}

function renderSelectedPaper(filtered) {
  paperList.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Δεν βρέθηκαν θέματα με αυτά τα φίλτρα.";
    paperList.append(empty);
  } else {
    const selectedPaper = filtered.find((paper) => paper.id === selectedPaperId) ?? filtered[0];
    paperList.append(createPaperCard(selectedPaper));
  }
}

function createPaperCard(paper) {
  const node = template.content.firstElementChild.cloneNode(true);
  const answer = answers[paper.id] ?? {};
  node.dataset.id = paper.id;

  node.querySelector("h3").textContent = `${paper.session} · ${paper.title}`;
  node.querySelector(".paper-meta").textContent = `${paper.source} · ${paper.type}`;
  const note = node.querySelector(".paper-note");
  note.textContent = paper.note ?? "";
  note.hidden = !paper.note;

  const tags = node.querySelector(".paper-tags");
  paper.levels.forEach((level) => {
    const tag = document.createElement("span");
    tag.className = `tag ${level === "Γ" ? "red" : level === "Β" ? "green" : ""}`;
    tag.textContent = `Επίπεδο ${level}`;
    tags.append(tag);
  });

  const typeTag = document.createElement("span");
  typeTag.className = "tag";
  typeTag.textContent = paper.type;
  tags.append(typeTag);

  const link = node.querySelector(".link-button");
  link.href = paper.url;

  const deleteButton = node.querySelector(".delete-custom");
  deleteButton.hidden = !paper.custom;
  deleteButton.addEventListener("click", () => {
    customPapers = customPapers.filter((item) => item.id !== paper.id);
    delete answers[paper.id];
    writeJson(CUSTOM_KEY, customPapers);
    writeJson(STORAGE_KEY, answers);
    render();
  });

  setupResources(node, paper);
  setupPrompts(node, paper);

  node.querySelectorAll(".answer-field").forEach((field) => {
    field.value = answer[field.dataset.field] ?? (field.dataset.field === "status" ? "open" : "");
    field.addEventListener("input", () => {
      answers[paper.id] = {
        ...answers[paper.id],
        [field.dataset.field]: field.value
      };
      writeJson(STORAGE_KEY, answers);
      updateStats(allPapers());
    });
    field.addEventListener("change", () => {
      answers[paper.id] = {
        ...answers[paper.id],
        [field.dataset.field]: field.value
      };
      writeJson(STORAGE_KEY, answers);
      if (field.dataset.field === "status") {
        render();
      } else {
        updateStats(allPapers());
      }
    });
  });

  return node;
}

function setupResources(node, paper) {
  const resources = paper.resources ?? paperAssets[paper.id] ?? [];
  const select = node.querySelector(".resource-select");
  const openLink = node.querySelector(".resource-open");
  const openLinkTop = node.querySelector(".resource-open-top");

  select.innerHTML = "";

  if (resources.length === 0) {
    select.disabled = true;
    const option = document.createElement("option");
    option.textContent = "Δεν υπάρχει ενσωματωμένο αρχείο";
    option.value = "";
    select.append(option);
    openLink.href = paper.url;
    openLinkTop.href = paper.url;
    openLink.textContent = "Άνοιγμα επίσημης πηγής";
    openLinkTop.textContent = "Άνοιγμα πηγής";
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
    openLink.href = resource.href;
    openLinkTop.href = resource.href;
    openLink.textContent = resourceActionLabel(resource);
    openLinkTop.textContent = resourceActionLabel(resource);
  };

  select.addEventListener("change", renderResource);
  select.value = "0";
  renderResource();
}

function setupPrompts(node, paper) {
  const prompts = paperPrompts[paper.id] ?? {};

  node.querySelectorAll(".prompt-box").forEach((box) => {
    const section = box.dataset.prompt;
    const entries = Array.isArray(prompts[section])
      ? prompts[section]
      : prompts[section]
        ? [prompts[section]]
        : [];

    box.innerHTML = "";
    box.classList.toggle("is-empty", entries.length === 0);

    if (entries.length === 0) {
      box.textContent = "Δεν έχει περαστεί ακόμη εκφώνηση για αυτή την ενότητα. Άνοιξε το PDF από επάνω.";
      return;
    }

    entries.forEach((entry, index) => {
      const details = document.createElement("details");
      details.open = true;

      const summary = document.createElement("summary");
      const title = document.createElement("span");
      title.textContent = entry.title ?? "Εκφώνηση";

      const source = document.createElement("span");
      source.className = "prompt-source";
      source.textContent = entry.source ?? "";

      summary.append(title, source);
      details.append(summary);

      if (entry.href) {
        const link = document.createElement("a");
        link.className = "prompt-link";
        link.href = entry.href;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = promptLinkText(entry.href);
        details.append(link);
      }

      const activityList = document.createElement("div");
      activityList.className = "activity-list";

      splitActivities(entry.text ?? "").forEach((activity, activityIndex) => {
        const fieldKey = activityAnswerField(section, entry, index, activityIndex);
        const activityDetails = document.createElement("section");
        activityDetails.className = "activity-card";
        activityDetails.dataset.source = entry.source ?? "";
        activityDetails.dataset.pdfPages = (activity.pages ?? []).join(",");

        const activitySummary = document.createElement("h5");
        activitySummary.className = "activity-title";
        activitySummary.textContent = activity.title;
        activityDetails.append(activitySummary);

        const activitySheet = document.createElement("div");
        activitySheet.className = "activity-writing-sheet";

        const text = document.createElement("pre");
        text.className = "prompt-text activity-text";
        text.textContent = activity.text;
        activitySheet.append(text);

        const imageEntries = activityImagesFor(paper.id, entry.source, activity);
        if (imageEntries.length > 0) {
          const imageGrid = document.createElement("div");
          imageGrid.className = "activity-media-grid";

          imageEntries.forEach((imageEntry, imageIndex) => {
            const imageTitle = `Εικόνα ${imageIndex + 1}`;
            const figure = document.createElement("figure");
            figure.className = "activity-image-card";
            const imageButton = document.createElement("button");
            imageButton.className = "activity-image-button";
            imageButton.type = "button";
            imageButton.setAttribute("aria-label", `Άνοιγμα ${imageTitle}`);
            const image = document.createElement("img");
            image.className = "activity-image";
            image.src = imageEntry.src;
            image.alt = imageTitle;
            image.loading = "lazy";
            const caption = document.createElement("figcaption");
            caption.textContent = imageTitle;
            imageButton.addEventListener("click", () => {
              openImageLightbox(imageEntry.src, imageTitle);
            });
            imageButton.append(image);
            figure.append(imageButton, caption);
            imageGrid.append(figure);
          });

          activitySheet.append(imageGrid);
        }

        if (activity.answerable !== false) {
          const answerLabel = document.createElement("label");
          answerLabel.className = "activity-answer-block inline-answer-fixed";
          const answerTitle = document.createElement("span");
          answerTitle.textContent = "Απάντηση";
          const answerField = document.createElement("textarea");
          answerField.className = "answer-field activity-answer";
          answerField.dataset.field = fieldKey;
          answerField.rows = 4;
          answerField.placeholder = "Γράψε εδώ την απάντησή σου για αυτή την activité.";
          answerLabel.append(answerTitle, answerField);
          activitySheet.append(answerLabel);
        }

        activityDetails.append(activitySheet);
        activityList.append(activityDetails);
      });

      details.append(activityList);

      box.append(details);
    });
  });
}

function openImageLightbox(src, title) {
  let lightbox = document.querySelector(".image-lightbox");

  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "image-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <div class="image-lightbox-backdrop"></div>
      <div class="image-lightbox-panel">
        <div class="image-lightbox-header">
          <strong></strong>
          <button type="button" class="image-lightbox-close" aria-label="Κλείσιμο">×</button>
        </div>
        <img alt="" />
      </div>
    `;
    document.body.append(lightbox);

    lightbox.querySelector(".image-lightbox-backdrop").addEventListener("click", closeImageLightbox);
    lightbox.querySelector(".image-lightbox-close").addEventListener("click", closeImageLightbox);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lightbox.hidden) closeImageLightbox();
    });
  }

  lightbox.querySelector("strong").textContent = title;
  const image = lightbox.querySelector("img");
  image.src = src;
  image.alt = title;
  lightbox.hidden = false;
  document.body.classList.add("has-lightbox");
}

function closeImageLightbox() {
  const lightbox = document.querySelector(".image-lightbox");
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.classList.remove("has-lightbox");
}

function activityAnswerField(section, entry, entryIndex, activityIndex) {
  const source = (entry.source ?? `prompt-${entryIndex}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 54);

  return `${section}_${source || entryIndex}_activity_${activityIndex + 1}`;
}

function activityImagesFor(paperId, source, activity) {
  if (activity.answerable === false) return [];

  const sourceImages = paperImages[paperId]?.[source] ?? {};
  const images = [];
  const activityKeys = activityKeysFor(activity);
  const pages = orderedUnique([
    ...(activity.pages ?? []),
    ...activityPageNumbers(activity.title ?? ""),
    ...inferredOralPageNumbers(paperId, source, activity)
  ]);

  pages.forEach((pageNumber) => {
    const pageImages = sourceImages[String(pageNumber)] ?? [];
    const taggedImages = pageImages.some((entry) => imageActivityKeys(entry).length > 0);

    if (taggedImages && activityKeys.length > 0) {
      images.push(...pageImages.filter((entry) => imageMatchesActivity(entry, activityKeys)));
      return;
    }

    if (!taggedImages) {
      images.push(...pageImages);
    }
  });

  return images;
}

function activityPageNumbers(text) {
  const pages = [];
  const addPage = (pageNumber) => {
    if (Number.isFinite(pageNumber) && !pages.includes(pageNumber)) {
      pages.push(pageNumber);
    }
  };
  const rangePattern = /\bpages?\s+(\d{1,2})\s*(?:\u00e0|a|\u2013|\u2014|-|to)\s*(\d{1,2})\b/gi;
  const singlePattern = /\bpage\s+(\d{1,2})\b/gi;
  let match;

  while ((match = rangePattern.exec(text)) !== null) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    const step = start <= end ? 1 : -1;
    for (let pageNumber = start; pageNumber !== end + step; pageNumber += step) {
      addPage(pageNumber);
    }
  }

  while ((match = singlePattern.exec(text)) !== null) {
    addPage(Number(match[1]));
  }

  return pages;
}

function activityKeysFor(activity) {
  const keys = [];
  const pattern = /\bACTIVIT\S*\s+(\d+(?:\.\d+)?)/gi;
  const text = `${activity.title ?? ""}\n${activity.text ?? ""}`;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (!keys.includes(match[1])) keys.push(match[1]);
  }

  return keys;
}

function imageActivityKeys(entry) {
  if (Array.isArray(entry.activities)) return entry.activities.map(String);
  if (entry.activity) return [String(entry.activity)];
  return [];
}

function imageMatchesActivity(entry, activityKeys) {
  return imageActivityKeys(entry).some((key) => activityKeys.includes(key));
}

function inferredOralPageNumbers(paperId, source, activity) {
  if (!/epr4/i.test(source ?? "") || !/consignes/i.test(source ?? "")) return [];

  const pages = [];
  const addPage = (pageNumber) => {
    if (Number.isFinite(pageNumber) && !pages.includes(pageNumber)) pages.push(pageNumber);
  };

  activityKeysFor(activity).forEach((key) => {
    const [major, minor] = key.split(".").map(Number);
    if (!Number.isFinite(major)) return;

    if (paperId === "2026-05-a" || paperId === "2026-05-b") {
      if (major === 2 && minor >= 1 && minor <= 4) addPage(4 + minor);
      if (major === 3 && minor >= 1 && minor <= 4) addPage(8 + minor);
      return;
    }

    if (paperId === "2026-05-c") {
      const mapping = {
        "1.1": [5],
        "1.2": [5],
        "1.3": [5],
        "2.1": [6],
        "2.2": [6],
        "2.3": [7],
        "2.4": [8],
        "3.1": [9],
        "3.2": [10],
        "3.3": [11],
        "3.4": [12]
      };
      (mapping[key] ?? []).forEach(addPage);
    }
  });

  return pages;
}

function orderedUnique(values) {
  const result = [];
  values.forEach((value) => {
    const number = Number(value);
    if (Number.isFinite(number) && !result.includes(number)) result.push(number);
  });
  return result;
}

function pageMarkersFor(text) {
  const markers = [];
  const pattern = /\bpage\s+(\d{1,2})\b/gi;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    markers.push({
      page: Number(match[1]),
      start: match.index
    });
  }

  return markers.filter((marker) => Number.isFinite(marker.page));
}

function pageAtPosition(markers, position) {
  let currentPage = null;

  markers.forEach((marker) => {
    if (marker.start <= position) currentPage = marker.page;
  });

  return currentPage;
}

function pagesForActivity(markers, start, title) {
  return orderedUnique([
    pageAtPosition(markers, start),
    ...activityPageNumbers(title)
  ]);
}

function splitActivities(text) {
  const cleanText = text.trim();
  if (!cleanText) return [{ title: "Εκφώνηση", text: "" }];

  const pageMarkers = pageMarkersFor(cleanText);
  const pattern = /(^|\n)\s*((?:CONSIGNES?\s+POUR\s+L\S*)?ACTIVIT\S*\s+\d+(?:\.\d+)?(?:[^\S\n]*[^\n]*)?)/gi;
  const matches = [...cleanText.matchAll(pattern)].map((match) => ({
    start: match.index + match[1].length,
    title: match[2].trim()
  }));

  if (matches.length === 0) {
    return [{ title: "Εκφώνηση", text: cleanText }];
  }

  const activities = [];
  const intro = cleanText.slice(0, matches[0].start).trim();

  if (intro.length > 120) {
    activities.push({
      title: "Οδηγίες πριν τις activités",
      text: intro,
      pages: pagesForActivity(pageMarkers, 0, intro),
      answerable: false
    });
  }

  matches.forEach((match, index) => {
    const nextStart = matches[index + 1]?.start ?? cleanText.length;
    const bodyStart = match.start + match.title.length;
    const body = cleanText.slice(bodyStart, nextStart).trim();

    activities.push({
      title: match.title,
      text: body || match.title,
      pages: pagesForActivity(pageMarkers, match.start, match.title)
    });
  });

  return activities;
}

function resourceLabel(resource) {
  const fileName = (resource.href ?? resource.label ?? "").split("/").pop().toLowerCase();
  let section = "Υλικό θέματος";

  if (resource.kind === "zip") return "Επίσημο πακέτο θεμάτων";
  if (resource.kind === "page") return "Επίσημη σελίδα Υπουργείου";
  if (fileName.includes("epr1")) section = "Ενότητα 1 - Κατανόηση γραπτού λόγου";
  if (fileName.includes("epr2")) section = "Ενότητα 2 - Παραγωγή γραπτού λόγου";
  if (fileName.includes("epr3")) section = "Ενότητα 3 - Κατανόηση προφορικού λόγου";
  if (fileName.includes("epr4")) section = "Ενότητα 4 - Προφορική εξέταση";

  if (resource.kind === "audio" || fileName.endsWith(".mp3")) return `${section} - Ακουστικό`;
  if (fileName.includes("reponses")) return `${section} - Απαντήσεις`;
  if (fileName.includes("script")) return `${section} - Script ακουστικού`;
  if (fileName.includes("consignes")) return `${section} - Οδηγίες`;
  if (fileName.includes("livret")) return `${section} - Φυλλάδιο`;
  if (fileName.includes("demo")) return `${section} - Θέμα δείγματος`;
  return `${section} - Θέμα`;
}

function resourceActionLabel(resource) {
  if (resource.kind === "audio") return "Άνοιγμα ακουστικού";
  if (resource.kind === "zip") return "Άνοιγμα θεμάτων";
  if (resource.kind === "page") return "Άνοιγμα πηγής";
  return "Άνοιγμα αρχείου";
}

function promptLinkText(href) {
  const fileName = (href ?? "").split("/").pop().toLowerCase();
  if (fileName.endsWith(".zip")) return "Άνοιγμα πακέτου θεμάτων";
  if (fileName.endsWith(".mp3")) return "Άνοιγμα ακουστικού";
  return "Άνοιγμα αντίστοιχου PDF";
}

function updateStats(papers) {
  const done = papers.filter((paper) => answers[paper.id]?.status === "done").length;
  totalCount.textContent = papers.length;
  doneCount.textContent = done;
  const percent = papers.length ? Math.round((done / papers.length) * 100) : 0;
  progressBar.value = percent;
  progressBar.textContent = `${percent}%`;
}

function resetCustomForm() {
  customForm.reset();
  customForm.hidden = true;
}

document.querySelectorAll("input[name='level']").forEach((field) => {
  field.addEventListener("change", render);
});

searchInput.addEventListener("input", render);
onlyOpen.addEventListener("change", render);
paperSelect.addEventListener("change", () => {
  selectedPaperId = paperSelect.value;
  render();
  requestAnimationFrame(() => {
    paperList.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

addCustomBtn.addEventListener("click", () => {
  customForm.hidden = !customForm.hidden;
  if (!customForm.hidden) document.querySelector("#customSession").focus();
});

cancelCustomBtn.addEventListener("click", resetCustomForm);

customForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = document.querySelector("#customSession").value.trim();
  const level = document.querySelector("#customLevel").value;
  const title = document.querySelector("#customTitle").value.trim();
  const url = document.querySelector("#customUrl").value.trim();

  if (!session || !title) return;

  customPapers.unshift({
    id: `custom-${Date.now()}`,
    session,
    title,
    levels: [level],
    type: url ? "Σύνδεσμος" : "Δικό μου",
    url: url || officialSourceUrl,
    source: "Προσωπικό",
    custom: true
  });

  writeJson(CUSTOM_KEY, customPapers);
  resetCustomForm();
  render();
});

exportBtn.addEventListener("click", () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    source: officialSourceUrl,
    answers,
    customPapers
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "kpg-gallika-apantiseis.json";
  link.click();
  URL.revokeObjectURL(url);
});

importFile.addEventListener("change", async () => {
  const [file] = importFile.files;
  if (!file) return;

  try {
    const payload = JSON.parse(await file.text());
    answers = payload.answers ?? {};
    customPapers = payload.customPapers ?? [];
    writeJson(STORAGE_KEY, answers);
    writeJson(CUSTOM_KEY, customPapers);
    render();
  } catch {
    alert("Το αρχείο δεν διαβάστηκε.");
  } finally {
    importFile.value = "";
  }
});

printBtn.addEventListener("click", () => window.print());

clearBtn.addEventListener("click", () => {
  if (!confirm("Να καθαριστούν όλες οι απαντήσεις και τα δικά σου θέματα;")) return;
  answers = {};
  customPapers = [];
  writeJson(STORAGE_KEY, answers);
  writeJson(CUSTOM_KEY, customPapers);
  render();
});

render();
