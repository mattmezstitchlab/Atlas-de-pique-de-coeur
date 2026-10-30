/* Les modules vivants de la Métamorphose (data/modules.js) : Timeline (couches, plan B, dépendances), Agenda, Facture (devis, impression),
   Intermittent, Documents, Invités, Musique, Galerie, Missions.
   Chaque module est un petit outil dans la Charte (champs, boutons, calendrier du design system).
   Ses données lui appartiennent (owner = l’uid du bloc) ; relié à d’autres, il lit celles de tout son réseau.
   Usage : A.module.corps(partie, ctx) rend le HTML ; A.module.ecouter(racine, ctx) branche les gestes.
   ctx : { donnees, reseau(uid) → [uid…], partie(uid) → bloc, changer() } */
(function () {
  var A = window.ATLAS, B = A.bloc;
  var DEF = {}; A.modules.forEach(function (m) { DEF[m.id] = m; });
  var JOURS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
  var MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  var euros = function (n) { return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }); };
  var id = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var aujourdhui = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var tri = function (a, b) { return (a.date + (a.heure || '')).localeCompare(b.date + (b.heure || '')); };
  var REP = ['attente', 'oui', 'non'], NOM_REP = { attente: 'En attente', oui: 'Vient', non: 'Ne vient pas' };
  var ETATS = ['À faire', 'Envoyé', 'Signé'];
  function reduire(f, max) {
    return new Promise(function (ok, ko) { var r = new FileReader(); r.onload = function () { var i = new Image(); i.onload = function () { var k = Math.min(1, max / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = Math.round(i.width * k); c.height = Math.round(i.height * k); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', 0.78)); }; i.onerror = ko; i.src = r.result; }; r.onerror = ko; r.readAsDataURL(f); });
  }

  function vue(ctx, uid) {
    var net = ctx.reseau(uid), dans = function (x) { return net.indexOf(x.owner) !== -1; }, D = ctx.donnees;
    ['morceaux', 'photos', 'missions'].forEach(function (k) { D[k] = D[k] || []; });
    var types = {}; net.forEach(function (u) { var p = ctx.partie(u); if (p && p.type === 'module') types[p.ref] = (types[p.ref] || 0) + 1; });
    return { net: net, types: types, moments: D.moments.filter(dans).sort(tri), invites: D.invites.filter(dans), documents: D.documents.filter(dans), morceaux: D.morceaux.filter(dans), photos: D.photos.filter(dans), missions: D.missions.filter(dans) };
  }
  var relies = function (v, quoi) { return v.types[quoi] ? ' <span class="flux">relié</span>' : ''; };
  var COUCHES = { moment: 'Moment', invites: 'Invités', budget: 'Budget', musique: 'Musique' };
  var coucheDe = function (m) { return m.couche || (m.cachet ? 'musique' : m.montant > 0 ? 'budget' : 'moment'); };
  var momentLi = function (m, tous) {
    var dep = m.apres && (tous || []).filter(function (x) { return x.id === m.apres; })[0];
    return '<li class="couche-' + coucheDe(m) + '"><time>' + B.date(m.date) + (m.heure ? ' · ' + m.heure.replace(':', ' h ') : '') + '</time><span>' + B.fr(m.titre) + '</span>' +
      (m.montant ? '<b>' + euros(m.montant) + '</b>' : '') + (m.cachet ? '<i class="etiquette-mod">Cachet</i>' : '') +
      '<button type="button" class="suppr" data-mod="suppr-moment" data-id="' + m.id + '" aria-label="Retirer ' + B.esc(m.titre) + '">×</button>' +
      (m.planB || dep ? '<p class="plan-b">' + (dep ? 'Après « ' + B.fr(dep.titre) + ' »' : '') + (dep && m.planB ? ' · ' : '') + (m.planB ? '<b>Plan B</b>&nbsp;: ' + B.fr(m.planB) : '') + '</p>' : '') + '</li>';
  };

  var CORPS = {
    timeline: function (p, v) {
      var conf = v.invites.filter(function (i) { return i.rep === 'oui'; }).length;
      var filtre = p.couche || '', vus = v.moments.filter(function (m) { return !filtre || coucheDe(m) === filtre; });
      return (v.types.invites ? '<p class="note-mod">' + conf + ' invité' + (conf > 1 ? 's' : '') + ' confirmé' + (conf > 1 ? 's' : '') + relies(v, 'invites') + '</p>' : '') +
        '<div class="couches-mod" role="group" aria-label="Couches">' + [['', 'Toutes']].concat(Object.keys(COUCHES).map(function (k) { return [k, COUCHES[k]]; })).map(function (c) { return '<button type="button" class="opt" data-mod="couche" data-couche="' + c[0] + '" aria-pressed="' + (filtre === c[0]) + '">' + c[1] + '</button>'; }).join('') + '</div>' +
        (vus.length ? '<ol class="liste-mod timeline-mod">' + vus.map(function (m) { return momentLi(m, v.moments); }).join('') + '</ol>' : '<p class="vide-mod">Aucun moment' + (filtre ? ' dans cette couche' : '') + '. Ajoutez le premier.</p>') +
        '<form class="form-mod" data-form="moment"><input class="champ" name="titre" required placeholder="Cérémonie, répétition…" aria-label="Titre du moment">' +
        '<div class="ligne-mod"><input class="champ" type="date" name="date" required value="' + aujourdhui() + '" aria-label="Date"><input class="champ" type="time" name="heure" aria-label="Heure"></div>' +
        '<div class="ligne-mod"><select class="champ" name="couche" aria-label="Couche">' + Object.keys(COUCHES).map(function (k) { return '<option value="' + k + '">' + COUCHES[k] + '</option>'; }).join('') + '</select>' +
        '<select class="champ" name="apres" aria-label="Dépend de"><option value="">Ne dépend de rien</option>' + v.moments.map(function (m) { return '<option value="' + m.id + '">Après « ' + B.esc(m.titre) + ' »</option>'; }).join('') + '</select></div>' +
        '<input class="champ" name="planB" placeholder="Plan B (pluie, retard, lieu…)" aria-label="Plan B">' +
        '<button class="bouton noir" type="submit">Ajouter le moment</button></form>';
    },
    agenda: function (p, v) {
      var m = p.mois || aujourdhui().slice(0, 7), an = +m.slice(0, 4), mo = +m.slice(5, 7) - 1;
      var premier = (new Date(an, mo, 1).getDay() + 6) % 7, nb = new Date(an, mo + 1, 0).getDate(), pris = {};
      v.moments.forEach(function (x) { if (x.date.slice(0, 7) === m) pris[+x.date.slice(8)] = (pris[+x.date.slice(8)] || 0) + 1; });
      var jour = p.jour && p.jour.slice(0, 7) === m ? p.jour : null, cases = '';
      for (var i = 0; i < premier; i++) cases += '<span></span>';
      for (var d = 1; d <= nb; d++) {
        var iso = m + '-' + String(d).padStart(2, '0');
        cases += '<button type="button" class="cal-j' + (pris[d] ? ' option' : '') + (iso === jour ? ' libre' : '') + (iso === aujourdhui() ? ' auj' : '') + '" data-mod="jour" data-jour="' + iso + '" aria-pressed="' + (iso === jour) + '" aria-label="' + d + ' ' + MOIS[mo] + (pris[d] ? ', ' + pris[d] + ' moment' + (pris[d] > 1 ? 's' : '') : '') + '">' + d + '</button>';
      }
      var duJour = jour ? v.moments.filter(function (x) { return x.date === jour; }) : [];
      return '<div class="cal-tete"><button type="button" class="opt" data-mod="mois" data-pas="-1" aria-label="Mois précédent">‹</button><b>' + MOIS[mo] + ' ' + an + '</b><button type="button" class="opt" data-mod="mois" data-pas="1" aria-label="Mois suivant">›</button></div>' +
        '<div class="cal cal-mod">' + JOURS.map(function (j) { return '<span class="cal-jsem">' + j + '</span>'; }).join('') + cases + '</div>' +
        '<div class="cal-legende"><span><i style="background:var(--option-fond);border:1px solid var(--option-trait)"></i>Un moment' + relies(v, 'timeline') + '</span><span><i style="background:var(--encre)"></i>Jour choisi</span></div>' +
        (jour ? (duJour.length ? '<ul class="liste-mod">' + duJour.map(momentLi).join('') + '</ul>' : '<p class="vide-mod">Rien le ' + B.date(jour) + '.</p>') +
          '<form class="form-mod" data-form="moment"><input type="hidden" name="date" value="' + jour + '"><div class="ligne-mod"><input class="champ" name="titre" required placeholder="Le ' + B.date(jour) + '…" aria-label="Titre"><input class="champ" type="time" name="heure" aria-label="Heure"></div><button class="bouton noir" type="submit">Poser ce jour</button></form>'
          : '<p class="vide-mod">Touchez un jour pour y poser un moment.</p>');
    },
    facture: function (p, v) {
      var lignes = v.moments.filter(function (x) { return x.montant > 0; }), total = lignes.reduce(function (s, x) { return s + x.montant; }, 0), devis = p.mode === 'devis';
      return '<div class="mode-mod" role="group" aria-label="Devis ou facture"><button type="button" class="opt" data-mod="mode" data-m="devis" aria-pressed="' + devis + '">Devis</button><button type="button" class="opt" data-mod="mode" data-m="facture" aria-pressed="' + !devis + '">Facture</button>' +
        '<button type="button" class="opt" data-mod="imprimer">Imprimer en PDF</button></div><p class="titre-piece">' + (devis ? 'Devis' : 'Facture') + ' · ' + B.date(aujourdhui()) + '</p>' + (lignes.length ? '<table class="table-mod"><thead><tr><th scope="col">Ligne</th><th scope="col">Montant</th></tr></thead><tbody>' +
        lignes.map(function (x) { return '<tr><td>' + B.fr(x.titre) + '<small>' + B.date(x.date) + (x.cachet ? ' · cachet' : '') + '</small></td><td>' + euros(x.montant) + '</td></tr>'; }).join('') +
        '</tbody><tfoot><tr><th scope="row">' + (p.mode === 'devis' ? 'Total estimé' : 'Total') + '</th><td>' + euros(total) + '</td></tr></tfoot></table>' : '<p class="vide-mod">Aucune ligne. Un montant posé ici ou dans un module relié apparaît dans la facture.</p>') +
        (v.types.timeline || v.types.agenda || v.types.intermittent ? '<p class="note-mod">Lit les montants de son réseau' + relies(v, 'timeline') + '</p>' : '') +
        '<form class="form-mod" data-form="ligne"><input class="champ" name="titre" required placeholder="Prestation" aria-label="Libellé"><div class="ligne-mod"><input class="champ" type="number" name="montant" min="0" step="0.01" required placeholder="Montant (€)" aria-label="Montant en euros"><input class="champ" type="date" name="date" value="' + aujourdhui() + '" aria-label="Date"></div><button class="bouton noir" type="submit">Ajouter la ligne</button></form>';
    },
    intermittent: function (p, v) {
      var depuis = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
      var cachets = v.moments.filter(function (x) { return x.cachet && x.date >= depuis; }), heures = cachets.length * 12, part = Math.min(1, heures / 507);
      return '<div class="compteur-mod"><b>' + heures + ' h</b><span>sur 507 h · ' + cachets.length + ' cachet' + (cachets.length > 1 ? 's' : '') + ' en 12 mois</span></div>' +
        '<div class="jauge-mod" role="meter" aria-valuemin="0" aria-valuemax="507" aria-valuenow="' + heures + '" aria-label="Heures comptées"><span style="width:' + (part * 100).toFixed(1) + '%"></span></div>' +
        '<p class="note-mod">' + (heures >= 507 ? 'Les 507 heures sont atteintes.' : 'Encore ' + (507 - heures) + ' h, soit ' + Math.ceil((507 - heures) / 12) + ' cachets.') + (v.types.facture ? ' Les montants partent à la Facture' + relies(v, 'facture') : '') + '</p>' +
        '<form class="form-mod" data-form="cachet"><input class="champ" name="titre" required placeholder="Lieu ou date du spectacle" aria-label="Cachet"><div class="ligne-mod"><input class="champ" type="date" name="date" required value="' + aujourdhui() + '" aria-label="Date"><input class="champ" type="number" name="montant" min="0" step="0.01" placeholder="Brut (€)" aria-label="Montant brut en euros"></div><button class="bouton noir" type="submit">Compter le cachet</button></form>';
    },
    documents: function (p, v) {
      var auto = [], lignes = v.moments.filter(function (x) { return x.montant > 0; });
      if (v.types.facture && lignes.length) auto.push(['Facture', euros(lignes.reduce(function (s, x) { return s + x.montant; }, 0)) + ' · ' + lignes.length + ' ligne' + (lignes.length > 1 ? 's' : '')]);
      if (v.types.timeline && v.moments.length) auto.push(['Programme', v.moments.length + ' moment' + (v.moments.length > 1 ? 's' : '')]);
      if (v.types.invites && v.invites.length) auto.push(['Liste des invités', v.invites.filter(function (i) { return i.rep === 'oui'; }).length + ' sur ' + v.invites.length]);
      if (v.types.intermittent) { var c = v.moments.filter(function (x) { return x.cachet; }).length; if (c) auto.push(['Relevé des cachets', c * 12 + ' h']); }
      return '<ul class="liste-mod docs-mod">' + auto.map(function (a) { return '<li class="auto"><span>' + B.fr(a[0]) + '</span><small>' + B.fr(a[1]) + '</small><i class="etiquette-mod">Du réseau</i></li>'; }).join('') +
        v.documents.map(function (d) { return '<li><span>' + B.fr(d.titre) + '</span><button type="button" class="opt etat-doc" data-mod="etat-doc" data-id="' + d.id + '" aria-label="' + B.esc(d.titre) + ' : ' + d.etat + '. Changer l’état">' + d.etat + '</button><button type="button" class="suppr" data-mod="suppr-doc" data-id="' + d.id + '" aria-label="Retirer ' + B.esc(d.titre) + '">×</button></li>'; }).join('') + '</ul>' +
        (auto.length || v.documents.length ? '' : '<p class="vide-mod">Aucune pièce. Reliez une Facture ou une Timeline : leurs documents viennent seuls.</p>') +
        '<form class="form-mod" data-form="doc"><input class="champ" name="titre" required placeholder="Contrat, devis, notice…" aria-label="Titre du document"><button class="bouton noir" type="submit">Ajouter la pièce</button></form>';
    },
    musique: function (p, v) {
      var tl = v.moments.filter(function (m) { return !m.cachet; }), groupes = [{ id: '', titre: 'Sans moment' }].concat(tl.map(function (m) { return { id: m.id, titre: m.titre + (m.heure ? ' · ' + m.heure.replace(':', ' h ') : '') }; }));
      var html = groupes.map(function (g) { var ms = v.morceaux.filter(function (x) { return (x.moment || '') === g.id; }); if (!ms.length && g.id === '') return ''; return '<li><p class="creneau">' + B.fr(g.titre) + '</p>' + (ms.length ? '<ul class="liste-mod">' + ms.map(function (x) { return '<li><span>' + B.fr(x.titre) + (x.artiste ? ' <small>— ' + B.fr(x.artiste) + '</small>' : '') + '</span><button type="button" class="suppr" data-mod="suppr-morceau" data-id="' + x.id + '" aria-label="Retirer ' + B.esc(x.titre) + '">×</button></li>'; }).join('') + '</ul>' : '<p class="vide-mod">Aucun morceau.</p>') + '</li>'; }).join('');
      return (tl.length ? '<p class="note-mod">La bande originale, rangée par moment' + relies(v, 'timeline') + '</p>' : '<p class="note-mod">Reliez une Timeline : chaque moment devient un créneau.</p>') +
        '<ol class="creneaux-mod">' + html + '</ol>' +
        '<form class="form-mod" data-form="morceau"><div class="ligne-mod"><input class="champ" name="titre" required placeholder="Morceau" aria-label="Morceau"><input class="champ" name="artiste" placeholder="Artiste" aria-label="Artiste"></div>' +
        '<select class="champ" name="moment" aria-label="Moment"><option value="">Sans moment</option>' + tl.map(function (m) { return '<option value="' + m.id + '">' + B.esc(m.titre) + '</option>'; }).join('') + '</select><button class="bouton noir" type="submit">Ajouter le morceau</button></form>';
    },
    galerie: function (p, v) {
      return (v.photos.length ? '<ul class="galerie-mod">' + v.photos.map(function (x) { return '<li><img src="' + x.src + '" alt="' + B.esc(x.legende || 'Photo déposée') + '"><button type="button" class="suppr" data-mod="suppr-photo" data-id="' + x.id + '" aria-label="Retirer la photo">×</button></li>'; }).join('') + '</ul>' : '<p class="vide-mod">Aucune photo. Elles restent sur cet appareil.</p>') +
        '<form class="form-mod" data-form="photo"><input class="champ" name="legende" placeholder="Légende : qui, où" aria-label="Légende"><label class="bouton noir depot-mod">Déposer une photo<input type="file" accept="image/*" data-photo hidden></label></form>' +
        '<p class="note-mod">' + v.photos.length + ' / 8 photos, réduites pour tenir sur l’appareil.</p>';
    },
    missions: function (p, v) {
      var ms = v.missions.slice().sort(function (a, b) { return (a.faite - b.faite) || (b.votes - a.votes); });
      return (ms.length ? '<ul class="liste-mod">' + ms.map(function (x) { return '<li class="' + (x.faite ? 'faite' : '') + '"><input type="checkbox" data-mod-case="faite" data-id="' + x.id + '"' + (x.faite ? ' checked' : '') + ' aria-label="Mission faite : ' + B.esc(x.titre) + '"><span>' + B.fr(x.titre) + (x.qui ? ' <small>— ' + B.fr(x.qui) + '</small>' : '') + '</span><button type="button" class="opt" data-mod="vote" data-id="' + x.id + '" aria-label="Voter pour ' + B.esc(x.titre) + ', ' + x.votes + ' voix">+ ' + x.votes + '</button><button type="button" class="suppr" data-mod="suppr-mission" data-id="' + x.id + '" aria-label="Retirer ' + B.esc(x.titre) + '">×</button></li>'; }).join('') + '</ul>' : '<p class="vide-mod">Aucune mission. Confiez la première.</p>') +
        '<form class="form-mod" data-form="mission"><div class="ligne-mod"><input class="champ" name="titre" required placeholder="Mission" aria-label="Mission"><input class="champ" name="qui" placeholder="Confiée à" aria-label="Confiée à"></div><button class="bouton noir" type="submit">Confier la mission</button></form>';
    },
    invites: function (p, v) {
      var n = function (r) { return v.invites.filter(function (i) { return i.rep === r; }).length; };
      return '<p class="note-mod"><b>' + n('oui') + '</b> viennent · <b>' + n('non') + '</b> non · <b>' + n('attente') + '</b> en attente</p>' +
        (v.invites.length ? '<ul class="liste-mod">' + v.invites.map(function (i) { return '<li><span>' + B.fr(i.nom) + '</span><button type="button" class="opt rep-' + i.rep + '" data-mod="rep" data-id="' + i.id + '" aria-label="' + B.esc(i.nom) + ' : ' + NOM_REP[i.rep] + '. Changer la réponse">' + NOM_REP[i.rep] + '</button><button type="button" class="suppr" data-mod="suppr-invite" data-id="' + i.id + '" aria-label="Retirer ' + B.esc(i.nom) + '">×</button></li>'; }).join('') + '</ul>' : '<p class="vide-mod">La liste est vide.</p>') +
        '<form class="form-mod" data-form="invite"><div class="ligne-mod"><input class="champ" name="nom" required placeholder="Prénom Nom" aria-label="Nom de l’invité"><button class="bouton noir" type="submit">Inviter</button></div></form>';
    }
  };

  A.module = {
    def: DEF,
    corps: function (p, ctx) {
      var d = DEF[p.ref], v = vue(ctx, p.uid), n = v.net.length - 1;
      return '<div class="module" data-owner="' + p.uid + '" data-module="' + p.ref + '"><div class="tete-module"><p class="sur">' + B.pastille(d.famille) + 'Module' + (n ? ' · relié à ' + n : '') + '</p><h4>' + B.fr(d.titre) + '</h4></div>' +
        '<div class="corps-module">' + CORPS[p.ref](p, v) + '</div></div>';
    },
    ecouter: function (racine, ctx) {
      racine.addEventListener('submit', function (ev) {
        var f = ev.target.closest('[data-form]'); if (!f) return;
        ev.preventDefault();
        var owner = f.closest('.module').getAttribute('data-owner'), x = {}, D = ctx.donnees;
        Array.prototype.forEach.call(f.elements, function (e) { if (e.name) x[e.name] = e.value.trim(); });
        var t = f.getAttribute('data-form');
        if (t === 'moment' || t === 'ligne' || t === 'cachet') {
          D.moments.push({ id: id(), owner: owner, titre: x.titre, date: x.date || aujourdhui(), heure: x.heure || '', montant: x.montant ? Math.round(parseFloat(x.montant.replace(',', '.')) * 100) / 100 : 0, cachet: t === 'cachet', couche: x.couche || '', apres: x.apres || '', planB: x.planB || '' });
        }
        else if (t === 'morceau') D.morceaux.push({ id: id(), owner: owner, titre: x.titre, artiste: x.artiste || '', moment: x.moment || '' });
        else if (t === 'mission') D.missions.push({ id: id(), owner: owner, titre: x.titre, qui: x.qui || '', votes: 0, faite: false });
        else if (t === 'photo') return; else if (t === 'doc') D.documents.push({ id: id(), owner: owner, titre: x.titre, etat: ETATS[0] });
        else if (t === 'invite') D.invites.push({ id: id(), owner: owner, nom: x.nom, rep: 'attente' });
        ctx.changer(owner, t === 'invite' ? 'nom' : 'titre');
      });
      racine.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-mod]'); if (!b) return;
        var owner = b.closest('.module').getAttribute('data-owner'), D = ctx.donnees, quoi = b.getAttribute('data-mod'), cible = b.getAttribute('data-id');
        var sans = function (l) { return l.filter(function (x) { return x.id !== cible; }); };
        if (quoi === 'suppr-moment') D.moments = sans(D.moments);
        else if (quoi === 'suppr-doc') D.documents = sans(D.documents);
        else if (quoi === 'suppr-invite') D.invites = sans(D.invites);
        else if (quoi === 'suppr-morceau') D.morceaux = sans(D.morceaux);
        else if (quoi === 'suppr-photo') D.photos = sans(D.photos);
        else if (quoi === 'suppr-mission') D.missions = sans(D.missions);
        else if (quoi === 'vote') D.missions.forEach(function (m) { if (m.id === cible) m.votes++; });
        else if (quoi === 'imprimer') { var mod = b.closest('.module'); mod.classList.add('a-imprimer'); document.documentElement.classList.add('impression'); window.print(); document.documentElement.classList.remove('impression'); mod.classList.remove('a-imprimer'); return; }
        else if (quoi === 'rep') D.invites.forEach(function (i) { if (i.id === cible) i.rep = REP[(REP.indexOf(i.rep) + 1) % REP.length]; });
        else if (quoi === 'etat-doc') D.documents.forEach(function (d) { if (d.id === cible) d.etat = ETATS[(ETATS.indexOf(d.etat) + 1) % ETATS.length]; });
        else {
          var p = ctx.partie(owner);
          if (quoi === 'couche') p.couche = b.getAttribute('data-couche');
          if (quoi === 'mode') p.mode = b.getAttribute('data-m');
          if (quoi === 'jour') p.jour = b.getAttribute('data-jour') === p.jour ? null : b.getAttribute('data-jour');
          if (quoi === 'mois') { var m = p.mois || aujourdhui().slice(0, 7), dt = new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + (+b.getAttribute('data-pas')), 1); p.mois = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0'); p.jour = null; }
        }
        ctx.changer(owner, quoi === 'jour' ? 'titre' : null, quoi === 'rep' || quoi === 'etat-doc' || quoi === 'vote' ? '[data-id="' + cible + '"]' : null);
      });
      racine.addEventListener('change', function (ev) {
        var t = ev.target, m = t.closest('.module'); if (!m) return;
        var owner = m.getAttribute('data-owner'), D = ctx.donnees;
        if (t.hasAttribute('data-mod-case')) { D.missions.forEach(function (x) { if (x.id === t.getAttribute('data-id')) x.faite = t.checked; }); ctx.changer(owner, null, '[data-id="' + t.getAttribute('data-id') + '"]'); return; }
        if (t.hasAttribute('data-photo') && t.files[0]) {
          var mine = D.photos.filter(function (x) { return x.owner === owner; });
          if (mine.length >= 8) { alert('Huit photos au plus par galerie, pour tenir sur l’appareil.'); return; }
          var leg = m.querySelector('[name="legende"]').value.trim();
          reduire(t.files[0], 720).then(function (src) { D.photos.push({ id: id(), owner: owner, src: src, legende: leg }); ctx.changer(owner, 'legende'); });
        }
      });
    }
  };
})();
