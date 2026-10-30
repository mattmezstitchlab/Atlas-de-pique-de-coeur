// Les fonctions pures de la publication, sans navigateur : node --test tests/publication.test.mjs
import { test } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import vm from "node:vm";
const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx);
for (const f of ["data/applications.js", "data/achevement.js", "data/visuels.js", "data/modules.js", "data/lexique.js", "js/publication.js"]) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
const A = ctx.window.ATLAS, P = A.publication, J = x => JSON.parse(JSON.stringify(x));
const etat = { mise: null, donnees: { invites: [{ nom: "Camille", tel: "06…" }], moments: [], documents: [] },
  blocs: [
    { uid: "b1x", type: "brique", ref: A.achevement.briques[0].id, x: 0, y: 0, w: 4, h: 2, image: { pos: "top", lum: 90 }, demandes: [{ phrase: "Envoyer les invitations aux 148 invités à Lyon", intention: "ecriture", reconnu: { lieu: "Lyon", quantites: ["148"] }, manque: ["quand"] }] },
    { uid: "b2y", type: "module", ref: A.modules[0].id, x: 4, y: 0, w: 4, h: 4, complet: true },
  ],
  liens: [["b1x", "b2y"], ["b1x", "absent"]] };

test("publier ne garde que les champs autorisés", () => {
  const p = P.publier(etat, { titre: "Démonstration : un essai", date: "2026-10-30" });
  assert.deepEqual(Object.keys(p).sort(), [...P.CHAMPS].sort());
  const t = JSON.stringify(p);
  for (const m of ["148", "Lyon", "Camille", "reconnu", "image", "donnees", "phrase", "manque", "complet", "b1x"]) assert.ok(!t.includes(m), m);
  assert.deepEqual(J(p.liens), [["p1", "p2"]]);
  assert.deepEqual(J(p.blocs[0].intentions), ["ecriture"]);
  assert.equal(p.visibility, "public"); assert.equal(p.publicationStatus, "publie");
});
test("identifiant stable et lisible", () => {
  const a = P.publier(etat, { titre: "Démonstration : un essai", date: "2026-10-30" }), b = P.publier(etat, { titre: "Démonstration : un essai", date: "2026-11-02" });
  assert.equal(a.id, b.id); assert.match(a.id, /^demonstration-un-essai-[0-9a-f]{6}$/);
  const c = P.publier({ ...etat, blocs: [{ ...etat.blocs[0], x: 1 }, etat.blocs[1]] }, { titre: "Démonstration : un essai" });
  assert.notEqual(a.id, c.id);
});
test("valider refuse proprement", () => {
  const p = P.publier(etat, { titre: "Essai", date: "2026-10-30" });
  assert.equal(P.valider(p, p.id).ok, true);
  assert.equal(P.valider({ ...p, visibility: "prive" }).code, "privee");
  assert.equal(P.valider({ ...p, publicationStatus: "brouillon" }).code, "non-publiee");
  assert.equal(P.valider(p, "autre-id").code, "invalide");
  assert.equal(P.valider({ ...p, invites: [] }).code, "invalide");
  assert.equal(P.valider({ ...p, blocs: [{ ...p.blocs[0], demandes: [] }, p.blocs[1]] }).code, "invalide");
  assert.equal(P.valider({ ...p, blocs: [{ ...p.blocs[0], ref: "inconnue" }, p.blocs[1]] }).code, "invalide");
  assert.equal(P.valider({ ...p, titre: "Autre titre" }).code, "invalide"); // modifié après préparation
  assert.equal(P.valider(null).code, "invalide"); assert.equal(P.valider({ format: "atlas-recette" }).code, "invalide");
  assert.throws(() => P.publier(etat, { titre: "  " }));
});
test("les fichiers publiés du dépôt sont valides, et les essais de refus refusés", () => {
  for (const f of fs.readdirSync("creations").filter(f => f.endsWith(".json"))) {
    const p = JSON.parse(fs.readFileSync("creations/" + f, "utf8")), r = P.valider(p, f.replace(/\.json$/, ""));
    if (f.startsWith("essai-")) assert.equal(r.ok, false, f); else assert.equal(r.ok, true, f + " : " + r.raison);
  }
});
