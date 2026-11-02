/* AIME — même geste d'import, interprétation par page ; aucune exécution de code. */
(function(){
const page=location.pathname.split('/').pop()||'index.html';
const label=page.replace(/\.html$/,'').replace(/-/g,' ').toUpperCase();
const targets={
'chronologie.html':'Carte datée · événement ou archive à renseigner',
'couleurs.html':'Nuancier · palette à identifier',
'rosace.html':'Source de patron · références DMC à calculer dans le moteur spécialisé',
'composition.html':'Fragment à composer dans le moteur magnétique',
'cartes.html':'Carte structurée · champs à renseigner',
'typographie.html':'Échantillon de texte ou de typographie',
'vue-cube.html':'Document ou média à rattacher à une face',
'archives.html':'Archive à documenter et classer',
'demander.html':'Pièce jointe à une demande',
'recevoir.html':'Élément reçu à classer',
'publier.html':'Élément à préparer avant publication',
'metamorphose.html':'Fragment à transformer'
};
const zone=document.createElement('div');zone.className='aime-import-context';zone.innerHTML='<button class="aime-import-context-open" type="button" aria-expanded="false" aria-controls="aime-import-panel">＋ IMPORTER · <span></span></button><section id="aime-import-panel" hidden><p>CONTEXTE : <strong></strong></p><p class="aime-import-purpose"></p><label class="aime-import-choose">CHOISIR UN FICHIER<input type="file" accept="image/*,audio/*,video/*,.pdf,.txt,.md,.html,.htm,.css,.js,.json"></label><p class="aime-import-status" role="status">Le fichier reste sur cet appareil. Aucun moteur de transformation n’est lancé automatiquement.</p></section>';
zone.querySelector('button span').textContent=label;zone.querySelector('section strong').textContent=label;zone.querySelector('.aime-import-purpose').textContent=targets[page]||'Fragment à identifier et classer';
const main=document.querySelector('main');if(!main)return;
const first=main.querySelector('section');if(first)first.insertAdjacentElement('afterend',zone);else main.prepend(zone);
const toggle=zone.querySelector('button'),panel=zone.querySelector('section');toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden))});
const input=zone.querySelector('input');input.addEventListener('change',async()=>{const f=input.files&&input.files[0];if(!f)return;const n=f.name.toLowerCase(),type=f.type.startsWith('image/')?'IMAGE':/\.md$/.test(n)?'MARKDOWN':/\.html?$/.test(n)?'HTML':/\.(js|css|json)$/.test(n)?'CODE':f.type.startsWith('video/')?'VIDÉO':'DOCUMENT';let txt=null;if(['MARKDOWN','HTML','CODE'].includes(type)&&f.size<=300000){try{txt=await f.text()}catch(e){}}const fragment={type,title:f.name,page,sourceName:f.name,text:txt,description:(targets[page]||'À classer')+' · '+Math.ceil(f.size/1024)+' Ko · source locale'};if(window.AIME_BUREAU){window.AIME_BUREAU.ajouterFragment(fragment);zone.querySelector('.aime-import-status').textContent='Ajouté au Bureau dans le contexte '+label+'. Transformation spécialisée non lancée.'}else zone.querySelector('.aime-import-status').textContent='Bureau indisponible sur cette page';input.value=''});
})();
