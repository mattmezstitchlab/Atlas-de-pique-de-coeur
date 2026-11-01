/*! Noyau Point Zéro © 2026 Matt Mez Stitch Lab, MIT. Voir outils/broderie/LICENCE-POINTZERO.txt. Données couleur MakeBead, CC BY 4.0. */
import { generer, formatParDefaut } from './moteur/motif5d/generer';
import { DIMENSIONS, VERSION, lireCode, type Signature, type Choix } from './moteur/motif5d/code';
import { FAMILLES, filsParFamille } from './moteur/famillesFils';
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
  const div=document.createElement('div'); div.className='broderie-reglage';
  const label=document.createElement('label'); label.htmlFor='choix-'+d.cle; label.textContent=d.nom;
  const valeur=document.createElement('output'); valeur.id='valeur-'+d.cle; label.append(valeur);
  const input=document.createElement('input'); input.type='range'; input.min='0'; input.max='3'; input.step='1'; input.id=label.htmlFor;
  input.setAttribute('aria-describedby',valeur.id);
  const maj=()=>{ valeur.value=d.reponses[Number(input.value)][0]; input.setAttribute('aria-valuetext',valeur.value); };
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
  if(apercu){signaler('Confirmez ou annulez l’aperçu avant de dessiner.');return;}
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
// Le même classement DMC que le disque de Point Zéro, sans importer son application React.
type Apercu = { base: Pattern; signature: Signature; graine: number; actif: number };
let apercu: Apercu | null = null;
let niveau: 'racine' | 'dimension' | 'fils' | 'familles' | 'nuances' = 'racine';
let dimension = DIMENSIONS[0], sourceFil = -1, famille = '', pageNuances = 0;
const PAGE = 12;
const verrouilles = '#generer, #annuler, #sauver, #export-svg, #imprimer, #export-json, #import-json, #appliquer, #toile, #outil, #nuancier, #palette button, #graine';
function verrouiller() { document.querySelectorAll<HTMLInputElement>(verrouilles).forEach(e=>e.disabled=!!apercu); if(!apercu)$<HTMLButtonElement>('annuler').disabled=!historique.length; }
function commencerApercu() {
  if(!apercu)apercu={base:pattern,signature:{...signature},graine,actif};
}
function montrerApercu(p: Pattern, texte: string) {
  pattern=p; actualiser(); verrouiller(); $('apercu-actions').hidden=false; $('apercu-texte').textContent=texte+' Rien n’est sauvegardé avant confirmation.'; signaler('Aperçu de la métamorphose. Confirmez ou annulez.'); animer();
}
function animer() {
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('motif').animate([{opacity:.35,transform:'scale(.985)'},{opacity:1,transform:'scale(1)'}],{duration:320,easing:'ease-out'});
}
function apercuDimension(d: typeof DIMENSIONS[number], valeur: Choix, redessiner=true) {
  commencerApercu();signature[d.cle]=valeur; synchroniser();
  const resultat=fabriquer(); resultat.pattern.count=apercu!.base.count; resultat.pattern.fabric={...apercu!.base.fabric!};
  $('ajustements').textContent=resultat.controle.ajustements.join(' ');
  montrerApercu(resultat.pattern,`${d.nom} : ${d.reponses[valeur][0]}. Le motif généré remplace les retouches et le suivi uniquement si vous confirmez.`);if(redessiner)couronne();
}
function terminerApercu(confirmer: boolean) {
  if(!apercu)return;
  const a=apercu;apercu=null;$('apercu-actions').hidden=true;
  if(confirmer){if(niveau==='nuances')sourceFil=actif;historique.push(copier(a.base));if(historique.length>20)historique.shift();modifie=true;}
  else {pattern=a.base;Object.assign(signature,a.signature);graine=a.graine;actif=a.actif;synchroniser();}
  actualiser();verrouiller();couronne();
  if(confirmer){if(sauver())signaler('La métamorphose est confirmée et sauvegardée sur cet appareil.');}
  else signaler('Aperçu annulé : votre ouvrage et son suivi sont inchangés.');
}
function boutonDisque(nom: string, id: string, faire:()=>void, couleur?: string, choisi=false) {
  const b=document.createElement('button');b.type='button';b.className='disque-choix';b.dataset.choix=id;b.setAttribute('aria-label',nom);b.setAttribute('aria-pressed',String(choisi));
  const c=document.createElement('i');if(couleur)c.style.background=couleur;else c.textContent=({structure:'❋',trace:'∿',densite:'⠿',echelle:'↗',palette:'◐',fils:'◉',outils:'✎',fichiers:'↥',affichage:'◈',toile:'▦',aide:'?',retour:'↶'} as Record<string,string>)[id]??'·';b.append(c);
  const texte=document.createElement('span');texte.textContent=nom;b.append(texte);b.onclick=()=>{faire();if(!b.isConnected){const suivant=Array.from(document.querySelectorAll<HTMLButtonElement>('.disque-choix')).find(e=>e.dataset.choix===id)??document.querySelector<HTMLButtonElement>('.disque-choix');suivant?.focus({preventScroll:true});}};return b;
}
function couronne() {
  const host=$('disque-couronne');host.replaceChildren();$('disque-pages').replaceChildren();$('disque-retour').hidden=niveau==='racine';
  let boutons: HTMLButtonElement[]=[],titre='Les cinq gestes de la rosace';
  if(niveau==='racine'){
    boutons=[];
    boutons=[boutonDisque('Fils DMC','fils',ouvrirFils),boutonDisque('Dessiner','outils',()=>panneau('outils')),boutonDisque('Toile','toile',()=>panneau('toile')),boutonDisque('Affichage','affichage',()=>panneau('affichage')),boutonDisque('Fichiers','fichiers',()=>panneau('fichiers')),boutonDisque('Annuler','retour',()=>{if(apercu)terminerApercu(false);else $('annuler').click();couronne();}),boutonDisque('Guide','aide',()=>panneau('aide')),boutonDisque('Variation','variation',()=>{if(apercu)terminerApercu(false);$<HTMLInputElement>('graine').value=String(1+Math.floor(Math.random()*99999));$('generer').click();})];
  } else if(niveau==='dimension'){
    titre=dimension.nom+' · touchez un choix pour voir la métamorphose';
    boutons=dimension.reponses.map(([nom],i)=>boutonDisque(nom,'valeur-'+i,()=>apercuDimension(dimension,i as Choix),undefined,signature[dimension.cle]===i));
  } else if(niveau==='fils'){
    titre='Remplacer un fil · choisissez le fil du motif';
    const fils=filsUtilises(apercu?.base??pattern);
    const max=Math.max(0,Math.ceil(fils.length/PAGE)-1);pageNuances=Math.min(pageNuances,max);
    boutons=fils.slice(pageNuances*PAGE,(pageNuances+1)*PAGE).map(f=>boutonDisque('DMC '+FLOSS[f].code,'source-'+f,()=>{sourceFil=f;niveau='familles';pageNuances=0;couronne();},FLOSS[f].hex));
    paginer(fils.length);
    if(!fils.length)titre='Aucun fil à remplacer. Dessinez d’abord une croix.';
  } else if(niveau==='familles'){
    titre='DMC '+FLOSS[sourceFil].code+' → choisissez une famille';
    boutons=FAMILLES.map(f=>boutonDisque(f.nom,'famille-'+f.id,()=>{famille=f.id;pageNuances=0;niveau='nuances';couronne();},f.hex));
  } else {
    const liste=filsParFamille().get(famille)??[];
    titre=(FAMILLES.find(f=>f.id===famille)?.nom??'Nuances')+' · du clair au foncé';
    boutons=liste.slice(pageNuances*PAGE,(pageNuances+1)*PAGE).map(f=>boutonDisque('DMC '+FLOSS[f].code,'nuance-'+f,()=>{
      commencerApercu(); const p=copier(apercu!.base);
      for(let i=0;i<p.cross.length;i++)if(p.cross[i]===sourceFil)p.cross[i]=f;
      ensurePalette(p,f);actif=f;montrerApercu(p,`DMC ${FLOSS[sourceFil].code} → DMC ${FLOSS[f].code} (${FLOSS[f].name}). La géométrie et le suivi sont conservés.`);couronne();
    },FLOSS[f].hex,actif===f));paginer(liste.length);
  }
  $('disque-titre').textContent=titre;
  boutons.forEach((b,i)=>{const angle=(-90+i*360/boutons.length)*Math.PI/180;b.style.left=(50+46*Math.cos(angle))+'%';b.style.top=(50+46*Math.sin(angle))+'%';host.append(b);});
  dessinerArcs();
}
function paginer(n: number) {
  const pages=Math.ceil(n/PAGE);if(pages<=1)return;
  const h=$('disque-pages');
  const avant=document.createElement('button');avant.className='bouton';avant.textContent='Nuances précédentes';avant.disabled=pageNuances===0;avant.onclick=()=>{pageNuances--;couronne();};
  const apres=document.createElement('button');apres.className='bouton';apres.textContent='Nuances suivantes';apres.disabled=pageNuances>=pages-1;apres.onclick=()=>{pageNuances++;couronne();};
  const t=document.createElement('span');t.textContent=`${pageNuances+1} / ${pages}`;h.append(avant,t,apres);
}
function ouvrirFils(){if(apercu)terminerApercu(false);niveau='fils';pageNuances=0;couronne();}
$('ouvrir-nuancier').onclick=ouvrirFils;
$('disque-retour').onclick=()=>{if(apercu)terminerApercu(false);niveau=niveau==='nuances'?'familles':niveau==='familles'?'fils':'racine';pageNuances=0;couronne();};
$('apercu-confirmer').onclick=()=>terminerApercu(true);$('apercu-annuler').onclick=()=>terminerApercu(false);
$('disque-studio').addEventListener('keydown',e=>{if(e.key==='Escape'){if(apercu)terminerApercu(false);else{niveau='racine';couronne();}return;}const b=Array.from(document.querySelectorAll<HTMLButtonElement>('.disque-choix'));const i=b.indexOf(document.activeElement as HTMLButtonElement);if(i<0)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();b[e.key==='Home'?0:e.key==='End'?b.length-1:(i+(e.key==='ArrowRight'?1:b.length-1))%b.length]?.focus();}});
DIMENSIONS.forEach(d=>controles.get(d.cle)!.addEventListener('change',()=>apercuDimension(d,Number(controles.get(d.cle)!.value) as Choix)));
/** Cinq curseurs en arc : même recette, aperçu réversible, souris / toucher / clavier. */
function dessinerArcs() {
  const host=$('arcs-reglages');host.replaceChildren();host.hidden=niveau!=='racine'&&niveau!=='dimension';if(host.hidden)return;
  const NS='http://www.w3.org/2000/svg', svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 600 600');
  const xy=(a:number,r=215)=>[300+r*Math.cos(a*Math.PI/180),300+r*Math.sin(a*Math.PI/180)];
  DIMENSIONS.forEach((d,i)=>{
    const start=-121+i*72,end=start+52;
    const g=document.createElementNS(NS,'g');g.setAttribute('role','slider');g.setAttribute('tabindex','0');g.setAttribute('aria-label',d.nom+' radial');g.setAttribute('aria-valuemin','0');g.setAttribute('aria-valuemax','3');g.dataset.radial=d.cle;
    const chemin=(a:number,b:number)=>{const [x,y]=xy(a),[X,Y]=xy(b);return `M${x} ${y}A215 215 0 0 1 ${X} ${Y}`;};
    const rail=document.createElementNS(NS,'path');rail.setAttribute('d',chemin(start,end));rail.setAttribute('class','arc-rail');g.append(rail);
    for(let j=0;j<4;j++){const [x,y]=xy(start+j*(end-start)/3);const tick=document.createElementNS(NS,'circle');tick.setAttribute('cx',String(x));tick.setAttribute('cy',String(y));tick.setAttribute('r','3');tick.setAttribute('class','arc-repere');g.append(tick);}
    const suivi=document.createElementNS(NS,'path');suivi.setAttribute('class','arc-actif');g.append(suivi);
    const boule=document.createElementNS(NS,'circle');boule.setAttribute('r','8');boule.setAttribute('class','arc-poignee');g.append(boule);
    const texte=document.createElementNS(NS,'text');const [tx,ty]=xy((start+end)/2,245);texte.setAttribute('x',String(tx));texte.setAttribute('y',String(ty));texte.setAttribute('text-anchor','middle');texte.setAttribute('class','arc-legende');g.append(texte);
    const maj=()=>{const v=signature[d.cle],a=start+v*(end-start)/3,[x,y]=xy(a);boule.setAttribute('cx',String(x));boule.setAttribute('cy',String(y));suivi.setAttribute('d',chemin(start,start+Math.max(.01,v*(end-start)/3)));texte.textContent=d.nom+' · '+(v+1);g.setAttribute('aria-valuenow',String(v));g.setAttribute('aria-valuetext',d.reponses[v][0]);};maj();
    const changer=(v:number)=>{v=Math.max(0,Math.min(3,v));if(v!==signature[d.cle]){apercuDimension(d,v as Choix,false);document.querySelectorAll<SVGGElement>('[data-radial]').forEach(el=>el.dispatchEvent(new Event('rafraichir')));}};
    g.addEventListener('rafraichir',maj);
    const pointer=(e:PointerEvent)=>{const r=svg.getBoundingClientRect(),a=Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI;let delta=((a-start)%360+360)%360;if(delta>180)delta-=360;changer(Math.round(delta/(end-start)*3));};
    g.addEventListener('pointerdown',e=>{e.preventDefault();g.setPointerCapture(e.pointerId);pointer(e);});g.addEventListener('pointermove',e=>{if(g.hasPointerCapture(e.pointerId))pointer(e);});g.addEventListener('pointerup',e=>{if(g.hasPointerCapture(e.pointerId))g.releasePointerCapture(e.pointerId);});
    g.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();changer(e.key==='Home'?0:e.key==='End'?3:signature[d.cle]+(['ArrowRight','ArrowUp'].includes(e.key)?1:-1));}});
    svg.append(g);
  });host.append(svg);
}
function panneau(genre: string) {
  if(apercu)terminerApercu(false);
  const h=$('panneau-contenu');h.replaceChildren();
  const parties:Record<string,HTMLElement[]>={
    outils:[$('outils-internes')], fichiers:[document.querySelector('.studio-fichiers')!],
    toile:[$('toile-interne')], affichage:[$('affichage-interne')], aide:[$('aide-interne')]
  };
  (parties[genre]??[]).forEach(e=>h.append(e));$('disque-panneau').hidden=false;$('tambour').hidden=true;$('arcs-reglages').hidden=true;$('disque-couronne').hidden=true;
  $('fermer-panneau').focus({preventScroll:true});
}
function fermerPanneau(){ Array.from($('panneau-contenu').children).forEach(e=>$('reserve-studio').append(e));$('disque-panneau').hidden=true;$('tambour').hidden=false;$('disque-couronne').hidden=false;couronne(); }
function installationObjet() {
  const disque=$('disque-studio'), reserve=document.createElement('div');reserve.id='reserve-studio';reserve.hidden=true;document.body.append(reserve);
  const construire=(id:string,nodes:HTMLElement[])=>{const div=document.createElement('div');div.id=id;nodes.forEach(e=>div.append(e));reserve.append(div);return div;};
  const fils=document.querySelector<HTMLElement>('.fils')!;
  const outil=$('outil'),coords=document.querySelector<HTMLElement>('.coordonnees')!;
  construire('outils-internes',[...Array.from(fils.querySelectorAll<HTMLElement>('label')).filter(e=>e.getAttribute('for')==='outil'||e.getAttribute('for')==='nuancier'),$('nuancier'),outil,coords,$('appliquer')]);
  construire('toile-interne',[fils.querySelector<HTMLElement>('label[for="toile"]')!,$('toile')]);
  construire('affichage-interne',[document.querySelector<HTMLElement>('.vue-actions')!]);
  const aide=construire('aide-interne',[]);aide.innerHTML='<h2>Un disque, un ouvrage</h2><p>Faites glisser les cinq curseurs en arc. La rosace change immédiatement ; confirmez pour garder le motif ou annulez pour retrouver votre ouvrage.</p><p>Fils DMC : fil du motif, famille, nuance. Le suivi reste intact. Outils : dessiner, effacer ou marquer comme brodé. Exportez une copie JSON pour conserver votre travail.</p><p>Clavier : Tabulation, flèches, Début / Fin. Échap referme. Les couleurs écran sont approximatives.</p>';
  const fichiers=document.querySelector<HTMLElement>('.studio-fichiers')!;fichiers.querySelector('.studio-actions')!.append($('export-svg'),$('imprimer'),$('sauver'));reserve.append(fichiers);
  reserve.append(document.querySelector('.reglages')!,fils,document.querySelector('.studio-actions')!);
  // Les actions contextuelles restent dans la coque, au pied du même disque.
  const pied=document.createElement('div');pied.className='disque-console';
  pied.append(document.querySelector('.disque-navigation')!,$('apercu-actions'),$('mesures'),$('etat'));disque.append(pied);
  $('fermer-panneau').onclick=fermerPanneau;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('disque-panneau').hidden)fermerPanneau();});
  const titre=document.querySelector<HTMLElement>('.studio-intro')!;titre.innerHTML='<h1>Rosace</h1><a href="index.html">ATLAS</a>';
  $('graine').removeAttribute('required');
}
installationObjet();

window.addEventListener('beforeunload',e=>{if(apercu){e.preventDefault();e.returnValue='';}});
couronne();

actualiser();signaler(avertissement||'Votre premier motif est prêt. Choisissez un geste pour modifier la grille.');
