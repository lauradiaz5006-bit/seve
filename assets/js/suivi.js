/* STRAKARA — suivi des actions clés dans Umami (mesure anonyme, sans cookie).
   Compte : appels, emails, prises de RDV, plaquette, « Proposer un espace »,
   « Déposer une recherche » et envois de formulaires. */
/* Ne pas compter les visites de Laura (et des vérifications faites dans son navigateur) :
   ouvrir une fois https://www.strakara.fr/?ne-pas-me-compter sur chaque appareil ; ?me-compter pour annuler.
   Umami lit « umami.disabled » ; Google Analytics est coupé sur les pages qui le chargent. */
(function () {
  try {
    var q = location.search;
    if (/[?&]ne-pas-me-compter\b/.test(q)) { localStorage.setItem('umami.disabled', '1'); localStorage.setItem('strakara-ne-pas-compter', '1'); window['ga-disable-G-C3YS089M0B'] = true; alert('C’est noté : tes visites sur cet appareil ne sont plus comptées (Umami et Google Analytics).'); }
    else if (/[?&]me-compter\b/.test(q)) { localStorage.removeItem('umami.disabled'); localStorage.removeItem('strakara-ne-pas-compter'); alert('Tes visites sur cet appareil sont de nouveau comptées.'); }
    else if (localStorage.getItem('strakara-ne-pas-compter')) window['ga-disable-G-C3YS089M0B'] = true;
  } catch (e) {}
})();

(function () {
  function suivre(nom, donnees) {
    try { if (window.umami && typeof window.umami.track === 'function') window.umami.track(nom, donnees || {}); } catch (e) {}
  }
  window.strakaraSuivi = suivre;
  var page = location.pathname;

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/^tel:/i.test(h)) suivre('Appel téléphone', { page: page });
    else if (/^mailto:/i.test(h)) suivre('Clic email', { page: page });
    else if (/plaquette-strakara\.pdf/i.test(h)) suivre('Plaquette téléchargée', { page: page });
    else if (/nouveau-espace/i.test(h)) suivre('Clic Proposer un espace', { page: page });
    else if (/recherche-espace\.html/i.test(h)) suivre('Clic Déposer une recherche', { page: page });
    else if (/calendly\.com/i.test(h)) suivre('Clic prise de rendez-vous', { page: page });
    else if (/guides-gratuits\.html/i.test(h)) suivre('Clic guides gratuits', { page: page });
  }, true);

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.closest('.sgm') || f.id === 'gg-form' || f.id === 'recherche-form') return; // guides : suivis à part
    suivre('Formulaire envoyé', { page: page, formulaire: f.id || f.getAttribute('name') || 'formulaire' });
  }, true);
})();

/* Suivi interne → table Airtable « Suivi visites » (via la fonction track-view).
   Pas compté : tes appareils (?ne-pas-me-compter), les robots (filtrés côté serveur) et les pages privées.
   Une vue de page n'est comptée qu'une fois par jour et par visiteur. */
(function () {
  var URL_API = 'https://strakara.netlify.app/.netlify/functions/track-view';
  var page = location.pathname.replace(/index\.html$/, '');
  if (/(espace-client|espace-hebergeur|login|-app|apercu|ancien|merci|messagerie|attestation|reservation|maintien|demande-)/i.test(page)) return;
  try { if (localStorage.getItem('strakara-ne-pas-compter')) return; } catch (e) {}
  var appareil = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Ordinateur';
  var idEspace = '';
  try { idEspace = new URLSearchParams(location.search).get('id') || ''; } catch (e) {}
  function envoyer(type, extra) {
    try {
      var corps = JSON.stringify({ type: type, page: page, id: extra && extra.id || '', appareil: appareil });
      if (navigator.sendBeacon) navigator.sendBeacon(URL_API, new Blob([corps], { type: 'text/plain' }));
      else fetch(URL_API, { method: 'POST', body: corps, keepalive: true });
    } catch (e) {}
  }
  function uneFoisParJour(cle) {
    try {
      var j = new Date().toISOString().slice(0, 10), k = 'strakara-vu-' + cle;
      if (localStorage.getItem(k) === j) return false;
      localStorage.setItem(k, j); return true;
    } catch (e) { return true; }
  }
  window.strakaraCompter = envoyer;
  var estFiche = /fiche-espace\.html$/.test(page) && idEspace;
  if (uneFoisParJour((estFiche ? 'fiche-' + idEspace : 'page-' + page))) envoyer(estFiche ? 'Vue annonce' : 'Vue page', { id: estFiche ? idEspace : '' });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href') || '', id = estFiche ? idEspace : '';
    if (/^tel:/i.test(h)) envoyer('Clic appel', { id: id });
    else if (/^mailto:/i.test(h)) envoyer('Clic email', { id: id });
    else if (/contact\.html|calendly\.com/i.test(h)) envoyer('Clic contact', { id: id });
    else if (/reservation\.html/i.test(h)) envoyer('Clic réserver', { id: id });
  }, true);
})();
