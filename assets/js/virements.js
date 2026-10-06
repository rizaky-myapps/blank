/* BLANK — virements */
(function () {
  'use strict';

  var D = window.BLANK;
  var KEY = 'blank_pending_transfers';
  var form = document.getElementById('vForm');
  var benef = document.getElementById('benef');
  var newBox = document.getElementById('newBenef');
  var pendingEl = document.getElementById('pending');
  var errEl = document.getElementById('vErr');

  benef.innerHTML = D.beneficiaries.map(function (b) {
    return '<option value="' + b.id + '">' + B.esc(b.name) + ' · ' + b.iban.slice(0, 4) + ' •••• ' + b.iban.slice(-4) + '</option>';
  }).join('') + '<option value="new">+ Nouveau bénéficiaire</option>';

  document.getElementById('from').innerHTML =
    '<option>' + B.esc(D.accounts.courant.label) + ' · ' + B.eur(D.accounts.courant.solde) + '</option>';

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
    errEl.innerHTML = '<div class="alert alert-err">' + B.icon('alert') + '<span>' + B.esc(msg) + '</span></div>';
    if (field) field.focus();
  }

  function readForm() {
    var name, iban;
    if (benef.value === 'new') {
      name = document.getElementById('nName').value.trim();
      iban = document.getElementById('nIban').value;
      if (name.length < 2) return fail('Indiquez le nom du bénéficiaire.', document.getElementById('nName'));
      if (!ibanValid(iban)) return fail("L'IBAN saisi n'est pas valide. Vérifiez-le et réessayez.", document.getElementById('nIban'));
      iban = groupIban(iban);
    } else {
      var b = D.beneficiaries.filter(function (x) { return x.id === benef.value; })[0];
      name = b.name; iban = groupIban(b.iban);
    }
    var amountEl = document.getElementById('amount');
    var amount = parseFloat(amountEl.value.replace(/\s/g, '').replace(',', '.'));
    if (!(amount > 0)) return fail('Saisissez un montant supérieur à 0 €.', amountEl);
    if (amount > D.accounts.courant.solde) return fail('Le montant dépasse le solde disponible de votre compte.', amountEl);
    return { name: name, iban: iban, amount: Math.round(amount * 100) / 100, motif: document.getElementById('motif').value.trim() };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errEl.innerHTML = '';
    var t = readForm();
    if (!t) return;
    var rows = [['Bénéficiaire', t.name], ['IBAN', t.iban], ['Montant', B.eur(t.amount)], ['Motif', t.motif || '—'], ['Exécution', 'Dès validation']];
    B.modal({
      title: 'Confirmer le virement',
      body: '<div class="recap">' + rows.map(function (r) { return '<div><span>' + B.esc(r[0]) + '</span><b>' + B.esc(r[1]) + '</b></div>'; }).join('') + '</div>',
      actions: [
        { label: 'Modifier', cls: 'btn-ghost' },
        { label: 'Confirmer', cls: 'btn-primary', onClick: function (close) { close(); submit(t); } }
      ]
    });
  });

  function submit(t) {
    var list = B.local.get(KEY, []);
    t.id = 'VIR-' + Date.now().toString().slice(-8);
    t.date = Date.now();
    list.unshift(t);
    B.local.set(KEY, list.slice(0, 20));
    form.reset();
    newBox.hidden = true;
    renderPending();
    B.modal({
      title: 'Virement enregistré',
      body: '<p>Votre virement de <b>' + B.eur(t.amount) + '</b> vers <b>' + B.esc(t.name) + '</b> a bien été enregistré.</p>' +
        "<p>Pour votre sécurité, il est soumis à une vérification par notre service conformité. Délai habituel : 2 à 3 jours ouvrés. Vous serez prévenu par e-mail dès son exécution.</p>",
      actions: [{ label: 'Compris', cls: 'btn-dark' }]
    });
  }

  function renderPending() {
    var list = B.local.get(KEY, []);
    if (!list.length) { pendingEl.innerHTML = '<div class="empty">Aucun virement en cours.</div>'; return; }
    pendingEl.innerHTML = list.map(function (t) {
      return '<div class="op"><div class="op-ico" style="background:' + UI.tint(t.name) + '" aria-hidden="true">' + B.esc(UI.initials(t.name)) + '</div>' +
        '<div class="op-main"><div class="op-label">' + B.esc(t.name) + '</div><div class="op-meta">' + B.esc(t.id) + ' · ' + B.esc(B.dateShort(new Date(t.date))) +
        '<span class="pill warn">' + B.icon('clock', 12) + 'En vérification</span></div></div>' +
        '<div class="op-amt num">' + B.eurSigned(-t.amount) + '</div></div>';
    }).join('');
  }

  renderPending();
})();
