/* BLANK — animations (inclinaison 3D, compteurs, apparition au défilement) */
(function () {
  'use strict';

  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var finePointer = mq('(hover: hover) and (pointer: fine)');

  /* Inclinaison 3D qui suit le curseur. `el` reçoit --rx/--ry/--gx/--gy ; `host` écoute la souris. */
  function tilt(el, opts) {
    if (!el || reduce || !finePointer) return;
    opts = opts || {};
    var host = opts.host || el;
    var max = opts.max || 9;
    var raf = 0;
    function reset() {
      cancelAnimationFrame(raf);
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      el.classList.remove('is-tilting');
    }
    host.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var cx = e.clientX, cy = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var r = host.getBoundingClientRect();
        var x = Math.min(1, Math.max(0, (cx - r.left) / r.width));
        var y = Math.min(1, Math.max(0, (cy - r.top) / r.height));
        el.style.setProperty('--ry', ((x - 0.5) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - y) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        el.classList.add('is-tilting');
      });
    });
    host.addEventListener('pointerleave', reset);
  }

  /* Compteur animé : lit data-count (+ data-format="eur"|"int", data-suffix). */
  function formatter(el) {
    var kind = el.getAttribute('data-format');
    var suffix = el.getAttribute('data-suffix') || '';
    if (kind === 'eur') return function (n) { return B.eur(n); };
    return function (n) { return Math.round(n).toLocaleString('fr-FR') + suffix; };
  }
  function countUp(el, ms) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var fmt = formatter(el);
    var final = fmt(target);
    if (reduce || !window.requestAnimationFrame) { el.textContent = final; return; }
    var dur = ms || 1100;
    var t0 = null;
    el.textContent = fmt(0);
    window.requestAnimationFrame(function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? fmt(target * eased) : final;
      if (p < 1) window.requestAnimationFrame(step);
    });
  }

  /* Cascade : numérote les N premiers éléments pour décaler leur animation. */
  function stagger(container, selector, max) {
    var nodes = container.querySelectorAll(selector || '.op, .day');
    for (var i = 0; i < nodes.length; i++) nodes[i].style.setProperty('--n', Math.min(i, max || 14));
  }

  /* Apparition au défilement (site vitrine) */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var counters = document.querySelectorAll('.reveal [data-count], .reveal[data-count]');
    function show(el) {
      el.classList.add('in');
      if (el.hasAttribute('data-count')) countUp(el);
      var inner = el.querySelectorAll('[data-count]');
      for (var i = 0; i < inner.length; i++) countUp(inner[i]);
    }
    if (!('IntersectionObserver' in window) || reduce) {
      for (var k = 0; k < els.length; k++) els[k].classList.add('in');
      return;
    }
    for (var c = 0; c < counters.length; c++) counters[c].textContent = formatter(counters[c])(0);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        show(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  window.Motion = { reduce: reduce, tilt: tilt, countUp: countUp, stagger: stagger };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initReveal); else initReveal();
})();
