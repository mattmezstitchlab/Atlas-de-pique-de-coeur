/* Jour, Nuit ou Auto : l’apparence de l’atlas, gardée sur cet appareil. Chargé dans <head> pour éviter l’éclair blanc.
   Auto suit le réglage du système (prefers-color-scheme). */
(function () {
  var CLE = 'atlas-theme', h = document.documentElement, choix;
  try { choix = localStorage.getItem(CLE) || 'auto'; } catch (e) { choix = 'auto'; }
  var sombre = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function mode() { h.setAttribute('data-theme', choix); h.setAttribute('data-mode', choix === 'nuit' || (choix === 'auto' && sombre && sombre.matches) ? 'nuit' : 'jour'); }
  mode(); if (sombre && sombre.addEventListener) sombre.addEventListener('change', mode);
  function poser() {
    var ligne = document.querySelector('.dock-haut .dock-ligne'); if (!ligne || ligne.querySelector('.theme-picto')) return;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'theme-picto'; btn.title = 'Changer le thème : automatique, jour, nuit';
    function etiquette() {
      var nom = choix === 'auto' ? 'Automatique' : choix === 'jour' ? 'Jour' : 'Nuit';
      btn.setAttribute('aria-label', 'Apparence : ' + nom + '. Activer le mode suivant');
      btn.innerHTML = choix === 'nuit' ? '&#9790;' : choix === 'jour' ? '&#9728;' : '&#9681;';
    }
    etiquette();
    btn.addEventListener('click',function(){
      choix = choix === 'auto' ? 'jour' : choix === 'jour' ? 'nuit' : 'auto';
      mode(); etiquette(); try { localStorage.setItem(CLE,choix); } catch(e) {}
    });
    ligne.appendChild(btn);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poser); else poser();
  function rubriques(){if(document.querySelector('script[data-aime-rubriques]'))return;var script=document.createElement('script');script.src='js/aime-rubriques.js';script.defer=true;script.setAttribute('data-aime-rubriques','');document.body.appendChild(script)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',rubriques);else rubriques();
})();
