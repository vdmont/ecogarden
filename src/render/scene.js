(function(root){
'use strict';
class GardenView{
 constructor(canvas,onPick,onDrag,isPainting,onStrokeEnd){
  this.canvas=canvas;this.onPick=onPick;this.onDrag=onDrag;this.isPainting=isPainting;this.onStrokeEnd=onStrokeEnd;this.world=null;this.focus=null;this.panMode=false;this.dirty=true;this.lastTick=-1;this.yaw=.72;this.zoom=1;this.targetZoom=1;this.look=new THREE.Vector3();this.targetLook=new THREE.Vector3();this.lastDraw=0;this.selected=-1;this.showLabels=true;
  this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});this.renderer.outputEncoding=THREE.sRGBEncoding;this.renderer.setClearColor(0x000000,0);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.scene=new THREE.Scene();this.scene.add(new THREE.HemisphereLight(0xe9fff4,0x6c6654,.9));
  this.sun=new THREE.DirectionalLight(0xffefce,.9);this.sun.position.set(-12,30,18);this.sun.castShadow=true;this.sun.shadow.mapSize.set(1024,1024);Object.assign(this.sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:.1,far:100});this.sun.shadow.bias=-.0012;this.sun.shadow.normalBias=.025;this.scene.add(this.sun);
  this.camera=new THREE.OrthographicCamera(-12,12,12,-12,1,110);this.box=new THREE.BoxGeometry(1,1,1);this.dummy=new THREE.Object3D();this.color=new THREE.Color();
  this.mesh=this.makeMesh(this.box,new THREE.MeshLambertMaterial({color:0xffffff}),60000);this.scene.add(this.mesh);this.animals=this.makeMesh(this.box,new THREE.MeshLambertMaterial({color:0xffffff}),50000);this.scene.add(this.animals);this.motion=new WeakMap();this.lastAnimalFrame=0;
  this.ringsG=new THREE.RingGeometry(.29,.34,24);this.ringsG.rotateX(-Math.PI/2);this.rings=this.makeMesh(this.ringsG,new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}),1800);this.scene.add(this.rings);this.flames=this.makeMesh(new THREE.ConeGeometry(1,1,5),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.66,depthWrite:false}),9000);this.flames.castShadow=false;this.scene.add(this.flames);this.fireCores=this.makeMesh(this.flames.geometry,new THREE.MeshBasicMaterial({color:0xffffff}),4500);this.fireCores.castShadow=false;this.scene.add(this.fireCores);this.waterfalls=this.makeMesh(this.box,new THREE.MeshBasicMaterial({color:0xffffff}),10000);this.waterfalls.castShadow=false;this.scene.add(this.waterfalls);
  this.cursor=new THREE.Mesh(new THREE.BoxGeometry(1,.04,1),new THREE.MeshBasicMaterial({color:0xffe4a2,transparent:true,opacity:.55}));this.cursor.visible=false;this.scene.add(this.cursor);
  this.ray=new THREE.Raycaster();this.plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);this.hit=new THREE.Vector3();this.labels=[];this.labelRoot=document.getElementById('worldLabels');
  this.pointers=new Map();this.bind();this.resize();window.addEventListener('resize',()=>this.resize());
 }
 makeMesh(g,m,n){let mesh=new THREE.InstancedMesh(g,m,n);mesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(n*3).fill(1),3);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.count=0;return mesh;}
 put(mesh,x,y,z,w,h,d,color,ry=0,rz=0){let n=mesh.count++;if(n>=mesh.instanceMatrix.count)throw Error('模型实例超过预算');this.dummy.position.set(x,y,z);this.dummy.rotation.set(0,ry,rz);this.dummy.scale.set(w,h,d);this.dummy.updateMatrix();mesh.setMatrixAt(n,this.dummy.matrix);this.color.setHex(color).convertSRGBToLinear();mesh.setColorAt(n,this.color);}
 boxAt(x,y,z,w,h,d,color,ry=0,rz=0){this.put(this.mesh,x,y,z,w,h,d,color,ry,rz);}
 setWorld(s){
  this.world=s;this.dirty=true;this.lastTick=-1;this.motion=new WeakMap();this.focus=null;this.selected=-1;this.hover=-1;this.zoom=this.targetZoom=1;this.look.set(0,0,0);this.targetLook.set(0,0,0);
  if(this.cliff){this.scene.remove(this.cliff);this.cliff.material.dispose();this.cliff.dispose?.();}
  this.cliff=this.makeMesh(this.box,new THREE.MeshLambertMaterial({color:0xffffff}),s.cells.length*2);
  s.cells.forEach((c,i)=>{if(!c)return;let x=i%s.w-s.w/2+.5,z=Math.floor(i/s.w)-s.h/2+.5,u=x/(s.w/2),v=z/(s.h/2),r=Math.min(1,Math.pow(Math.abs(u)**3.5+Math.abs(v)**3.5,1/3.5)),d=1.1+3*(1-r)+.28*Math.sin(x*.9+z*.7);this.put(this.cliff,x,-.35,z,1,.65,1,0x8d7659);this.put(this.cliff,x,-.65-d/2,z,1,d,1,[0x7e8173,0x8e8c78,0x99927a][Math.abs(Math.floor(x/4+z/3))%3]);});
  this.cliff.instanceMatrix.needsUpdate=true;this.cliff.instanceColor.needsUpdate=true;this.scene.add(this.cliff);this.resize();this.draw(0);
 }
 resize(){let r=this.canvas.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,this.quality==='high'?2:1.5));this.renderer.setSize(w,h,false);this.width=w;this.height=h;this.updateCamera(1);}
 setQuality(q){this.quality=q;this.renderer.shadowMap.enabled=q!=='low';this.resize();}
 updateCamera(k){if(!this.world)return;this.zoom+=(this.targetZoom-this.zoom)*k;this.look.lerp(this.targetLook,k);let a=this.width/this.height,extent=Math.max(this.world.w*.65/Math.max(.65,a),this.world.h*.73,8)*this.zoom;
  this.camera.left=-extent*a;this.camera.right=extent*a;this.camera.top=extent;this.camera.bottom=-extent;this.camera.updateProjectionMatrix();this.camera.position.set(this.look.x+Math.sin(this.yaw)*45,36+this.look.y,this.look.z+Math.cos(this.yaw)*45);this.camera.lookAt(this.look);this.camera.updateMatrixWorld();}
 screenCell(i){if(!this.world?.cells[i])return null;const r=this.canvas.getBoundingClientRect(),v=new THREE.Vector3(i%this.world.w-this.world.w/2+.5,Eco.surfaceHeight(this.world.cells[i])+.2,Math.floor(i/this.world.w)-this.world.h/2+.5).project(this.camera);return {x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};}
 focusCell(i){if(!this.world?.cells[i])return;this.focus=i;this.targetLook.set(i%this.world.w-this.world.w/2+.5,Eco.surfaceHeight(this.world.cells[i])+.3,Math.floor(i/this.world.w)-this.world.h/2+.5);this.targetZoom=Math.max(.14,Math.min(.28,5/this.world.w));}
 pan(dx,dy){if(!this.world)return;const factor=(this.camera.top-this.camera.bottom)/Math.max(1,this.height);this.targetLook.x+=(-dx*Math.cos(this.yaw)-dy*Math.sin(this.yaw))*factor;this.targetLook.z+=(dx*Math.sin(this.yaw)-dy*Math.cos(this.yaw))*factor;this.targetLook.x=Math.max(-this.world.w/2,Math.min(this.world.w/2,this.targetLook.x));this.targetLook.z=Math.max(-this.world.h/2,Math.min(this.world.h/2,this.targetLook.z));this.focus=null;}
 overview(){this.focus=null;this.targetLook.set(0,0,0);this.targetZoom=1;}
 pick(cx,cy){if(!this.world)return -1;let r=this.canvas.getBoundingClientRect(),v=new THREE.Vector2((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);this.ray.setFromCamera(v,this.camera);if(!this.ray.ray.intersectPlane(this.plane,this.hit))return -1;let x=Math.floor(this.hit.x+this.world.w/2),y=Math.floor(this.hit.z+this.world.h/2);return x>=0&&y>=0&&x<this.world.w&&y<this.world.h&&this.world.cells[y*this.world.w+x]?y*this.world.w+x:-1;}
 bind(){
  let dragging=false,start=null,pinch=0,angle=0,mode='rotate',painted=false,visited=new Set();const c=this.canvas;
  const paintLine=(from,to)=>{let distance=Math.hypot(to[0]-from[0],to[1]-from[1]),steps=Math.max(1,Math.ceil(distance/5));for(let k=0;k<=steps;k++){let i=this.pick(from[0]+(to[0]-from[0])*k/steps,from[1]+(to[1]-from[1])*k/steps);if(i>=0&&!visited.has(i)){visited.add(i);this.onPick(i,true);painted=true;}}};
  c.addEventListener('pointerdown',e=>{c.setPointerCapture?.(e.pointerId);this.pointers.set(e.pointerId,[e.clientX,e.clientY]);if(this.pointers.size===1){start=[e.clientX,e.clientY];dragging=false;painted=false;visited.clear();mode=e.button===1||e.shiftKey||this.panMode?'pan':e.button!==0||!this.isPainting?.()?'rotate':'paint';}else{dragging=true;mode='pinch';let a=[...this.pointers.values()];pinch=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);angle=Math.atan2(a[1][1]-a[0][1],a[1][0]-a[0][0]);}});
  c.addEventListener('pointermove',e=>{let p=this.pointers.get(e.pointerId);if(p){const oldPoints=[...this.pointers.values()],oldCenter=oldPoints.length>1?[(oldPoints[0][0]+oldPoints[1][0])/2,(oldPoints[0][1]+oldPoints[1][1])/2]:null;let q=[e.clientX,e.clientY],dx=q[0]-p[0];this.pointers.set(e.pointerId,q);if(this.pointers.size===1&&mode!=='pinch'){let begun=!dragging&&start&&Math.hypot(q[0]-start[0],q[1]-start[1])>9;if(begun)dragging=true;if(dragging){if(mode==='paint')paintLine(begun?start:p,q);else if(mode==='pan')this.pan(dx,q[1]-p[1]);else{this.yaw-=dx*.008;this.onDrag?.();}}}else if(this.pointers.size>1){let a=[...this.pointers.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),next=Math.atan2(a[1][1]-a[0][1],a[1][0]-a[0][0]);if(oldCenter)this.pan((a[0][0]+a[1][0])/2-oldCenter[0],(a[0][1]+a[1][1])/2-oldCenter[1]);if(pinch>0&&d>0)this.targetZoom=Math.max(.14,Math.min(1.8,this.targetZoom*pinch/d));let delta=next-angle;if(delta>Math.PI)delta-=2*Math.PI;if(delta<-Math.PI)delta+=2*Math.PI;this.yaw-=delta;pinch=d;angle=next;}}
   this.hover=this.pick(e.clientX,e.clientY);
  });
  c.addEventListener('pointerup',e=>{let single=this.pointers.size===1;this.pointers.delete(e.pointerId);if(single&&!dragging&&start&&e.button===0&&mode!=='pan')this.onPick(this.pick(e.clientX,e.clientY));if(this.pointers.size===0){if(painted)this.onStrokeEnd?.();start=null;dragging=false;pinch=0;visited.clear();}});
  c.addEventListener('pointercancel',e=>{this.pointers.delete(e.pointerId);if(painted)this.onStrokeEnd?.();painted=false;dragging=true;start=null;});c.addEventListener('lostpointercapture',()=>{if(painted&&this.pointers.size===0){painted=false;}});
  c.addEventListener('wheel',e=>{e.preventDefault();this.targetZoom=Math.max(.14,Math.min(1.8,this.targetZoom*(e.deltaY>0?1.1:.9)));},{passive:false});c.addEventListener('contextmenu',e=>e.preventDefault());
 }
 draw(t){if(!this.world)return;let s=this.world,m=this.mesh;m.count=0;this.rings.count=0;let labelList=[];const b=(...args)=>this.boxAt(...args);
  s.cells.forEach((c,i)=>{if(!c)return;let x=i%s.w-s.w/2+.5,z=Math.floor(i/s.w)-s.h/2+.5,phase=0,variant=c.variant||0,wet=c.moist>=.6;
   let ground=c.ground==='ash'?0x7f756a:c.moist>=.6?0x9c9a6b:0xb7a57c;b(x,0,z,1,.1,1,ground);
   if(['water','spring'].includes(c.ground)){b(x,.07,z,1,.12,1,c.ground==='spring'?0x53a9b5:0x71b3c2);if(i%3===0)b(x-.1,.14,z,.5,.025,.07,0xc2e4df);}
   if(c.ground==='rock'){b(x,.26,z,.76,.52,.7,0x8c9490);b(x-.12,.57,z+.03,.48,.16,.5,0xb3b6a6);}
   if(c.ground==='mountain'){const elevation=c.elevation||1.8;for(let h=0;h<4;h++)b(x,(h+.5)*elevation/4,z,1-h*.16,elevation/4,1-h*.16,h===3&&elevation>1.7?0xe2ece4:0x8b9893);}
   GardenModels.plants({b,c,i,x,z,variant,wet,labelList});
   if(c.ground==='ash'&&!c.plant&&c.ash>0&&i%3===0)b(x,.18,z,.25,.15,.16,0x9a8e86);

  });
  if(this.showLabels){for(const [i,txt,col,y] of labelList)if(['种','虫','鸟','蝶'].includes(txt))this.put(this.rings,i%s.w-s.w/2+.5,.16,Math.floor(i/s.w)-s.h/2+.5,1,1,1,col);}
  this.labelData=labelList;m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;this.rings.instanceMatrix.needsUpdate=true;this.rings.instanceColor.needsUpdate=true;this.flames.instanceMatrix.needsUpdate=true;this.flames.instanceColor.needsUpdate=true;this.fireCores.instanceMatrix.needsUpdate=true;this.fireCores.instanceColor.needsUpdate=true;this.lastDraw=t;this.dirty=false;this.lastTick=s.tick;
 }
 drawAnimals(t){if(!this.world)return;const s=this.world,m=this.animals;m.count=0;const b=(...args)=>this.put(m,...args),labelList=[],dt=Math.min(60,Math.max(0,t-this.lastAnimalFrame)),blend=1-Math.exp(-dt/130);this.lastAnimalFrame=t;
  s.cells.forEach((c,i)=>{if(!c?.animal)return;let x=i%s.w-s.w/2+.5,z=Math.floor(i/s.w)-s.h/2+.5,phase=Math.sin(t*.005+(c.animal.variant||0)*1.3);
   if(c.animal){let a=c.animal,state=this.motion.get(a);if(!state){state={x,z,y:Eco.surfaceHeight(c),yaw:a.dir||0,pet:0,heart:0,phase:(a.variant||0)*1.3};this.motion.set(a,state);}const distance=Math.hypot(x-state.x,z-state.z);state.y+=(Eco.surfaceHeight(c)-state.y)*blend;state.phase+=dt*.004;state.x+=(x-state.x)*blend;state.z+=(z-state.z)*blend;let turn=(a.dir||0)-state.yaw;turn=Math.atan2(Math.sin(turn),Math.cos(turn));state.yaw+=turn*blend;x=state.x;z=state.z;
    if(a.petUntil>s.tick&&(a.petUntil||0)>state.pet){state.pet=a.petUntil;state.heart=t+2200;}
    let bob=state.y+(a.sleep||a.type==='bug'?0:Math.sin(state.phase)*.014),yaw=state.yaw;
    if(state.heart>t){let rise=1-(state.heart-t)/2200,hy=2+rise*.5,col=0xe698a4;for(const[dx,dy]of [[-.1,.09],[.1,.09],[0,-.03]])b(x+dx,hy+dy,z,.18,.18,.12,col);}
    const part=(dx,y,dz,w,h,d,col,tilt=0)=>{let xx=dx*Math.cos(yaw)+dz*Math.sin(yaw),zz=-dx*Math.sin(yaw)+dz*Math.cos(yaw);b(x+xx,y+bob,z+zz,w,h,d,GardenPalette.animalColor(col,a.type,a.variant||0),yaw,tilt);};
    GardenModels.animals({a,part,phase,t,i,labelList});
   }
  });m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;
 }
 drawEffects(t){const s=this.world;if(!s)return;this.flames.count=0;this.fireCores.count=0;this.waterfalls.count=0;const b=(...args)=>this.put(this.waterfalls,...args);s.cells.forEach((c,i)=>{if(!c)return;const x=i%s.w-s.w/2+.5,z=Math.floor(i/s.w)-s.h/2+.5;
   if(c.fire){
    b(x,.12,z,.62,.14,.21,0x5e4e40,.5);b(x,.13,z,.23,.15,.62,0x6f5540,-.35);
    for(let k=0;k<3;k++){let flicker=Math.sin(t*.006+i*1.7+k*2),dx=(k-1)*.18,dz=k===1?-.08:.08,h=.55+(k===1?.27:0)+flicker*.09;
     this.put(this.flames,x+dx,.19+h*.48,z+dz,.22,h,.2,0xe47a3c,0,flicker*.1);
     this.put(this.fireCores,x+dx,.18+h*.25,z+dz+.02,.13,h*.55,.12,0xffd786,0,flicker*.08);
    }
    for(let k=0;k<2;k++){let rise=((t*.0007+i*.21+k*.47)%1);b(x+Math.sin(i+k+t*.001)*.13,.8+rise*.48,z+.05,.035,.065*(1-rise)+.025,.035,0xffd58b);}
   }

 if(['water','spring'].includes(c.ground)){for(const[dx,dz]of [[-1,0],[1,0],[0,-1],[0,1]]){const xx=i%s.w+dx,zz=Math.floor(i/s.w)+dz;if(xx>=0&&zz>=0&&xx<s.w&&zz<s.h&&s.cells[zz*s.w+xx])continue;const depth=2.6;b(x+dx*.51,-depth/2,z+dz*.51,dx?.14:1.01,depth,dz?.14:1.01,0x70bac9);for(let k=0;k<4;k++){const fall=(t*.00035+k/4+i*.11)%1;b(x+dx*.59+(dz?(k-1.5)*.14:0),-fall*depth,z+dz*.59+(dx?(k-1.5)*.14:0),dx?.035:.08,.23,dz?.035:.08,0xc9edf0);}for(let k=0;k<3;k++){const drop=(t*.00025+k*.33)%1;b(x+dx*(.53+drop*.12),-depth-drop*.6,z+dz*(.53+drop*.12),.07*(1-drop)+.015,.14,.07*(1-drop)+.015,0xc7e4e5);}}
 }});for(const m of [this.waterfalls,this.flames,this.fireCores]){m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;}}
 updateLabels(){for(const label of this.labels)label.hidden=true;}
 render(t){if(!this.world)return;if(this.followAnimal&&this.focus!==null){const state=this.motion.get(this.followAnimal);if(state)this.targetLook.set(state.x,state.y+.3,state.z);}this.updateCamera(.1);if(this.dirty||this.lastTick!==this.world.tick)this.draw(t);this.drawAnimals(t);this.drawEffects(t);let i=this.hover>=0?this.hover:this.selected;this.cursor.visible=i>=0&&!!this.world.cells[i];if(this.cursor.visible)this.cursor.position.set(i%this.world.w-this.world.w/2+.5,.19+Eco.surfaceHeight(this.world.cells[i]),Math.floor(i/this.world.w)-this.world.h/2+.5);this.updateLabels();this.renderer.render(this.scene,this.camera);}
}
root.GardenView=GardenView;
})(globalThis);
