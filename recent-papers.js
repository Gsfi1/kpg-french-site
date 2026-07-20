const MINEDU_KPG_THEMATA = "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata";

const recentKpgSessions = [
  {
    year: "2026",
    month: "05",
    session: "Μάιος 2026",
    code: "2026a",
    audioCode: "2026A",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/64969-themata-eksetaseon-kpg-maios-2026",
    levels: ["A", "B", "C"]
  },
  {
    year: "2025",
    month: "11",
    session: "Νοέμβριος 2025",
    code: "2025b",
    audioCode: "2025B",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/63403-themata-eksetaseon-kpg-noembrios-2025",
    levels: ["B", "C"]
  },
  {
    year: "2025",
    month: "05",
    session: "Μάιος 2025",
    code: "2025a",
    audioCode: "2025A",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/61500-themata-eksetaseon-kpg-maios-2025",
    levels: ["A", "B", "C"]
  },
  {
    year: "2024",
    month: "11",
    session: "Νοέμβριος 2024",
    code: "2024b",
    audioCode: "2024B",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/60170-themata-eksetaseon-kpg-noembrios-2024",
    levels: ["B", "C"]
  },
  {
    year: "2024",
    month: "05",
    session: "Μάιος 2024",
    code: "2024a",
    audioCode: "2024A",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/58421-themata-eksetaseon-kpg-maios-2024",
    levels: ["A", "B", "C"]
  },
  {
    year: "2023",
    month: "11",
    session: "Νοέμβριος 2023",
    code: "2023b",
    audioCode: "2023B",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/57160-themata-eksetaseon-kpg-noembrios-2023",
    levels: ["B", "C"]
  },
  {
    year: "2023",
    month: "05",
    session: "Μάιος 2023",
    code: "2023a",
    audioCode: "2023A",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/55431-themata-eksetaseon-kpg-maios-2023",
    levels: ["A", "B", "C"]
  },
  {
    year: "2022",
    month: "11",
    session: "Νοέμβριος 2022",
    code: "2022b",
    audioCode: "2022B",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/54080-themata-kpg-noemvriou-2022",
    levels: ["B", "C"]
  },
  {
    year: "2022",
    month: "05",
    session: "Μάιος 2022",
    code: "2022a",
    audioCode: "2022A",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/52258-themata-eksetaseon-kpg-maios-2022",
    levels: ["A", "B", "C"]
  },
  {
    year: "2021",
    month: "12",
    session: "Δεκέμβριος 2021",
    code: "2021b",
    audioCode: "2021B",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/51028-themata-eksetaseon-kpg-december-2021",
    levels: ["B", "C"]
  },
  {
    year: "2021",
    month: "06",
    session: "Ιούνιος 2021",
    code: "2021a",
    audioCode: "2021A",
    page: "https://www.minedu.gov.gr/kpg-prostheta/kpg-themata/48926-themata-eksetaseon-kpg-iounios-2021",
    levels: ["A", "B", "C"]
  }
];

const levelLabels = {
  A: { greek: "Α", title: "Επίπεδο Α" },
  B: { greek: "Β", title: "Επίπεδο Β" },
  C: { greek: "Γ", title: "Επίπεδο Γ" }
};

function recentPaperId(session, level) {
  return `${session.year}-${session.month}-${level.toLowerCase()}`;
}

function recentPaperPackageUrl(session, level) {
  return `https://www.minedu.gov.gr/publications/docs${session.year}/FR_${level}_${session.code}.zip`;
}

function recentPaperAudioUrl(session, level) {
  return `https://www.minedu.gov.gr/publications/docs${session.year}/FR_${level}_epr3_${session.audioCode}.mp3`;
}

function recentPrompt(session, level, sectionNumber) {
  const levelTitle = levelLabels[level].title;
  return {
    title: `${session.session} - ${levelTitle}`,
    source: "ΥΠΑΙΘΑ",
    href: recentPaperPackageUrl(session, level),
    text: `ACTIVITÉ ${sectionNumber}
Άνοιξε το επίσημο αρχείο θεμάτων για ${session.session}, ${levelTitle}.

Χρησιμοποίησε το πεδίο απάντησης αυτής της activité για να γράψεις την απάντησή σου.

Πηγή: Υπουργείο Παιδείας, Θρησκευμάτων και Αθλητισμού.`
  };
}

window.recentPapers = recentKpgSessions.flatMap((session) =>
  session.levels.map((level) => {
    const levelMeta = levelLabels[level];
    return {
      id: recentPaperId(session, level),
      session: session.session,
      title: levelMeta.title,
      levels: [levelMeta.greek],
      type: "Επίσημο αρχείο",
      url: session.page,
      source: "ΥΠΑΙΘΑ",
      note: "Πρόσφατο επίσημο θέμα ΚΠΓ. Άνοιξε το αρχείο θεμάτων από τα κουμπιά του site."
    };
  })
);

window.paperAssets = {
  ...(window.paperAssets ?? {}),
  ...Object.fromEntries(
    recentKpgSessions.flatMap((session) =>
      session.levels.map((level) => [
        recentPaperId(session, level),
        [
          {
            kind: "page",
            href: session.page
          },
          {
            kind: "zip",
            href: recentPaperPackageUrl(session, level)
          },
          {
            kind: "audio",
            href: recentPaperAudioUrl(session, level)
          }
        ]
      ])
    )
  )
};

window.paperPrompts = {
  ...(window.paperPrompts ?? {}),
  ...Object.fromEntries(
    recentKpgSessions.flatMap((session) =>
      session.levels.map((level) => [
        recentPaperId(session, level),
        {
          section1: [recentPrompt(session, level, 1)],
          section2: [recentPrompt(session, level, 2)],
          section3: [recentPrompt(session, level, 3)],
          section4: [recentPrompt(session, level, 4)]
        }
      ])
    )
  )
};

window.recentKpgSource = MINEDU_KPG_THEMATA;
