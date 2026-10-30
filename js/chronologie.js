/* La chronologie éditoriale (1999 – 2025) : data/chronologie.js, ou le brouillon de l’éditeur en aperçu (?apercu=1).
   Sept présentations (papier, magazine, téléviseur, archive, duo, lacune, bandeau), un marqueur d’année discret,
   et l’axe des relations : « Voir ce que cette recherche est devenue ».
   A.chrono.rendre(donnees, cible, options) ; options.apercu = true affiche les brouillons, signalés. */
(function () {
  var A = window.ATLAS = window.ATLAS || {}, H = A.histoire;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fr = function (s) { return esc(s).replace(/ ([:;?!»])/g, '&nbsp;$1').replace(/« /g, '«&nbsp;'); };
  var VIS = {}; (A.visuels || []).forEach(function (v) { VIS[v.id] = v; });
  var PREUVE = { document: 'Établi par document', declare: 'Déclaré par l’auteur', 'a-verifier': 'À vérifier' };
  var TYPE = { oeuvre: 'Œuvre', affiche: 'Affiche', photo: 'Photographie', diplome: 'Diplôme', video: 'Vidéo', document: 'Document', dessin: 'Dessin', musique: 'Musique', objet: 'Objet', prototype: 'Prototype', publication: 'Publication', recherche: 'Recherche' };

  function quand(e) {
    var a = e.dateStart || '', b = e.dateEnd || '';
    if (e.datePrecision === 'inconnue' || !a) return 'Date inconnue';
    var plage = b && b !== a ? a + ' – ' + b : a;
    return e.datePrecision === 'approx' ? 'Vers ' + plage : plage;
  }
  var annee = function (e) { return (e.dateStart || '').slice(0, 4); };
  function youtube(url) { var m = /(?:v=|youtu\.be\/|embed\/)([\w-]{11})/.exec(url || ''); return m ? m[1] : null; }

  function personnes(e) {
    return (e.people || []).length ? '<ul class="personnes">' + e.people.map(function (p) {
      return '<li><b>' + fr(p.nom) + '</b><span class="role">' + fr(p.role) + '</span>' + (p.note ? '<p>' + fr(p.note) + '</p>' : '') +
        (p.sources && p.sources.length ? '<p class="sources-p">Sources&nbsp;: ' + p.sources.map(function (s) { return '<a href="' + esc(s) + '" target="_blank" rel="noopener">' + esc(s.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) + '</a>'; }).join(' · ') + '</p>' : '') + '</li>';
    }).join('') + '</ul>' : '';
  }
  function archives(e, d, medias) {
    var ids = e.archiveIds || [], liste = ids.map(function (id) { return d.archives.filter(function (a) { return a.id === id; })[0]; }).filter(Boolean);
    if (!liste.length) return '';
    return '<ul class="archives-entree">' + liste.map(function (a) {
      var src = medias[a.id] || a.storageRef;
      return '<li class="archive' + (src ? '' : ' attente') + '">' + (src ? '<img src="' + esc(src) + '" alt="' + esc(a.title + (a.originalDate ? ', ' + a.originalDate : '')) + '" loading="lazy">' : '<span class="place">À déposer</span>') +
        '<span class="legende-archive"><b>' + fr(a.title) + '</b><small>' + esc(TYPE[a.mediaType] || a.mediaType) + (a.originalDate ? ' · ' + esc(a.originalDate) : '') + (a.privacy !== 'publie' ? ' · ' + (a.privacy === 'prive' ? 'privé' : 'publiable') : '') + '</small></span></li>';
    }).join('') + '</ul>';
  }
  function cible(v) {
    var p = v.split(':');
    if (p[0] === 'chapitre') { var c = H && H.chapitres.filter(function (x) { return x.id === p[1]; })[0]; return c ? { titre: c.titre, date: c.date, lien: '#' + c.id } : null; }
    if (p[0] === 'page' && p[1] === 'metamorphose') return { titre: 'La Métamorphose', date: 'Octobre 2026', lien: 'composition.html' };
    return null;
  }
  function relations(e, d) {
    var rs = (d.relations || []).filter(function (r) { return r.de === e.id; });
    if (!rs.length) return '';
    return '<div class="relations"><button type="button" class="bouton relations-ouvrir" aria-expanded="false" aria-controls="rel-' + esc(e.id) + '">Voir ce que cette recherche est devenue</button>' +
      '<ol class="relations-liste" id="rel-' + esc(e.id) + '" hidden>' + rs.map(function (r) {
        var t = cible(r.vers) || (function () { var x = d.entrees.filter(function (y) { return y.id === r.vers; })[0]; return x ? { titre: x.title, date: quand(x), lien: '#' + x.id } : null; })();
        if (!t) return '';
        return '<li><a href="' + esc(t.lien) + '"><span class="date-rel">' + fr(t.date) + '</span><b>' + fr(t.titre) + '</b></a><p>' + fr(r.justification) + '</p><small>' + (r.auteur === 'document' ? 'Établi par document' : 'Lecture de l’auteur') + '</small></li>';
      }).join('') + '</ol></div>';
  }
  function tete(e, opts) {
    return '<p class="date-chrono"><span>' + esc(quand(e)) + '</span><span class="preuve ' + esc(e.evidenceStatus) + '">' + esc(PREUVE[e.evidenceStatus] || '') + '</span>' +
      (opts.apercu && e.publicationStatus !== 'publie' ? '<span class="preuve brouillon">Brouillon</span>' : '') + '</p>' +
      '<h3 class="titre-chrono">' + fr(e.title) + (e.titreProvisoire ? ' <small class="provisoire">titre provisoire</small>' : '') + '</h3>';
  }

  var MODELES = {
    papier: function (e, d, m, o) {
      return '<div class="feuille">' + tete(e, o) + '<p class="recit">' + fr(e.narrative) + '</p>' + (e.contexte ? '<p class="contexte">' + fr(e.contexte) + '</p>' : '') + personnes(e) + archives(e, d, m) + '</div>';
    },
    magazine: function (e, d, m, o) {
      return '<div class="mag"><p class="grand-an" aria-hidden="true">' + esc(annee(e)) + '</p><div class="mag-texte">' + tete(e, o) + '<p class="recit">' + fr(e.narrative) + '</p>' + personnes(e) + '</div></div>' + archives(e, d, m);
    },
    televiseur: function (e, d, m, o) {
      var id = youtube(e.video);
      return '<div class="tele-scene">' + tete(e, o) +
        '<figure class="tele" data-yt="' + esc(id || '') + '"><div class="tele-caisse"><div class="tele-ecran">' +
        (id ? '<img class="tele-affiche" src="https://i.ytimg.com/vi/' + esc(id) + '/hqdefault.jpg" alt="Image de la vidéo « ' + esc(e.title) + ' »" loading="lazy" onerror="this.remove()">' : '') +
        '<button type="button" class="tele-lire" aria-label="Lire la vidéo « ' + esc(e.title) + ' » ici"><span aria-hidden="true">▶</span></button></div>' +
        '<div class="tele-pied"><span class="tele-voyant" aria-hidden="true"></span><span>Archive vidéo · ' + esc(quand(e)) + '</span>' +
        '<button type="button" class="tele-plein" aria-label="Plein écran">Plein écran</button></div></div>' +
        '<figcaption>' + (e.auteurVideo ? '<p class="tele-meta">' + fr(e.auteurVideo) + '</p>' : '') + '<p class="recit">' + fr(e.narrative) + '</p>' + (e.miseEnLigne ? '<p class="contexte">' + fr(e.miseEnLigne) + '</p>' : '') + (e.video ? '<a class="tele-lien" href="' + esc(e.video) + '" target="_blank" rel="noopener">Ouvrir sur YouTube, dans un nouvel onglet</a>' : '') + '</figcaption></figure></div>';
    },
    archive: function (e, d, m, o) {
      return tete(e, o) + '<p class="recit">' + fr(e.narrative) + '</p>' + archives(e, d, m);
    },
    duo: function (e, d, m, o) {
      var br = (A.achevement && A.achevement.briques || []).slice(0, 7);
      return tete(e, o) + '<div class="duo-chrono">' +
        '<div class="hier"><p class="surtitre">Hier · 2002 – 2005</p>' + (archives(e, d, m) || '<p class="recit">Les travaux d’atelier, à déposer.</p>') + '<p class="petit">Carré, cube, mosaïque, image en mouvement, matière.</p></div>' +
        '<div class="pont" aria-hidden="true"><span></span></div>' +
        '<div class="aujourdhui"><p class="surtitre">Aujourd’hui · 2026</p><div class="mini-grille">' + br.map(function (b) { return '<i class="' + esc(b.style) + '" style="grid-column:' + (b.x + 1) + ' / span ' + b.w + ';grid-row:' + (b.y + 1) + ' / span ' + b.h + '" title="' + esc(b.titre) + '"></i>'; }).join('') + '</div><p class="petit">La grille de la Métamorphose : des fragments carrés, reliés.</p></div>' +
        '</div><p class="recit">' + fr(e.narrative) + '</p>' + (e.lecture ? '<p class="lecture">' + fr(e.lecture) + '</p>' : '');
    },
    lacune: function (e, d, m, o) {
      var a = +e.dateStart || 2005, b = +e.dateEnd || 2024, ans = [];
      for (var y = a; y <= b; y++) ans.push('<li' + ((y - a) % 5 === 0 || y === b ? ' class="repere"' : '') + '><span>' + y + '</span></li>');
      return tete(e, o) + '<p class="recit">' + fr(e.narrative) + '</p><ol class="frise-lacune" aria-label="Années ' + a + ' à ' + b + ', non documentées">' + ans.join('') + '</ol>' +
        ((e.themes || []).length ? '<ul class="puces themes-lacune">' + e.themes.map(function (t) { return '<li>' + fr(t) + '</li>'; }).join('') + '</ul>' : '') + archives(e, d, m);
    },
    bandeau: function (e, d, m, o) {
      var v = VIS[e.bandeau], c = e.versChapitre && cible('chapitre:' + e.versChapitre);
      return (v ? '<div class="bandeau bandeau-chrono"><img src="' + esc(v.src) + '" alt="' + esc(v.alt) + '" loading="lazy"><div class="bandeau-texte"><p class="date-chapitre">' + esc(quand(e)) + '</p><h3 class="grand-mot">' + fr(e.title) + '</h3></div></div>' : tete(e, o)) +
        '<p class="recit">' + fr(e.narrative) + '</p>' + (c ? '<p><a class="bouton" href="' + esc(c.lien) + '">Aller à « ' + fr(c.titre) + ' »</a></p>' : '') + archives(e, d, m);
    }
  };

  /* Ce que veut dire « 643 » : les niveaux de réalité, d’après les données */
  function niveaux() {
    var P = A.projets || [], n = function (s) { return P.filter(function (p) { return p.etat === s; }).length; };
    var L = [['Inventoriée', (A.applications || []).length, 'Une application créée dans Base44 : une idée posée, parfois une page.', 'API Base44'],
      ['Prototype', n('Prototype'), 'Une forme qui se manipule, pas encore un outil.', 'data/projets.js'],
      ['En développement', n('En développement'), 'Des fonctions écrites, en cours.', 'data/projets.js'],
      ['Testée', null, 'Une fonction vérifiée par un test : pas encore mesuré ici.', 'aucune source'],
      ['En production', n('En production'), 'Un outil en ligne, utilisé.', 'data/projets.js']];
    return '<section class="niveaux" aria-labelledby="t-niveaux"><p class="surtitre">Avant de lire 2026</p><h3 id="t-niveaux" class="titre">Ce que veut dire « 643 »</h3>' +
      '<p class="chapeau">643 applications inventoriées ne sont pas 643 logiciels. Chaque projet est rangé à son niveau réel.</p><ol class="niveaux-liste">' +
      L.map(function (l, i) { return '<li style="--i:' + i + '"><b>' + (l[1] == null ? '—' : l[1]) + '</b><span class="niv">' + fr(l[0]) + '</span><p>' + fr(l[2]) + '</p><small>' + fr(l[3]) + '</small></li>'; }).join('') +
      '</ol><p class="note-source">Inventoriée : les 643 applications du compte Base44. Les autres niveaux : les ' + P.length + ' fiches de l’écosystème (architecture : ' + n('Architecture') + ').</p></section>';
  }

  A.chrono = {
    quand: quand, youtube: youtube, modeles: Object.keys(MODELES),
    rendre: function (d, zone, opts) {
      opts = opts || {}; var medias = opts.medias || {};
      var liste = d.entrees.filter(function (e) { return opts.apercu ? e.publicationStatus !== 'archive' : e.publicationStatus === 'publie' && e.visibility === 'public'; });
      zone.innerHTML = (opts.apercu ? '<p class="bandeau-apercu" role="status">Aperçu local : la version de l’éditeur, sur cet appareil seulement. Le public ne voit pas ces changements tant qu’ils ne sont pas publiés.</p>' : '') +
        '<div class="avant-tete"><p class="date-chapitre">1999 – 2025</p><h2 id="t-avant" class="grand-mot">' + fr(d.titre) + '</h2><p class="chapeau">' + fr(d.chapeau) + '</p></div>' +
        '<p class="annee-courante" aria-hidden="true"><span></span></p>' +
        liste.map(function (e) { return '<article class="entree-chrono modele-' + esc(e.layoutVariant) + (e.fond ? ' fond-' + esc(e.fond) : '') + '" id="' + esc(e.id) + '" data-annee="' + esc(annee(e)) + '">' + (MODELES[e.layoutVariant] || MODELES.papier)(e, d, medias, opts) + relations(e, d) + '</article>'; }).join('') +
        niveaux();
      brancher(zone);
    }
  };

  function brancher(zone) {
    if (zone.dataset.branche) return; zone.dataset.branche = '1';
    zone.addEventListener('click', function (ev) {
      var b = ev.target.closest('.relations-ouvrir');
      if (b) { var l = document.getElementById(b.getAttribute('aria-controls')), o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(o)); l.hidden = !o; return; }
      var lire = ev.target.closest('.tele-lire');
      if (lire) {
        var t = lire.closest('.tele'), id = t.getAttribute('data-yt'), ecran = t.querySelector('.tele-ecran');
        if (!id) return;
        ecran.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="Vidéo d’archive" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
        t.classList.add('allume'); return;
      }
      var plein = ev.target.closest('.tele-plein');
      if (plein) { var e2 = plein.closest('.tele').querySelector('.tele-ecran'); if (e2.requestFullscreen) e2.requestFullscreen(); }
    });
    /* le marqueur d’année : l’année de l’entrée lue, discrètement */
    var marque = zone.querySelector('.annee-courante span'), entrees = zone.querySelectorAll('.entree-chrono');
    if (!('IntersectionObserver' in window) || !marque) return;
    var io = new IntersectionObserver(function (vus) { vus.forEach(function (v) { if (v.isIntersecting) marque.textContent = v.target.getAttribute('data-annee'); }); }, { rootMargin: '-45% 0px -50% 0px' });
    Array.prototype.forEach.call(entrees, function (e) { io.observe(e); });
    var io2 = new IntersectionObserver(function (vus) { vus.forEach(function (v) { zone.classList.toggle('dans-avant', v.isIntersecting); }); });
    io2.observe(zone);
  }
})();
