/*! Noyau Point Zéro © 2026 Matt Mez Stitch Lab, MIT. Voir outils/broderie/LICENCE-POINTZERO.txt. Données couleur MakeBead, CC BY 4.0. */
import { generer, formatParDefaut } from './moteur/motif5d/generer';
import { DIMENSIONS, VERSION, lireCode, type Signature, type Choix } from './moteur/motif5d/code';
import { FLOSS } from './moteur/dmc';
import { toObject, ensurePalette, type Pattern, type Count } from './moteur/pattern';
import { SYMBOL_COUNT, drawSymbol } from './moteur/symbols';
import { lireCopie, copier, filsUtilises, svgPatron, ATTRIBUTION } from './adaptateur';
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const cle = 'atlas-broderie-v1';
const signaler = (s: string) => { $('etat').textContent = s; };
const signature: Signature = { structure: 0, trace: 2, densite: 1, echelle: 2, palette: 1 };
let pattern: Pattern, actif = 0, grille = false, modifie = false, avertissement = '', historique: Pattern[] = [];
let graine = 7;
const controles = new Map<string, HTMLInputElement>();
for(const d of DIMENSIONS) {
  const div=document.createElement('div'); div.className='reglage';
  const label=document.createElement('label'); label.htmlFor='choix-'+d.cle; label.textContent=d.nom;
  const valeur=document.createElement('output'); valeur.id='valeur-'+d.cle; label.append(valeur);
  const input=document.createElement('input'); input.type='range'; input.min='0'; input.max='3'; input.step='1'; input.id=label.htmlFor;
  input.setAttribute('aria-describedby',valeur.id);
  const maj=()=>{ signature[d.cle]=Number(input.value) as Choix; valeur.value=d.reponses[signature[d.cle]][0]; input.setAttribute('aria-valuetext',valeur.value); };
  input.value=String(signature[d.cle]); input.addEventListener('input',maj); maj();
  controles.set(d.cle,input); div.append(label,input); $('dimensions').append(div);
}
function synchroniser() {
  controles.forEach((input,k)=>{ input.value=String(signature[k as keyof Signature]); input.dispatchEvent(new Event('input')); });
  $<HTMLInputElement>('graine').value=String(graine);
}
function fabriquer() { const [w,h]=formatParDefaut(signature); return generer({signature:{...signature},graine,version:VERSION,w,h}); }
pattern=fabriquer().pattern;
try { const texte=localStorage.getItem(cle); if(texte){ pattern=lireCopie(JSON.parse(texte)); const r=lireCode(pattern.recette?.code); if(r){Object.assign(signature,r.signature); graine=r.graine;} modifie=true; avertissement='Votre ouvrage local a été repris.'; } }
catch { avertissement='La copie locale n’a pas pu être lue. Elle n’a pas été remplacée. Exportez avant de sauvegarder.'; }
synchroniser();
const nuancier=$<HTMLSelectElement>('nuancier');
FLOSS.forEach((f,i)=>{const option=new Option(`DMC ${f.code} — ${f.name}`,String(i)); nuancier.add(option);});
actif=pattern.palette[0]??0;
function souvenir() { historique.push(copier(pattern)); if(historique.length>20)historique.shift(); $('annuler').removeAttribute('disabled'); }
function sauver() { try { localStorage.setItem(cle,JSON.stringify(toObject(pattern))); return true; } catch { signaler('Sauvegarde impossible sur cet appareil. Exportez une copie JSON pour ne rien perdre.'); return false; } }
function change(message: string) { modifie=true; actualiser(); if(sauver())signaler(message+' Sauvegardé sur cet appareil.'); }
function actualiser() {
  const fils=filsUtilises(pattern), fini=Array.from(pattern.cross).reduce((n,f,i)=>n+(f>=0&&pattern.done[i]?1:0),0), n=Array.from(pattern.cross).filter(f=>f>=0).length;
  const over=pattern.fabric?.over??1, cm=(v:number)=>(v*2.54/(pattern.count/over)).toFixed(1).replace('.',',');
  $('mesures').textContent=`${pattern.w} × ${pattern.h} points · ${cm(pattern.w)} × ${cm(pattern.h)} cm · ${n} croix · ${fils.length} fils · ${fini} brodées`;
  $<HTMLInputElement>('colonne').max=String(pattern.w); $<HTMLInputElement>('ligne').max=String(pattern.h);
  const toile=$<HTMLSelectElement>('toile'); if(!Array.from(toile.options).some(o=>Number(o.value)===pattern.count))toile.add(new Option(String(pattern.count),String(pattern.count))); toile.value=String(pattern.count);
  nuancier.value=String(actif); $('fil-actif').textContent=FLOSS[actif].code;
  const couleurs=fils.length?fils:[actif]; $('roue').style.background=`conic-gradient(${couleurs.map((f,i)=>`${FLOSS[f].hex} ${i*100/couleurs.length}% ${(i+1)*100/couleurs.length}%`).join(',')})`;
  $('palette').replaceChildren();
  fils.forEach(f=>{const b=document.createElement('button');b.className='fil';b.title=FLOSS[f].name;b.setAttribute('aria-label','Dessiner avec le fil DMC '+FLOSS[f].code);b.setAttribute('aria-pressed',String(f===actif));const c=document.createElement('i');c.style.background=FLOSS[f].hex;b.append(c,document.createTextNode(FLOSS[f].code));b.onclick=()=>{actif=f;actualiser();};$('palette').append(b);});
  dessiner();
}
function dessiner() {
  const cv=$<HTMLCanvasElement>('motif'), ctx=cv.getContext('2d')!; const k=12;
  cv.width=pattern.w*k;cv.height=pattern.h*k;ctx.fillStyle=pattern.fabric?.color??'#f3f3f1';ctx.fillRect(0,0,cv.width,cv.height);
  const fils=filsUtilises(pattern);
  for(let y=0;y<pattern.h;y++)for(let x=0;x<pattern.w;x++) {const i=y*pattern.w+x,f=pattern.cross[i];if(f<0)continue;const X=x*k,Y=y*k;
    ctx.globalAlpha=pattern.done[i]?0.35:1;
    if(grille){ctx.fillStyle=FLOSS[f].hex;ctx.globalAlpha*=.25;ctx.fillRect(X,Y,k,k);ctx.globalAlpha=pattern.done[i]?.35:1;drawSymbol(ctx,fils.indexOf(f),X+6,Y+6,3.6,'#111');}
    else {ctx.lineCap='round';ctx.lineWidth=3.4;ctx.strokeStyle=FLOSS[f].hex;ctx.beginPath();ctx.moveTo(X+2,Y+2);ctx.lineTo(X+10,Y+10);ctx.moveTo(X+10,Y+2);ctx.lineTo(X+2,Y+10);ctx.stroke();ctx.lineWidth=.8;ctx.strokeStyle='rgba(255,255,255,.35)';ctx.stroke();}
  }
  ctx.globalAlpha=1;
  if(grille){for(let x=0;x<=pattern.w;x++){ctx.strokeStyle=x%10===0?'#777':'#ddd';ctx.lineWidth=x%10===0?1:.4;ctx.beginPath();ctx.moveTo(x*k,0);ctx.lineTo(x*k,cv.height);ctx.stroke();}for(let y=0;y<=pattern.h;y++){ctx.strokeStyle=y%10===0?'#777':'#ddd';ctx.lineWidth=y%10===0?1:.4;ctx.beginPath();ctx.moveTo(0,y*k);ctx.lineTo(cv.width,y*k);ctx.stroke();}}
}
function vue(v: boolean) {grille=v; $('tambour').classList.toggle('grille',v);$('vue-croix').setAttribute('aria-pressed',String(!v));$('vue-grille').setAttribute('aria-pressed',String(v));dessiner();}
$('vue-croix').onclick=()=>vue(false);$('vue-grille').onclick=()=>vue(true);
nuancier.onchange=()=>{actif=Number(nuancier.value);actualiser();};
$('generer').onclick=()=>{
  const champ=$<HTMLInputElement>('graine');if(!champ.reportValidity())return;
  if(modifie&&!confirm('Remplacer cet ouvrage par une variation ? Vous pourrez annuler. Exportez une copie JSON pour le conserver séparément.'))return;
  souvenir(); graine=Number(champ.value);const resultat=fabriquer();pattern=resultat.pattern;actif=pattern.palette[0]??0;$('ajustements').textContent=resultat.controle.ajustements.join(' ');change('Une nouvelle variation a été générée.');
};
$('sauver').onclick=()=>{if(sauver())signaler('Ouvrage sauvegardé sur cet appareil.');};
$('annuler').onclick=()=>{const p=historique.pop();if(!p)return;pattern=p;const r=lireCode(p.recette?.code);if(r){Object.assign(signature,r.signature);graine=r.graine;synchroniser();}if(!historique.length)$('annuler').setAttribute('disabled','');change('La dernière modification a été annulée.');};
$('toile').onchange=()=>{souvenir();pattern.count=Number($<HTMLSelectElement>('toile').value) as Count;change('Le comptage de la toile a été mis à jour.');};
function appliquer(x: number,y: number) {
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=pattern.w||y>=pattern.h){signaler('Choisissez une case dans les limites de la grille.');return;}
  const outil=$<HTMLSelectElement>('outil').value, i=y*pattern.w+x;if(outil==='regarder'){signaler(`Colonne ${x+1}, ligne ${y+1} : ${pattern.cross[i]<0?'toile vide':'DMC '+FLOSS[pattern.cross[i]].code}.`);return;}
  if(outil==='broder'&&pattern.cross[i]<0){signaler('Cette case ne contient aucune croix.');return;}
  if(outil==='dessiner'&&!filsUtilises(pattern).includes(actif)&&filsUtilises(pattern).length>=SYMBOL_COUNT){signaler('Limite de fils atteinte pour garder des symboles distincts.');return;}
  souvenir();if(outil==='dessiner'){pattern.cross[i]=actif;pattern.done[i]=0;ensurePalette(pattern,actif);}else if(outil==='effacer'){pattern.cross[i]=-1;pattern.done[i]=0;}else pattern.done[i]=pattern.done[i]?0:1;
  change(`Colonne ${x+1}, ligne ${y+1} : ${outil==='broder'?'suivi mis à jour':'grille modifiée'}.`);
}
$('outil').onchange=()=>{const edit=$<HTMLSelectElement>('outil').value!=='regarder';if(edit)vue(true);$('motif').classList.toggle('editable',edit);};
$('motif').onclick=e=>{const r=$('motif').getBoundingClientRect();const x=Math.floor((e.clientX-r.left)/r.width*pattern.w),y=Math.floor((e.clientY-r.top)/r.height*pattern.h);$<HTMLInputElement>('colonne').value=String(x+1);$<HTMLInputElement>('ligne').value=String(y+1);appliquer(x,y);};
$('appliquer').onclick=()=>appliquer(Number($<HTMLInputElement>('colonne').value)-1,Number($<HTMLInputElement>('ligne').value)-1);
function telecharger(contenu:string,type:string,nom:string) {const url=URL.createObjectURL(new Blob([contenu],{type}));const a=document.createElement('a');a.href=url;a.download=nom;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);signaler('Fichier préparé pour le téléchargement.');}
$('export-json').onclick=()=>telecharger(JSON.stringify({...toObject(pattern),attribution:ATTRIBUTION},null,2),'application/json','atlas-broderie.json');
$('export-svg').onclick=()=>telecharger(svgPatron(pattern),'image/svg+xml','atlas-patron.svg');
function preparerImpression(){const host=$('patron-impression');host.replaceChildren();for(let y=0;y<pattern.h;y+=40)for(let x=0;x<pattern.w;x+=40){const page=document.createElement('div');page.className='feuille-patron';page.innerHTML=svgPatron(pattern,{x,y,w:Math.min(40,pattern.w-x),h:Math.min(40,pattern.h-y)});host.append(page);}}
$('imprimer').onclick=()=>{preparerImpression();window.print();};window.addEventListener('beforeprint',preparerImpression);
$<HTMLInputElement>('import-json').onchange=async e=>{const input=e.target as HTMLInputElement,f=input.files?.[0];if(!f)return;try{if(f.size>5*1024*1024)throw Error('Fichier trop volumineux (5 Mo maximum).');const p=lireCopie(JSON.parse(await f.text()));if(!confirm('Ouvrir cette copie à la place de l’ouvrage actuel ? Vous pourrez annuler.'))return;souvenir();pattern=p;actif=p.palette[0]??0;modifie=true;const r=lireCode(p.recette?.code);if(r){Object.assign(signature,r.signature);graine=r.graine;synchroniser();}change('La copie JSON a été ouverte.');}catch(err){signaler(err instanceof Error?err.message:'Copie illisible.');}finally{input.value='';}};
actualiser();signaler(avertissement||'Votre premier motif est prêt. Choisissez un geste pour modifier la grille.');
