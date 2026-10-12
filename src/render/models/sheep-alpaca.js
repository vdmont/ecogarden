GardenModels.registry['sheep-alpaca']=function({a,part,phase,t,i}){const drawPart=part;

     let alp=a.type==='alpaca',baby=a.age<0,sc=baby?.72:1,rest=a.sleep>0,tilt=a.drunk?Math.sin(t*.004)*.13:0;
     const p=(dx,y,dz,w,h,d,col)=>part(dx*sc,(rest?y*.52:y)*sc,dz*sc,w*sc,h*sc,d*sc,col,tilt);
     const wool=alp?0xf1eadb:0xf1e8d0,shade=alp?0xdfd5c2:0xded5bd;
     p(0,.55,0,.67,.46,.86,wool);p(-.2,.76,-.13,.32,.16,.38,shade);p(.16,.79,.1,.37,.16,.4,wool);
     for(let dx of [-.23,.23])for(let dz of [-.29,.29]){p(dx,.23,dz,.13,.42,.14,shade);p(dx,.07,dz,.15,.12,.16,0x535147);}
     if(alp)p(0,.95,.33,.23,.76,.24,wool);
     const hy=alp?1.46:.86,hz=alp?.4:.44;
     p(0,hy,hz,.4,.35,.35,alp?0xe9dfce:0xd7c7ac);p(0,hy-.1,hz+.2,.29,.17,.2,alp?0xf6efdf:0xe9ddc7);
     for(let side of [-1,1]){p(side*.115,hy+.045,hz+.185,.065,a.sleep?.025:.065,.035,0x363f37);p(side*(alp?.12:.26),hy+(alp?.29:.02),hz,alp?.09:.16,alp?.27:.12,.13,shade);}
     p(0,hy-.13,hz+.315,.085,.045,.035,0x67554b);p(0,.65,-.48,.16,.18,.2,wool);
     if(a.drunk){p(-.21,hy-.035,hz+.18,.075,.05,.035,0xdd9a96);p(.21,hy-.035,hz+.18,.075,.05,.035,0xdd9a96);}
     
    
};
