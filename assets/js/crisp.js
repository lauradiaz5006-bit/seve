/* STRAKARA — chat en direct Crisp.
   Un seul fichier chargé par toutes les pages publiques et les espaces client / hébergeur.
   Pour changer de compte Crisp : modifier l'identifiant ci-dessous. */
(function () {
  if (window.$crisp) return;
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = "814b59db-dd31-47c7-aa68-b5415d717131";
  var s = document.createElement("script");
  s.src = "https://client.crisp.chat/l.js";
  s.async = 1;
  document.getElementsByTagName("head")[0].appendChild(s);
})();
