// Le temps d'ATLAS, pour le calendrier du Disque de lemondeaime.com : data/temps.json (format « atlas-temps », version 1).
// Il est tiré, sans rien y ajouter, de deux fichiers publics :
//   - data/chronologie.js : les entrées PUBLIÉES de la chronologie 1999 – 2025 (jamais un brouillon ni une archive privée) ;
//   - data/applications.js : les 643 applications Base44, avec leur date de création (au jour près).
// Chaque élément garde sa date telle qu'elle est connue (sa précision) et sa source. Rien n'est daté à la main ici.
// Le récit des époques (data/histoire.js) n'y est pas : ses dates sont écrites en toutes lettres (« 12 – 14 nov. »),
// les transformer en dates serait inventer une précision.
//
// Régénérer après une mise à jour de la chronologie ou des applications :  node outils/temps.mjs
// Le test tests/temps.test.mjs échoue si le fichier publié n'est plus à jour.
import fs from "node:fs"; import vm from "node:vm"; import path from "node:path"; import { fileURLToPath } from "node:url";

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (...fichiers) => {
  const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx);
  for (const f of fichiers) vm.runInContext(fs.readFileSync(path.join(RACINE, f), "utf8"), ctx, { filename: f });
  return ctx.window.ATLAS;
};
const cle = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "sans-titre";
const PRECISION = { annee: "annee", approx: "annee", periode: "annee", mois: "mois", jour: "jour" };
const PREUVE = { declare: "déclaré par Matt", "a-verifier": "à vérifier", documente: "documenté", verifie: "vérifié" };

export function construireTemps() {
  const A = lire("data/chronologie.js", "data/applications.js");
  const c = A.chronologie, elements = [];
  for (const e of c.entrees) {
    if (e.visibility !== "public" || e.publicationStatus !== "publie" || !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(e.dateStart || "")) continue;
    const vers = e.datePrecision === "approx" ? "vers " : "";
    const jusqu = e.datePrecision === "periode" && e.dateEnd ? ` (jusqu’en ${e.dateEnd})` : "";
    elements.push({ id: "c-" + e.id.replace(/^e-/, ""), genre: "chronologie", titre: e.title + jusqu, date: e.dateStart,
      precision: PRECISION[e.datePrecision] || "annee",
      source: `chronologie publiée d’ATLAS, ${vers}${e.dateStart} : ${PREUVE[e.evidenceStatus] || e.evidenceStatus}`,
      lien: "/chronologie" });
  }
  /* les applications : une ligne par nom et par jour (« Signature Vibratoire ×5 ») */
  const parJour = new Map();
  for (const [date, nom] of A.applications) {
    const titre = /^untitled$/i.test(nom.trim()) ? "Sans titre" : nom.trim(), k = date + "|" + titre;
    parJour.set(k, (parJour.get(k) || 0) + 1);
  }
  const vus = new Set();
  for (const [k, n] of parJour) {
    const [date, titre] = k.split("|"); let id = "app-" + date + "-" + cle(titre);
    while (vus.has(id)) id += "-b"; vus.add(id);
    elements.push({ id, genre: "application", titre: n > 1 ? `${titre} ×${n}` : titre, date, precision: "jour",
      source: "Base44, date de création (relevé du 30 octobre 2026)", lien: "/" });
  }
  elements.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  return { format: "atlas-temps", version: 1, titre: "ATLAS — l’histoire de l’écosystème AIME", adresse: "https://atlas.lemondeaime.com",
    sources: { chronologie: `data/chronologie.js, version publiée ${c.version} du ${c.publieLe}`, applications: "data/applications.js, 643 applications Base44" },
    elements };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const t = construireTemps();
  fs.writeFileSync(path.join(RACINE, "data/temps.json"), JSON.stringify(t, null, 1) + "\n");
  console.log(`data/temps.json : ${t.elements.length} éléments datés`);
}
