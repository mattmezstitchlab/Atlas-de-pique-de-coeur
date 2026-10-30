/* Le traducteur : du moteur à la grille, sans nouveau moteur.
   1. analyser(texte) (js/moteur.js) lit la demande : plusieurs intentions, ce qui est dit, ce qui manque.
   2. traduire(analyse) (ici, fonction pure) propose pour chaque demande des fragments et des modules,
      d’après la table data/traduction.js, et garde ce qui a été reconnu et ce qui manque.
   3. Rien n’est posé sans confirmation : la personne coche, puis A.grille.poser() (js/metamorphose.js) pose les blocs,
      reliés dans l’ordre des demandes. Le résultat est une composition structurée : aucune demande n’est exécutée. */
(function () {
  var A = window.ATLAS, T = A.traduction, M = A.moteur;
  var briques = {}; A.achevement.briques.forEach(function (b) { briques[b.id] = b; });
  var modules = {}; A.modules.forEach(function (m) { modules[m.id] = m; });

  /* un mot de la table est trouvé s’il commence un mot du texte (le texte est déjà sans accents ni majuscules) */
  var ech = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  var dit = function (t, mot) { return new RegExp('(^|[^a-z0-9])' + ech(mot)).test(t); };
  function mots(t, table) { return Object.keys(table).filter(function (id) { return table[id].some(function (m) { return dit(t, m); }); }); }

  function traduire(analyse) {
    var vus = {}, etapes = analyse.demandes.map(function (d) {
      var t = M.norm(d.texte), blocs = [];
      mots(t, T.modules).forEach(function (id) { if (modules[id]) blocs.push({ type: 'module', ref: id, raison: 'des mots de la demande appellent le module' }); });
      mots(t, T.briques).forEach(function (id) { if (briques[id]) blocs.push({ type: 'brique', ref: id, raison: 'des mots de la demande appellent la brique' }); });
      var repli = d.intention && T.parIntention[d.intention];
      if (!blocs.length && repli && briques[repli]) blocs.push({ type: 'brique', ref: repli, raison: 'l’intention « ' + d.intention + ' » appelle cette brique' });
      blocs.forEach(function (b) { var k = b.type + ':' + b.ref; b.deja = !!vus[k]; vus[k] = 1; });
      return {
        phrase: d.phrase, texte: d.texte, intention: d.intention,
        reconnu: { pourqui: d.pourqui, quand: d.quand, lieu: d.lieu, quantites: d.quantites, conditions: d.conditions, format: d.format, ton: d.ton },
        manque: d.manque, blocs: blocs
      };
    });
    return { format: 'atlas-traduction', version: 1, etapes: etapes };
  }
  A.traducteur = { traduire: traduire };
  if (typeof document === 'undefined' || !document.getElementById('plus')) return;

  /* =================== l’affichage =================== */
  var B = A.bloc, champ = document.getElementById('plus-demande'), zone = document.getElementById('plus-propositions');
  var statut = document.getElementById('plus-statut'), poser = document.getElementById('plus-poser');
  var courant = null;
  var nom = function (b) { return b.type === 'module' ? modules[b.ref].titre : briques[b.ref].titre; };
  var famille = function (b) { return b.type === 'module' ? modules[b.ref].famille : briques[b.ref].famille; };
  var NOMS = { pourqui: 'Pour qui', quand: 'Quand', lieu: 'Où', quantites: 'Combien', conditions: 'Conditions', format: 'Forme', ton: 'Ton' };
  function reconnu(r) {
    var l = Object.keys(NOMS).map(function (k) { var v = r[k]; if (Array.isArray(v)) v = v.join(', '); return v ? '<div><dt>' + NOMS[k] + '</dt><dd>' + B.fr(v) + '</dd></div>' : ''; }).join('');
    return l ? '<dl class="etude-liste plus-reconnu">' + l + '</dl>' : '<p class="non-dit">Aucune précision reconnue.</p>';
  }
  function afficher() {
    var texte = champ.value.trim();
    if (!texte) { courant = null; zone.innerHTML = ''; statut.textContent = 'Écrivez une demande, puis « Lire la demande ».'; poser.hidden = true; return; }
    courant = traduire(M.analyser(texte));
    var n = courant.etapes.length, nb = 0;
    zone.innerHTML = courant.etapes.map(function (e, i) {
      return '<li class="carte plus-etape"><p class="surtitre">Demande ' + (i + 1) + (e.intention ? ' · ' + B.fr(e.intention) : '') + '</p>' +
        '<h4 class="plus-phrase">' + B.fr(e.phrase) + '</h4>' + reconnu(e.reconnu) +
        (e.manque.length ? '<div class="manque"><p><strong>Il manque</strong></p><ul class="puces">' + e.manque.map(function (q) { return '<li>' + B.fr(q) + '</li>'; }).join('') + '</ul></div>' : '') +
        (e.blocs.length ? '<fieldset class="plus-blocs"><legend>Fragments proposés</legend>' + e.blocs.map(function (b, j) {
          if (b.deja) return '<p class="plus-deja">' + B.pastille(famille(b)) + ' ' + B.fr(nom(b)) + ' : déjà proposé plus haut, il sera relié.</p>';
          nb++;
          return '<label class="plus-choix"><input type="checkbox" checked data-e="' + i + '" data-b="' + j + '"> ' + B.pastille(famille(b)) + ' <span><span><strong>' + B.fr(nom(b)) + '</strong> · ' + (b.type === 'module' ? 'module' : 'brique') + '</span><small>' + B.fr(b.raison) + '</small></span></label>';
        }).join('') + '</fieldset>' : '<p class="non-dit">Aucun fragment ne correspond à ces mots : la table du traducteur ne les connaît pas encore.</p>') + '</li>';
    }).join('');
    statut.textContent = n ? n + ' demande' + (n > 1 ? 's' : '') + ' lue' + (n > 1 ? 's' : '') + ', ' + nb + ' fragment' + (nb > 1 ? 's' : '') + ' proposé' + (nb > 1 ? 's' : '') + '. Rien n’est posé tant que vous ne confirmez pas.' : 'Le moteur n’a reconnu aucune demande dans ce texte.';
    poser.hidden = !nb;
  }
  document.getElementById('plus-lire').addEventListener('click', afficher);
  Array.prototype.forEach.call(document.querySelectorAll('#plus-exemples [data-texte]'), function (b) {
    b.addEventListener('click', function () { champ.value = b.getAttribute('data-texte'); afficher(); });
  });
  poser.addEventListener('click', function () {
    if (!courant) return;
    var coche = {}; Array.prototype.forEach.call(zone.querySelectorAll('input[type=checkbox]'), function (c) { if (c.checked) coche[c.getAttribute('data-e') + ':' + c.getAttribute('data-b')] = 1; });
    var lot = courant.etapes.map(function (e, i) {
      return { phrase: e.phrase, intention: e.intention, reconnu: e.reconnu, manque: e.manque,
        blocs: e.blocs.filter(function (b, j) { return b.deja || coche[i + ':' + j]; }) };
    });
    var n = A.grille.poser(lot);
    statut.textContent = n ? n + ' bloc' + (n > 1 ? 's' : '') + ' posé' + (n > 1 ? 's' : '') + ' sur la grille, reliés dans l’ordre des demandes. Touchez-en un pour lire la demande qui l’a fait naître.' : 'Aucun fragment coché : rien n’a été posé.';
    poser.hidden = true;
    if (n) document.getElementById('atelier').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  afficher();
})();
