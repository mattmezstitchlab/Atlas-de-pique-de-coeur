/* Un bloc dans la Charte : la même forme pour un fragment (un projet) et pour une brique de l’achèvement.
   Utilisé par la Métamorphose (la grille) et par l’atlas (l’aperçu de « Demain »). */
(function () {
  var A = window.ATLAS = window.ATLAS || {};
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fr = function (s) { return esc(s).replace(/ ([:;?!])/g, ' $1'); };
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var date = function (d) { var p = d.split('-'); return (+p[2] === 1 ? '1er' : +p[2]) + ' ' + MOIS[+p[1] - 1] + ' ' + p[0]; };
  /* une pastille par famille : les teintes de la nacre et des orbes, jamais pour du texte */
  var TEINTE = { aime: 'var(--nacre-lilas)', mariage: 'var(--nacre-rose)', temps: 'var(--nacre-ciel)', preuve: 'var(--option-trait)', musique: 'var(--orbe-ecoute)',
    broderie: 'var(--info-remplie-trait)', memoire: 'var(--nacre-menthe)', lieux: 'var(--libre)', soin: 'var(--nacre-brume)', demarches: 'var(--orbe-lecture-1)',
    edition: 'var(--orbe-grand-2)', systemes: 'var(--encre)', jeux: 'var(--info-vient)', explorations: 'var(--trait-2)', etudes: 'var(--papier)', sanstitre: 'var(--trait)' };
  var nomFamille = function (id) { var f = (A.familles || []).filter(function (x) { return x.id === id; })[0]; return f ? f.nom : id; };
  var pastille = function (f) { return '<i class="pastille-famille" style="background:' + (TEINTE[f] || 'var(--trait)') + '"></i>'; };

  A.bloc = {
    esc: esc, fr: fr, date: date, teinte: function (f) { return TEINTE[f] || 'var(--trait)'; }, pastille: pastille, nomFamille: nomFamille,
    /* un projet (un nom et toutes ses versions) */
    groupe: function (g) {
      return '<p class="sur">' + pastille(g.famille) + esc(nomFamille(g.famille)) + '</p><h4>' + fr(g.nom) + '</h4>' +
        '<p class="meta">' + (g.n > 1 ? g.n + ' versions · depuis le ' : 'Créé le ') + date(g.premier) + '</p>';
    },
    /* une brique de l’achèvement */
    brique: function (b, court) {
      return (b.style === 'nacre' ? '<span class="orbe-bloc"></span>' : '') +
        '<p class="sur">' + pastille(b.famille) + 'Brique · ' + esc(nomFamille(b.famille)) + '</p><h4>' + fr(b.titre) + '</h4>' +
        (court === true ? '' : '<p class="role">' + fr(b.role) + '</p>') + (court ? '' : '<ul class="puces">' + b.exemples.map(function (e) { return '<li>' + fr(e[0]) + (e[1] > 1 ? ' ×' + e[1] : '') + '</li>'; }).join('') + '</ul>') +
        '<p class="meta">Tentée ' + b.tentatives + ' fois</p>';
    }
  };
})();
