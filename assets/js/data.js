/* BLANK — données du compte client
   Les opérations sont générées à partir de la date du jour : l'historique
   paraît toujours à jour, avec des montants et des libellés stables. */
(function () {
  'use strict';

  var DAY = 86400000;
  var now = new Date();
  var TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  var HISTORY_DAYS = 125;

  /* ---------- Identité & accès ---------- */
  var ACCESS = { identifiant: '4829175306', code: '628419' };

  var CLIENT = {
    civilite: 'M.',
    prenom: 'Thomas',
    nom: 'Marchetti',
    email: 't.marchetti@mailbox.fr',
    telephone: '06 39 98 41 27',
    adresse: '34 rue Garibaldi, 69003 Lyon',
    derniereConnexion: new Date(TODAY.getTime() - DAY).setHours(21, 14)
  };

  var BANK = {
    nom: 'BLANK',
    domiciliation: 'BLANK – Agence en ligne',
    adresse: '12 place du Théâtre, 59000 Lille',
    telephone: '01 99 00 67 41',
    email: 'contact@blank-banque.fr'
  };

  var IBAN = 'FR7618999004170482716390541';
  var ACCOUNTS = {
    courant: {
      id: 'courant', label: 'Compte courant',
      numero: '04827163905', iban: IBAN, bic: 'BLNKFR21XXX',
      codeBanque: '18999', codeGuichet: '00417', cleRib: '41',
      solde: 9847.26
    },
    livret: {
      id: 'livret', label: 'Livret Jeune BLANK',
      numero: '04827163911', taux: 3.0, plafond: 10000,
      solde: 4215.00
    }
  };

  var CARD = { label: 'Carte BLANK Classic', last4: '4821', expiration: '09/28', plafondPaiement: 2500, plafondRetrait: 500 };

  /* ---------- Prélèvements récurrents (mandats SEPA) ---------- */
  var MANDATES = [
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
  ];

  var INCOME = [
    { label: 'VIR SEPA RECU NEXALYS CONSEIL SALAIRE', category: 'Revenus', amount: 2380.00, day: 28, kind: 'virement' }
  ];

  var ONE_OFF = [
    { daysAgo: 9, label: 'VIR SEPA RECU CPAM DU RHONE REMBT SOINS', category: 'Santé', amount: 26.50, kind: 'virement' },
    { daysAgo: 17, label: 'VIR INST EMIS LEA MARCHETTI COURSES', category: 'Virements', amount: -45.00, kind: 'virement' },
    { daysAgo: 23, label: 'VIR INST RECU JULIEN PETIT SOIREE', category: 'Virements', amount: 32.00, kind: 'virement' },
    { daysAgo: 41, label: 'RETRAIT DAB LYON PART DIEU', category: 'Retraits', amount: -60.00, kind: 'retrait' },
    { daysAgo: 58, label: 'VIR SEPA EMIS LEA MARCHETTI CADEAU', category: 'Virements', amount: -80.00, kind: 'virement' },
    { daysAgo: 77, label: 'RETRAIT DAB LYON GARIBALDI', category: 'Retraits', amount: -40.00, kind: 'retrait' },
    { daysAgo: 96, label: 'VIR SEPA RECU CPAM DU RHONE REMBT SOINS', category: 'Santé', amount: 18.90, kind: 'virement' }
  ];

  /* [libellé, catégorie, min, max] */
  var MERCHANTS = [
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
  ];

  /* ---------- Génération déterministe ---------- */
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
  function startDate() { return daysAgo(HISTORY_DAYS); }

  function monthlyDate(offset, day) {
    var last = new Date(TODAY.getFullYear(), TODAY.getMonth() - offset + 1, 0).getDate();
    return new Date(TODAY.getFullYear(), TODAY.getMonth() - offset, Math.min(day, last), 12);
  }

  var KIND_LABEL = { carte: 'Paiement par carte', prelevement: 'Prélèvement SEPA', virement: 'Virement', retrait: 'Retrait DAB' };

  function buildOperations() {
    var ops = [];
    var start = startDate();
    var seq = 0;
    function push(o) { o.seq = seq++; o.kindLabel = KIND_LABEL[o.kind]; ops.push(o); }

    for (var m = 0; m <= 5; m++) {
      MANDATES.forEach(function (md) {
        var d = monthlyDate(m, md.day);
        if (d <= TODAY && d >= start) push({ date: d, label: md.label, category: md.category, amount: md.amount, kind: 'prelevement', mandate: md.id });
      });
      INCOME.forEach(function (inc) {
        var d = monthlyDate(m, inc.day);
        if (d <= TODAY && d >= start) push({ date: d, label: inc.label, category: inc.category, amount: inc.amount, kind: inc.kind });
      });
    }

    ONE_OFF.forEach(function (o) {
      push({ date: daysAgo(o.daysAgo), label: o.label, category: o.category, amount: o.amount, kind: o.kind });
    });

    for (var i = 0; i <= HISTORY_DAYS; i++) {
      var d = daysAgo(i);
      var rnd = mulberry32(hash(d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()));
      var count = rnd() < 0.55 ? (rnd() < 0.22 ? 2 : 1) : 0;
      for (var c = 0; c < count; c++) {
        var mer = MERCHANTS[Math.floor(rnd() * MERCHANTS.length)];
        var amount = -round2(mer[2] + rnd() * (mer[3] - mer[2]));
        push({ date: d, label: mer[0], category: mer[1], amount: amount, kind: 'carte', pending: i <= 1 });
      }
    }

    ops.sort(function (a, b) { return b.date - a.date || a.seq - b.seq; });

    var running = ACCOUNTS.courant.solde;
    ops.forEach(function (o, idx) {
      o.id = 'op' + (ops.length - idx);
      o.balance = round2(running);
      running -= o.amount;
    });
    return ops;
  }

  /* Prochaine échéance (strictement après aujourd'hui) */
  function nextDue(day) {
    var d = monthlyDate(0, day);
    if (d <= TODAY) d = monthlyDate(-1, day);
    return d;
  }

  var OPS = buildOperations();
  var MANDATES_FULL = MANDATES.map(function (m) {
    var copy = {};
    for (var k in m) copy[k] = m[k];
    copy.next = nextDue(m.day);
    return copy;
  });

  window.BLANK = {
    today: TODAY,
    access: ACCESS,
    client: CLIENT,
    bank: BANK,
    accounts: ACCOUNTS,
    card: CARD,
    mandates: MANDATES_FULL,
    operations: OPS,
    kindLabel: KIND_LABEL,
    beneficiaries: [
      { id: 'b1', name: 'Léa Marchetti', iban: 'FR7617999002120739184620550' },
      { id: 'b2', name: 'Agence Lumière Immobilier', iban: 'FR7619999000880156274938072' }
    ]
  };
})();
