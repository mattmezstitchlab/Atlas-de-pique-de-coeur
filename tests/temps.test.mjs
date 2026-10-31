// Le temps d'ATLAS (data/temps.json), lu par le calendrier du Disque de lemondeaime.com : node --test tests/temps.test.mjs
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { construireTemps } from "../outils/temps.mjs";
import vm from "node:vm";
const publie = JSON.parse(fs.readFileSync("data/temps.json", "utf8"));

test("data/temps.json est à jour (sinon : node outils/temps.mjs)", () => {
  assert.deepEqual(publie, JSON.parse(JSON.stringify(construireTemps())));
});
test("chaque élément a une date réelle, sa précision et sa source ; rien d'autre", () => {
  assert.equal(publie.format, "atlas-temps"); assert.equal(publie.version, 1);
  const ids = new Set();
  for (const e of publie.elements) {
    assert.deepEqual(Object.keys(e).sort(), ["date", "genre", "id", "lien", "precision", "source", "titre"]);
    assert.match(e.date, /^\d{4}(-\d{2}(-\d{2})?)?$/); assert.ok(["annee", "mois", "jour"].includes(e.precision));
    assert.ok(e.source.length > 5); assert.ok(!ids.has(e.id), e.id); ids.add(e.id);
  }
});
test("seules les entrées publiées de la chronologie y sont", () => {
  const ctx = { window: {} }; ctx.window.window = ctx.window;
  vm.createContext(ctx); vm.runInContext(fs.readFileSync("data/chronologie.js", "utf8"), ctx);
  const publiees = ctx.window.ATLAS.chronologie.entrees.filter(e => e.visibility === "public" && e.publicationStatus === "publie").length;
  assert.equal(publie.elements.filter(e => e.genre === "chronologie").length, publiees);
});
