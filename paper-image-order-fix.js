(() => {
  const PAGE_IMAGE_ORDERS = {
  "2013-08-c1-c2|FR_C1_C2_epr4_demo_livret.pdf|3": [
    "assets/exams/2013-08-c1-c2/images/fr-c1-c2-epr4-demo-livret-p03-img02.jpg",
    "assets/exams/2013-08-c1-c2/images/fr-c1-c2-epr4-demo-livret-p03-img01.jpg"
  ],
  "2013-11-b|kpg_fr_B_epr1_nov2013.pdf|8": [
    "assets/exams/2013-11-b/images/kpg-fr-b-epr1-nov2013-p08-img02.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr1-nov2013-p08-img01.jpg"
  ],
  "2013-11-b|kpg_fr_B_epr3_nov2013_consignes.pdf|1": [
    "assets/exams/2013-11-b/images/kpg-fr-b-epr3-nov2013-consignes-p01-img03.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr3-nov2013-consignes-p01-img01.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr3-nov2013-consignes-p01-img04.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr3-nov2013-consignes-p01-img02.jpg"
  ],
  "2013-11-b|kpg_fr_B_epr4_nov2013_livret.pdf|2": [
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p02-img01.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p02-img04.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p02-img02.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p02-img05.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p02-img06.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p02-img03.jpg"
  ],
  "2013-11-b|kpg_fr_B_epr4_nov2013_livret.pdf|3": [
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p03-img02.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p03-img05.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p03-img01.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p03-img06.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p03-img03.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p03-img04.jpg"
  ],
  "2013-11-b|kpg_fr_B_epr4_nov2013_livret.pdf|4": [
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p04-img03.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p04-img06.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p04-img02.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p04-img05.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p04-img04.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p04-img01.jpg"
  ],
  "2013-11-b|kpg_fr_B_epr4_nov2013_livret.pdf|5": [
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p05-img05.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p05-img04.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p05-img02.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p05-img03.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p05-img01.jpg"
  ],
  "2013-11-b|kpg_fr_B_epr4_nov2013_livret.pdf|6": [
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p06-img03.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p06-img01.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p06-img02.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p06-img04.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p06-img05.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p06-img06.jpg"
  ],
  "2013-11-b|kpg_fr_B_epr4_nov2013_livret.pdf|7": [
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p07-img04.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p07-img03.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p07-img02.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p07-img01.jpg"
  ],
  "2013-11-b|kpg_fr_B_epr4_nov2013_livret.pdf|9": [
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p09-img02.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p09-img01.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p09-img03.jpg"
  ],
  "2013-11-b|kpg_fr_B_epr4_nov2013_livret.pdf|11": [
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p11-img02.jpg",
    "assets/exams/2013-11-b/images/kpg-fr-b-epr4-nov2013-livret-p11-img01.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr1_mai2014.pdf|2": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p02-img04.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p02-img03.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p02-img01.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p02-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p02-img05.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p02-img06.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr1_mai2014.pdf|3": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p03-img01.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p03-img03.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p03-img02.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr1_mai2014.pdf|4": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p04-img03.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p04-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p04-img05.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p04-img04.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p04-img01.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr1_mai2014.pdf|6": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p06-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p06-img01.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr1_mai2014.pdf|7": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p07-img03.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p07-img01.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr1-mai2014-p07-img02.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr2_mai2014.pdf|4": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p04-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p04-img03.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p04-img06.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p04-img09.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p04-img01.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p04-img07.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p04-img08.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p04-img05.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p04-img04.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr2_mai2014.pdf|5": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p05-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr2-mai2014-p05-img01.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr3_mai2014_consignes.pdf|2": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr3-mai2014-consignes-p02-img01.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr3-mai2014-consignes-p02-img05.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr3-mai2014-consignes-p02-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr3-mai2014-consignes-p02-img03.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr3-mai2014-consignes-p02-img04.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr3-mai2014-consignes-p02-img06.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr4_mai2014_livret.pdf|7": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p07-img05.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p07-img04.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p07-img01.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p07-img06.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p07-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p07-img03.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr4_mai2014_livret.pdf|8": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p08-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p08-img01.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p08-img03.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p08-img05.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p08-img04.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr4_mai2014_livret.pdf|9": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p09-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p09-img01.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p09-img03.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p09-img04.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p09-img05.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p09-img06.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr4_mai2014_livret.pdf|10": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p10-img03.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p10-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p10-img01.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p10-img04.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p10-img06.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p10-img05.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr4_mai2014_livret.pdf|11": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p11-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p11-img04.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p11-img06.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p11-img05.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p11-img01.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p11-img03.jpg"
  ],
  "2014-05-a|kpg_fr_A_epr4_mai2014_livret.pdf|15": [
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p15-img02.jpg",
    "assets/exams/2014-05-a/images/kpg-fr-a-epr4-mai2014-livret-p15-img01.jpg"
  ],
  "2014-05-b|kpg_fr_B_epr1_mai2014.pdf|3": [
    "assets/exams/2014-05-b/images/kpg-fr-b-epr1-mai2014-p03-img03.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr1-mai2014-p03-img01.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr1-mai2014-p03-img02.jpg"
  ],
  "2014-05-b|kpg_fr_B_epr4_mai2014_livret.pdf|6": [
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p06-img03.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p06-img06.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p06-img04.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p06-img05.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p06-img02.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p06-img01.jpg"
  ],
  "2014-05-b|kpg_fr_B_epr4_mai2014_livret.pdf|7": [
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p07-img04.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p07-img02.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p07-img05.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p07-img06.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p07-img01.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p07-img03.jpg"
  ],
  "2014-05-b|kpg_fr_B_epr4_mai2014_livret.pdf|8": [
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p08-img03.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p08-img06.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p08-img05.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p08-img04.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p08-img02.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p08-img01.jpg"
  ],
  "2014-05-b|kpg_fr_B_epr4_mai2014_livret.pdf|9": [
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p09-img06.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p09-img03.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p09-img01.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p09-img04.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p09-img02.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p09-img05.jpg"
  ],
  "2014-05-b|kpg_fr_B_epr4_mai2014_livret.pdf|10": [
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p10-img05.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p10-img03.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p10-img01.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p10-img04.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p10-img02.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p10-img06.jpg"
  ],
  "2014-05-b|kpg_fr_B_epr4_mai2014_livret.pdf|11": [
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p11-img01.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p11-img04.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p11-img02.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p11-img03.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p11-img05.jpg"
  ],
  "2014-05-b|kpg_fr_B_epr4_mai2014_livret.pdf|12": [
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p12-img06.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p12-img01.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p12-img04.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p12-img05.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p12-img03.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p12-img02.jpg"
  ],
  "2014-05-b|kpg_fr_B_epr4_mai2014_livret.pdf|15": [
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p15-img01.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p15-img03.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p15-img02.jpg"
  ],
  "2014-05-b|kpg_fr_B_epr4_mai2014_livret.pdf|16": [
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p16-img01.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p16-img05.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p16-img02.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p16-img04.jpg",
    "assets/exams/2014-05-b/images/kpg-fr-b-epr4-mai2014-livret-p16-img03.jpg"
  ],
  "2014-05-c|kpg_fr_C_epr4_mai2014_livret.pdf|12": [
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p12-img02.jpg",
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p12-img01.jpg",
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p12-img03.jpg"
  ],
  "2014-05-c|kpg_fr_C_epr4_mai2014_livret.pdf|15": [
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p15-img02.jpg",
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p15-img03.jpg",
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p15-img01.jpg",
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p15-img05.jpg",
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p15-img04.jpg",
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p15-img06.jpg"
  ],
  "2014-05-c|kpg_fr_C_epr4_mai2014_livret.pdf|16": [
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p16-img01.jpg",
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p16-img03.jpg",
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p16-img02.jpg",
    "assets/exams/2014-05-c/images/kpg-fr-c-epr4-mai2014-livret-p16-img04.jpg"
  ]
};

  Object.entries(PAGE_IMAGE_ORDERS).forEach(([key, orderedSources]) => {
    const [paperId, source, page] = key.split("|");
    const entries = window.paperImages?.[paperId]?.[source]?.[page];
    if (!Array.isArray(entries)) return;

    const rank = new Map(orderedSources.map((src, index) => [src, index]));
    entries.sort((left, right) => {
      const leftRank = rank.has(left.src) ? rank.get(left.src) : Number.MAX_SAFE_INTEGER;
      const rightRank = rank.has(right.src) ? rank.get(right.src) : Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank;
    });

    entries.forEach((entry, index) => {
      entry.alt = `${source} - page ${page}, image ${index + 1}`;
    });
  });
})();
