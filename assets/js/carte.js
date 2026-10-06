/* BLANK — page « Ma carte » */
(function () {
  'use strict';

  var D = window.BLANK;
  var C = D.card;
  var A = D.accounts.courant;
  var AUTO_HIDE_S = 30;
  var MASKED_PAN = '•••• •••• •••• ' + C.last4;
  var MASKED_CVV = '•••';

  var card = document.getElementById('card3d');
  var revealBtn = document.getElementById('reveal');
  var revealLabel = document.getElementById('revealLabel');
  var flipBtn = document.getElementById('flipBtn');
  var copyBtns = [document.getElementById('copyPan'), document.getElementById('copyExp'), document.getElementById('copyCvv')];
  var autohide = document.getElementById('autohide');
  var autohideLabel = document.getElementById('autohideLabel');
  var countEl = document.getElementById('count');
  var live = document.getElementById('cardLive');

  var revealed = false;
  var flipped = false;
  var busy = false;
  var hideTimer = null;
  var tickTimer = null;
  var panEl, cvvEl, tagEl;

  document.getElementById('cardSub').textContent = C.label + ' · ' + C.type.toLowerCase();

  function group(n) { return n.replace(/(.{4})/g, '$1 ').trim(); }

  /* Les chiffres « défilent » avant de se fixer sur la bonne valeur */
  function scramble(el, finalText, ms) {
    if (Motion.reduce || !window.requestAnimationFrame) { el.textContent = finalText; return; }
    var t0 = null;
    window.requestAnimationFrame(function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / ms);
      var out = '';
      for (var i = 0; i < finalText.length; i++) {
        var ch = finalText.charAt(i);
        out += (ch === ' ' || p >= (i + 1) / finalText.length) ? ch : String(Math.floor(Math.random() * 10));
      }
      el.textContent = out;
      if (p < 1) window.requestAnimationFrame(tick);
    });
  }

  function build() {
    card.innerHTML =
      '<div class="tilt" id="cardTilt"><div class="flip">' +
        '<div class="face front">' +
          '<div class="top"><span class="logo"><span class="logo-mark"></span>blank</span><span class="tag" id="cardTag"></span></div>' +
          '<span class="chip"></span>' +
          '<span class="pan" id="cardPan"></span>' +
          '<div class="meta"><div><small>Titulaire</small>' + B.esc(C.holder) + '</div><div><small>Expire fin</small>' + B.esc(C.expiration) + '</div></div>' +
        '</div>' +
        '<div class="face back">' +
          '<div class="stripe"></div>' +
          '<div class="sig"><div class="paper">' + B.esc(C.holder) + '</div><div class="cvv"><small>CVV</small><span id="cardCvv"></span></div></div>' +
          '<p class="fine"><b>BLANK SAS</b> · Carte à débit immédiat.<br>Perte ou vol : ' + B.esc(D.bank.oppositionTelephone) + ' (24 h/24)</p>' +
        '</div>' +
      '</div></div>';
    panEl = document.getElementById('cardPan');
    cvvEl = document.getElementById('cardCvv');
    tagEl = document.getElementById('cardTag');
    Motion.tilt(document.getElementById('cardTilt'), { host: card, max: 8 });
  }

  function paint() {
    var st = UI.cardState.get();
    card.classList.toggle('locked', st.locked);
    card.classList.toggle('flipped', flipped);
    card.setAttribute('aria-pressed', String(flipped));
    card.setAttribute('aria-label', 'Carte bancaire BLANK se terminant par ' + C.last4 + (st.locked ? ', verrouillée' : '') + '. ' + (flipped ? 'Affichage du verso.' : 'Affichage du recto.') + ' Activer pour la retourner.');
    tagEl.textContent = st.locked ? 'Verrouillée' : C.type;
    flipBtn.querySelector('span:last-child').textContent = flipped ? 'Voir le recto' : 'Voir le verso';
  }

  function setFlipped(on) { flipped = on; paint(); }

  function stopCountdown() {
    clearTimeout(hideTimer);
    clearInterval(tickTimer);
    autohide.hidden = true;
    autohideLabel.hidden = true;
  }

  function startCountdown() {
    stopCountdown();
    var left = AUTO_HIDE_S;
    autohide.innerHTML = '<i></i>';
    autohide.hidden = false;
    autohideLabel.hidden = false;
    countEl.textContent = String(left);
    tickTimer = setInterval(function () { left -= 1; countEl.textContent = String(Math.max(left, 0)); }, 1000);
    hideTimer = setTimeout(function () { setRevealed(false); B.toast('Les données de la carte ont été masquées.'); }, AUTO_HIDE_S * 1000);
  }

  function setRevealed(on) {
    revealed = on;
    revealLabel.textContent = on ? 'Masquer les données' : 'Afficher les données';
    copyBtns.forEach(function (b) { b.disabled = !on; });
    if (on) {
      scramble(panEl, group(C.number), 750);
      scramble(cvvEl, C.cvv, 600);
      live.textContent = 'Données de la carte affichées.';
      startCountdown();
    } else {
      panEl.textContent = MASKED_PAN;
      cvvEl.textContent = MASKED_CVV;
      live.textContent = 'Données de la carte masquées.';
      stopCountdown();
      if (flipped) setFlipped(false);
    }
  }

  revealBtn.addEventListener('click', function () {
    if (busy) return;
    if (revealed) { setRevealed(false); return; }
    busy = true;
    revealBtn.disabled = true;
    revealLabel.textContent = 'Vérification…';
    setTimeout(function () { busy = false; revealBtn.disabled = false; setRevealed(true); }, 800);
  });

  /* Retourner la carte : clic, Entrée / Espace, ou bouton dédié */
  card.addEventListener('click', function () { setFlipped(!flipped); });
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(!flipped); }
  });
  flipBtn.addEventListener('click', function () { setFlipped(!flipped); });

  /* Copie, avec retour visuel sur le bouton */
  function wireCopy(btn, value, okMsg, label) {
    btn.addEventListener('click', function () {
      if (!revealed) return;
      B.copy(value, okMsg);
      var span = btn.querySelector('span:last-child');
      span.textContent = 'Copié ✓';
      setTimeout(function () { span.textContent = label; }, 1400);
    });
  }
  wireCopy(copyBtns[0], C.number, 'Numéro de carte copié', 'Numéro');
  wireCopy(copyBtns[1], C.expiration, 'Date d’expiration copiée', 'Date');
  wireCopy(copyBtns[2], C.cvv, 'Cryptogramme copié', 'CVV');

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
    paint();
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
  var cardOps = document.getElementById('cardOps');
  cardOps.innerHTML = D.operations.filter(function (o) { return o.kind === 'carte'; }).slice(0, 8).map(function (o) {
    var lbl = B.dayLabel(o.date), head = '';
    if (lbl !== last) { head = '<div class="day">' + B.esc(lbl) + '</div>'; last = lbl; }
    return head + UI.opRow(o);
  }).join('');
  cardOps.classList.add('stagger');
  Motion.stagger(cardOps, '.op, .day', 12);

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
          close(); renderToggles(); paint();
          B.toast('Carte verrouillée. Aucun paiement ne sera accepté.');
        } }
      ]
    });
  });

  build();
  renderToggles();
  panEl.textContent = MASKED_PAN;
  cvvEl.textContent = MASKED_CVV;
  paint();
  if (!Motion.reduce) {
    card.classList.add('hint-wiggle');
    setTimeout(function () { card.classList.remove('hint-wiggle'); }, 2400);
  }
})();
