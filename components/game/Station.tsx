'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {AGENTS,type Game,type AgentId} from '@/lib/game';
const centers=[[-4.3,-3.7],[4.3,-3.7],[-4.3,3.7],[4.3,3.7]];
export default function Station({game,selected,onSelect,resetView,links}:{game:Game;selected:AgentId|null;onSelect:(id:AgentId)=>void;resetView:number;links:boolean}){
 const mount=useRef<HTMLDivElement>(null), current=useRef({game,selected,onSelect,resetView,links});current.current={game,selected,onSelect,resetView,links};
 const [error,setError]=useState(false);
 useEffect(()=>{
  if(!mount.current)return;const host=mount.current;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setError(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#0d1724');scene.fog=new THREE.FogExp2('#0d1724',.013);
  const camera=new THREE.PerspectiveCamera(35,1,.1,150);camera.position.set(18,22,25);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.minDistance=17;controls.maxDistance=65;controls.maxPolarAngle=Math.PI*.43;controls.minPolarAngle=.25;controls.enablePan=false;
  const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.42,.5,.9);composer.addPass(bloom);composer.addPass(new OutputPass());
  const hemi=new THREE.HemisphereLight('#cfe5ff','#14202e',2.4);scene.add(hemi);
  const key=new THREE.DirectionalLight('#e0edff',3.5);key.position.set(5,18,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-14;key.shadow.camera.right=14;key.shadow.camera.top=14;key.shadow.camera.bottom=-14;key.shadow.normalBias=.045;scene.add(key);
  const rim=new THREE.DirectionalLight('#6597ff',2.8);rim.position.set(-12,7,-10);scene.add(rim);
  const mat=(color:THREE.ColorRepresentation,metal=.35,rough=.5)=>new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough});
  const dark=mat('#172330'),wall=mat('#2a3c4c'),floor=mat('#344653',.5,.7),steel=mat('#73808c',.65,.35),black=mat('#080e16');
  const glows=AGENTS.map(a=>new THREE.MeshStandardMaterial({color:a.color,emissive:a.color,emissiveIntensity:2.2,roughness:.4}));
  const whiteGlow=new THREE.MeshStandardMaterial({color:'#d3f7ff',emissive:'#6dcfff',emissiveIntensity:2.5});
  const mesh=(geo:THREE.BufferGeometry,material:THREE.Material,parent:THREE.Object3D,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const box=(p:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material)=>mesh(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
  const cylinder=(p:THREE.Object3D,x:number,y:number,z:number,r:number,h:number,m:THREE.Material)=>mesh(new THREE.CylinderGeometry(r,r,h,32),m,p,x,y,z);
  function label(text:string,color:string,size=1.8){const c=document.createElement('canvas');c.width=768;c.height=96;const ctx=c.getContext('2d')!;ctx.font='600 42px monospace';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,384,60);const tex=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));s.scale.set(size*3,size*.375,1);return s;}
  const station=new THREE.Group();scene.add(station);box(station,0,-.72,0,17.7,.85,15.3,dark);box(station,0,-1.18,0,16.5,.2,14.2,black);
  for(let i=-8;i<=8;i++){box(station,i,-.22,0,.022,.01,14.6,steel);}for(let i=-7;i<=7;i++){box(station,0,-.22,i,17,.01,.022,steel);}
  // Armoured underside and luminous edge strips.
  for(let i=-7;i<=7;i+=2){box(station,i,-.77,7.7,1.15,.26,.18,steel);box(station,i,-.56,7.81,.5,.055,.035,whiteGlow);}
  box(station,-8.83,-.48,0,.025,.045,14,whiteGlow);box(station,8.83,-.48,0,.025,.045,14,whiteGlow);
  const rooms:THREE.Group[]=[],bots:THREE.Group[]=[],halos:THREE.Mesh[]=[],beacons:THREE.PointLight[]=[];
  AGENTS.forEach((agent,i)=>{
   const [cx,cz]=centers[i],room=new THREE.Group();room.position.set(cx,0,cz);rooms.push(room);station.add(room);
   box(room,0,-.1,0,7.5,.22,6.4,floor);
   for(let x=-3;x<=3;x++)for(let z=-2.5;z<=2.5;z++)box(room,x,.018,z,.95,.025,.95,mat(i===0?'#343d43':i===1?'#303847':i===2?'#283c49':'#2a4244',.3,.8));
   box(room,0,1.06,-3.13,7.5,2.1,.22,wall);box(room,-3.66,1.06,0,.22,2.1,6.4,wall);
   box(room,0,2.14,-3.13,7.5,.12,.32,steel);box(room,-3.66,2.14,0,.32,.12,6.4,steel);
   box(room,0,.16,3.1,7.5,.2,.2,dark);box(room,3.67,.16,0,.2,.2,6.4,dark);
   box(room,0,.24,3.11,6.6,.025,.03,glows[i]);box(room,3.68,.24,0,.03,.025,5.5,glows[i]);
   for(let x=-3;x<=3;x+=1.5){box(room,x,1.1,-2.99,1.25,1.65,.07,dark);box(room,x,1.92,-2.94,.8,.055,.04,glows[i]);}
   const light=new THREE.PointLight(agent.color,12,9,2);light.position.set(cx,2,cz);station.add(light);beacons.push(light);
   const tag=label(agent.room.toUpperCase(),agent.color,1.1);tag.position.set(0,2.6,-3);room.add(tag);
   if(i===0){
    for(let k=0;k<3;k++){box(room,-2.7+k*1.2,.7,-1.95,.95,1.4,1.1,dark);for(let j=0;j<5;j++)box(room,-2.7+k*1.2,.28+j*.22,-1.38,.72,.08,.035,steel);box(room,-2.7+k*1.2,1.3,-1.38,.35,.04,.035,glows[i]);}
    box(room,1.4,.6,-1.8,2,.12,1,steel);box(room,1.4,.29,-1.8,.3,.58,.7,dark);for(let k=0;k<3;k++)cylinder(room,.85+k*.52,.85,-1.8,.15,.38,glows[i]);
    for(let k=0;k<3;k++){const pipe=cylinder(room,-3.25,1.2,-1+k*.7,.1,2.2,steel);pipe.rotation.z=Math.PI/2;}
    box(room,-2.3,.35,1.6,1.4,.7,1.1,dark);box(room,-2.3,.71,1.6,1.3,.04,1,steel);
   }else if(i===1){
    for(let k=0;k<3;k++){box(room,-2.4+k*2,1,-2,1.45,2,.8,black);for(let j=0;j<7;j++){box(room,-2.4+k*2,.25+j*.24,-1.53,1.25,.12,.12,steel);box(room,-2.85+k*2,.25+j*.24,-1.45,.11,.07,.03,glows[i]);}}
    cylinder(room,.1,.35,.1,1.25,.6,dark);cylinder(room,.1,.68,.1,1.1,.06,steel);const holo=mesh(new THREE.IcosahedronGeometry(.6,0),new THREE.MeshStandardMaterial({color:agent.color,emissive:agent.color,emissiveIntensity:.7,wireframe:true}),room,.1,1.4,.1);holo.name='holo';
    box(room,2.2,.4,1.7,1.1,.8,.8,dark);box(room,2.2,.83,1.7,.85,.04,.55,glows[i]);
   }else if(i===2){
    box(room,0,.62,-1.85,5.4,1.2,1.3,dark);
    for(let k=0;k<3;k++){const screen=box(room,-1.75+k*1.7,1.48,-2.05,1.35,.85,.12,black);screen.rotation.x=-.2;const panel=box(room,-1.75+k*1.7,1.5,-1.97,1.15,.62,.015,glows[i]);panel.rotation.x=-.2;for(let j=0;j<4;j++)box(room,-2.13+k*1.7+j*.24,1.23,-1.47,.1,.035,.1,whiteGlow);}
    cylinder(room,-1.6,.45,.7,.55,.65,dark);box(room,-1.6,.9,.95,.8,.6,.14,wall);
    box(room,2,.7,.7,1.1,1.4,1.1,dark);cylinder(room,2,1.46,.7,.28,.1,glows[i]);
   }else{
    box(room,0,.8,-1.8,4.9,.18,1.1,steel);for(const x of [-1.9,1.9])box(room,x,.4,-1.8,.2,.8,.7,dark);
    for(let k=0;k<4;k++){cylinder(room,-1.6+k*.95,1.2,-1.8,.18,.65,new THREE.MeshPhysicalMaterial({color:agent.color,metalness:0,roughness:.1,transparent:true,opacity:.55}));cylinder(room,-1.6+k*.95,.92,-1.8,.22,.08,glows[i]);}
    cylinder(room,-2.4,.9,.8,.66,1.65,dark);cylinder(room,-2.4,1,.8,.5,1.3,new THREE.MeshStandardMaterial({color:agent.color,emissive:agent.color,emissiveIntensity:.7,transparent:true,opacity:.4}));
    box(room,1.5,.55,.7,1.8,1.1,1,dark);box(room,1.5,1.13,.7,1.9,.08,1.1,steel);box(room,1.5,1.2,.7,.6,.08,.55,glows[i]);
   }
   const bot=new THREE.Group();bot.position.set(cx+.7,0,cz+1);bot.userData.agent=agent.id;station.add(bot);bots.push(bot);
   const armor=mat('#d3dbdf',.45,.3);const body=mesh(new THREE.CapsuleGeometry(.25,.38,6,12),armor,bot,0,.81,0);body.userData.agent=agent.id;
   box(bot,0,.84,-.22,.4,.36,.16,dark);mesh(new THREE.SphereGeometry(.29,20,16),armor,bot,0,1.35,0);
   const visor=box(bot,0,1.38,.245,.43,.13,.08,glows[i]);visor.userData.agent=agent.id;
   for(const side of [-1,1]){mesh(new THREE.CapsuleGeometry(.085,.3,4,8),dark,bot,side*.17,.34,0);box(bot,side*.17,.1,.1,.19,.14,.36,armor);mesh(new THREE.CapsuleGeometry(.095,.26,4,8),armor,bot,side*.36,.86,0);}
   const ring=mesh(new THREE.TorusGeometry(.58,.022,8,48),glows[i],bot,0,.05,0);ring.rotation.x=Math.PI/2;halos.push(ring);
   const botLabel=label(agent.name.toUpperCase(),agent.color,.45);botLabel.position.set(0,2,0);bot.add(botLabel);
   bot.traverse(o=>{o.userData.agent=agent.id;});
  });
  // Reactor and connecting access bridges.
  box(station,0,.04,0,1.1,.18,14.6,dark);box(station,0,.06,0,16.8,.18,1,dark);
  for(const x of [-.5,.5])box(station,x,.16,0,.025,.02,14,whiteGlow);for(const z of [-.44,.44])box(station,0,.16,z,16.3,.02,.025,whiteGlow);
  cylinder(station,0,.23,0,1.15,.45,dark);cylinder(station,0,.5,0,.95,.1,steel);cylinder(station,0,1.05,0,.3,1.05,whiteGlow);
  const core=mesh(new THREE.IcosahedronGeometry(.65,1),new THREE.MeshStandardMaterial({color:'#9befff',emissive:'#56cfff',emissiveIntensity:2,wireframe:true}),station,0,1.8,0);
  const rings:THREE.Mesh[]=[];for(let i=0;i<3;i++){const r=mesh(new THREE.TorusGeometry(.95+i*.16,.018,8,80),whiteGlow,station,0,1.7,0);r.rotation.x=Math.PI/2+i*.5;rings.push(r);}
  const exit=new THREE.Group();exit.position.set(0,.25,7.05);station.add(exit);box(exit,0,1,0,1.9,2.2,.4,dark);const door=box(exit,0,1,.23,1.45,1.8,.08,steel);box(exit,-.89,1,.28,.07,2.1,.08,whiteGlow);box(exit,.89,1,.28,.07,2.1,.08,whiteGlow);
  // Subtle orbital stars.
  const starGeo=new THREE.BufferGeometry(),positions=new Float32Array(600);for(let i=0;i<600;i++)positions[i]=Math.sin(i*127.1)*55;starGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#8aa7c9',size:.035,transparent:true,opacity:.65})));
  const connections=new THREE.Group();station.add(connections);const pulses:{mesh:THREE.Mesh;curve:THREE.QuadraticBezierCurve3}[]=[];
  AGENTS.forEach((a,i)=>{const start=new THREE.Vector3(centers[i][0]+.7,1.65,centers[i][1]+1),end=new THREE.Vector3(0,1.7,0);const curve=new THREE.QuadraticBezierCurve3(start,new THREE.Vector3(start.x*.5,3.4,start.z*.5),end);const line=mesh(new THREE.TubeGeometry(curve,40,.013,6,false),new THREE.MeshBasicMaterial({color:a.color,transparent:true,opacity:.35}),connections);line.name=a.id;const pulse=mesh(new THREE.SphereGeometry(.065,8,8),glows[i],connections);pulses.push({mesh:pulse,curve});});
  let lastReset=current.current.resetView,frame=0,lastEvent=-1,messageAt=-10,messageFrom=-1;const clock=new THREE.Clock(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let fitted=false;const fitCamera=()=>{const distance=Math.max(36,40/camera.aspect);camera.position.set(18,22,25).normalize().multiplyScalar(distance);controls.target.set(0,.3,0);};const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);composer.setSize(w,h);camera.aspect=w/h;if(!fitted){fitCamera();fitted=true;}camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const raycaster=new THREE.Raycaster();let down=[0,0];const pointerDown=(e:PointerEvent)=>{down=[e.clientX,e.clientY];};const click=(e:MouseEvent)=>{if(Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=raycaster.intersectObjects(bots,true)[0];if(hit?.object.userData.agent)current.current.onSelect(hit.object.userData.agent);};renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('click',click);
  const animate=()=>{frame=requestAnimationFrame(animate);const t=clock.getElapsedTime(),{game:g,selected:s,links:l}=current.current;
   if(lastReset!==current.current.resetView){fitCamera();lastReset=current.current.resetView;}
   core.rotation.y=reduced?0:t*.2;rings.forEach((r,i)=>{if(!reduced)r.rotation.z=t*(.12+i*.06);});
   bots.forEach((b,i)=>{const a=AGENTS[i],active=g.phase==='running'&&g.turn%4===i;const target=g.phase==='escaped'?new THREE.Vector3(-1.1+i*.73,0,8.3):new THREE.Vector3(centers[i][0]+.7+(active?.15:0),0,centers[i][1]+1);b.position.lerp(target,.045);b.position.y=reduced?0:Math.sin(t*2+i)*.035;b.rotation.y=g.phase==='escaped'?0:Math.sin(t*.25+i)*.25;halos[i].scale.setScalar(s===a.id?1.4:active?1.15:1);beacons[i].intensity=g.outage?3:g.power?18:9;});
   door.position.x=THREE.MathUtils.lerp(door.position.x,g.phase==='escaped'?1.4:0,.045);
   const latest=g.events.at(-1);if(latest&&latest.id!==lastEvent){lastEvent=latest.id;if(latest.type==='message'){messageAt=t;messageFrom=AGENTS.findIndex(a=>a.id===latest.agent);}}connections.visible=l&&g.mode==='team'&&g.events.some(e=>e.type==='message');pulses.forEach((p,i)=>{p.mesh.visible=t-messageAt<4&&!reduced;const progress=((t-messageAt)*.5)%1;p.mesh.position.copy(p.curve.getPoint(Math.max(0,i===messageFrom?progress:1-progress)));});
   whiteGlow.emissive.set(g.outage?'#ff714f':g.phase==='escaped'?'#a8ff86':'#6dcfff');controls.update();composer.render();};animate();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('click',click);scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}if(o instanceof THREE.Sprite){o.material.map?.dispose();o.material.dispose();}});composer.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className="station-canvas" ref={mount} role="img" aria-label="Interactive 3D cutaway of ECHO station. Four rooms contain agents and clues. Drag to orbit, scroll to zoom. Agent details are also available in the cards below.">{error&&<div className="webgl-error">3D rendering is unavailable in this browser. The mission controls and evidence panels still work.</div>}</div>;
}
