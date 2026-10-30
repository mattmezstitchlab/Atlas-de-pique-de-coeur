/* Le coffre local : les fichiers déposés dans l’éditeur (photos, scans), rangés dans IndexedDB sur cet appareil.
   Rien ne part sur un serveur. L’éditeur et l’aperçu de la page d’accueil le lisent ; la version publique ne le lit jamais.
   A.coffre.lire(id) → Promise<dataURL|null> ; A.coffre.ecrire(id, dataURL) ; A.coffre.effacer(id) */
(function () {
  var A = window.ATLAS = window.ATLAS || {};
  var base = null;
  function ouvrir() {
    if (base) return base;
    base = new Promise(function (ok, ko) {
      if (!window.indexedDB) { ko(new Error('IndexedDB indisponible')); return; }
      var r = indexedDB.open('atlas-coffre', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('fichiers'); };
      r.onsuccess = function () { ok(r.result); };
      r.onerror = function () { ko(r.error); };
    });
    return base;
  }
  function tx(mode, fn) {
    return ouvrir().then(function (db) {
      return new Promise(function (ok, ko) { var t = db.transaction('fichiers', mode), s = t.objectStore('fichiers'), q = fn(s); t.oncomplete = function () { ok(q && q.result); }; t.onerror = function () { ko(t.error); }; });
    });
  }
  A.coffre = {
    lire: function (id) { return tx('readonly', function (s) { return s.get(id); }).catch(function () { return null; }); },
    ecrire: function (id, data) { return tx('readwrite', function (s) { return s.put(data, id); }); },
    effacer: function (id) { return tx('readwrite', function (s) { return s.delete(id); }); },
    /* réduire une image avant de la ranger : 1600 px au plus, JPEG */
    reduire: function (fichier, max) {
      max = max || 1600;
      return new Promise(function (ok, ko) {
        var lu = new FileReader();
        lu.onload = function () {
          var img = new Image();
          img.onload = function () {
            var k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
            c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', 0.86));
          };
          img.onerror = ko; img.src = lu.result;
        };
        lu.onerror = ko; lu.readAsDataURL(fichier);
      });
    }
  };
})();
