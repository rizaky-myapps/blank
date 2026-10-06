/* BLANK — données des comptes clients
   Les opérations sont générées à partir de la date du jour : l'historique
   paraît toujours à jour, avec des montants et des libellés stables.
   Les virements exécutés depuis l'espace client sont conservés dans un
   registre local (localStorage) puis fusionnés à l'historique et aux soldes. */
(function () {
  'use strict';

  var DAY = 86400000;
  var now = new Date();
  var TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  var HISTORY_DAYS = 125;
  var LEDGER_KEY = 'blank_ledger';
  var USER_KEY = 'blank_user';
  var DEFAULT_USER = 'thomas';

  var BANK = {
    nom: 'BLANK',
    domiciliation: 'BLANK – Agence en ligne',
    adresse: '12 place du Théâtre, 59000 Lille',
    telephone: '01 99 00 67 41',
    oppositionTelephone: '01 99 00 67 42',
    email: 'contact@blank-banque.fr'
  };

  var KIND_LABEL = { carte: 'Paiement par carte', prelevement: 'Prélèvement SEPA', virement: 'Virement', retrait: 'Retrait DAB' };

  var THOMAS_IBAN = 'FR7618999004170482716390541';
  var LEA_IBAN = 'FR7618999004170491238560766';

  /* =========================================================
     Profils clients
     ========================================================= */
  var USERS = {};

  /* ---------- Thomas ---------- */
  USERS.thomas = {
    access: { identifiant: '4829175306', code: '628419' },
    client: {
      civilite: 'M.', prenom: 'Thomas', nom: 'Marchetti',
      email: 't.marchetti@mailbox.fr', telephone: '06 39 98 41 27',
      adresse: '34 rue Garibaldi, 69003 Lyon',
      derniereConnexion: { daysAgo: 1, hour: 21, minute: 14 }
    },
    accounts: {
      courant: {
        id: 'courant', label: 'Compte courant',
        numero: '04827163905', iban: THOMAS_IBAN, bic: 'BLNKFR21XXX',
        codeBanque: '18999', codeGuichet: '00417', cleRib: '41',
        baseSolde: 9847.26
      },
      savings: [
        { id: 'livret', label: 'Livret Jeune BLANK', numero: '04827163911', taux: 3.0, plafond: 10000, solde: 4215.00 }
      ]
    },
    card: {
      label: 'Carte BLANK Classic', type: 'Débit immédiat',
      number: '4970839946964821', last4: '4821', expiration: '09/28', cvv: '507',
      holder: 'THOMAS MARCHETTI', issued: '2023-09-14',
      plafondPaiement: 2500, plafondRetrait: 500
    },
    mandates: [
      { id: 'm1', creditor: 'Agence Lumière Immobilier', short: 'Loyer', label: 'PRLV SEPA AGENCE LUMIERE IMMOBILIER LOYER', category: 'Logement', amount: -745.00, day: 5, ics: 'FR45ZZZ812907', rum: 'LOY-2023-00418', signed: '2023-08-29', freq: 'Mensuel' },
      { id: 'm2', creditor: 'EDF', short: 'Électricité', label: 'PRLV SEPA EDF CLIENTS PARTICULIERS', category: 'Logement', amount: -68.40, day: 12, ics: 'FR84ZZZ005394', rum: 'EDF-0067291-5', signed: '2023-09-04', freq: 'Mensuel' },
      { id: 'm3', creditor: 'Free Mobile', short: 'Forfait mobile', label: 'PRLV SEPA FREE MOBILE', category: 'Abonnements', amount: -19.99, day: 8, ics: 'FR83ZZZ465730', rum: 'FM-9128840', signed: '2022-11-17', freq: 'Mensuel' },
      { id: 'm4', creditor: 'Free', short: 'Box internet', label: 'PRLV SEPA FREE HAUT DEBIT', category: 'Abonnements', amount: -39.99, day: 8, ics: 'FR60ZZZ441822', rum: 'FH-4471205', signed: '2023-09-12', freq: 'Mensuel' },
      { id: 'm5', creditor: 'Netflix', short: 'Streaming', label: 'PRLV SEPA NETFLIX INTERNATIONAL B.V.', category: 'Abonnements', amount: -13.49, day: 14, ics: 'NL08ZZZ331254', rum: 'NFX-58821903', signed: '2022-12-02', freq: 'Mensuel' },
      { id: 'm6', creditor: 'Spotify', short: 'Musique', label: 'PRLV SEPA SPOTIFY AB', category: 'Abonnements', amount: -10.99, day: 3, ics: 'SE12ZZZ000017', rum: 'SPT-77410362', signed: '2022-10-21', freq: 'Mensuel' },
      { id: 'm7', creditor: 'Amazon Prime', short: 'Livraison Prime', label: 'PRLV SEPA AMAZON EU SARL PRIME', category: 'Abonnements', amount: -6.99, day: 17, ics: 'LU27ZZZ040102', rum: 'AMZ-30561184', signed: '2023-03-09', freq: 'Mensuel' },
      { id: 'm8', creditor: 'Basic-Fit', short: 'Salle de sport', label: 'PRLV SEPA BASIC-FIT LYON GARIBALDI', category: 'Loisirs', amount: -29.99, day: 1, ics: 'FR31ZZZ617205', rum: 'BF-2023-117840', signed: '2023-09-14', freq: 'Mensuel' },
      { id: 'm9', creditor: 'MAIF', short: 'Assurance habitation', label: 'PRLV SEPA MAIF COTISATION HABITATION', category: 'Assurances', amount: -14.62, day: 20, ics: 'FR07ZZZ100330', rum: 'MAIF-8841620', signed: '2023-08-30', freq: 'Mensuel' },
      { id: 'm10', creditor: 'TCL Sytral Mobilités', short: 'Abonnement transports', label: 'PRLV SEPA TCL SYTRAL MOBILITES ABO', category: 'Transport', amount: -48.50, day: 2, ics: 'FR92ZZZ559123', rum: 'TCL-0049317', signed: '2023-09-01', freq: 'Mensuel' },
      { id: 'm11', creditor: 'Cofidis', short: 'Crédit conso', label: 'PRLV SEPA COFIDIS ECHEANCE CREDIT', category: 'Crédit', amount: -156.00, day: 10, ics: 'FR89ZZZ322560', rum: 'COF-2024-5530941', signed: '2024-01-22', freq: 'Mensuel' },
      { id: 'm12', creditor: 'Direction Générale des Finances Publiques', short: 'Impôt sur le revenu', label: 'PRLV SEPA DGFIP PRELEVEMENT MENSUEL', category: 'Impôts', amount: -112.00, day: 15, ics: 'FR72ZZZ006190', rum: 'DGFIP-0073358', signed: '2023-02-06', freq: 'Mensuel' }
    ],
    income: [
      { label: 'VIR SEPA RECU NEXALYS CONSEIL SALAIRE', category: 'Revenus', amount: 2380.00, day: 28, kind: 'virement' }
    ],
    oneOff: [
      { daysAgo: 9, label: 'VIR SEPA RECU CPAM DU RHONE REMBT SOINS', category: 'Santé', amount: 26.50, kind: 'virement' },
      { daysAgo: 17, label: 'VIR INST EMIS LEA MARCHETTI COURSES', category: 'Virements', amount: -45.00, kind: 'virement' },
      { daysAgo: 23, label: 'VIR INST RECU JULIEN PETIT SOIREE', category: 'Virements', amount: 32.00, kind: 'virement' },
      { daysAgo: 41, label: 'RETRAIT DAB LYON PART DIEU', category: 'Retraits', amount: -60.00, kind: 'retrait' },
      { daysAgo: 58, label: 'VIR SEPA EMIS LEA MARCHETTI CADEAU', category: 'Virements', amount: -80.00, kind: 'virement' },
      { daysAgo: 77, label: 'RETRAIT DAB LYON GARIBALDI', category: 'Retraits', amount: -40.00, kind: 'retrait' },
      { daysAgo: 96, label: 'VIR SEPA RECU CPAM DU RHONE REMBT SOINS', category: 'Santé', amount: 18.90, kind: 'virement' }
    ],
    /* [libellé, catégorie, min, max] */
    merchants: [
      ['CB CARREFOUR CITY LYON 03', 'Courses', 8, 46],
      ['CB MONOPRIX LYON GARIBALDI', 'Courses', 12, 58],
      ['CB LIDL LYON 03', 'Courses', 14, 64],
      ['CB BOULANGERIE PAUL', 'Restauration', 2.4, 9.8],
      ['CB TABAC PRESSE DE LA PART DIEU', 'Divers', 3, 22],
      ['CB UBER EATS', 'Restauration', 15, 38],
      ['CB DELIVEROO', 'Restauration', 17, 41],
      ['CB MC DONALDS LYON', 'Restauration', 6, 17],
      ['CB STARBUCKS LYON PART DIEU', 'Restauration', 4.5, 9.5],
      ['CB SNCF CONNECT', 'Transport', 19, 74],
      ['CB UBER TRIP', 'Transport', 7, 24],
      ['CB TOTALENERGIES LYON', 'Transport', 28, 66],
      ['CB PHARMACIE DE LA GARE', 'Santé', 4, 26],
      ['CB DECATHLON LYON', 'Loisirs', 12, 80],
      ['CB FNAC LYON BELLECOUR', 'Loisirs', 9, 54],
      ['CB AMAZON EU SARL', 'Shopping', 11, 72],
      ['CB ZARA LYON', 'Shopping', 20, 85]
    ],
    beneficiaries: [
      { id: 'b1', name: 'Léa Marchetti', iban: LEA_IBAN },
      { id: 'b2', name: 'Agence Lumière Immobilier', iban: 'FR7619999000880156274938072' }
    ]
  };

  /* ---------- Léa ---------- */
  USERS.lea = {
    access: { identifiant: '5731048296', code: '395172' },
    client: {
      civilite: 'Mme', prenom: 'Léa', nom: 'Marchetti',
      email: 'lea.marchetti@mailbox.fr', telephone: '06 39 98 52 16',
      adresse: '8 quai Saint-Antoine, 69002 Lyon',
      derniereConnexion: { daysAgo: 1, hour: 8, minute: 52 }
    },
    accounts: {
      courant: {
        id: 'courant', label: 'Compte courant',
        numero: '04912385607', iban: LEA_IBAN, bic: 'BLNKFR21XXX',
        codeBanque: '18999', codeGuichet: '00417', cleRib: '66',
        baseSolde: 148730.42
      },
      savings: [
        { id: 'livret', label: 'Livret BLANK', numero: '04912385613', taux: 2.4, plafond: 22950, solde: 22950.00 },
        { id: 'epargne', label: 'Compte Épargne Plus', numero: '04912385620', taux: 3.5, plafond: 250000, solde: 112400.00 }
      ]
    },
    card: {
      label: 'Carte BLANK Premium', type: 'Débit immédiat',
      number: '4970830667817306', last4: '7306', expiration: '03/29', cvv: '318',
      holder: 'LEA MARCHETTI', issued: '2024-03-11',
      plafondPaiement: 15000, plafondRetrait: 1500
    },
    mandates: [
      { id: 'l1', creditor: 'Gestion Rive Gauche Immobilier', short: 'Loyer', label: 'PRLV SEPA GESTION RIVE GAUCHE IMMOBILIER LOYER', category: 'Logement', amount: -1850.00, day: 3, ics: 'FR58ZZZ774301', rum: 'LOY-2022-00871', signed: '2022-06-14', freq: 'Mensuel' },
      { id: 'l2', creditor: 'Banque Rhodanienne', short: 'Prêt immobilier', label: 'PRLV SEPA BANQUE RHODANIENNE ECHEANCE PRET', category: 'Crédit', amount: -1240.00, day: 5, ics: 'FR19ZZZ458812', rum: 'PRET-2021-0045512', signed: '2021-03-02', freq: 'Mensuel' },
      { id: 'l3', creditor: 'EDF', short: 'Électricité', label: 'PRLV SEPA EDF CLIENTS PARTICULIERS', category: 'Logement', amount: -94.20, day: 11, ics: 'FR84ZZZ005394', rum: 'EDF-0145873-2', signed: '2022-06-20', freq: 'Mensuel' },
      { id: 'l4', creditor: 'Engie', short: 'Gaz', label: 'PRLV SEPA ENGIE PARTICULIERS GAZ', category: 'Logement', amount: -52.30, day: 12, ics: 'FR62ZZZ316640', rum: 'ENG-6620418', signed: '2022-06-20', freq: 'Mensuel' },
      { id: 'l5', creditor: 'Orange', short: 'Fibre', label: 'PRLV SEPA ORANGE FIBRE', category: 'Abonnements', amount: -44.99, day: 9, ics: 'FR51ZZZ002287', rum: 'ORG-81420395', signed: '2022-07-01', freq: 'Mensuel' },
      { id: 'l6', creditor: 'Free Mobile', short: 'Forfait mobile', label: 'PRLV SEPA FREE MOBILE', category: 'Abonnements', amount: -19.99, day: 8, ics: 'FR83ZZZ465730', rum: 'FM-5520176', signed: '2021-09-10', freq: 'Mensuel' },
      { id: 'l7', creditor: 'AXA Assurance', short: 'Assurance auto', label: 'PRLV SEPA AXA FRANCE IARD AUTO', category: 'Assurances', amount: -78.40, day: 18, ics: 'FR14ZZZ410287', rum: 'AXA-2023-7710365', signed: '2023-01-18', freq: 'Mensuel' },
      { id: 'l8', creditor: 'Harmonie Mutuelle', short: 'Mutuelle santé', label: 'PRLV SEPA HARMONIE MUTUELLE COTISATION', category: 'Assurances', amount: -89.50, day: 7, ics: 'FR27ZZZ551904', rum: 'HM-0338841', signed: '2022-07-05', freq: 'Mensuel' },
      { id: 'l9', creditor: 'Netflix', short: 'Streaming Premium', label: 'PRLV SEPA NETFLIX INTERNATIONAL B.V.', category: 'Abonnements', amount: -17.99, day: 14, ics: 'NL08ZZZ331254', rum: 'NFX-40927761', signed: '2021-10-12', freq: 'Mensuel' },
      { id: 'l10', creditor: 'Disney+', short: 'Streaming', label: 'PRLV SEPA DISNEY PLUS', category: 'Abonnements', amount: -11.99, day: 21, ics: 'NL93ZZZ627410', rum: 'DSN-77104238', signed: '2022-11-24', freq: 'Mensuel' },
      { id: 'l11', creditor: 'Apple', short: 'iCloud+', label: 'PRLV SEPA APPLE DISTRIBUTION INTL ICLOUD', category: 'Abonnements', amount: -9.99, day: 23, ics: 'IE26ZZZ338154', rum: 'APL-5530187', signed: '2021-12-03', freq: 'Mensuel' },
      { id: 'l12', creditor: 'Cercle Sportif de Lyon', short: 'Club de sport', label: 'PRLV SEPA CERCLE SPORTIF DE LYON COTISATION', category: 'Loisirs', amount: -79.00, day: 1, ics: 'FR33ZZZ290716', rum: 'CSL-2023-0914', signed: '2023-09-02', freq: 'Mensuel' },
      { id: 'l13', creditor: 'Direction Générale des Finances Publiques', short: 'Impôt sur le revenu', label: 'PRLV SEPA DGFIP PRELEVEMENT MENSUEL', category: 'Impôts', amount: -412.00, day: 15, ics: 'FR72ZZZ006190', rum: 'DGFIP-0128840', signed: '2022-02-08', freq: 'Mensuel' },
      { id: 'l14', creditor: 'Altivie Assurance Vie', short: 'Versement programmé', label: 'PRLV SEPA ALTIVIE VERSEMENT PROGRAMME', category: 'Épargne', amount: -500.00, day: 25, ics: 'FR40ZZZ803562', rum: 'ALT-2022-0067719', signed: '2022-09-15', freq: 'Mensuel' }
    ],
    income: [
      { label: 'VIR SEPA RECU HELIOS CONSULTING SALAIRE', category: 'Revenus', amount: 6480.00, day: 27, kind: 'virement' },
      { label: 'VIR SEPA RECU SCI DES QUAIS LOYERS', category: 'Revenus', amount: 1150.00, day: 4, kind: 'virement' }
    ],
    oneOff: [
      { daysAgo: 17, label: 'VIR INST RECU THOMAS MARCHETTI COURSES', category: 'Virements', amount: 45.00, kind: 'virement' },
      { daysAgo: 21, label: 'VIR SEPA EMIS NOTAIRE MAITRE LAMBERT FRAIS ACTE', category: 'Divers', amount: -2480.00, kind: 'virement' },
      { daysAgo: 38, label: 'VIR SEPA RECU HELIOS CONSULTING PRIME ANNUELLE', category: 'Revenus', amount: 8500.00, kind: 'virement' },
      { daysAgo: 45, label: 'RETRAIT DAB LYON BELLECOUR', category: 'Retraits', amount: -200.00, kind: 'retrait' },
      { daysAgo: 58, label: 'VIR SEPA RECU THOMAS MARCHETTI CADEAU', category: 'Virements', amount: 80.00, kind: 'virement' },
      { daysAgo: 62, label: 'VIR SEPA RECU SCI DES QUAIS DIVIDENDES T2', category: 'Revenus', amount: 3200.00, kind: 'virement' },
      { daysAgo: 83, label: 'RETRAIT DAB LYON PART DIEU', category: 'Retraits', amount: -300.00, kind: 'retrait' },
      { daysAgo: 105, label: 'VIR SEPA RECU HELIOS CONSULTING NOTE DE FRAIS', category: 'Revenus', amount: 642.30, kind: 'virement' }
    ],
    merchants: [
      ['CB MONOPRIX LYON BELLECOUR', 'Courses', 18, 96],
      ['CB BIOCOOP LYON 02', 'Courses', 12, 70],
      ['CB CARREFOUR MARKET LYON 02', 'Courses', 20, 110],
      ['CB BOULANGERIE PAUL', 'Restauration', 3, 14],
      ['CB LE BOUCHON DES FILLES LYON', 'Restauration', 38, 120],
      ['CB RESTAURANT LES TROIS DOMES', 'Restauration', 90, 260],
      ['CB STARBUCKS LYON BELLECOUR', 'Restauration', 5, 12],
      ['CB UBER TRIP', 'Transport', 9, 38],
      ['CB SNCF CONNECT', 'Transport', 45, 210],
      ['CB AIR FRANCE', 'Transport', 180, 620],
      ['CB TOTALENERGIES LYON', 'Transport', 55, 110],
      ['CB BOOKING.COM', 'Loisirs', 140, 520],
      ['CB FNAC LYON BELLECOUR', 'Loisirs', 18, 140],
      ['CB DECATHLON LYON', 'Loisirs', 20, 160],
      ['CB SEPHORA LYON', 'Shopping', 25, 130],
      ['CB GALERIES LAFAYETTE LYON', 'Shopping', 60, 420],
      ['CB SEZANE', 'Shopping', 80, 260],
      ['CB APPLE STORE', 'Shopping', 29, 290],
      ['CB AMAZON EU SARL', 'Shopping', 14, 180],
      ['CB PHARMACIE DE LA REPUBLIQUE', 'Santé', 6, 48]
    ],
    beneficiaries: [
      { id: 'b1', name: 'Thomas Marchetti', iban: THOMAS_IBAN },
      { id: 'b2', name: 'Gestion Rive Gauche Immobilier', iban: 'FR7619999000880372196485082' }
    ]
  };

  /* =========================================================
     Génération déterministe
     ========================================================= */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function round2(n) { return Math.round(n * 100) / 100; }
  function daysAgo(n) { return new Date(TODAY.getTime() - n * DAY); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function dayKey(d) { return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate(); }

  function monthlyDate(offset, day) {
    var last = new Date(TODAY.getFullYear(), TODAY.getMonth() - offset + 1, 0).getDate();
    return new Date(TODAY.getFullYear(), TODAY.getMonth() - offset, Math.min(day, last), 12);
  }

  /* Prochaine échéance (strictement après aujourd'hui) */
  function nextDue(day) {
    var d = monthlyDate(0, day);
    if (d <= TODAY) d = monthlyDate(-1, day);
    return d;
  }

  /* ---------- Registre local des virements ---------- */
  function readLedger() {
    var l = window.B && window.B.local ? window.B.local.get(LEDGER_KEY, {}) : {};
    return l && typeof l === 'object' && !Array.isArray(l) ? l : {};
  }
  function writeLedger(l) { if (window.B && window.B.local) window.B.local.set(LEDGER_KEY, l); }
  function validEntry(o) {
    return o && typeof o === 'object' && isFinite(o.ts) && isFinite(o.amount) && o.amount !== 0 &&
      typeof o.label === 'string' && typeof o.ref === 'string';
  }
  function userLedger(key) {
    var list = readLedger()[key];
    return Array.isArray(list) ? list.filter(validEntry) : [];
  }
  function addLedger(key, entry) {
    var all = readLedger();
    var list = Array.isArray(all[key]) ? all[key] : [];
    list.push(entry);
    all[key] = list.slice(-200);
    writeLedger(all);
  }

  /* ---------- Historique d'un client ---------- */
  function buildOperations(key, def, ledger, balance) {
    var ops = [];
    var start = daysAgo(HISTORY_DAYS);
    var seq = 0;
    function push(o) { o.seq = seq++; o.kindLabel = KIND_LABEL[o.kind]; ops.push(o); }

    for (var m = 0; m <= 5; m++) {
      def.mandates.forEach(function (md) {
        var d = monthlyDate(m, md.day);
        if (d <= TODAY && d >= start) push({ date: d, label: md.label, category: md.category, amount: md.amount, kind: 'prelevement', mandate: md.id });
      });
      def.income.forEach(function (inc) {
        var d = monthlyDate(m, inc.day);
        if (d <= TODAY && d >= start) push({ date: d, label: inc.label, category: inc.category, amount: inc.amount, kind: inc.kind });
      });
    }

    def.oneOff.forEach(function (o) {
      push({ date: daysAgo(o.daysAgo), label: o.label, category: o.category, amount: o.amount, kind: o.kind });
    });

    for (var i = 0; i <= HISTORY_DAYS; i++) {
      var d = daysAgo(i);
      var seed = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
      var rnd = mulberry32(hash(key === 'thomas' ? seed : key + '|' + seed));
      var count = rnd() < 0.55 ? (rnd() < 0.22 ? 2 : 1) : 0;
      for (var c = 0; c < count; c++) {
        var mer = def.merchants[Math.floor(rnd() * def.merchants.length)];
        var amount = -round2(mer[2] + rnd() * (mer[3] - mer[2]));
        push({ date: d, label: mer[0], category: mer[1], amount: amount, kind: 'carte', pending: i <= 1 });
      }
    }

    ledger.forEach(function (e, idx) {
      var ts = Math.min(e.ts, Date.now());
      ops.push({
        id: 'L' + e.ref + '-' + idx, date: new Date(ts), ts: ts,
        label: String(e.label).slice(0, 90), category: 'Virements',
        amount: round2(e.amount), kind: 'virement', kindLabel: KIND_LABEL.virement,
        ledger: true, ref: e.ref, counterparty: String(e.counterparty || '').slice(0, 60), motif: String(e.motif || '').slice(0, 35)
      });
    });

    /* Jour décroissant ; dans un même jour, les virements récents d'abord */
    ops.sort(function (a, b) {
      var da = dayKey(a.date), db = dayKey(b.date);
      if (da !== db) return db - da;
      if (a.ledger && b.ledger) return b.ts - a.ts;
      if (a.ledger) return -1;
      if (b.ledger) return 1;
      return a.seq - b.seq;
    });

    var running = balance;
    var baseCount = ops.length;
    ops.forEach(function (o, idx) {
      if (!o.ledger) o.id = 'op' + (baseCount - idx);
      o.balance = round2(running);
      running -= o.amount;
    });
    return ops;
  }

  function buildUser(key) {
    var def = USERS[key];
    var ledger = userLedger(key);
    var ledgerSum = ledger.reduce(function (s, e) { return s + e.amount; }, 0);

    var accounts = { courant: clone(def.accounts.courant), savings: clone(def.accounts.savings) };
    accounts.courant.solde = round2(def.accounts.courant.baseSolde + ledgerSum);

    var c = clone(def.client);
    var last = new Date(TODAY.getTime() - c.derniereConnexion.daysAgo * DAY);
    c.derniereConnexion = last.setHours(c.derniereConnexion.hour, c.derniereConnexion.minute);

    return {
      key: key,
      client: c,
      accounts: accounts,
      card: clone(def.card),
      mandates: def.mandates.map(function (m) { var copy = clone(m); copy.next = nextDue(m.day); return copy; }),
      operations: buildOperations(key, def, ledger, accounts.courant.solde),
      beneficiaries: clone(def.beneficiaries)
    };
  }

  /* ---------- Virements ---------- */
  function normIban(s) { return String(s || '').replace(/\s+/g, '').toUpperCase(); }
  function plain(s, max) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
      .replace(/[^A-Z0-9 '.\-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 40);
  }

  function findAccountByIban(iban) {
    var n = normIban(iban);
    for (var k in USERS) {
      if (USERS[k].accounts.courant.iban === n) {
        return { key: k, name: USERS[k].client.prenom + ' ' + USERS[k].client.nom };
      }
    }
    return null;
  }

  function totalAssets(accounts) {
    return round2(accounts.courant.solde + accounts.savings.reduce(function (s, a) { return s + a.solde; }, 0));
  }

  /* Exécute un virement instantané : débit du compte courant de l'utilisateur
     connecté et, si l'IBAN est celui d'un autre client, crédit de son compte. */
  function transfer(opts) {
    var me = BLANK;
    var amount = round2(Number(opts && opts.amount));
    if (!(amount > 0)) return { ok: false, error: 'amount' };
    if (amount > me.accounts.courant.solde) return { ok: false, error: 'funds' };
    var iban = normIban(opts.toIban);
    if (iban === me.accounts.courant.iban) return { ok: false, error: 'same' };

    var toName = String(opts.toName || '').trim().slice(0, 60) || 'BENEFICIAIRE';
    var motif = String(opts.motif || '').trim().slice(0, 35);
    var ts = Date.now();
    var ref = 'VIR' + String(ts).slice(-9);
    var senderName = me.client.prenom + ' ' + me.client.nom;
    var target = findAccountByIban(iban);

    addLedger(me.userKey, {
      ts: ts, ref: ref, amount: -amount,
      label: ('VIR INST EMIS ' + plain(toName, 34) + (motif ? ' ' + plain(motif, 24) : '')).trim(),
      counterparty: toName, motif: motif, iban: iban
    });
    if (target) {
      addLedger(target.key, {
        ts: ts, ref: ref, amount: amount,
        label: ('VIR INST RECU ' + plain(senderName, 34) + (motif ? ' ' + plain(motif, 24) : '')).trim(),
        counterparty: senderName, motif: motif, iban: me.accounts.courant.iban
      });
    }

    load(me.userKey);
    return { ok: true, ref: ref, amount: amount, name: toName, iban: iban, internal: !!target, balance: BLANK.accounts.courant.solde };
  }

  /* ---------- Exposition ---------- */
  function currentKey() {
    var k = window.B && window.B.session ? window.B.session.get(USER_KEY, DEFAULT_USER) : DEFAULT_USER;
    return USERS[k] ? k : DEFAULT_USER;
  }

  var BLANK = {
    today: TODAY,
    bank: BANK,
    kindLabel: KIND_LABEL,
    userKey: null,
    accessList: Object.keys(USERS).map(function (k) { return { key: k, identifiant: USERS[k].access.identifiant, code: USERS[k].access.code }; }),
    findAccountByIban: findAccountByIban,
    transfer: transfer,
    totalAssets: function () { return totalAssets(BLANK.accounts); },
    /* Efface le registre des virements et les réglages mémorisés (remise à zéro) */
    reset: function () {
      if (!window.B) return;
      window.B.local.del(LEDGER_KEY);
      Object.keys(USERS).forEach(function (k) {
        window.B.local.del('blank_card_' + k);
        window.B.local.del('blank_revoked_' + k);
      });
    }
  };

  function load(key) {
    var u = buildUser(key);
    BLANK.userKey = key;
    BLANK.client = u.client;
    BLANK.accounts = u.accounts;
    BLANK.card = u.card;
    BLANK.mandates = u.mandates;
    BLANK.operations = u.operations;
    BLANK.beneficiaries = u.beneficiaries;
  }

  load(currentKey());
  window.BLANK = BLANK;
})();
