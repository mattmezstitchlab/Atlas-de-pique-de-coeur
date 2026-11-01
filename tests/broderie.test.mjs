import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
// Tests sans installation de dépendances : la CI existante peut les exécuter tels quels.
const { FAMILLES, filsParFamille, SOURCE_DIGEST, generer, formatParDefaut, FLOSS, toObject, lireCopie, svgPatron, ATTRIBUTION } = await import('./broderie-moteur.mjs');
test('les bundles correspondent aux sources versionnées',()=>{
  const fichiers=readdirSync('outils/broderie',{recursive:true}).filter(f=>/\.(ts|mjs)$/.test(f)&&!f.startsWith('node_modules')).sort();
  const digest=createHash('sha256');
  for(const f of fichiers)digest.update(f).update(readFileSync('outils/broderie/'+f));
  digest.update(readFileSync('outils/broderie/package-lock.json'));
  assert.equal(digest.digest('hex'),SOURCE_DIGEST,'Relancez npm --prefix outils/broderie run build');
  assert.ok(readFileSync('js/broderie.js','utf8').includes('Sources SHA256 '+SOURCE_DIGEST));
});
const signature={structure:0,trace:2,densite:1,echelle:2,palette:1};
const creer=(s=signature,graine=7)=>{const [w,h]=formatParDefaut(s);return generer({signature:s,graine,version:'v0.1',w,h}).pattern;};
test('le vrai moteur est déterministe et toutes ses dimensions produisent des croix DMC',()=>{
  assert.deepEqual(creer().cross,creer().cross);
  for(const cle of Object.keys(signature))for(let i=0;i<4;i++){
    const p=creer({...signature,[cle]:i});
    assert.equal(p.cross.length,p.w*p.h); assert.ok(p.cross.some(v=>v>=0));
    assert.ok(p.cross.every(v=>v===-1||FLOSS[v]));
    assert.deepEqual(lireCopie(toObject(p)).cross,p.cross);
  }
});
test('la palette seule ne change pas la géométrie',()=>{
  const a=creer(),b=creer({...signature,palette:2});
  assert.deepEqual(Array.from(a.cross,v=>v>=0),Array.from(b.cross,v=>v>=0));
});
test('copie JSON : retouches et progression conservées, formats non pris en charge refusés',()=>{
  const p=creer();p.cross[0]=p.palette[0];p.done[0]=1;
  const o=toObject(p),r=lireCopie(JSON.parse(JSON.stringify(o)));
  assert.deepEqual(r.cross,p.cross);assert.equal(r.done[0],1);
  assert.throws(()=>lireCopie({...o,w:1000}));
  assert.throws(()=>lireCopie({...o,fwd:[p.palette[0],...o.fwd.slice(1)]}));
  assert.throws(()=>lireCopie({...o,layers:[{name:'calque'}]}));
  assert.throws(()=>lireCopie({...o,cross:[999999,...o.cross.slice(1)]}));
});
test('patron : symboles, légende DMC, attribution et texte échappé',()=>{
  const p=creer();p.name='<script>attaque</script>';
  const svg=svgPatron(p);assert.ok(svg.includes('&lt;script&gt;'));assert.ok(!svg.includes('<script>'));
  assert.ok(svg.includes(ATTRIBUTION));assert.ok(svg.includes('une case = une croix'));
  for(const i of new Set(p.cross))if(i>=0)assert.ok(svg.includes('DMC '+FLOSS[i].code));
  const page=svgPatron(p,{x:40,y:40,w:21,h:21});assert.ok(page.includes('Colonnes 41–61'));
});

test('le nuancier de lemondeaime couvre chaque référence une seule fois',()=>{
 const m=filsParFamille(), fils=FAMILLES.flatMap(f=>m.get(f.id));
 assert.equal(fils.length,FLOSS.length);assert.equal(new Set(fils).size,FLOSS.length);
});
