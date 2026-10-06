/* BLANK — utilitaires communs (icônes, formats, modale, toast) */
(function () {
  'use strict';

  var PATHS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    repeat: '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
    id: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    trend: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
    pie: '<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
    arrowDown: '<path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/>',
    refresh: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    arrowUp: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>'
  };

  function icon(name, size) {
    var s = size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '';
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"' + s + '>' + (PATHS[name] || '') + '</svg>';
  }

  var nf = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  function eur(n) { return nf.format(n); }
  function eurSigned(n) {
    if (n === 0) return eur(0);
    return (n > 0 ? '+' : '−') + ' ' + eur(Math.abs(n));
  }

  var MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var DAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  function pad(n) { return String(n).padStart(2, '0'); }
  function dateShort(d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function dateMed(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function dayLabel(d) {
    var now = new Date();
    var y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (sameDay(d, now)) return "Aujourd'hui";
    if (sameDay(d, y)) return 'Hier';
    return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + (d.getFullYear() !== now.getFullYear() ? ' ' + d.getFullYear() : '');
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Stockage tolérant (navigation privée, etc.) */
  function store(kind) {
    var area;
    try { area = kind === 'session' ? window.sessionStorage : window.localStorage; area.getItem('x'); } catch (e) { area = null; }
    var mem = {};
    return {
      get: function (k, fallback) {
        try { var v = area ? area.getItem(k) : mem[k]; return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
      },
      set: function (k, v) {
        try { if (area) area.setItem(k, JSON.stringify(v)); else mem[k] = JSON.stringify(v); } catch (e) { mem[k] = JSON.stringify(v); }
      },
      del: function (k) { try { if (area) area.removeItem(k); } catch (e) { /* noop */ } delete mem[k]; }
    };
  }

  /* Toast */
  var toastTimer;
  function toast(msg) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.remove(); }, 3800);
  }

  /* Modale : opts = { title, body (HTML), actions: [{label, cls, onClick(close)}] } */
  function modal(opts) {
    var prev = document.activeElement;
    var wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    var box = document.createElement('div');
    box.className = 'modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<h3>' + esc(opts.title) + '</h3><div class="body">' + opts.body + '</div><div class="actions"></div>';
    var actions = box.querySelector('.actions');
    function close() {
      document.removeEventListener('keydown', onKey);
      wrap.remove();
      if (prev && prev.focus) prev.focus();
    }
    (opts.actions || [{ label: 'Fermer', cls: 'btn-dark' }]).forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-sm ' + (a.cls || 'btn-ghost');
      b.textContent = a.label;
      b.addEventListener('click', function () { if (a.onClick) a.onClick(close); else close(); });
      actions.appendChild(b);
    });
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('mousedown', function (e) { if (e.target === wrap) close(); });
    wrap.appendChild(box);
    document.body.appendChild(wrap);
    var first = actions.querySelector('button:last-child');
    if (first) first.focus();
    return { close: close, el: box };
  }

  function copy(text, okMsg) {
    function done() { toast(okMsg || 'Copié dans le presse-papiers'); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('Copie impossible sur ce navigateur'); }
      ta.remove();
    }
  }

  window.B = {
    icon: icon, eur: eur, eurSigned: eurSigned, esc: esc, pad: pad,
    dateShort: dateShort, dateMed: dateMed, dayLabel: dayLabel, sameDay: sameDay,
    toast: toast, modal: modal, copy: copy,
    local: store('local'), session: store('session')
  };

  function hydrate() {
    var els = document.querySelectorAll('[data-icon]');
    for (var i = 0; i < els.length; i++) els[i].innerHTML = icon(els[i].getAttribute('data-icon'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hydrate); else hydrate();
})();
