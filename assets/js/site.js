/* BLANK — interactions du site vitrine */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileMenu');
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  document.querySelectorAll('[data-open-account]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      B.modal({
        title: 'Ouverture de compte',
        body: '<p>BLANK est en <b>lancement progressif</b> : l’ouverture de compte se fait pour l’instant sur invitation, via notre programme de parrainage étudiant.</p>' +
          '<p>Vous avez un code d’invitation ? Écrivez-nous à <b>contact@blank-banque.fr</b> en le mentionnant, nous reviendrons vers vous sous 48 h ouvrées.</p>' +
          '<p>Vous êtes déjà client ? Accédez directement à votre espace.</p>',
        actions: [
          { label: 'Fermer', cls: 'btn-ghost' },
          { label: 'Espace client', cls: 'btn-primary', onClick: function () { location.href = 'connexion.html'; } }
        ]
      });
    });
  });
})();
