GardenModels.registry['bug']=function({a,part,phase,t,i}){const drawPart=part;
for(let k=-1;k<=1;k++)part(k*.18,.25+(k===0?.018:0),0,.172,.2,.25,k===1?0xe6b26b:0xc99053);part(.24,.36,.08,.055,.055,.045,0x373b32);part(.24,.36,-.08,.055,.055,.045,0x373b32);for(let k=-1;k<=1;k++)for(let side of [-1,1])part(k*.17,.14,side*.15,.06,.09,.09,0x62523b);
};
