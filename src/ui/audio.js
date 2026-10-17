// Original pentatonic music and quiet synthesized animal calls; no external downloads.
(function(root){let ctx,master,timer,beat=0,next=0,settings={},active=false;
function tone(f,t,d,v=.08,type='sine',end=f){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(25,end),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(master);o.start(t);o.stop(t+d+.02);o.onended=()=>{o.disconnect();g.disconnect();};}
const phrases=[
 [0,4,7,-1,9,7,4,2],[4,7,12,9,-1,7,4,2],[2,7,9,7,4,-1,2,0],[0,2,4,7,4,2,-1,0],
 [9,12,14,-1,12,9,7,4],[7,9,12,7,-1,4,2,4],[4,2,0,2,7,4,-1,2],[2,4,7,4,2,0,-1,-1]];
function musicStep(index){const beat=index%128,phrase=phrases[Math.floor(beat/8)%8],note=phrase[beat%8];return {note:note<0?-1:note+(beat>=64&&Math.floor(beat/8)%2===0?12:0),duration:[.48,.72,.48,.6,.72,.48,.6,.84][beat%8],bass:[130.81,110,174.61,146.83,130.81,164.81,146.83,130.81][Math.floor(beat/16)]};}
function schedule(){if(!ctx||ctx.state!=='running'||document.hidden||!active||settings.music===false)return;while(next<ctx.currentTime+.3){const {note,duration,bass}=musicStep(beat);if(note>=0)tone(261.63*2**(note/12),next,beat%8===7?1.8:.9,.032);if(beat%4===0){tone(bass,next,2.3,.022);tone(bass*1.5,next+.12,1.8,.01);}if(beat%8===3)tone(bass*2,next+.08,.5,.008,'triangle');beat++;next+=duration;}}
function unlock(s){settings=s||settings;active=true;try{ctx??=new(window.AudioContext||window.webkitAudioContext)();if(!master){master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination);}ctx.resume();next=Math.max(next,ctx.currentTime+.08);timer??=setInterval(schedule,150);}catch{}}
function configure(s){settings=s;if(ctx){if(document.hidden)ctx.suspend();else if(active){ctx.resume();next=Math.max(next,ctx.currentTime+.08);}}}
function pet(type,s){unlock(s);if(!ctx||s.sound===false)return;const t=ctx.currentTime+.02,k=EcoData.VISITORS[type]?.[1];
 if(k==='cat'){tone(620,t,.33,.12,'triangle',920);tone(920,t+.3,.42,.1,'triangle',360);}
 else if(k==='dog'||['wolf','fox'].includes(type)){tone(180,t,.13,.1,'triangle',85);tone(210,t+.22,.16,.09,'triangle',90);}
 else if(k==='bird'||type==='bird'){
 const calls={nightHeron:[[480,.28,270]],redstart:[[1700,.1,2300],[2100,.12,1400],[1800,.16,2600]],longtail:[[2900,.07,3400],[3200,.07,2800],[3000,.09,3600],[3400,.06,3000]],wren:[[2200,.08,3100],[2700,.06,1900],[2400,.09,3300],[2900,.07,2100],[2500,.1,3400]],flamingo:[[520,.2,700],[640,.23,400]],bird:[[1100,.12,1700],[1600,.16,1200]]};let offset=0;for(const [f,d,end]of calls[type]||calls.bird){tone(f,t+offset,d,.055,'sine',end);offset+=d+.05;}}
 else if(type==='alpaca'){for(let j=0;j<5;j++){const f=[420,540,610,520,380][j];tone(f,t+j*.13,.2,.055,'triangle',f*.93);tone(f*2,t+j*.13,.2,.009,'sine',f*1.9);}}
 else if(type==='chicken'){for(let j=0;j<3;j++)tone(500,t+j*.17,.1,.06,'triangle',270);}
 else if(type==='bee'){tone(180,t,.45,.025,'sawtooth',210);}
 else if(['rabbit','squirrel','hedgehog'].includes(type)){tone(type==='rabbit'?920:1300,t,.14,.03,'sine',670);}
 else if(type==='frog'){tone(180,t,.2,.1,'square',90);tone(160,t+.3,.18,.07,'sine',70);}
 else if(['sheep','deer','boar'].includes(type)||k==='capy'){for(let j=0;j<4;j++)tone(260+j%2*55,t+j*.09,.13,.07,'triangle',210);}
 else if(k==='dragon'||k==='myth'){tone(k==='dragon'?90:320,t,.7,.09,'triangle',k==='dragon'?45:180);}
 else {tone(type==='butterfly'?1500:950,t,.13,.028,'sine',type==='butterfly'?1900:1250);tone(type==='butterfly'?1900:1250,t+.16,.16,.02,'sine',type==='butterfly'?1700:1100);}
}
document.addEventListener('visibilitychange',()=>configure(settings));root.GardenAudio={unlock,configure,pet,musicStep};})(globalThis);
