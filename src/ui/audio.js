// Original pentatonic music and quiet synthesized animal calls; no external downloads.
(function(root){let ctx,master,timer,beat=0,next=0,settings={},active=false;
function tone(f,t,d,v=.08,type='sine',end=f){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(25,end),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(master);o.start(t);o.stop(t+d+.02);o.onended=()=>{o.disconnect();g.disconnect();};}
function schedule(){if(!ctx||ctx.state!=='running'||document.hidden||!active||settings.music===false)return;while(next<ctx.currentTime+.3){const melody=[0,4,7,9,7,4,2,0,4,7,12,9,7,4,2,4];const note=melody[beat%melody.length];tone(261.63*2**(note/12),next,1.35,.035);if(beat%4===0){const bass=[130.81,110,146.83,130.81][Math.floor(beat/4)%4];tone(bass,next,2.3,.025);tone(bass*1.5,next,2.1,.012);}beat++;next+=.58;}}
function unlock(s){settings=s||settings;active=true;try{ctx??=new(window.AudioContext||window.webkitAudioContext)();if(!master){master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination);}ctx.resume();next=Math.max(next,ctx.currentTime+.08);timer??=setInterval(schedule,150);}catch{}}
function configure(s){settings=s;if(ctx){if(document.hidden)ctx.suspend();else if(active){ctx.resume();next=Math.max(next,ctx.currentTime+.08);}}}
function pet(type,s){unlock(s);if(!ctx||s.sound===false)return;const t=ctx.currentTime+.02,k=EcoData.VISITORS[type]?.[1];
 if(k==='cat'){tone(620,t,.33,.12,'triangle',920);tone(920,t+.3,.42,.1,'triangle',360);}
 else if(k==='dog'||['wolf','fox'].includes(type)){tone(180,t,.13,.1,'triangle',85);tone(210,t+.22,.16,.09,'triangle',90);}
 else if(k==='bird'||['bird','chicken','bee'].includes(type)){for(let j=0;j<3;j++)tone(1100+j*240,t+j*.14,.12,.06,'sine',2000-j*180);}
 else if(type==='frog'){tone(180,t,.2,.1,'square',90);tone(160,t+.3,.18,.07,'sine',70);}
 else if(['sheep','alpaca','deer','boar'].includes(type)||k==='capy'){for(let j=0;j<4;j++)tone(260+j%2*55,t+j*.09,.13,.07,'triangle',210);}
 else if(k==='dragon'||k==='myth'){tone(k==='dragon'?90:320,t,.7,.09,'triangle',k==='dragon'?45:180);}
}
document.addEventListener('visibilitychange',()=>configure(settings));root.GardenAudio={unlock,configure,pet};})(globalThis);
