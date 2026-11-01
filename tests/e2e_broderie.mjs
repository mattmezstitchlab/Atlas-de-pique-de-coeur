import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
const { chromium }=createRequire(import.meta.url)('playwright');
const base=(process.env.BASE||'http://localhost:8090')+(process.env.PREFIXE||'');
const b=await chromium.launch(process.env.CHROMIUM?{executablePath:process.env.CHROMIUM}:{});
try {
for(const largeur of [1280,390]) {
  const p=await b.newPage({viewport:{width:largeur,height:900}}), erreurs=[];
  p.on('pageerror',e=>erreurs.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto(base+'/broderie');await p.waitForFunction(()=>document.querySelector('#mesures').textContent.includes('croix'));
  const image=()=>p.$eval('#motif',c=>c.toDataURL());
  const depart=await image();
  await p.fill('#graine','8');await p.click('#generer');assert.notEqual(await image(),depart);
  await p.click('#annuler');assert.equal(await image(),depart);
  await p.selectOption('#outil','dessiner');await p.fill('#colonne','1');await p.fill('#ligne','1');await p.click('#appliquer');
  assert.match(await p.textContent('#etat'),/grille modifiée/);
  await p.selectOption('#outil','broder');await p.click('#appliquer');assert.match(await p.textContent('#mesures'),/1 brodées/);
  const avant=await image();await p.reload();await p.waitForFunction(()=>document.querySelector('#mesures').textContent.includes('1 brodées'));
  await p.click('#vue-grille');assert.equal(await image(),avant);
  const dl=async id=>{const attente=p.waitForEvent('download');await p.click(id);const d=await attente;return fs.readFile(await d.path(),'utf8');};
  const json=JSON.parse(await dl('#export-json'));assert.equal(json.done[0],1);assert.ok(json.flossCodes.length>400);
  const svg=await dl('#export-svg');assert.ok(svg.includes('une case = une croix'));assert.ok(svg.includes('CC BY 4.0'));
  await p.selectOption('#outil','effacer');await p.click('#appliquer');assert.match(await p.textContent('#mesures'),/0 brodées/);
  await p.setInputFiles('#import-json',{name:'copie.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(json))});
  await p.waitForFunction(()=>document.querySelector('#mesures').textContent.includes('1 brodées'));
  await p.setInputFiles('#import-json',{name:'faux.json',mimeType:'application/json',buffer:Buffer.from('{}')});
  await p.waitForFunction(()=>document.querySelector('#etat').textContent.includes('refusée'));assert.match(await p.textContent('#mesures'),/1 brodées/);
  await p.selectOption('#toile','18');assert.match(await p.textContent('#mesures'),/8,6 × 8,6 cm/);
  await p.evaluate(()=>dispatchEvent(new Event('beforeprint')));assert.equal(await p.locator('.feuille-patron').count(),4);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(erreurs,[]);console.log(`✓ Studio ${largeur} px : variation, annulation, dessin, suivi, reprise, JSON, SVG, refus, toile et 4 feuilles d’impression`);
  await p.close();
}
} finally {await b.close();}
