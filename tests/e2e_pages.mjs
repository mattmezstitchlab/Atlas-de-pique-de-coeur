// Chaque page d’ATLAS, ouverte comme un visiteur : elle répond, sans erreur JavaScript, sans défilement horizontal,
// avec la police servie par le site (aucun appel à Google) et son aperçu de partage. Puis deux parcours : le récit, l’import.
// Usage : node tests/serveur.mjs 8090 &   puis   BASE=http://localhost:8090 node tests/e2e_pages.mjs
// Sous lemondeaime.com : ATLAS=http://localhost:8090 node tests/lemondeaime.mjs 8092 &   puis   BASE=http://localhost:8092 PREFIXE=/atlas node tests/e2e_pages.mjs
// (chaque adresse, chaque ressource et chaque lien d’ATLAS doit alors rester sous /atlas/)
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");   /* installé à côté (CI) ou globalement */
const B = (process.env.BASE || "http://localhost:8090").replace(/\/$/, ""), P = (process.env.PREFIXE || "").replace(/\/$/, ""), RACINE = B + P + "/";
const PAGES = [["/", true], ["/chronologie", true], ["/composition", true], ["/vue-cube", true], ["/importer", true], ["/ecosysteme", true], ["/moteur", true], ["/mariage", true], ["/administration", false]];
let bons = 0, mauvais = 0;
const ok = (c, m) => { c ? bons++ : mauvais++; console.log((c ? "✓ " : "✗ ") + m); };
const opts = process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {};
const b = await chromium.launch(opts);
for (const [l, h] of [[1280, 800], [390, 844]]) {
  for (const [p, public_] of PAGES) {
    const pg = await b.newPage({ viewport: { width: l, height: h } }), erreurs = [], dehors = [], manquants = [];
    pg.on("response", x => { if (x.status() >= 400 && x.url().startsWith(B) && x.request().resourceType() !== "document") manquants.push(x.url().slice(B.length)); });
    pg.on("pageerror", e => erreurs.push(e.message));
    pg.on("request", r => { if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) dehors.push(r.url()); });
    const r = await pg.goto(B + P + p, { waitUntil: "load" });
    await pg.waitForTimeout(600);
    const t = `[${l}] ${P}${p}`;
    ok(r && r.status() === 200, `${t} répond (${r && r.status()})`);
    ok(!erreurs.length, `${t} aucune erreur ${erreurs.length ? JSON.stringify(erreurs.slice(0, 2)) : ""}`);
    ok(!dehors.length, `${t} aucune police demandée à Google`);
    ok(!manquants.length, `${t} toutes ses ressources répondent ${manquants.length ? JSON.stringify(manquants.slice(0, 3)) : ""}`);
    /* chaque lien et chaque ressource d’ATLAS restent dans ATLAS (sous /atlas/ quand il vit sur lemondeaime.com) */
    const hors = await pg.evaluate(([o, racine]) => Array.prototype.map.call(document.querySelectorAll("a[href], link[href], script[src], img[src]"), e => e.href || e.src)
      .filter(u => u && u.startsWith(o) && !u.startsWith(racine)), [B, RACINE]);
    ok(!hors.length && pg.url().startsWith(RACINE), `${t} liens et adresse restent dans ATLAS ${hors.length ? JSON.stringify(hors.slice(0, 3)) : ""}`);
    const d = await pg.evaluate(() => ({ deborde: document.documentElement.scrollWidth - innerWidth, police: document.fonts.check('600 16px "Inter Tight"'), og: !!document.querySelector('meta[property="og:title"]') && !!document.querySelector('meta[property="og:image"]') }));
    ok(d.deborde <= 1, `${t} pas de défilement horizontal (${d.deborde} px)`);
    ok(d.police, `${t} Inter Tight chargée depuis le site`);
    if (public_) ok(d.og, `${t} aperçu de partage (og:title, og:image)`);
    await pg.close();
  }
}
/* les anciennes adresses mènent, sans quitter ATLAS, à la nouvelle ; une page inconnue est la 404 d’ATLAS, habillée */
for (const [ancienne, nouvelle] of [["/metamorphose", "/composition"], ["/admin", "/administration"], ["/cube", "/vue-cube"]]) {
  const pg = await b.newPage(); await pg.goto(B + P + ancienne); await pg.waitForURL(u => String(u).includes(P + nouvelle), { timeout: 10000 }).catch(() => {});
  ok(pg.url().startsWith(B + P + nouvelle), `${P}${ancienne} → ${pg.url().slice(B.length)}`); await pg.close();
}
{
  const pg = await b.newPage(), manquants = []; pg.on("response", x => { if (x.status() >= 400 && x.request().resourceType() === "stylesheet") manquants.push(x.url()); });
  const r = await pg.goto(B + P + "/une/page/qui-n-existe-pas"); await pg.waitForTimeout(300);
  const lien = await pg.evaluate(() => document.querySelector(".dock-haut .outil[href]").href);
  ok(r.status() === 404 && !manquants.length && lien.startsWith(RACINE), `la 404 d’ATLAS, habillée, ses liens dans ATLAS (${r.status()})`); await pg.close();
}
/* une création publiée : à sa propre adresse, lue, habillée, et qui donne l’adresse où elle vit */
{
  const id = "demonstration-un-concert-en-deux-demandes-c010df", pg = await b.newPage(), erreurs = [];
  pg.on("response", x => { if (x.status() >= 400) erreurs.push(x.url()); }); pg.on("pageerror", e => erreurs.push(e.message));
  const r = await pg.goto(B + P + "/composition/" + id); await pg.waitForSelector(".creation-etat[data-code]", { timeout: 10000 }).catch(() => {});
  const d = await pg.evaluate(() => ({ code: document.querySelector(".creation-etat") && document.querySelector(".creation-etat").getAttribute("data-code"), adresse: (document.getElementById("creation-adresse") || {}).textContent }));
  ok(r.status() === 200 && d.code === "ok" && d.adresse === B + P + "/composition/" + id && !erreurs.length, `une création publiée sous ${P || "/"} (${d.code}, ${erreurs.length} erreur)`); await pg.close();
}
/* le Cube du Jour J : ce qui manque est trouvé ; chacun sa face, et les montants restent aux mariés */
{
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 } }); await pg.goto(B + P + "/mariage"); await pg.waitForTimeout(600);
  const d = await pg.evaluate(() => {
    const titres = ATLAS.mariageCube.manques().map(x => x.titre).join(" | ");
    const dj = ATLAS.mariageCube.source("dj"), invites = ATLAS.mariageCube.vue("invites");
    const montantsDJ = Object.values(dj.items).filter(it => /€/.test(it.sous + " " + (it.detail || ""))).length;
    return { titres, montantsDJ, invitesDocs: invites.docs.length, invitesManques: invites.manques.length };
  });
  ok(/pas signé/.test(d.titres) && /deux endroits/.test(d.titres) && /sans plan B/.test(d.titres) && /régime/.test(d.titres), "le Cube du Jour J trouve ce qui manque (contrat, double présence, plan B, régimes)");
  ok(d.montantsDJ === 0 && d.invitesDocs === 1 && d.invitesManques === 0, `chacun sa face : aucun montant pour le DJ (${d.montantsDJ}), un seul document et rien à régler pour les invités`);
  await pg.close();
}
/* le récit : des stations, et le Cube qui remplit ses cases */
{
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 } }); await pg.goto(B + P + "/"); await pg.waitForTimeout(600);
  const n = await pg.evaluate(() => ({ stations: document.querySelectorAll(".station").length, tuiles: document.querySelectorAll(".tuile").length }));
  ok(n.stations >= 10 && n.tuiles >= 30, `le récit : ${n.stations} stations, ${n.tuiles} tuiles dans le Cube`);
  await pg.close();
}
/* l’import : l’exemple lu, relié, rassemblé */
{
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 } }); await pg.goto(B + P + "/importer"); await pg.waitForTimeout(400);
  await pg.click("#imp-exemple"); await pg.waitForSelector(".imp-resume", { timeout: 60000 });
  const txt = await pg.textContent(".imp-resume");
  ok(/6 fichiers/.test(txt) && /7 relations/.test(txt), `l’import de l’exemple : ${txt.trim()}`);
  await pg.close();
}
await b.close();
console.log(`— ${bons}/${bons + mauvais}`);
process.exit(mauvais ? 1 : 0);
