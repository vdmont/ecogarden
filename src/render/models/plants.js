globalThis.GardenModels=globalThis.GardenModels||{};
GardenModels.plants=function({b,c,i,x,z,variant,wet,labelList}){const box=b;
   if(c.plant==='seed'){b(x,.15,z,.21,.17,.22,0xb77540);b(x-.13,.31,z,.22,.125,.14,0x8ccc6a,0,.2);b(x+.11,.41,z,.18,.125,.14,0x64a45a,0,-.2);labelList.push([i,'种',0xb8d386,.6]);}
   if(c.plant==='grass'){b(x,.11,z,1,.1,1,wet?0x719b55:0x8ca864);if(c.animal?.type!=='bug')for(let k=0;k<2+variant%3;k++)b(x+(k-1)*.2,.18+variant*.008,z+(k%2)*.18-.09,.11,.19+variant*.016,.11,GardenPalette.leaves[variant][1]);}
   if(c.plant==='flower'){b(x,.09,z,.75,.1,.75,0x83a55e);b(x,.3,z,.125,.45,.125,0x4e8847);for(let [dx,dz] of [[-.15,0],[.15,0],[0,.15],[0,-.15]])b(x+dx,.54,z+dz,.22,.14,.22,GardenPalette.flowers[variant]);b(x,.63,z,.14,.1,.14,0xba804a);}
   if(c.plant==='tree'){const base=box;const b=(dx,y,dz,w,h,d,col)=>{const scale=.88+variant*.06;const color=[0x609252,0x78a75c,0x6f9e53,0x8bb965,0x87b162,0x65934d].includes(col)?GardenPalette.leaves[variant][y>1.5?1:0]:col;base(dx,y*scale,dz,w*(variant===1?.82:1),h*scale,d,col);};
    if(variant===1){b(x,.55,z,.2,1.1,.2,0x7f5c42);for(let k=0;k<4;k++)b(x,.85+k*.36,z,1.1-k*.22,.29,1.1-k*.22,k%2?0x8bb965:0x609252);return;}
    if(variant===3){b(x,.6,z,.23,1.2,.23,0x7f5c42);for(const[dx,dz,y]of [[-.35,0,1.15],[.35,0,1.18],[0,-.33,1.33],[0,.33,1.36],[0,0,1.66]])b(x+dx,y,z+dz,.69,.4,.65,y>1.5?0x8bb965:0x609252);return;}
    b(x,.58,z,.25,1.1,.25,0x7f5c42);b(x-.2,.9,z,.5,.18,.18,0x8c6a45);b(x+.15,1.12,z+.05,.18,.36,.16,0x8c6a45);
    for(let [dx,dy,dz,w,h,d,col] of [[0,1.25,0,1.05,.52,.95,0x609252],[-.32,1.56,.03,.66,.42,.7,0x78a75c],[.31,1.53,-.18,.64,.52,.67,0x6f9e53],[0,1.87,-.02,.71,.39,.66,0x8bb965],[.1,1.49,.37,.7,.39,.5,0x87b162],[-.34,1.22,-.32,.46,.36,.51,0x65934d]])b(x+dx,dy,z+dz,w,h,d,col);
   }
   if(c.plant==='bush'){
    for(let [dx,dy,dz,w] of [[0,.3,0,.58],[-.39,.23,.08,.19],[.4,.26,.06,.21],[-.11,.61,-.12,.31],[.27,.57,-.16,.22]])b(x+dx,dy,z+dz,w,.36,w,GardenPalette.leaves[variant][dy>.4?1:0]);
    if(c.age>=80){let col=c.age>=150?0x8d588e:0xcd6c62;for(let [dx,dy,dz] of [[-.28,.52,.36],[.25,.61,.33],[.07,.81,-.02],[-.25,.79,-.17]].slice(0,2+variant%3))b(x+dx,dy,z+dz,.13,.13,.13,col);if(c.age>=150)labelList.push([i,'紫浆果',0xc6a0cc,.95]);}
   }

};
