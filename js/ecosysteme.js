/* L’écosystème : les fiches de data/projets.js, filtrées par état (les mêmes classes que dans la chronologie). */
(function () {
  var P = window.ATLAS.projets;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fr = function (s) { return esc(s).replace(/ ([:;])/g, '&nbsp;$1'); };
  var CLASSE = { 'En production': 'prod', 'En développement': 'dev', 'Prototype': 'proto', 'Architecture': 'archi' };
  var ORDRE = ['En production', 'En développement', 'Prototype', 'Architecture'], filtre = 'Tous';
  var zf = document.getElementById('filtres'), zl = document.getElementById('fiches');
  function rendre() {
    zf.innerHTML = ['Tous'].concat(ORDRE).map(function (s) { var n = s === 'Tous' ? P.length : P.filter(function (p) { return p.etat === s; }).length; return '<button type="button" class="opt" aria-pressed="' + (s === filtre) + '" data-s="' + esc(s) + '">' + esc(s) + ' <small>' + n + '</small></button>'; }).join('');
    zl.innerHTML = P.filter(function (p) { return filtre === 'Tous' || p.etat === filtre; }).map(function (p) {
      return '<li class="fiche"><div class="fiche-haut"><span class="cat">' + esc(p.categorie) + '</span><span class="etat ' + (CLASSE[p.etat] || '') + '">' + esc(p.etat) + '</span></div><h3>' + fr(p.titre) + '</h3><p>' + fr(p.description) + '</p>' +
        ((p.fonctions || []).length ? '<ul class="puces">' + p.fonctions.slice(0, 5).map(function (f) { return '<li>' + fr(f) + '</li>'; }).join('') + '</ul>' : '') + '</li>';
    }).join('');
  }
  zf.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { filtre = b.getAttribute('data-s'); rendre(); } });
  rendre();
})();
