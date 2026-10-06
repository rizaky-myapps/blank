/* BLANK — mandats et prélèvements SEPA */
(function () {
  'use strict';

  var D = window.BLANK;
  var KEY = 'blank_revoked';
  var revoked = B.local.get(KEY, []);

  var sumEl = document.getElementById('mandSum');
  var tbody = document.getElementById('mandBody');
  var histEl = document.getElementById('prlvHist');

  function status(m) {
    return revoked.indexOf(m.id) !== -1
      ? '<span class="pill warn">Révocation en cours</span>'
      : '<span class="pill pos">Actif</span>';
  }

  function render() {
    var active = D.mandates.filter(function (m) { return revoked.indexOf(m.id) === -1; });
    var total = active.reduce(function (s, m) { return s + m.amount; }, 0);
    sumEl.innerHTML =
      '<span><b>' + active.length + '</b> mandat' + (active.length > 1 ? 's' : '') + ' actif' + (active.length > 1 ? 's' : '') + '</span>' +
      '<span>Total mensuel <b class="num">' + B.eur(-total) + '</b></span>' +
      '<span>Prochain prélèvement <b>' + B.esc(B.dateMed(D.mandates.slice().sort(function (a, b) { return a.next - b.next; })[0].next)) + '</b></span>';

    tbody.innerHTML = D.mandates.slice().sort(function (a, b) { return a.next - b.next; }).map(function (m) {
      return '<tr>' +
        '<td class="c-name"><div class="creditor"><div class="op-ico" style="background:' + UI.tint(m.label) + ';width:38px;height:38px;border-radius:12px" aria-hidden="true">' + B.esc(UI.initials(m.label)) + '</div><div>' + B.esc(m.creditor) + '<small>' + B.esc(m.short) + ' · ' + B.esc(m.freq) + '</small></div></div></td>' +
        '<td class="mono" data-label="Réf.">' + B.esc(m.rum) + '</td>' +
        '<td class="amt" data-label="Montant">' + B.eur(-m.amount) + '</td>' +
        '<td data-label="Prochain">' + B.esc(B.dateMed(m.next)) + '</td>' +
        '<td>' + status(m) + '</td>' +
        '<td class="c-action"><button class="btn btn-ghost btn-sm" data-id="' + m.id + '">Gérer</button></td></tr>';
    }).join('');
  }

  function details(m) {
    var isRevoked = revoked.indexOf(m.id) !== -1;
    var rows = [
      ['Créancier', m.creditor],
      ['Référence unique de mandat', m.rum],
      ['Identifiant créancier SEPA', m.ics],
      ['Compte débité', D.accounts.courant.label + ' •••• ' + D.accounts.courant.numero.slice(-4)],
      ['Signé le', B.dateMed(new Date(m.signed + 'T12:00:00'))],
      ['Montant habituel', B.eur(-m.amount) + ' / mois'],
      ['Prochaine échéance', B.dateMed(m.next)]
    ];
    var body = '<div class="recap">' + rows.map(function (r) { return '<div><span>' + B.esc(r[0]) + '</span><b>' + B.esc(r[1]) + '</b></div>'; }).join('') + '</div>';
    B.modal({
      title: m.short,
      body: body,
      actions: isRevoked
        ? [{ label: 'Fermer', cls: 'btn-dark' }]
        : [{ label: 'Fermer', cls: 'btn-ghost' }, { label: 'Révoquer ce mandat', cls: 'btn-dark', onClick: function (close) { close(); confirmRevoke(m); } }]
    });
  }

  function confirmRevoke(m) {
    B.modal({
      title: 'Révoquer le mandat ?',
      body: '<p>Les prélèvements de <b>' + B.esc(m.creditor) + '</b> seront refusés à partir de la prochaine échéance. Le créancier pourra vous réclamer les sommes dues par un autre moyen.</p>',
      actions: [
        { label: 'Annuler', cls: 'btn-ghost' },
        { label: 'Confirmer la révocation', cls: 'btn-primary', onClick: function (close) {
          revoked.push(m.id); B.local.set(KEY, revoked); close(); render();
          B.toast('Demande enregistrée. Elle sera effective sous 48 h ouvrées.');
        } }
      ]
    });
  }

  tbody.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-id]');
    if (!b) return;
    var m = D.mandates.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
    if (m) details(m);
  });

  var hist = D.operations.filter(function (o) { return o.kind === 'prelevement'; }).slice(0, 12);
  var last = null;
  histEl.innerHTML = hist.map(function (o) {
    var lbl = B.dayLabel(o.date), head = '';
    if (lbl !== last) { head = '<div class="day">' + B.esc(lbl) + '</div>'; last = lbl; }
    return head + UI.opRow(o);
  }).join('');

  render();
})();
