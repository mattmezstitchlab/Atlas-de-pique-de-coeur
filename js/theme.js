/* Jour, Nuit ou Auto : l’apparence de l’atlas, gardée sur cet appareil. Chargé dans <head> pour éviter l’éclair blanc.
   Auto suit le réglage du système (prefers-color-scheme). */
(function () {
  var CLE = 'atlas-theme', h = document.documentElement, choix;
  try { choix = localStorage.getItem(CLE) || 'auto'; } catch (e) { choix = 'auto'; }
  var sombre = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function mode() { h.setAttribute('data-theme', choix); h.setAttribute('data-mode', choix === 'nuit' || (choix === 'auto' && sombre && sombre.matches) ? 'nuit' : 'jour'); }
  mode(); if (sombre && sombre.addEventListener) sombre.addEventListener('change', mode);
  var NOMS = { auto: 'Auto', jour: 'Jour', nuit: 'Nuit' };
  function poser() {
    var ligne = document.querySelector('.dock-haut .dock-ligne'); if (!ligne || ligne.querySelector('.theme-choix')) return;
    ligne.insertAdjacentHTML('beforeend', '<span class="separateur" aria-hidden="true"></span><div class="theme-choix" role="group" aria-label="Apparence">' +
      Object.keys(NOMS).map(function (k) { return '<button type="button" class="theme-btn" data-theme-choix="' + k + '" aria-pressed="' + (k === choix) + '">' + NOMS[k] + '</button>'; }).join('') + '</div>');
    ligne.querySelector('.theme-choix').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-theme-choix]'); if (!b) return;
      choix = b.getAttribute('data-theme-choix'); mode();
      try { localStorage.setItem(CLE, choix); } catch (e) { /* le choix vaut pour la séance */ }
      Array.prototype.forEach.call(this.querySelectorAll('[data-theme-choix]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poser); else poser();
})();
