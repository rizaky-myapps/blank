/* BLANK — virements */
(function () {
  'use strict';

  var D = window.BLANK;
  var form = document.getElementById('vForm');
  var benef = document.getElementById('benef');
  var fromEl = document.getElementById('from');
  var newBox = document.getElementById('newBenef');
  var recentEl = document.getElementById('recent');
  var errEl = document.getElementById('vErr');
  var submitBtn = form.querySelector('button[type=submit]');

  benef.innerHTML = D.beneficiaries.map(function (b) {
    return '<option value="' + B.esc(b.id) + '">' + B.esc(b.name) + ' · ' + b.iban.slice(0, 4) + ' •••• ' + b.iban.slice(-4) + '</option>';
  }).join('') + '<option value="new">+ Nouveau bénéficiaire</option>';

  function renderFrom() {
    fromEl.innerHTML = '<option>' + B.esc(D.accounts.courant.label) + ' · ' + B.esc(B.eur(D.accounts.courant.solde)) + '</option>';
  }

  benef.addEventListener('change', function () { newBox.hidden = benef.value !== 'new'; });

  /* Clé IBAN (modulo 97) */
  function ibanValid(raw) {
    var s = raw.replace(/\s+/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
    if (s.slice(0, 2) === 'FR' && s.length !== 27) return false;
    var r = s.slice(4) + s.slice(0, 4);
    var rem = 0;
    for (var i = 0; i < r.length; i++) {
      var c = r.charCodeAt(i);
      var chunk = c >= 65 ? String(c - 55) : r[i];
      for (var j = 0; j < chunk.length; j++) rem = (rem * 10 + Number(chunk[j])) % 97;
    }
    return rem === 1;
  }
  function groupIban(s) { return s.replace(/\s+/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim(); }

  function fail(msg, field) {
    errEl.innerHTML = '<div class="alert alert-err" role="alert">' + B.icon('alert') + '<span>' + B.esc(msg) + '</span></div>';
    if (field) field.focus();
  }

  function readForm() {
    var name, iban;
    if (benef.value === 'new') {
      name = document.getElementById('nName').value.trim();
      iban = document.getElementById('nIban').value;
      if (name.length < 2) return fail('Indiquez le nom du bénéficiaire.', document.getElementById('nName'));
      if (!ibanValid(iban)) return fail('L’IBAN saisi n’est pas valide. Vérifiez-le et réessayez.', document.getElementById('nIban'));
      iban = groupIban(iban);
    } else {
      var b = D.beneficiaries.filter(function (x) { return x.id === benef.value; })[0];
      name = b.name; iban = groupIban(b.iban);
    }
    var amountEl = document.getElementById('amount');
    var amount = parseFloat(amountEl.value.replace(/\s/g, '').replace(',', '.'));
    if (!(amount > 0)) return fail('Saisissez un montant supérieur à 0 €.', amountEl);
    if (amount > D.accounts.courant.solde) return fail('Le montant dépasse le solde disponible de votre compte.', amountEl);
    if (iban.replace(/\s/g, '') === D.accounts.courant.iban) return fail('Le compte bénéficiaire doit être différent du compte à débiter.', benef.value === 'new' ? document.getElementById('nIban') : benef);
    return { name: name, iban: iban, amount: Math.round(amount * 100) / 100, motif: document.getElementById('motif').value.trim() };
  }

  function recap(rows) {
    return '<div class="recap">' + rows.map(function (r) { return '<div><span>' + B.esc(r[0]) + '</span><b>' + B.esc(r[1]) + '</b></div>'; }).join('') + '</div>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errEl.innerHTML = '';
    var t = readForm();
    if (!t) return;
    B.modal({
      title: 'Confirmer le virement',
      body: recap([['Compte à débiter', D.accounts.courant.label], ['Bénéficiaire', t.name], ['IBAN', t.iban], ['Montant', B.eur(t.amount)], ['Motif', t.motif || '—'], ['Exécution', 'Immédiate']]),
      actions: [
        { label: 'Modifier', cls: 'btn-ghost' },
        { label: 'Confirmer', cls: 'btn-primary', onClick: function (close) { close(); execute(t); } }
      ]
    });
  });

  var ERRORS = {
    funds: 'Le montant dépasse le solde disponible de votre compte.',
    amount: 'Saisissez un montant supérieur à 0 €.',
    same: 'Le compte bénéficiaire doit être différent du compte à débiter.'
  };

  function execute(t) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>Exécution…';
    setTimeout(function () {
      var res = D.transfer({ toName: t.name, toIban: t.iban, amount: t.amount, motif: t.motif });
      submitBtn.disabled = false;
      submitBtn.textContent = 'Continuer';
      if (!res.ok) { fail(ERRORS[res.error] || 'Le virement n’a pas pu être exécuté.'); return; }
      form.reset();
      newBox.hidden = true;
      renderFrom();
      renderRecent(true);
      B.modal({
        title: 'Virement exécuté',
        body: '<p>Votre virement instantané de <b>' + B.esc(B.eur(res.amount)) + '</b> vers <b>' + B.esc(res.name) + '</b> a bien été exécuté. Les fonds sont disponibles immédiatement chez le bénéficiaire.</p>' +
          recap([['Référence', res.ref], ['Montant débité', B.eur(res.amount)], ['Nouveau solde', B.eur(res.balance)]]),
        actions: [{ label: 'Terminé', cls: 'btn-dark' }]
      });
    }, Motion.reduce ? 0 : 900);
  }

  function renderRecent(animate) {
    var list = D.operations.filter(function (o) { return o.kind === 'virement'; }).slice(0, 8);
    if (!list.length) { recentEl.innerHTML = '<div class="empty">Aucun virement récent.</div>'; return; }
    var last = null;
    recentEl.innerHTML = list.map(function (o) {
      var lbl = B.dayLabel(o.date), head = '';
      if (lbl !== last) { head = '<div class="day">' + B.esc(lbl) + '</div>'; last = lbl; }
      return head + UI.opRow(o);
    }).join('');
    if (animate) {
      recentEl.classList.add('stagger');
      Motion.stagger(recentEl, '.op, .day', 8);
      setTimeout(function () { recentEl.classList.remove('stagger'); }, 1200);
    }
  }

  renderFrom();
  renderRecent(false);
})();
