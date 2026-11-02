/* AIME — import universel contextuel, sans interface dupliquée.
   Le bouton Importer du Bureau appelle ce moteur depuis n'importe quelle page. */
(function(){
const page=location.pathname.split('/').pop()||'index.html';
const labels={
'chronologie.html':'Événement ou archive à dater',
'couleurs.html':'Palette ou nuancier à identifier',
'rosace.html':'Source de patron à traiter avec le moteur de broderie',
'composition.html':'Fragment pour la composition magnétique',
'cartes.html':'Carte structurée à compléter',
'typographie.html':'Échantillon typographique',
'vue-cube.html':'Contenu à rattacher à une face',
'archives.html':'Archive à indexer',
'metamorphose.html':'Fragment à transformer',
'publier.html':'Contenu à préparer pour publication'
};
function classify(file){
const n=file.name.toLowerCase(),type=file.type||'';
if(type.startsWith('image/'))return 'IMAGE';
if(type.startsWith('video/'))return 'VIDÉO';
if(type.startsWith('audio/'))return 'AUDIO';
if(/\.md$/.test(n))return 'MARKDOWN';
if(/\.html?$/.test(n))return 'HTML';
if(/\.(js|ts|css|json)$/.test(n))return 'CODE';
if(/\.pdf$/.test(n))return 'DOCUMENT';
return 'TEXTE';
}
async function importFile(file){
if(!file)return;
const type=classify(file);let content=null;
if(['MARKDOWN','HTML','CODE','TEXTE'].includes(type)&&file.size<=300000){
try{content=await file.text()}catch(e){}
}
const fragment={type,title:file.name,page,sourceName:file.name,text:content,description:(labels[page]||'Fragment à classer')+' · '+Math.ceil(file.size/1024)+' Ko · source locale'};
if(!window.AIME_BUREAU)throw new Error('Bureau non disponible');
window.AIME_BUREAU.ajouterFragment(fragment);
return fragment;
}
window.AIME_IMPORT={page,importFile,classify};
})();
