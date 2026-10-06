/* BLANK — page « Ma carte » */
(function () {
  'use strict';

  var D = window.BLANK;
  var C = D.card;
  var A = D.accounts.courant;
  var AUTO_HIDE_MS = 30000;

  var visual = document.getElementById('cardVisual');
  var revealBtn = document.getElementById('reveal');
  var revealLabel = document.getElementById('revealLabel');
  var copyBtn = document.getElementById('copyPan');
  var revealed = false;
  var hideTimer = null;

  document.getElementById('cardSub').textContent = C.label + ' · ' + C.type.toLowerCase();

  function group(n) { return n.replace(/(.{4})/g, '$1 ').trim(); }

  function renderCard() {
    var st = UI.cardState.get();
    visual.classList.toggle('locked', st.locked);
    var pan = revealed ? group(C.number) : '•••• •••• •••• ' + C.last4;
    var cvv = revealed ? C.cvv : '•••';
    visual.innerHTML =
      '<div class="top"><span class="logo"><span class="logo-mark"></span>blank</span><span class="tag">' + (st.locked ? 'Verrouillée' : B.esc(C.type)) + '</span></div>' +
      '<span class="chip"></span>' +
      '<span class="pan">' + pan + '</span>' +
      '<div class="meta"><div><small>Titulaire</small>' + B.esc(C.holder) + '</div><div><small>Expire fin</small>' + B.esc(C.expiration) + '</div><div><small>CVV</small>' + cvv + '</div></div>';
    visual.setAttribute('aria-label', 'Carte bancaire BLANK se terminant par ' + C.last4 + (st.locked ? ', verrouillée' : ''));
  }

  function setRevealed(on) {
    revealed = on;
    clearTimeout(hideTimer);
    revealLabel.textContent = on ? 'Masquer les données' : 'Afficher les données';
    copyBtn.disabled = !on;
    if (on) hideTimer = setTimeout(function () { setRevealed(false); }, AUTO_HIDE_MS);
    renderCard();
  }

  revealBtn.addEventListener('click', function () {
    if (revealed) { setRevealed(false); return; }
    revealBtn.disabled = true;
    revealLabel.textContent = 'Vérification…';
    setTimeout(function () { revealBtn.disabled = false; setRevealed(true); }, 800);
  });

  copyBtn.addEventListener('click', function () { B.copy(C.number, 'Numéro de carte copié'); });

  /* Réglages */
  var TOGGLES = [
    { key: 'locked', label: 'Verrouiller la carte', help: 'Bloque tous les paiements et retraits', on: 'Carte verrouillée. Aucun paiement ne sera accepté.', off: 'Carte déverrouillée.' },
    { key: 'online', label: 'Paiements en ligne', help: 'Achats sur Internet (3D Secure)', on: 'Paiements en ligne activés.', off: 'Paiements en ligne désactivés.' },
    { key: 'contactless', label: 'Paiement sans contact', help: 'Jusqu’à 50 € sans saisir le code', on: 'Paiement sans contact activé.', off: 'Paiement sans contact désactivé.' },
    { key: 'abroad', label: 'Paiements hors Europe', help: 'Activation valable 30 jours', on: 'Paiements hors Europe activés pour 30 jours.', off: 'Paiements hors Europe désactivés.' }
  ];

  var togglesEl = document.getElementById('cardToggles');
  function renderToggles() {
    var st = UI.cardState.get();
    togglesEl.innerHTML = TOGGLES.map(function (t) {
      return '<div class="toggle-row"><div>' + B.esc(t.label) + '<small>' + B.esc(t.help) + '</small></div>' +
        '<label class="switch"><input type="checkbox" data-key="' + t.key + '" aria-label="' + B.esc(t.label) + '"' + (st[t.key] ? ' checked' : '') + '><span></span></label></div>';
    }).join('');
  }
  togglesEl.addEventListener('change', function (e) {
    var key = e.target.getAttribute('data-key');
    if (!key) return;
    var t = TOGGLES.filter(function (x) { return x.key === key; })[0];
    UI.cardState.set(key, e.target.checked);
    B.toast(e.target.checked ? t.on : t.off);
    renderCard();
  });

  /* Plafonds */
  function sumSince(kind, days) {
    var since = new Date(D.today.getTime() - days * 86400000);
    return D.operations.reduce(function (s, o) { return o.kind === kind && o.date > since ? s - o.amount : s; }, 0);
  }
  function limitRow(label, used, max, period) {
    var pct = Math.min(100, Math.round(used / max * 100));
    return '<div class="bar-row"><div class="top"><span>' + B.esc(label) + '</span><b>' + B.eur(used) + ' / ' + B.eur(max) + '</b></div>' +
      '<div class="bar"><i style="width:' + Math.max(pct, used > 0 ? 3 : 0) + '%"></i></div><small class="hint">' + B.esc(period) + '</small></div>';
  }
  document.getElementById('cardLimits').innerHTML =
    limitRow('Paiements', sumSince('carte', 30), C.plafondPaiement, 'Sur 30 jours glissants') +
    limitRow('Retraits', sumSince('retrait', 7), C.plafondRetrait, 'Sur 7 jours glissants');

  /* Informations */
  var info = [
    ['Titulaire', C.holder],
    ['Type', C.label],
    ['Débit', C.type],
    ['Compte rattaché', A.label + ' · •••• ' + A.numero.slice(-4)],
    ['Émise le', B.dateMed(new Date(C.issued + 'T12:00:00'))],
    ['Expire fin', C.expiration.replace('/', ' / 20')]
  ];
  document.getElementById('cardInfo').innerHTML = info.map(function (r) {
    return '<div class="kv-row"><dt>' + B.esc(r[0]) + '</dt><dd>' + B.esc(r[1]) + '</dd></div>';
  }).join('');

  /* Derniers paiements par carte */
  var last = null;
  document.getElementById('cardOps').innerHTML = D.operations.filter(function (o) { return o.kind === 'carte'; }).slice(0, 8).map(function (o) {
    var lbl = B.dayLabel(o.date), head = '';
    if (lbl !== last) { head = '<div class="day">' + B.esc(lbl) + '</div>'; last = lbl; }
    return head + UI.opRow(o);
  }).join('');

  /* Opposition */
  document.getElementById('oppose').addEventListener('click', function () {
    B.modal({
      title: 'Faire opposition',
      body: '<p>En cas de perte, de vol ou d’utilisation frauduleuse de votre carte, appelez sans attendre le <b>' + B.esc(D.bank.oppositionTelephone) + '</b> (24 h/24, 7 j/7).</p>' +
        '<p>En attendant, vous pouvez verrouiller votre carte immédiatement. Le verrouillage est réversible à tout moment.</p>',
      actions: [
        { label: 'Fermer', cls: 'btn-ghost' },
        { label: 'Verrouiller ma carte', cls: 'btn-primary', onClick: function (close) {
          UI.cardState.set('locked', true);
          close(); renderToggles(); renderCard();
          B.toast('Carte verrouillée. Aucun paiement ne sera accepté.');
        } }
      ]
    });
  });

  renderToggles();
  renderCard();
})();
