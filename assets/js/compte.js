/* BLANK — tableau de bord */
(function () {
  'use strict';

  var D = window.BLANK;
  var A = D.accounts;
  var el = document.getElementById('dash');
  var cardState = UI.cardState.get();

  function savingsCard(s, wide) {
    return '<section class="acct sec"' + (wide ? ' style="grid-column:1/-1"' : '') + ' aria-label="' + B.esc(s.label) + '">' +
      '<div class="label">' + B.icon('trend', 16) + B.esc(s.label) + ' <span class="pill acc">' + String(s.taux).replace('.', ',') + ' %</span></div>' +
      '<div class="amount" data-count="' + s.solde + '" data-format="eur">' + B.eur(s.solde) + '</div>' +
      '<div class="sub">Plafond ' + B.eur(s.plafond) + ' \u00b7 N\u00b0 \u2022\u2022\u2022\u2022 ' + s.numero.slice(-4) + '</div>' +
      '<div class="actions"><a class="btn btn-ghost btn-sm" href="virements.html">Alimenter</a></div>' +
    '</section>';
  }

  function maskIban(iban) { return iban.slice(0, 4) + ' •••• •••• •••• •••• ' + iban.slice(-3); }

  var hour = new Date().getHours();
  var greeting = hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour';
  var todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  /* Dépenses des 30 derniers jours par catégorie */
  var since = new Date(D.today.getTime() - 30 * 86400000);
  var cats = {};
  var total = 0;
  D.operations.forEach(function (o) {
    if (o.amount < 0 && o.date > since && o.category !== 'Virements' && o.category !== 'Retraits') {
      cats[o.category] = (cats[o.category] || 0) - o.amount;
      total -= o.amount;
    }
  });
  var catList = Object.keys(cats).map(function (k) { return [k, cats[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
  var maxCat = catList.length ? catList[0][1] : 1;

  var upcoming = D.mandates.slice().sort(function (a, b) { return a.next - b.next; }).slice(0, 4);

  var recent = D.operations.slice(0, 8);
  var lastDay = null;
  var recentHtml = recent.map(function (o) {
    var head = '';
    var lbl = B.dayLabel(o.date);
    if (lbl !== lastDay) { head = '<div class="day">' + B.esc(lbl) + '</div>'; lastDay = lbl; }
    return head + UI.opRow(o);
  }).join('');

  el.innerHTML =
    '<div class="page-head"><div><h1>' + greeting + ', ' + B.esc(D.client.prenom) + '</h1><p>' + B.esc(todayStr.charAt(0).toUpperCase() + todayStr.slice(1)) + '</p></div>' +
      '<div class="total"><small>Avoir total</small><b class="num" data-count="' + D.totalAssets() + '" data-format="eur">' + B.eur(D.totalAssets()) + '</b></div></div>' +

    '<div class="grid-2">' +
      '<section class="acct main" aria-label="Compte courant">' +
        '<div class="label">' + B.icon('card', 16) + A.courant.label + '</div>' +
        '<div class="amount" data-count="' + A.courant.solde + '" data-format="eur">' + B.eur(A.courant.solde) + '</div>' +
        '<div class="sub">' + maskIban(A.courant.iban) + '</div>' +
        '<div class="actions"><a class="btn btn-light btn-sm" href="virements.html">Faire un virement</a><a class="btn btn-ghost btn-sm" href="rib.html">Mon RIB</a></div>' +
      '</section>' +
      A.savings.map(function (s, i) { return savingsCard(s, (A.savings.length + 1) % 2 === 1 && i === A.savings.length - 1); }).join('') +
    '</div>' +

    '<div class="dash-grid">' +
      '<div>' +
        '<section class="panel stagger" id="recentOps"><div class="panel-head"><h2>Dernières opérations</h2><a class="link" href="operations.html">Tout voir</a></div>' + recentHtml + '</section>' +
      '</div>' +
      '<div>' +
        '<section class="panel"><div class="panel-head"><h2>' + D.card.label + '</h2><a class="link" href="carte.html">Gérer</a></div>' +
          '<a class="card-visual' + (cardState.locked ? ' locked' : '') + '" id="cardVisual" href="carte.html" aria-label="Gérer ma carte"><span class="logo"><span class="logo-mark"></span>blank</span>' +
          '<span class="pan">•••• •••• •••• ' + D.card.last4 + '</span>' +
          '<span class="holder"><span>' + B.esc(D.client.prenom + ' ' + D.client.nom) + '</span><span>' + D.card.expiration + '</span></span></a>' +
          '<div class="toggle-row"><div>Verrouiller la carte<small>Bloque tous les paiements</small></div><label class="switch"><input type="checkbox" id="lockCard" aria-label="Verrouiller la carte"' + (cardState.locked ? ' checked' : '') + '><span></span></label></div>' +
          '<div class="toggle-row"><div>Paiements hors Europe<small>Plafond ' + B.eur(D.card.plafondPaiement) + ' / 30 jours</small></div><label class="switch"><input type="checkbox" id="abroad" aria-label="Paiements hors Europe"' + (cardState.abroad ? ' checked' : '') + '><span></span></label></div>' +
        '</section>' +
        '<section class="panel"><div class="panel-head"><h2>Prochains prélèvements</h2><a class="link" href="prelevements.html">Gérer</a></div><ul class="upcoming">' +
          upcoming.map(function (m) {
            return '<li><div>' + B.esc(m.creditor) + '<small>' + B.esc(B.dateMed(m.next)) + '</small></div><div class="amt">' + B.eurSigned(m.amount) + '</div></li>';
          }).join('') +
        '</ul></section>' +
        '<section class="panel"><div class="panel-head"><h2>Dépenses sur 30 jours</h2><b class="num">' + B.eur(total) + '</b></div><div class="bars">' +
          catList.map(function (c) {
            return '<div class="bar-row"><div class="top"><span>' + B.esc(c[0]) + '</span><b>' + B.eur(c[1]) + '</b></div><div class="bar"><i style="width:' + Math.max(4, Math.round(c[1] / maxCat * 100)) + '%"></i></div></div>';
          }).join('') +
        '</div></section>' +
      '</div>' +
    '</div>';

  Array.prototype.forEach.call(el.querySelectorAll('[data-count]'), function (n) { Motion.countUp(n); });
  Motion.stagger(document.getElementById('recentOps'), '.op, .day', 10);
  Motion.tilt(document.getElementById('cardVisual'), { max: 10 });

  document.getElementById('lockCard').addEventListener('change', function (e) {
    UI.cardState.set('locked', e.target.checked);
    document.getElementById('cardVisual').classList.toggle('locked', e.target.checked);
    B.toast(e.target.checked ? 'Carte verrouillée. Aucun paiement ne sera accepté.' : 'Carte déverrouillée.');
  });
  document.getElementById('abroad').addEventListener('change', function (e) {
    UI.cardState.set('abroad', e.target.checked);
    B.toast(e.target.checked ? 'Paiements hors Europe activés pour 30 jours.' : 'Paiements hors Europe désactivés.');
  });
})();
