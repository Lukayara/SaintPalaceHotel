import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Sky } from 'three/addons/objects/Sky.js';

const CONTACT_EMAIL='tresjuice@hotmail.com';
const canvas=document.querySelector('#coast-scene'),stage=document.querySelector('#scene-stage'),experience=document.querySelector('#beleving');
const fallback=document.querySelector('#scene-fallback'),loaderMessage=document.querySelector('#scene-loader');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger,ScrollSmoother=window.ScrollSmoother;
if(gsap&&ScrollTrigger&&ScrollSmoother){
 gsap.registerPlugin(ScrollTrigger,ScrollSmoother);
 if(!reducedMotion){
  window.siteSmoother=ScrollSmoother.create({wrapper:'#smooth-wrapper',content:'#smooth-content',smooth:1.15,smoothTouch:.12,effects:true,normalizeScroll:false});
 }
}
const chapterElements=[...document.querySelectorAll('.story-chapter')],viewButtons=[...document.querySelectorAll('[data-view]')],hotspotButtons=[...document.querySelectorAll('[data-hotspot]')];
const hotspotNote=document.querySelector('#hotspot-note'),clamp=(v,min,max)=>Math.min(max,Math.max(min,v)),smooth=t=>t*t*(3-2*t);
let renderer,scene,camera,controls,towerRoot,towerBounds,modelSize,modelCenter,fallbackRoot;
let running=false,stageVisible=false,raf=0,lastFrame=0,lastWater=0,manualPose=null,exploring=false,activeChapter=-1;
let waterGeometry,waterPositions,waterBase=[];
const hotspotObjects={},raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();

function material(color,roughness,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness})}
function addBox(parent,size,position,mat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
function makeFallbackTower(parent){
 const root=new THREE.Group(),stone=material('#c8b99f',.82),terrace=material('#e2d3b7',.65),glass=new THREE.MeshPhysicalMaterial({color:'#476d78',roughness:.27,metalness:.1,clearcoat:.4}),rail=material('#d8c9ab',.45,.2);
 addBox(root,[7,.8,5.3],[0,.4,0],stone);
 for(let level=0;level<10;level++){const y=1.1+level*1.05,width=4.4+(level>7?.35:0);addBox(root,[width,.63,3.8],[0,y,0],stone);addBox(root,[width+.55,.12,4.65],[0,y-.36,.08],terrace);
  for(const z of [-2.18,2.18])addBox(root,[width+.52,.045,.07],[0,y-.18,z],rail);
  for(const side of [-1,1])for(const z of [-1,1])addBox(root,[.055,.54,.055],[side*(width/2+.22),y-.03,z*2.16],rail);
  for(let col=0;col<6;col++){const x=-width/2+.35+col*(width-.7)/5;addBox(root,[.49,.63,.08],[x,y+.02,1.94],glass);addBox(root,[.49,.63,.08],[x,y+.02,-1.94],glass);addBox(root,[.045,.7,.09],[x-.26,y,1.97],rail)}
 }
 addBox(root,[4.9,.8,4.2],[0,11.75,0],terrace);parent.add(root);return root
}
function createSky(){
 const sky=new Sky();sky.scale.setScalar(420);scene.add(sky);const u=sky.material.uniforms;u.turbidity.value=5.5;u.rayleigh.value=2.8;u.mieCoefficient.value=.004;u.mieDirectionalG.value=.78;
 u.sunPosition.value.setFromSphericalCoords(1,THREE.MathUtils.degToRad(83),THREE.MathUtils.degToRad(205));
 const sun=new THREE.DirectionalLight('#ffd39a',3.4);sun.position.set(-28,16,-46);sun.castShadow=true;sun.shadow.mapSize.set(innerWidth<720?768:1536,innerWidth<720?768:1536);sun.shadow.camera.left=-26;sun.shadow.camera.right=26;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;sun.shadow.bias=-.0002;scene.add(sun);scene.add(new THREE.HemisphereLight('#e6f2ec','#324e50',1.7));
}
function createCoast(){
 waterGeometry=new THREE.PlaneGeometry(260,380,110,72);waterPositions=waterGeometry.attributes.position;for(let i=0;i<waterPositions.count;i++)waterBase.push(waterPositions.getY(i));
 const sea=new THREE.Mesh(waterGeometry,new THREE.MeshStandardMaterial({color:'#477681',roughness:.34,metalness:.08}));sea.rotation.x=-Math.PI/2;sea.position.set(-5,-.12,-210);sea.receiveShadow=true;scene.add(sea);
 const sand=new THREE.Mesh(new THREE.PlaneGeometry(190,72),material('#b9a781',.96));sand.rotation.x=-Math.PI/2;sand.position.set(-5,-.13,15);sand.receiveShadow=true;scene.add(sand);
 for(let i=0;i<7;i++){const dune=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),material(i%2?'#a9946f':'#c3ad82',.98));dune.scale.set(15,1.35,4);dune.position.set(-25+i*7,.15,10+i*1.7);dune.receiveShadow=true;scene.add(dune)}
 const plinth=addBox(scene,[11,.76,9],[0,.36,0],material('#d2c2a5',.8));for(let i=0;i<8;i++)addBox(scene,[.72,.53,.12],[-4.1+i*1.17,.4,4.58],material('#315661',.52,.12));plinth.receiveShadow=true
}
function addFacadeGlazing(bounds){
 const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),cols=8,rows=12;
 const width=size.x*.56,height=size.y*.77,stepX=width/cols,stepY=height/rows,front=bounds.max.z-size.z*.2,bottom=bounds.min.y+size.y*.13;
 const pane=new THREE.BoxGeometry(stepX*.69,stepY*.54,.035),glass=new THREE.MeshPhysicalMaterial({color:'#668995',roughness:.24,metalness:.18,clearcoat:.55,transparent:true,opacity:.88});
 const windows=new THREE.InstancedMesh(pane,glass,cols*rows);windows.castShadow=false;windows.receiveShadow=true;const dummy=new THREE.Object3D();let i=0;
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){dummy.position.set(center.x-width/2+stepX*(col+.5),bottom+stepY*(row+.5),front);dummy.updateMatrix();windows.setMatrixAt(i++,dummy.matrix)}
 windows.instanceMatrix.needsUpdate=true;scene.add(windows);
 const trim=material('#d4c09a',.55,.12),railGeo=new THREE.BoxGeometry(width*1.08,.045,.085),rails=new THREE.InstancedMesh(railGeo,trim,rows+1);i=0;
 for(let row=0;row<=rows;row++){dummy.position.set(center.x,bottom+stepY*row,front+.055);dummy.updateMatrix();rails.setMatrixAt(i++,dummy.matrix)}
 rails.instanceMatrix.needsUpdate=true;scene.add(rails);return [windows,rails]
}
function createHotspots(raw,scale,center){
 const lo=raw.min,size=raw.getSize(new THREE.Vector3()),points={
  facade:new THREE.Vector3(center.x,lo.y+size.y*.7,raw.max.z+.08),
  balcony:new THREE.Vector3(center.x-size.x*.28,lo.y+size.y*.52,raw.max.z+.12),
  coast:new THREE.Vector3(center.x-size.x*1.25,.55,center.z+size.z*1.9)
 };
 const colors={facade:'#efd49b',balcony:'#d7bc84',coast:'#ffffff'};
 for(const key of Object.keys(points)){
  const local=points[key],world=new THREE.Vector3(-center.x*scale+local.x*scale,.76+(local.y-lo.y)*scale,-center.z*scale+local.z*scale);
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(key==='coast'?.2:.16,18,12),new THREE.MeshBasicMaterial({color:colors[key],toneMapped:false,depthTest:false}));mesh.position.copy(world);mesh.renderOrder=10;scene.add(mesh);
  const button=document.querySelector('[data-hotspot="'+key+'"]');hotspotObjects[key]={world,mesh,button};button.hidden=false
 }
}
function setupTower(object){
 const raw=new THREE.Box3().setFromObject(object),rawSize=raw.getSize(new THREE.Vector3()),center=raw.getCenter(new THREE.Vector3()),scale=12.2/rawSize.y;
 towerRoot=new THREE.Group();towerRoot.scale.setScalar(scale);towerRoot.position.set(-center.x*scale,.76-raw.min.y*scale,-center.z*scale);
 const stone=new THREE.MeshStandardMaterial({color:'#c9b99d',roughness:.8,metalness:.025});
 object.traverse(child=>{if(!child.isMesh)return;child.material=stone;child.castShadow=true;child.receiveShadow=true});
 towerRoot.add(object);scene.add(towerRoot);scene.remove(fallbackRoot);towerRoot.updateMatrixWorld(true);towerBounds=new THREE.Box3().setFromObject(towerRoot);modelSize=towerBounds.getSize(new THREE.Vector3());modelCenter=towerBounds.getCenter(new THREE.Vector3());
 addFacadeGlazing(towerBounds);
 createHotspots(raw,scale,center);loaderMessage.hidden=true;canvas.dataset.modelLoaded='true'
}
function poseFor(name){
 const c=modelCenter||new THREE.Vector3(0,6,0),s=modelSize||new THREE.Vector3(8,12,6),d=Math.max(s.x,s.y,s.z),narrow=camera.aspect<.82?1.2:1;
 if(name==='architecture')return {target:new THREE.Vector3(c.x,c.y+.35,c.z),position:new THREE.Vector3(c.x+d*1.52*narrow,c.y+d*.24,c.z+d*1.92*narrow)};
 if(name==='sea')return {target:new THREE.Vector3(c.x-3,c.y-.4,c.z-8),position:new THREE.Vector3(c.x-d*1.45*narrow,c.y+d*.24,c.z+d*1.65*narrow)};
 if(name==='closing')return {target:new THREE.Vector3(c.x,c.y-.6,c.z-4),position:new THREE.Vector3(c.x-d*.72*narrow,c.y+d*.32,c.z+d*2.75*narrow)};
 return {target:new THREE.Vector3(c.x,c.y-.1,c.z),position:new THREE.Vector3(c.x+d*.7*narrow,c.y+d*.38,c.z+d*2.48*narrow)}
}
function setView(name){
 manualPose=poseFor(name);viewButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
 exploring=false;controls.enabled=false;canvas.classList.remove('is-exploring');document.querySelector('#explore-toggle').setAttribute('aria-pressed','false');hotspotNote.hidden=true
}
function activateHotspot(key){
 const data={facade:{view:'architecture',message:'Gevelritme · raamvlakken en balkonzones uit het aangeleverde 3D-model.'},balcony:{view:'architecture',message:'Balkonzone · een nadere blik op de uitstekende vloerranden in de visualisatie.'},coast:{view:'sea',message:'Kustlijn · een scèneperspectief, geen bevestiging van het uitzicht vanuit de woning.'}}[key];
 setView(data.view);hotspotNote.textContent=data.message;hotspotNote.hidden=false
}
function placeHotspots(){
 const rect=canvas.getBoundingClientRect();if(!rect.width)return;
 for(const key of Object.keys(hotspotObjects)){const item=hotspotObjects[key],point=item.world.clone().project(camera),visible=point.z<1&&point.z>-1&&Math.abs(point.x)<1.08&&Math.abs(point.y)<1.08;item.button.hidden=!visible;if(visible){item.button.style.left=((point.x*.5+.5)*rect.width)+'px';item.button.style.top=((-point.y*.5+.5)*rect.height)+'px'}}
}
function progress(){const distance=experience.offsetHeight-innerHeight;return distance>0?clamp(-experience.getBoundingClientRect().top/distance,0,1):0}
function scrollPose(p){const t=clamp(p,0,1)*3,i=Math.min(2,Math.floor(t)),mix=smooth(t-i),keys=['overview','architecture','sea','closing'],a=poseFor(keys[i]),b=poseFor(keys[i+1]);return {position:a.position.clone().lerp(b.position,mix),target:a.target.clone().lerp(b.target,mix)}}
function renderFrame(time){
 raf=0;if(!running||document.hidden)return;const dt=Math.min(.05,Math.max(.001,(time-lastFrame)/1000));lastFrame=time;const p=progress(),chapter=Math.min(3,Math.floor(p*4));
 if(chapter!==activeChapter){activeChapter=chapter;chapterElements.forEach((el,i)=>el.classList.toggle('is-active',i===chapter));document.querySelector('#scene-chapter-number').textContent='0'+(chapter+1)+' / 04';document.querySelector('#scene-chapter-label').textContent=['Kustoverzicht','Architectuur','Zeezijde','Verder ontdekken'][chapter];if(!manualPose&&!exploring)viewButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===Math.min(chapter,2))))}
 if(!exploring){const goal=manualPose||scrollPose(p),ease=reducedMotion?1:1-Math.exp(-5.2*dt);camera.position.lerp(goal.position,ease);controls.target.lerp(goal.target,ease)}
 controls.update();if(time-lastWater>32){for(let i=0;i<waterPositions.count;i++){const x=waterPositions.getX(i),z=waterBase[i];waterPositions.setY(i,z+Math.sin(x*.12+time*.00065)*.16+Math.cos(z*.18-time*.00048)*.08)}waterPositions.needsUpdate=true;waterGeometry.computeVertexNormals();lastWater=time}
 placeHotspots();renderer.render(scene,camera);raf=requestAnimationFrame(renderFrame)
}
function setRunning(on){running=on&&!document.hidden;if(running&&!raf){lastFrame=performance.now();raf=requestAnimationFrame(renderFrame)}else if(!running&&raf){cancelAnimationFrame(raf);raf=0}}
function initScene(){
 try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:innerWidth>680,alpha:false,powerPreference:'high-performance'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<720?1.25:1.7));renderer.shadowMap.enabled=innerWidth>720;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();scene.background=new THREE.Color('#9dbdc3');scene.fog=new THREE.Fog('#a9c4c4',140,420);camera=new THREE.PerspectiveCamera(37,Math.max(.1,stage.clientWidth/stage.clientHeight),.1,800);camera.position.set(14,14,35);
  controls=new OrbitControls(camera,canvas);controls.target.set(0,6,0);controls.enableDamping=true;controls.dampingFactor=.065;controls.enablePan=false;controls.enableZoom=false;controls.minPolarAngle=.38;controls.maxPolarAngle=1.48;controls.minDistance=11;controls.maxDistance=65;controls.enabled=false;
  createSky();createCoast();fallbackRoot=makeFallbackTower(scene);
  new OBJLoader().load('assets/sunrise-tower.obj',setupTower,undefined,error=>{loaderMessage.hidden=true;console.warn('Het aangeleverde architectuurmodel kon niet worden geladen.',error)});
  const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<720?1.25:1.7))};new ResizeObserver(resize).observe(stage);resize();
  viewButtons.forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  document.querySelector('#explore-toggle').addEventListener('click',event=>{exploring=!exploring;manualPose=null;controls.enabled=exploring;canvas.classList.toggle('is-exploring',exploring);event.currentTarget.setAttribute('aria-pressed',String(exploring));viewButtons.forEach(b=>b.setAttribute('aria-pressed','false'));hotspotNote.hidden=true});
  document.querySelector('#reset-view').addEventListener('click',()=>{exploring=false;controls.enabled=false;canvas.classList.remove('is-exploring');setView('overview')});
  hotspotButtons.forEach(b=>b.addEventListener('click',()=>activateHotspot(b.dataset.hotspot)));
  let down=null;canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
  canvas.addEventListener('pointerup',e=>{if(!down)return;const moved=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(moved>6)return;const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(Object.values(hotspotObjects).map(o=>o.mesh),false)[0];if(hit){const item=Object.entries(hotspotObjects).find(entry=>entry[1].mesh===hit.object);if(item)activateHotspot(item[0])}});
  window.addEventListener('scroll',()=>{if(!exploring){manualPose=null;hotspotNote.hidden=true}},{passive:true});
  new IntersectionObserver(([entry])=>{stageVisible=entry.isIntersecting;setRunning(stageVisible)},{threshold:.01}).observe(stage);
  document.addEventListener('visibilitychange',()=>setRunning(stageVisible));
 }catch(error){canvas.hidden=true;fallback.hidden=false;loaderMessage.hidden=true;console.error('De 3D-kustscène kon niet worden gestart.',error)}
}
initScene();

const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.site-header nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Sluiten':'Menu';nav.classList.toggle('is-open',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu'}));
const hoverTextTargets='h1,h2,.chapter-kicker,.chapter-copy,.chapter-note,.eyebrow,.site-header nav a,.site-footer nav a,.section-intro>p,.gallery-copy>p,.location-copy>p,.contact-copy>p,.email-link,figcaption,.form-help';
document.querySelectorAll(hoverTextTargets).forEach(element=>{
 const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){
  if(!node.nodeValue.trim()||node.parentElement.closest('span'))continue;
  const fragment=document.createDocumentFragment();
  node.nodeValue.split(/(\s+)/).forEach(part=>{
   if(!part.trim()){fragment.append(document.createTextNode(part));return}
   const word=document.createElement('span');word.className='hover-word';word.textContent=part;fragment.append(word)
  });node.replaceWith(fragment)
 }
});
const revealTargets=[...document.querySelectorAll('.reveal')];
if(gsap&&ScrollTrigger&&!reducedMotion){
 revealTargets.forEach(el=>{
  const x=el.classList.contains('reveal-left')?-42:el.classList.contains('reveal-right')?42:0;
  const y=el.classList.contains('reveal-up')?32:12;
  el.classList.add('gsap-reveal');
  gsap.fromTo(el,{autoAlpha:0,x,y},{autoAlpha:1,x:0,y:0,duration:.95,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}})
 });
}else revealTargets.forEach(el=>el.classList.add('is-visible'));
const form=document.querySelector('#inquiry-form'),error=document.querySelector('#form-error'),status=document.querySelector('#form-status');
form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form),name=String(d.get('name')||'').trim(),email=String(d.get('email')||'').trim(),message=String(d.get('message')||'').trim(),okN=!!name,okE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),okM=!!message;form.elements.name.setAttribute('aria-invalid',String(!okN));form.elements.email.setAttribute('aria-invalid',String(!okE));form.elements.message.setAttribute('aria-invalid',String(!okM));if(!okN||!okE||!okM){error.hidden=false;status.textContent='';(!okN?form.elements.name:!okE?form.elements.email:form.elements.message).focus();return}error.hidden=true;const lines=['Naam: '+name,'E-mailadres: '+email,'Aankomst: '+(d.get('arrival')||'niet opgegeven'),'Vertrek: '+(d.get('departure')||'niet opgegeven'),'Aantal gasten: '+(d.get('guests')||'niet opgegeven'),'','Bericht:',message];status.textContent='Je e-mailprogramma wordt geopend. Verstuur het bericht daar om je aanvraag te verzenden.';location.href='mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent('Verblijfsaanvraag Zandvoort — '+name)+'&body='+encodeURIComponent(lines.join('\n'))});
form.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input',()=>el.setAttribute('aria-invalid','false')));
document.querySelector('#copy-email').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(CONTACT_EMAIL);e.currentTarget.textContent='E-mailadres gekopieerd'}catch{e.currentTarget.textContent=CONTACT_EMAIL}});
const lightbox=document.querySelector('#lightbox');document.querySelector('.image-open').addEventListener('click',()=>lightbox.showModal());document.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});
