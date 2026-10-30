/* Le Disque : l’outil rond de .ONE (lemondeaime.com/studio/one/univers), repris pour l’atlas.
   Un Point au centre, une couronne de mots autour. Choisir un mot ouvre son niveau : « le Disque devient son outil ».
   Toucher le centre revient au niveau d’avant ; Échap ferme. Les flèches font le tour de la couronne.
   Usage : var d = ATLAS.disque({ titre: 'L’atlas', racine: function () { return niveau; } }); d.ouvrir();
   Un niveau : { titre, sous, note, items: [{ mot, sous?, actif?, niveau?: function () { return niveau }, agir?: function () {} }] }.
   « niveau » fait descendre le Disque d’un cran ; « agir » ferme le Disque, puis agit. */
(function () {
  var A = window.ATLAS = window.ATLAS || {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fr = function (s) { return esc(s).replace(/ ([:;?!])/g, '&nbsp;$1'); };
  var uid = 0;

  A.disque = function (opts) {
    var id = 'disque-' + (++uid), pile = [], courant = null, retourFocus = null;
    var dlg = document.createElement('dialog');
    dlg.className = 'disque-fenetre';
    dlg.setAttribute('aria-labelledby', id + '-titre');
    dlg.innerHTML = '<div class="disque-scene"><div class="disque" id="' + id + '">' +
      '<button type="button" class="disque-centre"><span class="orbe disque-orbe" aria-hidden="true"></span><b id="' + id + '-titre"></b><span class="disque-sous"></span><span class="disque-retour"></span></button>' +
      '<ul class="couronne"></ul></div>' +
      '<p class="disque-note" role="status" aria-live="polite"></p>' +
      '<button type="button" class="bouton disque-fermer">Fermer le Disque</button></div>';
    document.body.appendChild(dlg);
    var centre = dlg.querySelector('.disque-centre'), couronne = dlg.querySelector('.couronne'), note = dlg.querySelector('.disque-note');

    function rendre(niv, focusIndex) {
      courant = niv;
      dlg.querySelector('#' + id + '-titre').textContent = niv.titre;
      dlg.querySelector('.disque-sous').innerHTML = fr(niv.sous || '');
      dlg.querySelector('.disque-retour').textContent = pile.length ? '← Revenir' : '';
      centre.setAttribute('aria-label', pile.length ? niv.titre + '. Revenir au niveau précédent' : niv.titre + '. Fermer le Disque');
      var n = niv.items.length;
      couronne.style.setProperty('--n', n);
      couronne.classList.toggle('dense', n > 9);
      couronne.innerHTML = niv.items.map(function (it, k) {
        return '<li style="--i:' + k + '"><button type="button" class="satellite' + (it.actif ? ' actif' : '') + '" data-k="' + k + '"' + (it.actif ? ' aria-current="true"' : '') + '>' +
          '<span class="pastille-sat" aria-hidden="true"></span><span class="mot">' + fr(it.mot) + '</span>' + (it.sous ? '<span class="mot-sous">' + fr(it.sous) + '</span>' : '') + '</button></li>';
      }).join('');
      note.innerHTML = fr(niv.note || '');
      dlg.querySelector('.disque').classList.remove('tourne'); void couronne.offsetWidth; dlg.querySelector('.disque').classList.add('tourne');
      var cible = couronne.querySelectorAll('.satellite')[focusIndex || 0];
      (cible || centre).focus();
    }
    couronne.addEventListener('click', function (ev) {
      var b = ev.target.closest('.satellite'); if (!b) return;
      var it = courant.items[+b.getAttribute('data-k')];
      if (it.niveau) { pile.push(courant); rendre(it.niveau()); return; }
      fermer(); if (it.agir) requestAnimationFrame(it.agir);
    });
    centre.addEventListener('click', function () { if (pile.length) rendre(pile.pop()); else fermer(); });
    dlg.querySelector('.disque-fermer').addEventListener('click', fermer);
    dlg.addEventListener('click', function (ev) { if (ev.target === dlg) fermer(); });   /* toucher hors du Disque */
    dlg.addEventListener('keydown', function (ev) {
      var sats = Array.prototype.slice.call(couronne.querySelectorAll('.satellite')), i = sats.indexOf(document.activeElement);
      if ((ev.key === 'Backspace') && pile.length) { ev.preventDefault(); rendre(pile.pop()); return; }
      if (i < 0 || !sats.length) return;
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
      if (d) { ev.preventDefault(); sats[(i + d + sats.length) % sats.length].focus(); }
      if (ev.key === 'Home') { ev.preventDefault(); sats[0].focus(); }
      if (ev.key === 'End') { ev.preventDefault(); sats[sats.length - 1].focus(); }
    });
    dlg.addEventListener('close', function () { document.documentElement.classList.remove('disque-ouvert'); if (retourFocus && retourFocus.focus) retourFocus.focus(); });

    function ouvrir(niveau) {
      retourFocus = document.activeElement; pile = [];
      document.documentElement.classList.add('disque-ouvert');
      if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
      rendre(niveau || opts.racine());
    }
    function fermer() { document.documentElement.classList.remove('disque-ouvert'); if (dlg.open && typeof dlg.close === 'function') dlg.close(); else { dlg.removeAttribute('open'); document.documentElement.classList.remove('disque-ouvert'); } }
    return { ouvrir: ouvrir, fermer: fermer, element: dlg };
  };
})();
