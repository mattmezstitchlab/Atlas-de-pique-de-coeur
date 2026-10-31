// Chaque page d’ATLAS, ouverte comme un visiteur : elle répond, sans erreur JavaScript, sans défilement horizontal,
// avec la police servie par le site (aucun appel à Google) et son aperçu de partage. Puis deux parcours : le récit, l’import.
// Usage : node tests/serveur.mjs 8090 &   puis   BASE=http://localhost:8090 node tests/e2e_pages.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");   /* installé à côté (CI) ou globalement */
const B = (process.env.BASE || "http://localhost:8090").replace(/\/$/, "");
const PAGES = [["/", true], ["/chronologie", true], ["/composition", true], ["/vue-cube", true], ["/importer", true], ["/ecosysteme", true], ["/moteur", true], ["/administration", false]];
let bons = 0, mauvais = 0;
const ok = (c, m) => { c ? bons++ : mauvais++; console.log((c ? "✓ " : "✗ ") + m); };
const opts = process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {};
const b = await chromium.launch(opts);
for (const [l, h] of [[1280, 800], [390, 844]]) {
  for (const [p, public_] of PAGES) {
    const pg = await b.newPage({ viewport: { width: l, height: h } }), erreurs = [], dehors = [];
    pg.on("pageerror", e => erreurs.push(e.message));
    pg.on("request", r => { if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) dehors.push(r.url()); });
    const r = await pg.goto(B + p, { waitUntil: "load" });
    await pg.waitForTimeout(600);
    const t = `[${l}] ${p}`;
    ok(r && r.status() === 200, `${t} répond (${r && r.status()})`);
    ok(!erreurs.length, `${t} aucune erreur ${erreurs.length ? JSON.stringify(erreurs.slice(0, 2)) : ""}`);
    ok(!dehors.length, `${t} aucune police demandée à Google`);
    const d = await pg.evaluate(() => ({ deborde: document.documentElement.scrollWidth - innerWidth, police: document.fonts.check('600 16px "Inter Tight"'), og: !!document.querySelector('meta[property="og:title"]') && !!document.querySelector('meta[property="og:image"]') }));
    ok(d.deborde <= 1, `${t} pas de défilement horizontal (${d.deborde} px)`);
    ok(d.police, `${t} Inter Tight chargée depuis le site`);
    if (public_) ok(d.og, `${t} aperçu de partage (og:title, og:image)`);
    await pg.close();
  }
}
/* le récit : des stations, et le Cube qui remplit ses cases */
{
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 } }); await pg.goto(B + "/"); await pg.waitForTimeout(600);
  const n = await pg.evaluate(() => ({ stations: document.querySelectorAll(".station").length, tuiles: document.querySelectorAll(".tuile").length }));
  ok(n.stations >= 10 && n.tuiles >= 30, `le récit : ${n.stations} stations, ${n.tuiles} tuiles dans le Cube`);
  await pg.close();
}
/* l’import : l’exemple lu, relié, rassemblé */
{
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 } }); await pg.goto(B + "/importer"); await pg.waitForTimeout(400);
  await pg.click("#imp-exemple"); await pg.waitForSelector(".imp-resume", { timeout: 60000 });
  const txt = await pg.textContent(".imp-resume");
  ok(/6 fichiers/.test(txt) && /7 relations/.test(txt), `l’import de l’exemple : ${txt.trim()}`);
  await pg.close();
}
await b.close();
console.log(`— ${bons}/${bons + mauvais}`);
process.exit(mauvais ? 1 : 0);
