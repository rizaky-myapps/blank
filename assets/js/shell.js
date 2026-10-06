/* BLANK — structure commune de l'espace client */
(function () {
  'use strict';

  var C = window.BLANK.client;
  var page = document.body.getAttribute('data-page');

  var NAV = [
    { id: 'compte', href: 'compte.html', label: 'Mes comptes', icon: 'home' },
    { id: 'operations', href: 'operations.html', label: 'Opérations', icon: 'list' },
    { id: 'carte', href: 'carte.html', label: 'Ma carte', icon: 'card' },
    { id: 'prelevements', href: 'prelevements.html', label: 'Prélèvements', icon: 'repeat' },
    { id: 'virements', href: 'virements.html', label: 'Virements', icon: 'send' },
    { id: 'rib', href: 'rib.html', label: 'Mon RIB', icon: 'id' }
  ];

  var logo = '<a class="logo" href="compte.html" aria-label="BLANK"><span class="logo-mark"></span>blank</a>';

  function lastLogin() {
    var d = new Date(C.derniereConnexion);
    return 'Dernière connexion : ' + B.dayLabel(d).toLowerCase() + ' à ' + B.pad(d.getHours()) + 'h' + B.pad(d.getMinutes());
  }

  document.getElementById('sidebar').innerHTML =
    logo +
    '<nav class="side-nav" aria-label="Navigation principale">' +
    NAV.map(function (n) {
      return '<a class="side-link' + (n.id === page ? ' active' : '') + '" href="' + n.href + '"' + (n.id === page ? ' aria-current="page"' : '') + '>' + B.icon(n.icon) + n.label + '</a>';
    }).join('') +
    '</nav>' +
    '<div class="side-foot"><small>' + B.esc(lastLogin()) + '</small>' +
    '<a class="side-link" href="#" id="logout">' + B.icon('logout') + 'Déconnexion</a></div>';

  var initials = (C.prenom[0] + C.nom[0]).toUpperCase();
  document.getElementById('topbar').innerHTML =
    '<button class="burger" id="burger" aria-label="Ouvrir le menu">' + B.icon('menu', 24) + '</button>' +
    logo +
    '<div class="user-chip"><div class="who">' + B.esc(C.prenom + ' ' + C.nom) + '<small>Compte courant · •••• 3905</small></div>' +
    '<div class="avatar" aria-hidden="true">' + initials + '</div></div>';

  function setNav(open) { document.body.classList.toggle('nav-open', open); }
  document.getElementById('burger').addEventListener('click', function () { setNav(true); });
  document.getElementById('scrim').addEventListener('click', function () { setNav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });

  document.getElementById('logout').addEventListener('click', function (e) {
    e.preventDefault();
    B.session.del('blank_auth');
    location.href = 'connexion.html?deconnexion=1';
  });

  /* Utilitaires partagés par les pages */
  var ACRONYMS = ['EDF', 'MAIF', 'DGFIP', 'TCL', 'SNCF', 'CPAM', 'DAB', 'SEPA', 'SARL', 'AB', 'EU', 'CB', 'B.V.'];
  var COLORS = ['#ece9ff', '#e3f6ee', '#fff0d6', '#fde8ec', '#e2f0fb', '#f1ecdf', '#efe6fb'];
  /* Réglages de la carte, partagés entre le tableau de bord et la page « Ma carte » */
  var CARD_KEY = 'blank_card';
  var CARD_DEFAULTS = { locked: false, online: true, contactless: true, abroad: false };

  window.UI = {
    cardState: {
      get: function () {
        var s = B.local.get(CARD_KEY, {});
        var out = {};
        for (var k in CARD_DEFAULTS) out[k] = typeof s[k] === 'boolean' ? s[k] : CARD_DEFAULTS[k];
        return out;
      },
      set: function (key, value) {
        var s = UI.cardState.get();
        s[key] = value;
        B.local.set(CARD_KEY, s);
        return s;
      }
    },
    cleanLabel: function (l) {
      return l.replace(/^(PRLV SEPA|CB|VIR SEPA RECU|VIR SEPA EMIS|VIR INST RECU|VIR INST EMIS|RETRAIT DAB)\s+/, '');
    },
    initials: function (l) {
      var w = UI.cleanLabel(l).replace(/[^A-Za-zÀ-ÿ0-9 ]/g, ' ').trim().split(/\s+/);
      return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase();
    },
    tint: function (l) {
      var h = 0; for (var i = 0; i < l.length; i++) h = (h * 31 + l.charCodeAt(i)) >>> 0;
      return COLORS[h % COLORS.length];
    },
    prettyLabel: function (l) {
      return UI.cleanLabel(l).split(' ').map(function (w) {
        if (ACRONYMS.indexOf(w) !== -1) return w;
        return w.charAt(0) + w.slice(1).toLowerCase();
      }).join(' ');
    },
    opRow: function (o, opts) {
      opts = opts || {};
      var pos = o.amount > 0;
      var meta = [B.esc(o.kindLabel), B.esc(o.category)];
      var pend = o.pending ? '<span class="pill warn">' + B.icon('clock', 12) + 'En cours</span>' : '';
      return '<div class="op"><div class="op-ico" style="background:' + UI.tint(o.label) + '" aria-hidden="true">' + B.esc(UI.initials(o.label)) + '</div>' +
        '<div class="op-main"><div class="op-label" title="' + B.esc(o.label) + '">' + B.esc(UI.prettyLabel(o.label)) + '</div>' +
        '<div class="op-meta">' + meta.join(' · ') + pend + '</div></div>' +
        '<div class="op-amt num' + (pos ? ' pos' : '') + '">' + B.eurSigned(o.amount) +
        (opts.balance ? '<small>Solde ' + B.eur(o.balance) + '</small>' : '') + '</div></div>';
    }
  };
})();
