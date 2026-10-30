/* La section « Publier » de la Composition : préparer, sur un choix explicite, le fichier public d’une composition.
   Rien n’est envoyé ni enregistré ailleurs : le fichier est téléchargé, puis ajouté au dépôt par une personne (docs/PUBLICATION.md). */
(function () {
  var A = window.ATLAS, P = A.publication;
  var $ = function (id) { return document.getElementById(id); };
  var titre = $('publier-titre'), desc = $('publier-description'), accord = $('publier-accord'), preparer = $('publier-preparer');
  var statut = $('publier-statut'), res = $('publier-resultat'), courant = null;
  function etatBouton() { preparer.disabled = !(accord.checked && titre.value.trim()); }
  [titre, accord].forEach(function (e) { e.addEventListener('input', etatBouton); e.addEventListener('change', etatBouton); });
  /* changer le titre ou la composition demande de préparer à nouveau */
  [titre, desc].forEach(function (e) { e.addEventListener('input', function () { courant = null; res.hidden = true; }); });
  preparer.addEventListener('click', function () {
    try { courant = P.publier(A.grille.etat(), { titre: titre.value, description: desc.value }); }
    catch (e) { courant = null; res.hidden = true; statut.textContent = e.message; return; }
    var adresse = location.origin + '/composition/' + courant.id;
    $('publier-id').textContent = courant.id;
    $('publier-adresse').textContent = adresse;
    $('publier-reference').textContent = JSON.stringify({ format: 'atlas-reference', version: 1, type: 'composition', id: courant.id });
    $('publier-apercu').textContent = JSON.stringify(courant, null, 2);
    res.hidden = false;
    statut.textContent = 'Version publique préparée : ' + courant.blocs.length + ' bloc' + (courant.blocs.length > 1 ? 's' : '') + ', ' + courant.liens.length + ' lien' + (courant.liens.length > 1 ? 's' : '') + '. Elle n’est pas publiée tant que le fichier n’est pas ajouté au dépôt.';
  });
  $('publier-telecharger').addEventListener('click', function () {
    if (!courant) return;
    var url = URL.createObjectURL(new Blob([JSON.stringify(courant, null, 2) + '\n'], { type: 'application/json' })), a = document.createElement('a');
    a.href = url; a.download = courant.id + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });
  etatBouton();
})();
