/* L’import : la métamorphose de l’impossible. On dépose n’importe quels fichiers, on dit ce qu’on veut ;
   ATLAS les lit, les relie seulement quand ils sont réellement liés, et les montre dans la visionneuse : le Cube (js/vue-cube.js).
   Les six faces d’un import :
     Chronologie : les dates trouvées dans les fichiers ·  Composition : les documents rassemblés (les fichiers reliés, fusionnés)
     Archives : vos fichiers ·  Relations : ce qui relie deux fichiers, avec sa raison
     Modules : ce que votre demande appelle (js/moteur.js → js/traducteur.js) ·  Écosystème : l’état, ce qui manque
   Rien n’est envoyé : tout est lu dans le navigateur. Les PDF passent par pdf.js (js/vendor/pdfjs, la version de l’atelier Point Zéro).
   Les archives ZIP sont dépliées (jusqu’à deux niveaux) : chaque fichier devient un fragment, « contenu dans » son archive, avec la date
   qu’il porte dans l’archive. Les traces de macOS (__MACOSX, .DS_Store) sont comptées, pas importées. Les doublons exacts sont reconnus
   par leur empreinte SHA-256. Un dossier entier peut être déposé.
   L’export : un dossier web rangé (.zip), le PDF (par l’impression du navigateur), le manifeste (.json). */
(function () {
  var A = window.ATLAS = window.ATLAS || {};
  var ICI = document.currentScript ? document.currentScript.src : location.href;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var sans = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var slug = function (s) { return sans(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'document'; };
  var poids = function (n) { return n < 1024 ? n + ' o' : n < 1048576 ? Math.round(n / 1024) + ' Ko' : (n / 1048576).toFixed(1).replace('.', ',') + ' Mo'; };
  var MOIS = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
  var MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var VIDES = ('avec dans pour sans sous entre apres avant depuis pendant comme aussi alors ainsi encore toujours jamais toutes toute tous cette celle celui ceux elles leurs notre votre vous nous etre avoir fait faire sont etait seront plus moins tres bien voir page pages document fichier fichiers').split(' ');

  /* ---------- lire un fichier, quel qu’il soit ---------- */
  var TYPES = { pdf: 'pdf', png: 'image', jpg: 'image', jpeg: 'image', webp: 'image', gif: 'image', svg: 'image', avif: 'image',
    txt: 'texte', md: 'texte', markdown: 'texte', csv: 'tableau', tsv: 'tableau', json: 'json', html: 'html', htm: 'html',
    mp3: 'audio', wav: 'audio', m4a: 'audio', ogg: 'audio', mp4: 'video', mov: 'video', webm: 'video', zip: 'archive' };
  /* le code et la configuration se lisent comme du texte (jamais exécutés) */
  'js jsx ts tsx mjs cjs mts css scss sass less vue svelte astro py rb php java kt swift go rs c h cpp sh sql yml yaml toml ini xml jsonc patch diff log env example gitignore rtf tex srt vtt'.split(' ').forEach(function (x) { TYPES[x] = TYPES[x] || 'texte'; });
  /* des noms trop communs pour relier deux projets à eux seuls */
  var CODE = /\.(js|jsx|ts|tsx|mjs|cjs|mts|css|scss|sass|less|vue|svelte|astro|py|rb|php|java|kt|swift|go|rs|c|h|cpp|sh|sql|jsonc|patch|diff|lock)$/i;
  var GENERIQUES = ('readme index main app style styles package package-lock config vite.config tsconfig utils types constants license changelog favicon logo robots manifest home page layout router routes store api test setup').split(' ');
  var NOM_TYPE = { pdf: 'PDF', image: 'Image', texte: 'Texte', tableau: 'Tableau', json: 'Données', html: 'Page web', audio: 'Son', video: 'Vidéo', archive: 'Archive ZIP', autre: 'Autre format' };
  var CITE = /[\w\-.]+\.(?:pdf|png|jpe?g|webp|gif|svg|csv|tsv|txt|md|html?|json|mp3|wav|m4a|mp4|mov|webm|docx?|xlsx?|pptx?|zip)\b/gi;

  function dates(texte) {
    var t = sans(texte), out = {}, m;
    var r1 = /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/g; while ((m = r1.exec(t))) { if (+m[2] >= 1 && +m[2] <= 12 && +m[1] >= 1 && +m[1] <= 31) out[m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2)] = 1; }
    var r2 = /\b(\d{4})-(\d{2})-(\d{2})\b/g; while ((m = r2.exec(t))) out[m[1] + '-' + m[2] + '-' + m[3]] = 1;
    var r3 = new RegExp('\\b(\\d{1,2})(?:er)? (' + MOIS.join('|') + ') (\\d{4})\\b', 'g'); while ((m = r3.exec(t))) out[m[3] + '-' + ('0' + (MOIS.indexOf(m[2]) + 1)).slice(-2) + '-' + ('0' + m[1]).slice(-2)] = 1;
    return Object.keys(out).sort();
  }
  var dateFr = function (iso) { var p = iso.split('-'); return (+p[2]) + (p[2] === '01' ? 'er' : '') + ' ' + MOIS_FR[+p[1] - 1] + ' ' + p[0]; };
  function mots(texte) {
    var c = {}; (sans(texte).match(/[a-z][a-z-]{5,}/g) || []).forEach(function (w) { if (VIDES.indexOf(w) === -1) c[w] = (c[w] || 0) + 1; });
    return c;
  }
  var pdfjs = null;
  function chargerPdfjs() {
    if (pdfjs) return Promise.resolve(pdfjs);
    return import(new URL('vendor/pdfjs/pdf.min.mjs', ICI).href).then(function (m) { m.GlobalWorkerOptions.workerSrc = new URL('vendor/pdfjs/pdf.worker.min.mjs', ICI).href; pdfjs = m; return m; });
  }
  function lirePdf(d, buf) {
    return chargerPdfjs().then(function (lib) { return lib.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise; }).then(function (pdf) {
      d.pages = pdf.numPages; var n = Math.min(pdf.numPages, 40), textes = [], sansTexte = [], symboles = [], grilles = [];
      var suite = Promise.resolve();
      for (var i = 1; i <= n; i++) (function (k) {
        suite = suite.then(function () { return pdf.getPage(k); }).then(function (page) { return page.getTextContent(); }).then(function (tc) {
          var t = tc.items.map(function (x) { return x.str; }).join(' ').replace(/\s+/g, ' ').trim();
          var illisibles = (t.match(/[-�]/g) || []).length, seuls = tc.items.filter(function (x) { return x.str.trim().length === 1; }).length;
          if (t.length < 20) sansTexte.push(k);
          else if (illisibles > 5) symboles.push(k);
          if (tc.items.length > 80 && seuls / tc.items.length > 0.6) grilles.push(k);
          textes.push(t.replace(/[-�]/g, ''));
        });
      })(i);
      return suite.then(function () {
        d.texte = textes.join('\n\n');
        if (pdf.numPages > n) d.alertes.push('Seules les ' + n + ' premières pages sur ' + pdf.numPages + ' ont été lues.');
        if (sansTexte.length) d.alertes.push('Page' + (sansTexte.length > 1 ? 's ' : ' ') + sansTexte.join(', ') + ' : pas de texte lisible (image, scan ou grille) ; montrée en image.');
        if (symboles.length) d.alertes.push('Page' + (symboles.length > 1 ? 's ' : ' ') + symboles.join(', ') + ' : caractères d’une police à symboles, illisibles en texte.');
        if (grilles.length) d.alertes.push('Page' + (grilles.length > 1 ? 's ' : ' ') + grilles.join(', ') + ' : une grille de symboles probable (patron). ATLAS la montre et la range ; la convertir en points relève de l’atelier Point Zéro.');
        return pdf.getMetadata().catch(function () { return null; });
      }).then(function (meta) {
        var info = meta && meta.info || {}; if (info.Title) d.titrePdf = info.Title;
        return pdf.getPage(1);
      }).then(function (page) {
        var vp = page.getViewport({ scale: 1 }), k = Math.min(2, 1100 / vp.width), v = page.getViewport({ scale: k });
        var c = document.createElement('canvas'); c.width = Math.round(v.width); c.height = Math.round(v.height);
        return page.render({ canvas: c, canvasContext: c.getContext('2d'), viewport: v }).promise.then(function () { d.apercu = c.toDataURL('image/jpeg', 0.85); d.format = Math.round(vp.width) + ' × ' + Math.round(vp.height) + ' pt'; });
      });
    }).catch(function (e) { d.alertes.push('Ce PDF n’a pas pu être lu ici (' + (e && e.message ? e.message.slice(0, 80) : 'erreur') + ') ; il est gardé tel quel dans l’export.'); });
  }
  function lire(f, i) {
    var ext = (f.name.split('.').pop() || '').toLowerCase(), type = f.name.indexOf('.') === -1 ? 'autre' : (TYPES[ext] || 'autre');
    var d = { id: 'f' + i, nom: f.name, base: f.name.replace(/\.[^.]+$/, ''), ext: ext, type: type, taille: f.size, modifie: f.lastModified, fichier: f,
      url: URL.createObjectURL(f), texte: '', alertes: [], cite: [], pages: 0, chemin: f.chemin || f.webkitRelativePath || f.name, archive: f.archive || '', dateArchive: f.dateArchive || '', empreinte: f.empreinte || '' };
    if (f.deplie) d.alertes = d.alertes.concat(f.deplie);
    if (!f.size) d.alertes.push('Le fichier est vide.');
    var fin = function () {
      /* le code cite des noms de fichiers à tout moment (variables, exemples) : on ne les compte pas comme des citations */
      d.cite = CODE.test(d.nom) ? [] : ((d.texte || '') + ' ' + (d.refs || []).join(' ')).match(CITE) || []; d.cite = d.cite.map(function (x) { return x.split('/').pop(); }).filter(function (x, k, t) { return t.indexOf(x) === k && x !== d.nom; });
      d.dates = dates(d.texte + ' ' + d.nom); d.mots = mots(d.texte + ' ' + d.base.replace(/[-_]/g, ' '));
      return d;
    };
    if (type === 'image') return new Promise(function (ok) { var im = new Image(); im.onload = function () { d.format = im.naturalWidth + ' × ' + im.naturalHeight + ' px'; d.apercu = d.url; ok(fin()); }; im.onerror = function () { d.alertes.push('L’image n’a pas pu être affichée.'); ok(fin()); }; im.src = d.url; });
    if (type === 'pdf') return f.arrayBuffer().then(function (b) { return lirePdf(d, b); }).then(fin);
    if (type === 'texte' || type === 'tableau' || type === 'json' || type === 'html') return f.text().then(function (t) {
      if (type === 'html') {
        var doc = new DOMParser().parseFromString(t.replace(/<\/(h\d|p|div|li|td|th|tr|section|article|header|footer|title)>|<br\s*\/?>/gi, '$& '), 'text/html');   /* un espace entre les blocs : sinon les mots se collent */
        d.titrePdf = doc.title; d.texte = (doc.body ? doc.body.textContent : t).replace(/\s+/g, ' ').trim();
        d.refs = Array.prototype.map.call(doc.querySelectorAll('[src],[href]'), function (el) { return el.getAttribute('src') || el.getAttribute('href'); }).filter(function (u) { return u && !/^(https?:|mailto:|tel:|#|data:)/i.test(u); });
      } else if (type === 'tableau') {
        var sep = (t.split('\n')[0].match(/;/g) || []).length > (t.split('\n')[0].match(/,/g) || []).length ? ';' : ext === 'tsv' ? '\t' : ',';
        d.lignes = t.split(/\r?\n/).filter(Boolean).map(function (l) { return l.split(sep).map(function (c) { return c.replace(/^"|"$/g, '').trim(); }); });
        d.format = d.lignes.length + ' lignes × ' + (d.lignes[0] || []).length + ' colonnes'; d.texte = t;
      } else if (type === 'json') {
        try { var o = JSON.parse(t); d.texte = JSON.stringify(o, null, 1).replace(/[{}\[\]",]/g, ' '); if (o && o.format === 'atlas-recette') d.alertes.push('Une recette de la Composition d’ATLAS : elle se réimporte dans /composition.'); }
        catch (e) { d.texte = t; d.alertes.push('Le JSON n’est pas valide : lu comme du texte.'); }
      } else d.texte = t;
      if (/�/.test(t)) d.alertes.push('Certains caractères ne sont pas dans l’encodage attendu (UTF-8) : ils sont remplacés par �.');
      return fin();
    });
    if (type === 'audio' || type === 'video' || type === 'archive') return Promise.resolve(fin());
    d.alertes.push('Format « .' + ext + ' » non lu ici : il est gardé tel quel, et rangé dans l’export.');
    return Promise.resolve(fin());
  }

  /* ---------- les archives : un ZIP se déplie, sans bibliothèque (le navigateur sait décompresser : DecompressionStream) ---------- */
  var LIMITES = { entrees: 3000, octets: 400 * 1048576, ratio: 200, profondeur: 2 };
  var estZip = function (u8) { return u8.length > 3 && u8[0] === 0x50 && u8[1] === 0x4b && u8[2] === 0x03 && u8[3] === 0x04; };
  function nomZip(u8, utf8) {
    try { return new TextDecoder('utf-8', { fatal: true }).decode(u8); } catch (e) { return new TextDecoder(utf8 ? 'utf-8' : 'windows-1252').decode(u8); }
  }
  /* un chemin sûr : ni racine, ni « .. » (pas de « zip slip ») */
  var cheminSur = function (n) { return n.replace(/\\/g, '/').split('/').filter(function (x) { return x && x !== '.' && x !== '..'; }).join('/'); };
  function dateDos(jour, heure) {
    var a = 1980 + (jour >> 9), m = (jour >> 5) & 15, j = jour & 31;
    if (a <= 1980 || m < 1 || m > 12 || j < 1) return null;   /* 1980 : la date par défaut d’un outil qui a effacé la vraie date */
    return new Date(a, m - 1, j, heure >> 11, (heure >> 5) & 63, (heure & 31) * 2);
  }
  function inflate(octets) {
    if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('ce navigateur ne sait pas décompresser'));
    return new Response(new Blob([octets]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
  }
  function deplier(f, profondeur) {
    return f.arrayBuffer().then(function (buf) {
      var u8 = new Uint8Array(buf), v = new DataView(buf), r = { fichiers: [], caches: 0, chiffres: 0, ignores: [], total: 0, commentaire: '' };
      var fin = -1; for (var k = u8.length - 22; k >= Math.max(0, u8.length - 65557); k--) if (v.getUint32(k, true) === 0x06054b50) { fin = k; break; }
      if (fin < 0) { r.erreur = 'le répertoire de l’archive est introuvable : elle est peut-être tronquée'; return r; }
      var n = v.getUint16(fin + 10, true), pos = v.getUint32(fin + 16, true), lc = v.getUint16(fin + 20, true);
      if (lc) r.commentaire = nomZip(u8.subarray(fin + 22, fin + 22 + lc), true).trim();
      if (pos === 0xffffffff || n === 0xffff) { r.erreur = 'archive ZIP64 (très grande) : pas encore dépliée ici'; return r; }
      var taches = [];
      for (var i = 0; i < n && pos + 46 <= u8.length; i++) {
        if (v.getUint32(pos, true) !== 0x02014b50) { r.erreur = 'le répertoire de l’archive est abîmé après ' + i + ' entrées'; break; }
        var drapeaux = v.getUint16(pos + 8, true), methode = v.getUint16(pos + 10, true), heure = v.getUint16(pos + 12, true), jour = v.getUint16(pos + 14, true);
        var comp = v.getUint32(pos + 20, true), brut = v.getUint32(pos + 24, true), ln = v.getUint16(pos + 28, true), le = v.getUint16(pos + 30, true), lk = v.getUint16(pos + 32, true), local = v.getUint32(pos + 42, true);
        var brutNom = nomZip(u8.subarray(pos + 46, pos + 46 + ln), drapeaux & 0x800), nom = cheminSur(brutNom);
        pos += 46 + ln + le + lk;
        if (!nom || /[\/\\]$/.test(brutNom)) continue;   /* un dossier */
        var base = nom.split('/').pop();
        if (/(^|\/)__MACOSX\//.test(nom) || base.charAt(0) === '.') { r.caches++; continue; }
        if (drapeaux & 1) { r.chiffres++; r.ignores.push(nom + ' (chiffré : il faut son mot de passe)'); continue; }
        if (r.fichiers.length + taches.length >= LIMITES.entrees) { r.ignores.push('au-delà de ' + LIMITES.entrees + ' fichiers : le reste n’est pas déplié'); break; }
        if (comp && brut / comp > LIMITES.ratio) { r.ignores.push(nom + ' (compression anormale : refusé par prudence)'); continue; }
        r.total += brut;
        if (r.total > LIMITES.octets) { r.ignores.push('au-delà de ' + poids(LIMITES.octets) + ' dépliés : le reste n’est pas déplié'); break; }
        if (v.getUint32(local, true) !== 0x04034b50) { r.ignores.push(nom + ' (entrée abîmée)'); continue; }
        var debut = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true), donnees = u8.subarray(debut, debut + comp);
        taches.push((function (nom, base, methode, donnees, date) {
          var p = methode === 0 ? Promise.resolve(donnees) : methode === 8 ? inflate(donnees) : Promise.reject(new Error('méthode de compression ' + methode + ' non lue'));
          return p.then(function (o) {
            var g = new File([o], base, { lastModified: date ? date.getTime() : f.lastModified });
            g.chemin = (f.chemin || f.name) + '/' + nom; g.archive = f.chemin || f.name;
            if (date) g.dateArchive = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
            return g;
          }, function (e) { r.ignores.push(nom + ' (' + e.message + ')'); return null; });
        })(nom, base, methode, donnees, dateDos(jour, heure)));
      }
      return Promise.all(taches).then(function (fs) {
        r.fichiers = fs.filter(Boolean);
        /* une archive dans l’archive se déplie aussi, jusqu’à la profondeur permise */
        return Promise.all(r.fichiers.map(function (g) {
          if (!/\.zip$/i.test(g.name) || profondeur >= LIMITES.profondeur) return [g];
          return deplier(g, profondeur + 1).then(function (s2) { g.deplie = resumeArchive(s2); r.caches += s2.caches; return [g].concat(s2.fichiers); });
        })).then(function (l) { r.fichiers = [].concat.apply([], l); return r; });
      });
    });
  }
  function resumeArchive(r) {
    var a = [];
    if (r.erreur) a.push('Archive non dépliée : ' + r.erreur + '.');
    else a.push('Archive dépliée : ' + r.fichiers.length + ' fichier' + (r.fichiers.length > 1 ? 's' : '') + ' (' + poids(r.total) + ').');
    if (r.caches) a.push(r.caches + ' trace' + (r.caches > 1 ? 's' : '') + ' de macOS (__MACOSX, .DS_Store) comptée' + (r.caches > 1 ? 's' : '') + ', non importée' + (r.caches > 1 ? 's' : '') + ' : elles disent quand et par quel logiciel les fichiers ont été téléchargés.');
    if (r.commentaire) a.push('Commentaire caché de l’archive : « ' + r.commentaire.slice(0, 160) + ' ».');
    r.ignores.slice(0, 8).forEach(function (x) { a.push('Non déplié : ' + x + '.'); });
    if (r.ignores.length > 8) a.push('Et ' + (r.ignores.length - 8) + ' autres entrées non dépliées.');
    return a;
  }
  /* tout ce qui est déposé, archives dépliées */
  function deplierTout(fs) {
    return Promise.all(fs.map(function (f) {
      return f.slice(0, 4).arrayBuffer().then(function (h) {
        if (!estZip(new Uint8Array(h))) return [f];
        return deplier(f, 1).then(function (r) { f.deplie = resumeArchive(r); return [f].concat(r.fichiers); }, function (e) { f.deplie = ['Archive non dépliée : ' + e.message + '.']; return [f]; });
      });
    })).then(function (l) { return [].concat.apply([], l); });
  }
  /* l’empreinte : deux fichiers aux octets identiques ont la même */
  function empreintes(fs) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve(fs);
    return Promise.all(fs.map(function (f) {
      if (f.size > 200 * 1048576) return f;
      return f.arrayBuffer().then(function (b) { return crypto.subtle.digest('SHA-256', b); }).then(function (h) { f.empreinte = Array.prototype.map.call(new Uint8Array(h), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); return f; });
    }));
  }

  /* ---------- relier : seulement ce qui est réellement lié, avec sa raison ---------- */
  function relier(docs) {
    var rel = [], n = docs.length, df = {};
    docs.forEach(function (d) { Object.keys(d.mots).forEach(function (w) { df[w] = (df[w] || 0) + 1; }); });
    var limite = Math.max(2, Math.min(Math.floor(n / 2), 6));
    /* les doublons exacts : reliés au premier exemplaire seulement (pas tous entre eux) ; un fichier vide n’est le doublon de rien */
    var premier = {}; docs.forEach(function (d) { if (d.empreinte && d.taille && !premier[d.empreinte]) premier[d.empreinte] = d; });
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
      var a = docs[i], b = docs[j], raisons = [];
      [[a, b], [b, a]].forEach(function (p) { if (p[1].archive && p[1].archive === p[0].chemin) raisons.push(p[1].nom + ' est contenu dans ' + p[0].nom); });
      if (a.empreinte && a.taille && a.empreinte === b.empreinte) { if (premier[a.empreinte] === a || premier[a.empreinte] === b) raisons.push('même contenu : empreinte identique (doublon exact)'); }
      /* deux fichiers de la même archive sont déjà reliés par elle : on ne les compare pas entre eux */
      else if (a.archive && a.archive === b.archive) { if (raisons.length) rel.push({ a: a.id, b: b.id, raisons: raisons, communs: [] }); continue; }
      else if (sans(a.base) === sans(b.base) && GENERIQUES.indexOf(sans(a.base)) === -1) raisons.push('même nom de fichier');
      /* du code : seules la citation exacte, le contenu et le nom comptent ; ses mots et ses noms de variables ne relient pas des projets */
      var code = CODE.test(a.nom) || CODE.test(b.nom);
      [[a, b], [b, a]].forEach(function (p) {
        var x = p[0], y = p[1];
        if (x.cite.some(function (c) { return sans(c) === sans(y.nom); })) raisons.push(x.nom + ' cite ' + y.nom);
        else if (!code && y.base.length >= 5 && GENERIQUES.indexOf(sans(y.base)) === -1 && sans(x.texte).indexOf(sans(y.base).replace(/[-_]/g, ' ')) !== -1) raisons.push(x.nom + ' nomme « ' + y.base + ' »');
      });
      var dd = code ? [] : a.dates.filter(function (x) { return b.dates.indexOf(x) !== -1; });
      if (dd.length) raisons.push('même date : ' + dd.map(dateFr).join(', '));
      var communs = code ? [] : Object.keys(a.mots).filter(function (w) { return b.mots[w] && df[w] <= limite; }).sort(function (x, y) { return (b.mots[y] + a.mots[y]) - (b.mots[x] + a.mots[x]); });
      if (communs.length >= 3) raisons.push('mots en commun : ' + communs.slice(0, 4).join(', '));
      /* un lien fort (contenu, doublon, citation, même nom) rassemble ; un lien faible entre deux archives différentes est montré, sans fondre les archives */
      var origine = function (d) { return d.archive || (d.type === 'archive' ? d.chemin : ''); }, ailleurs = origine(a) !== origine(b);
      var fort = raisons.some(function (x) { return /contenu|empreinte/.test(x) || !ailleurs && /cite|même nom/.test(x); });
      if (raisons.length) rel.push({ a: a.id, b: b.id, raisons: raisons, communs: communs, fort: fort || !origine(a) && !origine(b) });
    }
    return rel;
  }
  function groupes(docs, rel) {
    var parent = {}; docs.forEach(function (d) { parent[d.id] = d.id; });
    var trouve = function (x) { while (parent[x] !== x) x = parent[x] = parent[parent[x]]; return x; };
    rel.forEach(function (r) { if (r.fort !== false) parent[trouve(r.a)] = trouve(r.b); });
    var g = {}; docs.forEach(function (d) { var k = trouve(d.id); (g[k] = g[k] || []).push(d); });
    return Object.keys(g).map(function (k) { return g[k]; }).sort(function (x, y) { return y.length - x.length; });
  }

  /* ---------- la demande : le moteur la lit, le traducteur propose des modules ---------- */
  function lireDemande(texte) {
    if (!texte.trim() || !A.moteur || !A.traducteur) return { phrases: [], manques: [], blocs: [] };
    var t = A.traducteur.traduire(A.moteur.analyser(texte)), blocs = {}, manques = [];
    t.etapes.forEach(function (e) { e.blocs.forEach(function (b) { blocs[b.type + ':' + b.ref] = b; }); e.manque.forEach(function (q) { if (manques.indexOf(q) === -1) manques.push(q); }); });
    return { phrases: t.etapes.map(function (e) { return e.phrase; }), manques: manques, blocs: Object.keys(blocs).map(function (k) { return blocs[k]; }) };
  }

  /* ---------- la source du Cube : les six faces d’un import ---------- */
  var etat = { docs: [], rel: [], groupes: [], demande: '', lecture: null, manques: [] };
  function source() {
    var docs = etat.docs, items = {}, liens = {}, noms = {};
    var item = function (id, o) { o.id = id; items[id] = o; liens[id] = liens[id] || {}; return o; };
    var lier = function (a, b) { if (!items[a] || !items[b] || a === b) return; liens[a][b] = 1; liens[b][a] = 1; };
    docs.forEach(function (d) { noms[sans(d.nom)] = d; });
    var extrait = function (t) { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > 420 ? t.slice(0, 420) + '…' : t; };

    var archives = docs.map(function (d) {
      return item('d:' + d.id, { court: (d.ext || '?').toUpperCase().slice(0, 4), titre: d.nom, sous: NOM_TYPE[d.type] + ' · ' + poids(d.taille) + (d.pages ? ' · ' + d.pages + ' page' + (d.pages > 1 ? 's' : '') : ''),
        date: NOM_TYPE[d.type] + (d.pages ? ' · ' + d.pages + ' p.' : ''), img: d.apercu ? { src: d.apercu, alt: 'Aperçu de ' + d.nom } : null, href: d.url, ouvrir: 'Ouvrir le fichier', telecharger: d.nom,
        texte: extrait(d.texte), etat: d.alertes.length ? 'En développement' : '',
        fiche: [['Format', d.format || ''], ['Chemin', d.chemin !== d.nom ? d.chemin : ''], ['Date dans l’archive', d.dateArchive ? dateFr(d.dateArchive) : ''], ['Dates trouvées', d.dates.map(dateFr).join(', ')], ['Cite', d.cite.join(', ')],
          ['Doublon de', docs.filter(function (x) { return x !== d && d.empreinte && x.empreinte === d.empreinte; }).map(function (x) { return x.chemin; }).join(', ')], ['Empreinte', d.empreinte ? 'SHA-256 ' + d.empreinte.slice(0, 12) + '…' : ''],
          ['Lecture', d.alertes.length ? d.alertes.length + ' remarque' + (d.alertes.length > 1 ? 's' : '') : 'complète']],
        detail: (d.alertes.length ? '<ul class="imp-alertes">' + d.alertes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + visionneuse(d) });
    });
    /* deux sortes de dates, dites comme telles : écrites dans le texte, ou portées par le fichier dans son archive */
    var parDate = {}, place = function (x, d, k) { var e = parDate[x] = parDate[x] || { texte: [], archive: [] }; if (e[k].indexOf(d) === -1) e[k].push(d); };
    docs.forEach(function (d) { d.dates.forEach(function (x) { place(x, d, 'texte'); }); if (d.dateArchive) place(d.dateArchive, d, 'archive'); });
    var chrono = Object.keys(parDate).sort().map(function (x) {
      var e = parDate[x], tous = e.texte.concat(e.archive.filter(function (d) { return e.texte.indexOf(d) === -1; })), noms = function (l) { return l.map(function (d) { return d.nom; }).join(', '); };
      var it = item('t:' + x, { court: x.slice(8) + '/' + x.slice(5, 7), titre: dateFr(x), sous: (e.texte.length ? 'Écrite dans ' + e.texte.length + ' fichier' + (e.texte.length > 1 ? 's' : '') : 'Date de ' + e.archive.length + ' fichier' + (e.archive.length > 1 ? 's' : '') + ' dans l’archive'), date: dateFr(x),
        texte: (e.texte.length ? 'Écrite dans : ' + noms(e.texte) + '. ' : '') + (e.archive.length ? 'Date du fichier dans l’archive : ' + noms(e.archive) + '.' : '') });
      tous.forEach(function (d) { lier(it.id, 'd:' + d.id); }); return it;
    });
    var relations = etat.rel.map(function (r, i) {
      var a = docs.filter(function (d) { return d.id === r.a; })[0], b = docs.filter(function (d) { return d.id === r.b; })[0];
      var it = item('r:' + i, { court: '↔', titre: a.nom + ' ↔ ' + b.nom, sous: r.raisons[0], date: 'Relation', texte: r.raisons.join(' · ') + '.', fiche: [['Raisons', r.raisons.length]] });
      lier(it.id, 'd:' + a.id); lier(it.id, 'd:' + b.id); return it;
    });
    var compo = etat.groupes.map(function (g, i) {
      var cov = g.filter(function (d) { return d.apercu; })[0], communs = {};
      etat.rel.forEach(function (r) { if (g.some(function (d) { return d.id === r.a; })) r.communs.slice(0, 3).forEach(function (w) { communs[w] = (communs[w] || 0) + 1; }); });
      /* le titre : le mot partagé par le plus de fichiers du groupe, préféré s’il est aussi dans la demande */
      var dem = sans(etat.demande), score = function (w) { return g.filter(function (d) { return d.mots[w]; }).length + (dem.indexOf(w) !== -1 ? 2 : 0) + communs[w] / 10; };
      var arch = g.filter(function (d) { return d.type === 'archive'; })[0];
      var titre = arch ? arch.base : g.length > 1 ? (Object.keys(communs).sort(function (x, y) { return score(y) - score(x); })[0] || g[0].base) : g[0].base;
      titre = titre.replace(/[-_]/g, ' '); titre = titre.charAt(0).toUpperCase() + titre.slice(1);
      g.titre = titre;
      var it = item('g:' + i, { court: g.length > 1 ? '×' + g.length : '1', titre: g.length > 1 ? titre : titre + ' (seul)', sous: g.length > 1 ? 'Document rassemblé · ' + g.length + ' fichiers reliés' : 'Non relié aux autres fichiers', date: g.length > 1 ? g.length + ' fichiers' : 'Seul',
        img: cov ? { src: cov.apercu, alt: 'Aperçu de ' + cov.nom } : null, texte: g.map(function (d) { return d.nom; }).join(' · '), etat: g.length > 1 ? 'En production' : '' });
      g.forEach(function (d) { lier(it.id, 'd:' + d.id); }); return it;
    });
    var modules = (etat.lecture ? etat.lecture.blocs : []).map(function (b) {
      var mod = b.type === 'module' ? (A.modules || []).filter(function (m) { return m.id === b.ref; })[0] : (A.achevement ? A.achevement.briques.filter(function (x) { return x.id === b.ref; })[0] : null);
      var t = mod ? mod.titre : b.ref, mots2 = (A.traduction && (b.type === 'module' ? A.traduction.modules[b.ref] : A.traduction.briques[b.ref])) || [];
      var it = item('m:' + b.type + ':' + b.ref, { court: t, titre: t, sous: b.type === 'module' ? 'Module appelé par votre demande' : 'Brique appelée par votre demande', date: b.type === 'module' ? 'Module' : 'Brique', texte: (mod && (mod.role || '')) + ' ' + b.raison + '.' });
      docs.forEach(function (d) { if (mots2.some(function (w) { return sans(d.texte + ' ' + d.nom).indexOf(w) !== -1; })) lier(it.id, 'd:' + d.id); });
      return it;
    });
    var manques = [];
    docs.forEach(function (d) {
      d.cite.forEach(function (c) { if (!noms[sans(c)]) { var it = item('x:cite:' + slug(c), items['x:cite:' + slug(c)] || { court: 'manque', titre: c, sous: 'Cité, mais absent de l’import', date: 'Manquant', texte: '', etat: 'Prototype' }); it.texte = (it.texte ? it.texte + ' ' : 'Cité par ') + d.nom + '.'; lier(it.id, 'd:' + d.id); if (manques.indexOf(it) === -1) manques.push(it); } });
      d.alertes.forEach(function (a, k) { if (/^Page|pas pu|non lu|vide|encodage|chiffré|^Archive non/.test(a)) { var it = item('x:' + d.id + ':' + k, { court: 'à lire', titre: d.nom, sous: a.split(' : ')[0], date: 'Lecture', texte: a, etat: 'Prototype' }); lier(it.id, 'd:' + d.id); manques.push(it); } });
    });
    (etat.lecture ? etat.lecture.manques : []).forEach(function (q, k) { manques.push(item('x:q:' + k, { court: '?', titre: q, sous: 'Votre demande ne le dit pas encore', date: 'À préciser', texte: 'Le moteur a lu votre demande ; cette information manque pour aller au bout.' })); });
    etat.manques = manques;
    var visuel = function (l) { var x = l.filter(function (it) { return it.img; })[0]; return x ? x.img : null; };
    var faces = [
      { id: 'avant', mot: 'Chronologie', sous: 'Les dates trouvées', axe: 'temps', liste: chrono, rx: 0, ry: 0, img: null },
      { id: 'droite', mot: 'Composition', sous: 'Les documents rassemblés', axe: 'structure', liste: compo, rx: 0, ry: -90, img: visuel(compo) },
      { id: 'arriere', mot: 'Archives', sous: 'Vos fichiers', axe: 'temps', liste: archives, rx: 0, ry: -180, img: visuel(archives) },
      { id: 'gauche', mot: 'Relations', sous: 'Ce qui relie vos fichiers', axe: 'structure', liste: relations, rx: 0, ry: -270, img: null },
      { id: 'haut', mot: 'Modules', sous: 'Ce que votre demande appelle', axe: 'usage', liste: modules, rx: -90, ry: 0, img: null },
      { id: 'bas', mot: 'Écosystème', sous: 'L’état : ce qui manque', axe: 'usage', liste: manques, rx: 90, ry: 0, img: null }
    ];
    return { faces: faces, items: items, liens: liens, textes: { sansLien: 'Relié à rien : aucune raison trouvée (ni citation, ni date, ni nom, ni mots en commun). Il reste seul, et c’est dit.' } };
  }

  /* la visionneuse d’un fichier, dans le panneau (le Cube projette son aperçu en grand) */
  function visionneuse(d) {
    if (d.type === 'image') return '<img class="imp-vue" src="' + esc(d.url) + '" alt="' + esc(d.nom) + '">';
    if (d.type === 'pdf') return (d.apercu ? '<img class="imp-vue" src="' + d.apercu + '" alt="Première page de ' + esc(d.nom) + '">' : '') + (d.texte ? '<p class="imp-texte">' + esc(d.texte.slice(0, 900)) + (d.texte.length > 900 ? '…' : '') + '</p>' : '');
    if (d.type === 'tableau' && d.lignes) return '<div class="imp-tableau"><table>' + d.lignes.slice(0, 12).map(function (l, i) { return '<tr>' + l.map(function (c) { return (i ? '<td>' : '<th>') + esc(c) + (i ? '</td>' : '</th>'); }).join('') + '</tr>'; }).join('') + '</table></div>';
    if (d.type === 'audio') return '<audio class="imp-vue" controls src="' + esc(d.url) + '"></audio>';
    if (d.type === 'video') return '<video class="imp-vue" controls src="' + esc(d.url) + '"></video>';
    if (d.texte) return '<p class="imp-texte">' + esc(d.texte.slice(0, 900)) + (d.texte.length > 900 ? '…' : '') + '</p>';
    return '';
  }

  /* ---------- l’export : le document rassemblé, rangé ---------- */
  function documentHtml(chemin) {
    var titre = etat.lecture && etat.lecture.phrases[0] ? etat.lecture.phrases[0].replace(/\.$/, '') : 'Document rassemblé';
    var bloc = function (d) {
      var p = chemin(d), h = '<article class="piece"><h3>' + esc(d.nom) + '</h3><p class="meta">' + esc(NOM_TYPE[d.type]) + ' · ' + esc(poids(d.taille)) + (d.pages ? ' · ' + d.pages + ' pages' : '') + (d.dates.length ? ' · ' + esc(d.dates.map(dateFr).join(', ')) : '') + '</p>';
      if (d.type === 'image') h += '<img src="' + esc(p) + '" alt="' + esc(d.nom) + '">';
      else if (d.type === 'pdf') h += (d.apercu ? '<img src="' + esc(chemin(d, 'apercu')) + '" alt="Première page de ' + esc(d.nom) + '">' : '') + '<p><a href="' + esc(p) + '">Ouvrir le PDF</a></p>' + (d.texte ? '<p class="texte">' + esc(d.texte.slice(0, 3000)) + '</p>' : '');
      else if (d.type === 'tableau' && d.lignes) h += '<table>' + d.lignes.map(function (l, i) { return '<tr>' + l.map(function (c) { return (i ? '<td>' : '<th>') + esc(c) + (i ? '</td>' : '</th>'); }).join('') + '</tr>'; }).join('') + '</table>';
      else if (d.type === 'audio') h += '<audio controls src="' + esc(p) + '"></audio>';
      else if (d.type === 'video') h += '<video controls src="' + esc(p) + '"></video>';
      else if (d.texte) h += '<p class="texte">' + esc(d.texte.slice(0, 6000)) + '</p><p><a href="' + esc(p) + '">Le fichier d’origine</a></p>';
      else h += '<p><a href="' + esc(p) + '">Le fichier d’origine</a></p>';
      if (d.alertes.length) h += '<ul class="alertes">' + d.alertes.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>';
      return h + '</article>';
    };
    var rels = function (g) { return etat.rel.filter(function (r) { return g.some(function (d) { return d.id === r.a; }); }).map(function (r) { var n = function (id) { return etat.docs.filter(function (d) { return d.id === id; })[0].nom; }; return '<li>' + esc(n(r.a)) + ' ↔ ' + esc(n(r.b)) + ' : ' + esc(r.raisons.join(' ; ')) + '</li>'; }).join(''); };
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + esc(titre) + '</title><style>' +
      'body{margin:0;background:#f6f6f4;color:#0b0b0c;font:16px/1.55 "Inter Tight",system-ui,sans-serif}main{max-width:880px;margin:0 auto;padding:48px 20px 80px}h1{font-size:40px;line-height:1.05;letter-spacing:-.03em;margin:0 0 8px}h2{font-size:28px;letter-spacing:-.02em;margin:56px 0 8px;padding-top:24px;border-top:1px solid #e2e2de}h3{font-size:19px;margin:0}.meta,.sous{color:#55555a;font-size:14px;margin:4px 0 12px}.piece{background:#fff;border:1px solid #e2e2de;border-radius:16px;padding:20px;margin:16px 0}img,video,audio{max-width:100%;border-radius:10px;display:block;margin:8px 0}.texte{white-space:pre-wrap;font-size:14.5px;color:#3a3a3f;max-height:none}table{border-collapse:collapse;font-size:14px;width:100%}td,th{border:1px solid #e2e2de;padding:4px 8px;text-align:left}.alertes,.manques{color:#7a4b00}.relations{font-size:14px;color:#3a3a3f}@media print{.piece{break-inside:avoid}h2{break-before:page}}' +
      '</style></head><body><main><p class="sous">ATLAS · document rassemblé le ' + esc(new Date().toLocaleDateString('fr-FR')) + '</p><h1>' + esc(titre) + '</h1>' +
      (etat.demande ? '<p class="sous">Votre demande : « ' + esc(etat.demande) + ' »</p>' : '') +
      (etat.manques.length ? '<h2>Ce qui manque</h2><ul class="manques">' + etat.manques.map(function (m) { return '<li><b>' + esc(m.titre) + '</b> : ' + esc(m.sous) + (m.texte ? ' (' + esc(m.texte) + ')' : '') + '</li>'; }).join('') + '</ul>' : '') +
      etat.groupes.map(function (g) { return '<h2>' + esc(g.length > 1 ? g.titre : g.titre + ' (non relié)') + '</h2>' + (g.length > 1 ? '<ul class="relations">' + rels(g) + '</ul>' : '') + g.map(bloc).join(''); }).join('') +
      '</main></body></html>';
  }
  function chemins() {
    var c = {}, pris = {}, libre = function (x) { var y = x, k = 2; while (pris[y]) y = x.replace(/(\.[^.\/]+)?$/, ' (' + k++ + ')$1'); pris[y] = 1; return y; };
    etat.groupes.forEach(function (g) { var dossier = 'fichiers/' + (g.length > 1 ? slug(g.titre) : 'non-relies') + '/'; g.forEach(function (d) { c[d.id] = libre(dossier + d.nom); if (d.apercu && d.type === 'pdf') c[d.id + ':apercu'] = libre('apercus/' + slug(d.base) + '.jpg'); }); });
    return c;
  }
  function manifeste() {
    return { format: 'atlas-document', version: 1, cree: new Date().toISOString(), demande: etat.demande, lecture: etat.lecture,
      fichiers: etat.docs.map(function (d) { return { nom: d.nom, chemin: d.chemin !== d.nom ? d.chemin : undefined, type: d.type, taille: d.taille, sha256: d.empreinte || undefined, dateArchive: d.dateArchive || undefined, pages: d.pages || undefined, dates: d.dates, cite: d.cite, remarques: d.alertes }; }),
      relations: etat.rel.map(function (r) { var n = function (id) { return etat.docs.filter(function (d) { return d.id === id; })[0].nom; }; return { a: n(r.a), b: n(r.b), raisons: r.raisons }; }),
      documents: etat.groupes.map(function (g) { return { titre: g.titre, fichiers: g.map(function (d) { return d.nom; }) }; }),
      manques: etat.manques.map(function (m) { return { quoi: m.titre, pourquoi: m.sous, detail: m.texte }; }) };
  }

  /* un ZIP sans compression (méthode « stored »), écrit à la main : CRC-32, en-têtes locaux, répertoire central */
  var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { var c = 0xffffffff; for (var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function zip(entrees) {   /* entrees : [{ nom, octets: Uint8Array }] → Blob */
    var enc = new TextEncoder(), parts = [], central = [], decalage = 0, d = new Date();
    var heure = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), jour = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    entrees.forEach(function (e) {
      var nom = enc.encode(e.nom), c = crc32(e.octets), h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, heure, true); h.setUint16(12, jour, true);
      h.setUint32(14, c, true); h.setUint32(18, e.octets.length, true); h.setUint32(22, e.octets.length, true); h.setUint16(26, nom.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), nom, e.octets);
      var cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint16(8, 0x0800, true); cd.setUint16(10, 0, true); cd.setUint16(12, heure, true); cd.setUint16(14, jour, true);
      cd.setUint32(16, c, true); cd.setUint32(20, e.octets.length, true); cd.setUint32(24, e.octets.length, true); cd.setUint16(28, nom.length, true); cd.setUint32(42, decalage, true);
      central.push(new Uint8Array(cd.buffer), nom);
      decalage += 30 + nom.length + e.octets.length;
    });
    var taille = central.reduce(function (s, x) { return s + x.length; }, 0), fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true); fin.setUint16(8, entrees.length, true); fin.setUint16(10, entrees.length, true); fin.setUint32(12, taille, true); fin.setUint32(16, decalage, true);
    return new Blob(parts.concat(central, [new Uint8Array(fin.buffer)]), { type: 'application/zip' });
  }
  function octetsDataUrl(u) { var b = atob(u.split(',')[1]), o = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) o[i] = b.charCodeAt(i); return o; }
  function telecharger(blob, nom) { var u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = nom; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }
  function racine() { return slug(etat.lecture && etat.lecture.phrases[0] ? etat.lecture.phrases[0] : 'document-atlas'); }
  function exporterZip() {
    var c = chemins(), enc = new TextEncoder(), r = racine() + '/';
    return Promise.all(etat.docs.map(function (d) { return d.fichier.arrayBuffer().then(function (b) { return { nom: r + c[d.id], octets: new Uint8Array(b) }; }); })).then(function (fichiers) {
      var e = [{ nom: r + 'index.html', octets: enc.encode(documentHtml(function (d, k) { return k ? c[d.id + ':apercu'] : c[d.id]; })) }].concat(fichiers);
      etat.docs.forEach(function (d) { if (c[d.id + ':apercu']) e.push({ nom: r + c[d.id + ':apercu'], octets: octetsDataUrl(d.apercu) }); });
      e.push({ nom: r + 'manifeste.json', octets: enc.encode(JSON.stringify(manifeste(), null, 2)) });
      if (etat.manques.length) e.push({ nom: r + 'A-COMPLETER.txt', octets: enc.encode('Ce qui manque pour que le document soit complet :\n\n' + etat.manques.map(function (m) { return '- ' + m.titre + ' : ' + m.sous + (m.texte ? ' (' + m.texte + ')' : ''); }).join('\n') + '\n') });
      var blob = zip(e); telecharger(blob, racine() + '.zip'); return { entrees: e.map(function (x) { return x.nom; }), taille: blob.size, blob: blob };
    });
  }
  function exporterPdf() {
    var w = window.open('', '_blank'); if (!w) { alert('La fenêtre d’impression a été bloquée par le navigateur.'); return; }
    w.document.write(documentHtml(function (d, k) { return k ? d.apercu : d.url; }).replace('</body>', '<script>addEventListener("load",function(){setTimeout(print,300)})<\/script></body>'));
    w.document.close();
  }

  /* ---------- l’exemple : de vrais fichiers fabriqués ici, dont un PDF, et un fichier cité qui manque ---------- */
  function pdfMinimal(lignes) {
    var flux = 'BT /F1 20 Tf 56 780 Td (' + lignes[0] + ') Tj /F1 12 Tf' + lignes.slice(1).map(function (l) { return ' 0 -24 Td (' + l.replace(/[()\\]/g, '\\$&') + ') Tj'; }).join('') + ' ET';
    var objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', '<< /Length ' + flux.length + ' >>\nstream\n' + flux + '\nendstream'];
    var s = '%PDF-1.4\n', off = [];
    objs.forEach(function (o, i) { off.push(s.length); s += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
    var x = s.length; s += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + off.map(function (o) { return ('000000000' + o).slice(-10) + ' 00000 n \n'; }).join('') + 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + x + '\n%%EOF';
    var u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u;
  }
  function exemple() {
    var f = function (nom, contenu, type) { return new File([contenu], nom, { type: type || 'text/plain' }); };
    var images = [['phare.jpg', 'media/phare.jpg'], ['union.jpg', 'media/union.jpg']];
    return Promise.all(images.map(function (x) { return fetch(x[1]).then(function (r) { return r.blob(); }).then(function (b) { return new File([b], x[0], { type: 'image/jpeg' }); }); })).then(function (imgs) {
      return {
        demande: 'Je veux un seul dossier pour le mariage du 12 septembre : le programme, la musique et les invités, à envoyer au DJ.',
        fichiers: imgs.concat([
          f('notes-mariage.txt', 'Mariage de Camille et Gabriel, le 12/09/2026, au phare.\nLe programme est dans programme.html, le devis du DJ dans devis-dj.pdf.\nMusique : saxophone pendant le cocktail, puis DJ.\nLes invités sont dans invites.csv.'),
          f('programme.html', '<!doctype html><html><head><title>Programme du 12 septembre 2026</title></head><body><h1>Programme du 12 septembre 2026</h1><p>16 h : cérémonie au phare. 18 h : cocktail, saxophone. 21 h : dîner et DJ.</p><img src="phare.jpg" alt="Le phare"><img src="plan-salle.png" alt="Le plan de la salle"></body></html>', 'text/html'),
          f('invites.csv', 'nom;table;régime\nCamille;1;\nGabriel;1;\nInès;2;végétarien\nHugo;2;\nAldo;3;sans gluten'),
          new File([pdfMinimal(['Devis DJ et saxophone', 'Mariage de Camille et Gabriel, le 12/09/2026, au phare.', 'Cocktail : saxophone, 1 heure.', 'Soiree : DJ, 4 heures.', 'Total : 900 euros.'])], 'devis-dj.pdf', { type: 'application/pdf' })
        ])
      };
    });
  }

  /* ---------- l’écran : étape 1 (importer, décrire), étape 2 (le Cube, les exports) ---------- */
  var depot = document.getElementById('imp-depot'), champ = document.getElementById('imp-fichiers'), demandeEl = document.getElementById('imp-demande');
  var liste = document.getElementById('imp-liste'), lancer = document.getElementById('imp-lancer'), statut = document.getElementById('imp-statut'), etape1 = document.getElementById('imp-etape1'), barre = document.getElementById('imp-barre');
  var enAttente = [];
  function montrerAttente() {
    liste.innerHTML = enAttente.map(function (f, i) { return '<li><span>' + esc(f.chemin || f.webkitRelativePath || f.name) + '</span><small>' + poids(f.size) + '</small><button type="button" class="imp-retirer" data-i="' + i + '" aria-label="Retirer ' + esc(f.name) + '">Retirer</button></li>'; }).join('');
    lancer.disabled = !enAttente.length;
    statut.textContent = enAttente.length ? enAttente.length + ' fichier' + (enAttente.length > 1 ? 's' : '') + ' prêt' + (enAttente.length > 1 ? 's' : '') + '. Décrivez ce que vous voulez, puis métamorphosez.' : 'Déposez vos fichiers ou un dossier entier : PDF, images, textes, tableaux, pages web, sons, vidéos, archives ZIP… Rien n’est envoyé.';
  }
  function ajouter(fs) { Array.prototype.forEach.call(fs, function (f) { var c = f.chemin || f.webkitRelativePath || f.name; if (!enAttente.some(function (x) { return (x.chemin || x.webkitRelativePath || x.name) === c && x.size === f.size; })) enAttente.push(f); }); montrerAttente(); }
  function metamorphoser() {
    if (!enAttente.length) return Promise.resolve();
    statut.textContent = 'Lecture de ' + enAttente.length + ' fichier' + (enAttente.length > 1 ? 's' : '') + '…'; lancer.disabled = true;
    etat.docs.forEach(function (d) { URL.revokeObjectURL(d.url); });
    return deplierTout(enAttente.slice()).then(empreintes).then(function (fs) {
      if (fs.length > enAttente.length) statut.textContent = 'Archives dépliées : ' + fs.length + ' fichiers à lire…';
      return Promise.all(fs.map(lire));
    }).then(function (docs) {
      etat.docs = docs; etat.demande = demandeEl.value.trim(); etat.lecture = lireDemande(etat.demande);
      etat.rel = relier(docs); etat.groupes = groupes(docs, etat.rel);
      A.vueCube.charger(source());
      var g = etat.groupes.filter(function (x) { return x.length > 1; }).length, vus = {}, doublons = docs.filter(function (d) { if (!d.empreinte) return false; var deja = vus[d.empreinte]; vus[d.empreinte] = 1; return deja; }).length;
      var archives = docs.filter(function (d) { return d.type === 'archive'; }).length;
      barre.innerHTML = '<p class="imp-resume"><b>' + docs.length + ' fichier' + (docs.length > 1 ? 's' : '') + '</b> · ' + etat.rel.length + ' relation' + (etat.rel.length > 1 ? 's' : '') + ' · ' + g + ' document' + (g > 1 ? 's' : '') + ' rassemblé' + (g > 1 ? 's' : '') + ' · ' + etat.manques.length + ' manque' + (etat.manques.length > 1 ? 's' : '') + (archives ? ' · ' + archives + ' archive' + (archives > 1 ? 's' : '') + ' dépliée' + (archives > 1 ? 's' : '') : '') + (doublons ? ' · ' + doublons + ' doublon' + (doublons > 1 ? 's' : '') : '') + '</p>' +
        '<p class="imp-exports"><button type="button" class="imp-bouton" data-export="zip">Dossier web (.zip)</button><button type="button" class="imp-bouton" data-export="pdf">PDF</button><button type="button" class="imp-bouton" data-export="json">Manifeste</button><button type="button" class="imp-bouton imp-discret" data-export="recommencer">Modifier l’import</button></p>';
      etape1.hidden = true; barre.hidden = false; document.body.classList.add('imp-fait');
      return etat;
    });
  }
  if (depot) {
    champ.addEventListener('change', function () { ajouter(champ.files); champ.value = ''; });
    ['dragenter', 'dragover'].forEach(function (t) { depot.addEventListener(t, function (e) { e.preventDefault(); depot.classList.add('survol'); }); });
    ['dragleave', 'drop'].forEach(function (t) { depot.addEventListener(t, function (e) { e.preventDefault(); depot.classList.remove('survol'); }); });
    /* un dossier déposé : on parcourt ses sous-dossiers ; le chemin est gardé */
    var parcourir = function (entree, chemin) {
      if (entree.isFile) return new Promise(function (ok) { entree.file(function (f) { f.chemin = chemin + f.name; ok([f]); }, function () { ok([]); }); });
      if (!entree.isDirectory) return Promise.resolve([]);
      var lecteur = entree.createReader(), tout = [];
      return new Promise(function (ok) { (function lot() { lecteur.readEntries(function (l) { if (!l.length) return ok(tout); tout = tout.concat(l); lot(); }, function () { ok(tout); }); })(); })
        .then(function (l) { return Promise.all(l.filter(function (x) { return x.name.charAt(0) !== '.'; }).map(function (x) { return parcourir(x, chemin + entree.name + '/'); })); })
        .then(function (l) { return [].concat.apply([], l); });
    };
    depot.addEventListener('drop', function (e) {
      var dt = e.dataTransfer; if (!dt) return;
      var entrees = Array.prototype.map.call(dt.items || [], function (it) { return it.webkitGetAsEntry ? it.webkitGetAsEntry() : null; }).filter(Boolean);
      if (entrees.some(function (x) { return x.isDirectory; })) Promise.all(entrees.map(function (x) { return parcourir(x, ''); })).then(function (l) { ajouter([].concat.apply([], l)); });
      else if (dt.files) ajouter(dt.files);
    });
    var dossier = document.getElementById('imp-dossier');
    if (dossier) dossier.addEventListener('change', function () { ajouter(Array.prototype.filter.call(dossier.files, function (f) { return !/(^|\/)\./.test(f.webkitRelativePath || f.name); })); dossier.value = ''; });
    liste.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) { enAttente.splice(+b.getAttribute('data-i'), 1); montrerAttente(); } });
    lancer.addEventListener('click', metamorphoser);
    document.getElementById('imp-exemple').addEventListener('click', function () { exemple().then(function (x) { enAttente = []; ajouter(x.fichiers); demandeEl.value = x.demande; return metamorphoser(); }); });
    barre.addEventListener('click', function (e) {
      var b = e.target.closest('[data-export]'); if (!b) return;
      var k = b.getAttribute('data-export');
      if (k === 'zip') exporterZip(); else if (k === 'pdf') exporterPdf();
      else if (k === 'json') telecharger(new Blob([JSON.stringify(manifeste(), null, 2)], { type: 'application/json' }), racine() + '.json');
      else { etape1.hidden = false; barre.hidden = true; document.body.classList.remove('imp-fait'); montrerAttente(); }
    });
    A.vueCube.charger(source());
    montrerAttente();
  }
  A.importer = { deplier: deplier, deplierTout: deplierTout, empreintes: empreintes, lire: lire, relier: relier, groupes: groupes, dates: dates, source: source, zip: zip, crc32: crc32, exporterZip: exporterZip, manifeste: manifeste, documentHtml: documentHtml, exemple: exemple, metamorphoser: metamorphoser, etat: etat, ajouter: ajouter, pdfMinimal: pdfMinimal };
})();
