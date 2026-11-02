/* AIME — quatre repères éditoriaux par espace, sans moteur secondaire. */
(function(){
const groups={
"chronologie.html":["TIMELINE","CADRAN","CALENDRIER","HISTORIQUE"],
"composition.html":["GRILLE","BLOCS","MISES EN PAGE","RECETTES"],
"metamorphose.html":["FRAGMENTS","TRANSFORMATION","VISUELS","RÉSULTAT"],
"reparation.html":["RÉPÉTITIONS","DIAGNOSTIC","DOUBLONS","RÉUTILISATION"],
"demander.html":["DÉCRIRE","ANALYSER","PROPOSITIONS","CONFIRMER"],
"recevoir.html":["DEMANDES","MESSAGES","DOCUMENTS","SUIVI"],
"publier.html":["PRÉPARER","PRÉVISUALISER","VÉRIFIER","PUBLIER"],
"relier.html":["PERSONNES","FRAGMENTS","LIENS","RÉSEAU"],
"couleurs.html":["NUANCIER","PALETTES","CONTRASTES","HARMONIES"],
"deposer.html":["FICHIERS","MÉDIAS","SOURCES","IMPORTATION"],
"fusionner.html":["SÉLECTIONNER","COMPARER","ASSEMBLER","VALIDER"],
"trier.html":["INVENTAIRE","FILTRES","DOUBLONS","CLASSEMENT"],
"organiser.html":["ESPACES","ÉTAPES","RÔLES","VUES"],
"rosace.html":["DÉCOUVRIR","COMPOSER","COMPRENDRE","EXPLORER"],
"vue-cube.html":["PROFIL","CALENDRIER","MÉDIAS","DOCUMENTS"],
"cube-recit.html":["RÉCIT","FACES","MOSAÏQUE","RELATIONS"],
"espace.html":["PROFIL","COMPTE","AGENDA","BUREAU"],
"orbe.html":["RECHERCHE","ASSISTANCE","CONTEXTE","RÉSULTATS"],
"map.html":["ESPACES","LIEUX","CONNEXIONS","PARCOURS"],
"moteur.html":["DEMANDE","ANALYSE","STRUCTURE","SOURCES"]};
const path=location.pathname.split("/").pop()||"index.html";
document.querySelectorAll('.dock-haut .marque').forEach(e=>e.textContent="AIME");
document.querySelectorAll('.dock-haut a[aria-label*="ATLAS"]').forEach(e=>e.setAttribute('aria-label','AIME, accueil'));
if(path==="index.html")return;
const names=groups[path];if(!names)return;
const main=document.querySelector('main');if(!main||main.querySelector('.aime-quatre'))return;
const part=document.createElement('section');part.className='aime-quatre';part.setAttribute('aria-label','Quatre rubriques de cet espace');
const title=document.createElement('p');title.className='aime-quatre-sur';title.textContent='EXPLORER CET ESPACE';part.appendChild(title);
const grid=document.createElement('div');grid.className='aime-quatre-grille';
const existing=Array.from(main.querySelectorAll('section[id]')).filter(e=>e.id!=='contenu'&&getComputedStyle(e).display!=='none'&&e.id!=='faces-explication');
names.forEach((name,i)=>{const id='rubrique-'+(i+1);const a=document.createElement('a');a.href='#'+id;a.className='aime-quatre-carte';a.innerHTML='<small>0'+(i+1)+'</small><strong></strong><span aria-hidden="true">↘</span>';a.querySelector('strong').textContent=name;grid.appendChild(a);const target=document.createElement('section');target.id=id;target.className='aime-rubrique-ancre';target.setAttribute('aria-label',name);target.innerHTML='<span>0'+(i+1)+'</span><h2></h2><p>Emplacement de classement — aucun nouveau moteur.</p>';target.querySelector('h2').textContent=name;main.appendChild(target)});
part.appendChild(grid);
const hero=main.querySelector('.atlas-page-hero,.rosace-entree,.hero,.vc-scene-zone');
if(hero)hero.insertAdjacentElement('afterend',part);else main.insertBefore(part,main.firstChild);
})();
