GardenModels.registry['rabbit']=function({a,part,phase,t,i}){const drawPart=part;

     const scale=a.age<0?.7:1,p=(dx,y,dz,w,h,d,col)=>part(dx*scale,y*scale,dz*scale,w*scale,h*scale,d*scale,col);
     p(0,.31,-.04,.43,.36,.5,0xd8c4aa);p(0,.49,.25,.36,.32,.32,0xe5d2bb);p(0,.27,-.36,.22,.22,.22,0xf7eddc);
     for(let side of [-1,1]){p(side*.11,.89,.23,.1,.5,.12,0xe5d2bb);p(side*.11,.91,.303,.05,.34,.035,0xc89187);p(side*.095,.53,.425,.055,.055,.03,0x3d4036);p(side*.18,.12,.12,.19,.13,.25,0xc5ad90);}p(0,.43,.435,.07,.045,.045,0xc48579);
    
};
