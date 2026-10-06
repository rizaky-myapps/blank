/* BLANK — liste des opérations */
(function () {
  'use strict';

  var D = window.BLANK;
  var list = document.getElementById('opsList');
  var sum = document.getElementById('opsSum');
  var q = document.getElementById('q');
  var kind = document.getElementById('kind');
  var period = document.getElementById('period');
  var params = new URLSearchParams(location.search);
  if (params.get('type')) kind.value = params.get('type');

  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function filtered() {
    var term = norm(q.value.trim());
    var days = parseInt(period.value, 10);
    var since = days ? new Date(D.today.getTime() - days * 86400000) : null;
    return D.operations.filter(function (o) {
      if (kind.value !== 'all' && o.kind !== kind.value) return false;
      if (since && o.date < since) return false;
      if (term && norm(o.label + ' ' + o.category + ' ' + o.kindLabel).indexOf(term) === -1) return false;
      return true;
    });
  }

  function render() {
    var ops = filtered();
    var inn = 0, out = 0;
    ops.forEach(function (o) { if (o.amount > 0) inn += o.amount; else out += o.amount; });
    sum.innerHTML =
      '<span><b>' + ops.length + '</b> opération' + (ops.length > 1 ? 's' : '') + '</span>' +
      '<span>Entrées <b class="num" style="color:var(--pos)">' + B.eurSigned(inn) + '</b></span>' +
      '<span>Sorties <b class="num">' + B.eurSigned(out) + '</b></span>';
    if (!ops.length) { list.innerHTML = '<div class="empty">Aucune opération ne correspond à votre recherche.</div>'; return; }
    var last = null;
    list.innerHTML = ops.map(function (o) {
      var lbl = B.dayLabel(o.date), head = '';
      if (lbl !== last) { head = '<div class="day">' + B.esc(lbl) + '</div>'; last = lbl; }
      return head + UI.opRow(o, { balance: true });
    }).join('');
  }

  [q, kind, period].forEach(function (c) { c.addEventListener('input', render); });

  document.getElementById('exportCsv').addEventListener('click', function () {
    var rows = [['Date', 'Libellé', 'Type', 'Catégorie', 'Montant (EUR)', 'Solde (EUR)']];
    filtered().forEach(function (o) {
      rows.push([B.dateShort(o.date), o.label, o.kindLabel, o.category, o.amount.toFixed(2).replace('.', ','), o.balance.toFixed(2).replace('.', ',')]);
    });
    var csv = '﻿' + rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(';');
    }).join('\r\n');
    var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'operations-blank-' + D.accounts.courant.numero.slice(-4) + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });

  render();
})();
