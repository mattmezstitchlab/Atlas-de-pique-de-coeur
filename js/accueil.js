/* L’accueil : la mosaïque vive de « Créer », deux vrais modules reliés (Timeline et Agenda, js/modules.js),
   les chiffres de la chronologie et de ses preuves (data/chronologie.js), le dock du bas. */
(function () {
  var A = window.ATLAS, B = A.bloc;

  /* la mosaïque vive : la composition de l’achèvement, en petit */
  var mv = document.getElementById('mosaique-vive');
  if (mv && A.achevement) mv.innerHTML = A.achevement.briques.map(function (b, i) { return '<i class="' + B.esc(b.style) + '" style="grid-column:' + (b.x + 1) + ' / span ' + b.w + ';grid-row:' + (b.y + 1) + ' / span ' + b.h + ';--i:' + i + '"></i>'; }).join('');

  /* l’essai : Timeline et Agenda, reliés ; leurs données restent sur cet appareil (clé à part de la Composition) */
  var zone = document.getElementById('essai-grille'), CLE = 'atlas-accueil-essai-v1';
  if (zone && A.module) {
    var parts = { tl: { uid: 'essai-tl', type: 'module', ref: 'timeline' }, ag: { uid: 'essai-ag', type: 'module', ref: 'agenda' } };
    var donnees; try { donnees = JSON.parse(localStorage.getItem(CLE) || 'null'); } catch (e) { donnees = null; }
    donnees = donnees || { moments: [], invites: [], documents: [] };
    var ctx = { donnees: donnees, reseau: function () { return ['essai-tl', 'essai-ag']; }, partie: function (id) { return id === 'essai-tl' ? parts.tl : parts.ag; },
      changer: function (owner, champ, cible) {
        try { localStorage.setItem(CLE, JSON.stringify(donnees)); } catch (e) { /* la démonstration vit pour la séance */ }
        rendre(); var m = zone.querySelector('.module[data-owner="' + owner + '"]'); if (!m) return;
        var f = (cible && m.querySelector(cible)) || (champ && m.querySelector('[name="' + champ + '"]')); if (f) f.focus({ preventScroll: true });
      } };
    function rendre() {
      zone.innerHTML = ['tl', 'ag'].map(function (k) { return '<article class="bloc module carte moyen relie" style="grid-column: span 6; grid-row: span 6" aria-label="Module ' + (k === 'tl' ? 'Timeline' : 'Agenda') + '">' + A.module.corps(parts[k], ctx) + '</article>'; }).join('') +
        '<span class="essai-fil" aria-hidden="true"></span>';
    }
    A.module.ecouter(zone, ctx); rendre();
  }

  /* la chronologie et ses preuves, comptées dans le fichier publié */
  var pc = document.getElementById('preuves-chiffres'), C = A.chronologie;
  if (pc && C) {
    var n = function (s) { return C.entrees.filter(function (e) { return e.evidenceStatus === s; }).length; };
    var attente = C.archives.filter(function (a) { return a.attente; }).length;
    pc.innerHTML = [[C.entrees.length, 'moments publiés', '1999 – 2025'], [n('document'), 'établis par document', 'une pièce les prouve'], [n('declare'), 'déclarés par l’auteur', 'en attente de leur pièce'],
      [n('a-verifier'), 'à vérifier', 'dits comme tels'], [C.relations.length, 'relations justifiées', 'jamais déduites'], [attente, 'archives à déposer', 'leur place est réservée']]
      .map(function (c, i) { return '<li style="--i:' + i + '"><b>' + c[0] + '</b><span>' + B.fr(c[1]) + '</span><small>' + B.fr(c[2]) + '</small></li>'; }).join('');
  }

  /* les sections qui apparaissent, et le lieu courant dans le dock du bas */
  var lieux = Array.prototype.slice.call(document.querySelectorAll('#dock .lieu'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (v) { v.forEach(function (x) { if (x.isIntersecting) x.target.classList.add('vu'); }); }, { threshold: 0.18 });
    Array.prototype.forEach.call(document.querySelectorAll('main > section'), function (s) { io.observe(s); });
    var io2 = new IntersectionObserver(function (v) { v.forEach(function (x) { if (!x.isIntersecting) return; lieux.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + x.target.id)); }); }); }, { rootMargin: '-45% 0px -50% 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('main > section[id]'), function (s) { io2.observe(s); });
  } else Array.prototype.forEach.call(document.querySelectorAll('main > section'), function (s) { s.classList.add('vu'); });
})();
