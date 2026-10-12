GardenModels.registry['fox-wolf']=function({a,part:drawPart,phase,t,i}){
let wolf=a.type==='wolf';const original=drawPart;const shade=col=>wolf?({[0xc47c40]:0x89938e,[0xda9552]:0xa4aca5,[0xb56e35]:0x69756f,[0xd59551]:0x929f98,[0xf2dfb7]:0xd7ddd2,[0xe7c79c]:0xc6d0c2,[0xf1e1bd]:0xd5dcd0,[0x664d38]:0x505e58}[col]||col):col;const part=(...args)=>{args[6]=shade(args[6]);original(...args);};
     part(0,.44,0,.4,.31,.63,0xc47c40);part(0,.57,.34,.35,.3,.32,0xda9552);part(0,.47,.51,.27,.14,.21,0xf2dfb7);part(0,.5,.635,.075,.06,.045,0x3a4138);
     for(let side of [-1,1]){part(side*.12,.79,.34,.12,.23,.12,0xb56e35);part(side*.12,.79,.41,.06,.13,.03,0xe7c79c);part(side*.13,.6,.503,.055,.06,.035,0x353e33);for(let dz of [-.22,.22])part(side*.14,.19,dz,.095,.35,.1,0x664d38);}
     part(0,.48,-.56,.25,.25,.54,0xd59551);part(0,.51,-.87,.23,.24,.23,0xf1e1bd);
    
};

