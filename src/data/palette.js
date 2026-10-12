globalThis.GardenPalette={
 leaves:[[0x609252,0x8bb965],[0x517f60,0x80a778],[0x819351,0xacb66c],[0x4f897e,0x80b097],[0x738856,0xa0ac72]],
 flowers:[0xf1ae9d,0xf3d78d,0xcfb2de,0xe9e8cf,0x9dbdd5],
 animalColor(color,type,variant){
  if(type==='alpaca'||color===0x333f2e||color<0x555555)return color;
  const tone=[0,.025,-.03,.045,-.015][variant%5];
  const r=Math.max(0,Math.min(255,(color>>16)+Math.round(tone*255))),g=Math.max(0,Math.min(255,((color>>8)&255)+Math.round(tone*180))),b=Math.max(0,Math.min(255,(color&255)+Math.round(tone*110)));
  return (r<<16)|(g<<8)|b;
 }
};
