'use strict';
window.practiceModel=(()=>{

function make(level,type){
 const min=level==='foundation'?0:-8,max=8;
 let x,y;
 do {
  x=min+Math.floor(Math.random()*(max-min+1));
  y=min+Math.floor(Math.random()*(max-min+1));
 } while(x===0&&y===0);
 const step=level==='challenge'?(Math.random()<0.5?2:5):1;
 x*=step;y*=step;
 const mode=type==='Mix'?(Math.random()<0.5?'Read':'Plot'):type;
 const raw={x,y,min:min*step,max:max*step,step,mode};
 return {prompt:mode==='Plot'?'Plot ('+x+', '+y+').':'Read the coordinates of point P.',labels:['x','y'],answers:[String(x),String(y)],raw,key:[mode,x,y].join('|'),steps:'From the origin, move '+Math.abs(x)+' units '+(x<0?'left':'right')+', then '+Math.abs(y)+' units '+(y<0?'down':'up')+'. P = ('+x+', '+y+').'};
}
return {id:"coordinates",title:"Plot Coordinates",make};
})();