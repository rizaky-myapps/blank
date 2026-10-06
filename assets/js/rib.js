/* BLANK — relevé d'identité bancaire */
(function () {
  'use strict';

  var D = window.BLANK;
  var A = D.accounts.courant;
  var C = D.client;

  function grouped(s) { return s.replace(/(.{4})/g, '$1 ').trim(); }

  var rows = [
    ['Titulaire', C.civilite + ' ' + C.prenom + ' ' + C.nom.toUpperCase(), null],
    ['Adresse', C.adresse, null],
    ['Domiciliation', D.bank.domiciliation, null],
    ['IBAN', grouped(A.iban), A.iban, 'big'],
    ['BIC', A.bic, A.bic, 'big'],
    ['Code banque', A.codeBanque, null],
    ['Code guichet', A.codeGuichet, null],
    ['Numéro de compte', A.numero, null],
    ['Clé RIB', A.cleRib, null]
  ];

  document.getElementById('ribBody').innerHTML = rows.map(function (r) {
    return '<div class="kv-row"><dt>' + B.esc(r[0]) + '</dt><dd' + (r[3] ? ' class="big"' : '') + '>' + B.esc(r[1]) + '</dd>' +
      (r[2] ? '<button class="btn btn-ghost btn-sm copy-btn" data-copy="' + B.esc(r[2]) + '" data-what="' + B.esc(r[0]) + '">' + B.icon('copy', 16) + 'Copier</button>' : '<span></span>') + '</div>';
  }).join('');

  document.getElementById('ribBody').addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (b) B.copy(b.getAttribute('data-copy'), b.getAttribute('data-what') + ' copié');
  });
  document.getElementById('copyIban').addEventListener('click', function () { B.copy(A.iban, 'IBAN copié'); });
  document.getElementById('printRib').addEventListener('click', function () { window.print(); });
  document.getElementById('ribDate').textContent = B.dateMed(new Date());
})();
