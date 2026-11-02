/* AIME — Chronologie essentielle. Les inventaires complets restent sur ARCHIVES.
   Données : data/chronologie.js et data/histoire.js. Aucune suppression. */
(function(){
  var A=window.ATLAS||{}, H=A.histoire||{}, C=A.chronologie||{};
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c]})};
  var container=document.getElementById('chapitres'),before=document.getElementById('avant'),future=document.getElementById('demain');
  if(!container)return;
  var old=Array.isArray(C.entrees)?C.entrees.filter(function(e){return e.visibility==='public'&&e.publicationStatus==='publie'}):[];
  var chapters=Array.isArray(H.chapitres)?H.chapitres:[];
  var visual={};(A.visuels||[]).forEach(function(v){visual[v.id]=v});
  var early=old.map(function(e){return {id:e.id,title:e.title,date:e.dateStart+(e.dateEnd?' — '+e.dateEnd:''),year:Number(String(e.dateStart).slice(0,4))||0,source:'ARCHIVES',image:null}});
  var later=chapters.map(function(c){var img=visual[c.bandeau];return{id:c.id,title:c.titre,date:c.date,year:2025+(c.id==='novembre'||c.id==='decembre'?0:1),source:'ARCHIVES',image:img&&img.src?img:null}});
  var all=early.concat(later).sort(function(a,b){return a.year-b.year});
  if(before)before.innerHTML='';
  if(future)future.innerHTML='';
  container.innerHTML='<div class="aime-chrono-simple"><div class="aime-chrono-intro"><p class="surtitre">AIME · LE TEMPS</p><h2>LES GRANDS MOMENTS.</h2></div><ol class="aime-chrono-events">'+all.map(function(e){var img=e.image?'<img src="'+esc(e.image.src)+'" alt="'+esc(e.image.alt||'')+'" loading="lazy">':'';return '<li id="'+esc(e.id)+'" class="aime-chrono-event'+(e.image?'':' sans-image')+'"><a href="archives.html#'+esc(e.id)+'" aria-label="Retrouver dans les archives : '+esc(e.title)+'"><div class="aime-chrono-image">'+img+'</div><div class="aime-chrono-copy"><span class="aime-chrono-date">'+esc(e.date)+'</span><h3>'+esc(e.title)+'</h3><small>ARCHIVES ↗</small></div></a></li>'}).join('')+'</ol><p class="aime-chrono-end"><a href="archives.html">TOUTES LES ARCHIVES ↗</a></p></div>';
  var nums=document.getElementById('chiffres');if(nums)nums.innerHTML='';
})();
