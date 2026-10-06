/* BLANK — connexion à l'espace client */
(function () {
  'use strict';

  var ACCESS = window.BLANK.accessList;
  var CODE_LEN = 6;
  var form = document.getElementById('loginForm');
  var idInput = document.getElementById('identifiant');
  var idErr = document.getElementById('idErr');
  var pad = document.getElementById('keypad');
  var dots = document.getElementById('dots');
  var banner = document.getElementById('banner');
  var submit = document.getElementById('submit');
  var code = '';

  /* Purge des données locales (paramètre technique) */
  if (new URLSearchParams(location.search).get('reinit')) {
    window.BLANK.reset();
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* noop */ }
  }

  if (B.session.get('blank_auth', false)) { location.replace('compte.html'); return; }
  if (new URLSearchParams(location.search).get('deconnexion')) {
    banner.innerHTML = '<div class="alert alert-ok">' + B.icon('check') + '<span>Vous avez été déconnecté en toute sécurité.</span></div>';
  }

  dots.innerHTML = new Array(CODE_LEN + 1).join('<i></i>');

  function shuffled() {
    var d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (var i = d.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = d[i]; d[i] = d[j]; d[j] = t; }
    return d;
  }

  function buildPad() {
    var d = shuffled();
    var html = '';
    for (var i = 0; i < 9; i++) html += '<button type="button" class="key" data-d="' + d[i] + '">' + d[i] + '</button>';
    html += '<button type="button" class="key ctl" data-act="clear">Effacer</button>' +
      '<button type="button" class="key" data-d="' + d[9] + '">' + d[9] + '</button>' +
      '<button type="button" class="key ctl" data-act="back" aria-label="Corriger">Corriger</button>';
    pad.innerHTML = html;
  }

  function paint() {
    var els = dots.children;
    for (var i = 0; i < els.length; i++) els[i].classList.toggle('on', i < code.length);
    submit.disabled = !(code.length === CODE_LEN && idInput.value.replace(/\D/g, '').length === 10);
  }

  function add(d) { if (code.length < CODE_LEN) { code += d; paint(); } }

  pad.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.act === 'clear') code = '';
    else if (b.dataset.act === 'back') code = code.slice(0, -1);
    else add(b.dataset.d);
    paint();
  });

  document.addEventListener('keydown', function (e) {
    if (document.activeElement === idInput || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^\d$/.test(e.key)) { add(e.key); }
    else if (e.key === 'Backspace') { code = code.slice(0, -1); paint(); }
  });

  idInput.addEventListener('input', function () {
    var digits = idInput.value.replace(/\D/g, '').slice(0, 10);
    idInput.value = digits;
    idInput.classList.remove('invalid');
    idErr.textContent = '';
    paint();
  });

  function showError(msg) {
    banner.innerHTML = '<div class="alert alert-err" role="alert">' + B.icon('alert') + '<span>' + B.esc(msg) + '</span></div>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submit.disabled) return;
    banner.innerHTML = '';
    submit.disabled = true;
    submit.innerHTML = '<span class="spinner"></span>Vérification…';
    setTimeout(function () {
      var who = ACCESS.filter(function (a) { return a.identifiant === idInput.value && a.code === code; })[0];
      if (who) {
        B.session.set('blank_user', who.key);
        B.session.set('blank_auth', true);
        submit.classList.add('btn-ok');
        submit.innerHTML = '<span class="tick">' + B.icon('check') + '</span>Connect\u00e9';
        setTimeout(function () { location.href = 'compte.html'; }, Motion.reduce ? 0 : 520);
        return;
      }
      showError('Identifiant ou code secret incorrect. V\u00e9rifiez vos informations et r\u00e9essayez.');
      [dots, pad].forEach(function (n) { n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake'); });
      code = '';
      buildPad();
      submit.textContent = 'Se connecter';
      paint();
    }, 900);
  });

  document.querySelectorAll('[data-help]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var what = a.getAttribute('data-help');
      B.modal({
        title: what === 'id' ? 'Identifiant oublié ?' : 'Code secret oublié ?',
        body: '<p>Votre identifiant client figure dans le mail de bienvenue reçu à l’ouverture de votre compte, ainsi que sur votre contrat.</p>' +
          '<p>Une difficulté ? Notre service client vous répond du lundi au vendredi, de 9 h à 18 h, au <b>' + B.esc(window.BLANK.bank.telephone) + '</b>.</p>',
        actions: [{ label: 'Fermer', cls: 'btn-dark' }]
      });
    });
  });

  buildPad();
  paint();
})();
