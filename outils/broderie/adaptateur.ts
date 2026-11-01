import { fromObject, toObject, type Pattern } from './moteur/pattern';
import { FLOSS } from './moteur/dmc';
import { SYMBOL_COUNT, symbolMarkup } from './moteur/symbols';
export const ATTRIBUTION = 'Données couleur : craft-color-codes par MakeBead (makebead.com), licence CC BY 4.0.';
export const echapper = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;'}[c]!));
export function lireCopie(o: any): Pattern {
  if (!o || typeof o !== 'object' || !Number.isInteger(o.w) || !Number.isInteger(o.h) || o.w > 160 || o.h > 160) throw Error('Copie refusée : grille de 160 × 160 maximum.');
  if (['fwd','bwd','q0','q1','q2','q3'].some(k => Array.isArray(o[k]) && o[k].some((v: number) => v >= 0)) || ['back','long','knots','special','layers','annotations','parked'].some(k => o[k]?.length) || o.subjectScene) throw Error('Ce projet contient des points, calques ou annotations non pris en charge ici. Ouvrez-le dans l’atelier Point Zéro.');
  const p = fromObject(o);
  if (!p) throw Error('Copie Point Zéro invalide : aucune modification effectuée.');
  if (o.cross.some((v: number, i: number) => v >= 0 && p.cross[i] < 0)) throw Error('Une référence de fil est inconnue.');
  if (filsUtilises(p).length > SYMBOL_COUNT) throw Error('Trop de fils pour une légende sans ambiguïté.');
  return p;
}
export const copier = (p: Pattern) => lireCopie(toObject(p));
export function filsUtilises(p: Pattern) { return [...new Set(p.cross)].filter(i => i >= 0).sort((a,b) => a-b); }
/** Même symbole dans la grille, les fichiers et leur légende ; aucun HTML importé. */
export function svgPatron(p: Pattern, zone = { x: 0, y: 0, w: p.w, h: p.h }): string {
  const fils = filsUtilises(p), k = 12, marge = 24, W = Math.max(560, zone.w*k + marge*2), H = zone.h*k + 110 + fils.length*22;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img"><title>Patron au point de croix</title><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif" font-size="12" fill="#111"><text x="24" y="18">${echapper(p.name.slice(0,100))} · ${p.w} × ${p.h} points · Aida ${p.count}</text>`;
  for(let y=0;y<zone.h;y++) for(let x=0;x<zone.w;x++) { const f=p.cross[(y+zone.y)*p.w+x+zone.x]; if(f<0)continue; s+=`<rect x="${marge+x*k}" y="${marge+y*k}" width="12" height="12" fill="${FLOSS[f].hex}" fill-opacity=".23"/>`+symbolMarkup(fils.indexOf(f),marge+x*k+6,marge+y*k+6,3.6,'#111'); }
  for(let x=0;x<=zone.w;x++) s+=`<path d="M${marge+x*k} ${marge}v${zone.h*k}" stroke="#777" stroke-width="${(x+zone.x)%10===0?1:.25}"/>`;
  for(let y=0;y<=zone.h;y++) s+=`<path d="M${marge} ${marge+y*k}h${zone.w*k}" stroke="#777" stroke-width="${(y+zone.y)%10===0?1:.25}"/>`;
  const Y=zone.h*k+52;
  s+=`<text x="24" y="${Y}">Colonnes ${zone.x+1}–${zone.x+zone.w} · lignes ${zone.y+1}–${zone.y+zone.h} · une case = une croix</text>`;
  fils.forEach((f,i)=>{ const n=Array.from(p.cross).filter(v=>v===f).length; s+=symbolMarkup(i,30,Y+22+i*22,4,'#111')+`<text x="46" y="${Y+26+i*22}">DMC ${echapper(FLOSS[f].code)} · ${echapper(FLOSS[f].name)} · ${n} croix</text>`; });
  return s+`<text x="24" y="${H-16}" font-size="10">${ATTRIBUTION}</text></g></svg>`;
}
