/* STRAKARA : comportements de l'en-tête commun (menu mobile, bandeau, lien actif). */
(function () {
  function init() {
    var burger = document.getElementById('tn-burger');
    var menu = document.getElementById('tn-mobile');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('tn-open');
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      });
    }
    var banner = document.getElementById('tn-banner');
    if (banner) {
      var key = 'tn-banner-closed-' + (banner.getAttribute('data-aud') || 'client');
      try { if (sessionStorage.getItem(key)) banner.classList.add('tn-hidden'); } catch (e) {}
      var close = banner.querySelector('.tn-banner__close');
      if (close) close.addEventListener('click', function () {
        banner.classList.add('tn-hidden');
        try { sessionStorage.setItem(key, '1'); } catch (e) {}
      });
    }
    // Connectée : « Connexion » devient « Mon espace » (client ou hébergeur selon le profil)
    try {
      if (localStorage.getItem('strakara_session')) {
        var heb = localStorage.getItem('strakara_profil') === 'hebergeur';
        var lg = document.querySelectorAll('.tn-login, .tn-mobile a[href*="login-"]');
        for (var k = 0; k < lg.length; k++) {
          lg[k].textContent = 'Mon espace';
          lg[k].setAttribute('href', heb ? '/espace-hebergeur.html' : '/espace-client.html');
        }
      }
    } catch (e) {}
    var path = (location.pathname.replace(/\/+$/, '/index.html') || '/index.html');
    var links = document.querySelectorAll('.tn-nav a, .tn-mobile a');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href') || '';
      if (h.charAt(0) === '/' && h !== '/index.html' && (path === h || (h === '/blog/index.html' && path.indexOf('/blog/') === 0))) {
        links[i].setAttribute('aria-current', 'page');
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
