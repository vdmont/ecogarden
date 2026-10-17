// Shared silhouettes with species-specific markings; all coordinates use the animal's local frame.
for(const [type,[name,kind,color]] of Object.entries(EcoData.VISITORS))GardenModels.registry[type]=function({a,part,phase}){
 const scale=a.age<0?.68:1,rest=a.sleep>0||a.habit===2?.62:a.habit===4?.55:1;
 const p=(x,y,z,w,h,d,c,tilt=0)=>part(x*scale*(type==='abyssinian'?.76:1),y*scale*rest,z*scale,w*scale*(type==='abyssinian'?.76:1),h*scale,d*scale,c,tilt);
 const eye=(y,z)=>{for(const side of [-1,1])p(side*.115,y,z,.045,.05,.035,type==='ragdoll'?0x609dc1:0x253633);};
 if(kind==='bird'){
  const tall=type==='flamingo'||type==='nightHeron',y=tall?.95:.54;
  p(0,y,0,.34,.32,.48,color);p(0,y+.06,-.28,.17,.08,type==='longtail'?.5:.24,type==='redstart'?0xc96b45:color);
  if(tall){for(const x of [-.09,.09])p(x,.4,0,.035,.65,.035,0xaa806b);p(0,y+.25,.19,.09,.4,.09,color);}
  const hy=y+(tall?.48:.22);p(0,hy,.23,.25,.23,.24,color);p(0,hy-.04,.4,.09,.065,tall?.22:.13,type==='flamingo'?0x343c37:0xd4af69);eye(hy+.02,.355);
  for(const side of [-1,1])p(side*.21,y+.03,0,.14,.18,.31,type==='longtail'?0x65695e:color,side*(a.habit===5?0:phase*.08));return;
 }
 if(kind==='dragon'){
  for(let j=0;j<6;j++){const z=a.habit===6?Math.cos(j*.8)*.38:.35-j*.22;p(a.habit===6?Math.sin(j*.8)*.38:Math.sin(j*.7)*.12,.55+j*.025,z,.34-j*.025,.31,.29,color);if(j>0)p(0,.76+j*.025,z,.09,.13,.1,0xd4ba75);}
  p(0,.88,.46,.42,.36,.38,color);p(0,.77,.73,.31,.16,.3,0xc9c6a0);eye(.94,.66);
  for(const side of [-1,1]){p(side*.16,1.16,.4,.07,.28,.08,0xd4ba75);p(side*.29,.4,.1,.16,.23,.14,color);p(side*.24,.4,-.5,.13,.2,.13,color);p(side*.25,.78,.75,.23,.035,.035,0xe4d5ac);}return;
 }
 const cat=kind==='cat',dog=kind==='dog',capy=kind==='capy',myth=kind==='myth',fluffy=['ragdoll','samoyed','baize'].includes(type),body=fluffy?.58:.46;
 p(0,.45,0,.48,body,.66,color);for(const x of [-.16,.16])for(const z of [-.23,.23])p(x,.17,z,.11,.3,.12,color);
 const hy=capy?.57:cat?.82:.76,hz=.34;p(0,hy,hz,capy?.4:.37,.33,capy?.44:.33,color);p(0,hy-.08,hz+(cat?.165:.21),cat?.21:.23,cat?.1:.15,capy?.26:cat?.055:.16,capy?color:0xe8dcc5);eye(hy+.03,hz+.18);
 p(0,hy-.04,hz+(capy?.36:cat?.205:.31),.07,.05,.035,0x41433b);
 for(const side of [-1,1]){if(cat){for(let tier=0;tier<4;tier++){const width=.16-tier*.038;p(side*.135,hy+.19+tier*.047,hz-.015,width,.052,.11,type==='ragdoll'?0x746b63:color);if(tier<3)p(side*.135,hy+.19+tier*.047,hz+.043,width*.5,.04,.012,0xd4a093);}for(const dy of [-.025,.025])p(side*.215,hy-.055+dy,hz+.18,.12,.015,.02,0xeee4cc);}else p(side*.14,hy+(myth?.24:.13),hz-.04,.13,myth?.2:.17,.12,color);}
 if(!capy)p(.08,.55,-.49,.1,cat?.46:.23,.12,color,Math.sin(phase)*.08);
 if(type==='tabby'||type==='orangeCat')for(let j=0;j<3;j++)p(0,.45+body/2+.006,-.22+j*.18,.48,.025,.045,type==='tabby'?0x494b40:0xb77a42);
 if(type==='borderCollie'){p(0,.69,.12,.3,.13,.25,0xf0ebdf);p(0,hy+.04,hz+.175,.09,.26,.018,0xf0ebdf);}
 if(fluffy)p(0,.54,.22,.54,.35,.22,0xf1eee1);
 if(myth){for(const side of [-1,1]){p(side*.13,1.08,.27,.07,.27,.08,0xd0af70);p(side*.32,.6,-.04,.22,.13,.4,type==='pixiu'?0xe3c989:0xc4d9cd);}p(0,.98,.37,.09,.08,.07,0x82b5aa);}
};
