(function(){
'use strict';
// Missing Interior Angles — Geometry / FAST FIVE #2.
// The original app's 40 drawings are retained as geometry templates.
// Unlike the original, the numerical angles are derived from the actual
// convex polygon, then rounded to an appropriate level step and checked.
const randInt=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const choose=a=>a[randInt(0,a.length-1)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=randInt(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
// BEGIN ORIGINAL TEMPLATES
const triangleTemplates = [
    // 1–3: original styles
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 60,  y: 190 },
        { id: 'B', x: 200, y: 185 },
        { id: 'C', x: 130, y: 60  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 70,  y: 60  },
        { id: 'B', x: 200, y: 110 },
        { id: 'C', x: 110, y: 200 }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 60,  y: 130 },
        { id: 'B', x: 210, y: 160 },
        { id: 'C', x: 140, y: 50  }
      ]
    },
    // 4–20: extra variety (upright, leaning, wide, narrow)
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 80,  y: 200 },
        { id: 'B', x: 190, y: 170 },
        { id: 'C', x: 130, y: 60  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 70,  y: 190 },
        { id: 'B', x: 210, y: 150 },
        { id: 'C', x: 90,  y: 60  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 60,  y: 180 },
        { id: 'B', x: 200, y: 190 },
        { id: 'C', x: 170, y: 70  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 80,  y: 60  },
        { id: 'B', x: 210, y: 130 },
        { id: 'C', x: 100, y: 200 }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 65,  y: 70  },
        { id: 'B', x: 210, y: 90  },
        { id: 'C', x: 120, y: 200 }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 50,  y: 160 },
        { id: 'B', x: 210, y: 140 },
        { id: 'C', x: 130, y: 50  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 70,  y: 200 },
        { id: 'B', x: 190, y: 200 },
        { id: 'C', x: 110, y: 70  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 60,  y: 180 },
        { id: 'B', x: 210, y: 110 },
        { id: 'C', x: 120, y: 60  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 80,  y: 70  },
        { id: 'B', x: 200, y: 190 },
        { id: 'C', x: 100, y: 200 }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 70,  y: 190 },
        { id: 'B', x: 200, y: 90  },
        { id: 'C', x: 100, y: 60  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 60,  y: 80  },
        { id: 'B', x: 220, y: 140 },
        { id: 'C', x: 120, y: 200 }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 70,  y: 70  },
        { id: 'B', x: 200, y: 70  },
        { id: 'C', x: 150, y: 200 }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 60,  y: 180 },
        { id: 'B', x: 220, y: 150 },
        { id: 'C', x: 130, y: 60  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 80,  y: 190 },
        { id: 'B', x: 220, y: 110 },
        { id: 'C', x: 120, y: 60  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 60,  y: 150 },
        { id: 'B', x: 210, y: 190 },
        { id: 'C', x: 140, y: 60  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 80,  y: 60  },
        { id: 'B', x: 210, y: 120 },
        { id: 'C', x: 140, y: 200 }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 65,  y: 200 },
        { id: 'B', x: 220, y: 160 },
        { id: 'C', x: 120, y: 60  }
      ]
    },
    {
      type: 'triangle',
      vertices: [
        { id: 'A', x: 70,  y: 180 },
        { id: 'B', x: 200, y: 190 },
        { id: 'C', x: 150, y: 70  }
      ]
    }
  ];
const quadTemplates = [
    // 1–3: original styles
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 190 },
        { id: 'B', x: 200, y: 180 },
        { id: 'C', x: 215, y: 80  },
        { id: 'D', x: 80,  y: 60  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 170 },
        { id: 'B', x: 170, y: 200 },
        { id: 'C', x: 215, y: 90  },
        { id: 'D', x: 90,  y: 60  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 90  },
        { id: 'B', x: 130, y: 50  },
        { id: 'C', x: 215, y: 110 },
        { id: 'D', x: 90,  y: 195 }
      ]
    },
    // 4–20: extra quadrilateral shapes
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 70,  y: 190 },
        { id: 'B', x: 200, y: 190 },
        { id: 'C', x: 220, y: 100 },
        { id: 'D', x: 90,  y: 60  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 180 },
        { id: 'B', x: 190, y: 200 },
        { id: 'C', x: 220, y: 120 },
        { id: 'D', x: 80,  y: 70  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 70,  y: 70  },
        { id: 'B', x: 200, y: 60  },
        { id: 'C', x: 220, y: 150 },
        { id: 'D', x: 90,  y: 190 }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 160 },
        { id: 'B', x: 190, y: 190 },
        { id: 'C', x: 220, y: 80  },
        { id: 'D', x: 80,  y: 60  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 70,  y: 190 },
        { id: 'B', x: 210, y: 170 },
        { id: 'C', x: 220, y: 80  },
        { id: 'D', x: 90,  y: 60  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 150 },
        { id: 'B', x: 180, y: 190 },
        { id: 'C', x: 220, y: 120 },
        { id: 'D', x: 80,  y: 60  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 70,  y: 80  },
        { id: 'B', x: 190, y: 60  },
        { id: 'C', x: 220, y: 140 },
        { id: 'D', x: 90,  y: 190 }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 100 },
        { id: 'B', x: 180, y: 60  },
        { id: 'C', x: 220, y: 130 },
        { id: 'D', x: 90,  y: 190 }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 70,  y: 190 },
        { id: 'B', x: 190, y: 200 },
        { id: 'C', x: 220, y: 110 },
        { id: 'D', x: 80,  y: 70  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 180 },
        { id: 'B', x: 200, y: 190 },
        { id: 'C', x: 220, y: 100 },
        { id: 'D', x: 70,  y: 70  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 90  },
        { id: 'B', x: 180, y: 60  },
        { id: 'C', x: 220, y: 110 },
        { id: 'D', x: 80,  y: 190 }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 160 },
        { id: 'B', x: 180, y: 200 },
        { id: 'C', x: 220, y: 140 },
        { id: 'D', x: 80,  y: 70  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 70,  y: 80  },
        { id: 'B', x: 200, y: 70  },
        { id: 'C', x: 220, y: 160 },
        { id: 'D', x: 90,  y: 190 }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 190 },
        { id: 'B', x: 200, y: 180 },
        { id: 'C', x: 220, y: 130 },
        { id: 'D', x: 80,  y: 70  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 70,  y: 90  },
        { id: 'B', x: 190, y: 60  },
        { id: 'C', x: 220, y: 140 },
        { id: 'D', x: 80,  y: 190 }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 170 },
        { id: 'B', x: 200, y: 190 },
        { id: 'C', x: 220, y: 120 },
        { id: 'D', x: 70,  y: 70  }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 60,  y: 100 },
        { id: 'B', x: 200, y: 60  },
        { id: 'C', x: 220, y: 150 },
        { id: 'D', x: 80,  y: 190 }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 70,  y: 80  },
        { id: 'B', x: 180, y: 60  },
        { id: 'C', x: 220, y: 130 },
        { id: 'D', x: 90,  y: 190 }
      ]
    },
    {
      type: 'quad',
      vertices: [
        { id: 'A', x: 65,  y: 185 },
        { id: 'B', x: 190, y: 195 },
        { id: 'C', x: 220, y: 115 },
        { id: 'D', x: 75,  y: 70  }
      ]
    }
  ];
// END ORIGINAL TEMPLATES
const templates={triangle:triangleTemplates,quad:quadTemplates};
const levels=['easy','medium','hard'];
const recent={game:{easy:[],medium:[],hard:[]},qa:{easy:[],medium:[],hard:[]},stress:{easy:[],medium:[],hard:[]}};
const rotating={game:{easy:[],medium:[],hard:[]},qa:{easy:[],medium:[],hard:[]},stress:{easy:[],medium:[],hard:[]}};
const levelName=l=>l==='easy'?'Foundation Mode':l==='medium'?'Core Mode':'Challenge Mode';
const shapeName=t=>t==='triangle'?'triangle':'quadrilateral';
const labels=['A','B','C','D'];
const stepByLevel={easy:10,medium:5,hard:1};
// Rotation makes 20-question worksheets closely reflect the taught progression.
// Foundation: 100% direct angles. Core: 50% direct, 50% simple equations.
// Challenge: 20% direct, 50% algebra, 30% angle relationships.
const familyPlans={easy:['numeric'],medium:['numeric','simple'],hard:['numeric','numeric','algebra','algebra','algebra','algebra','algebra','relation','relation','relation']};
const familyQueues={game:{easy:[],medium:[],hard:[]},qa:{easy:[],medium:[],hard:[]},stress:{easy:[],medium:[],hard:[]}};
function nextFamily(level,channel){const q=familyQueues[channel][level];if(!q.length)q.push(...shuffle(familyPlans[level]));return q.shift();}
let polygonChoice='mixed';
function centroid(V){return {x:V.reduce((s,v)=>s+v.x,0)/V.length,y:V.reduce((s,v)=>s+v.y,0)/V.length};}
function cross(a,b,c){return (b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x)}
function isConvex(V){if(V.length===3)return Math.abs(cross(V[0],V[1],V[2]))>500;const signs=V.map((v,i)=>cross(v,V[(i+1)%V.length],V[(i+2)%V.length]));return signs.every(x=>x>350)||signs.every(x=>x< -350)}
function interiorAngles(V){return V.map((v,i)=>{const a=V[(i+V.length-1)%V.length],b=V[(i+1)%V.length];const ux=a.x-v.x,uy=a.y-v.y,vx=b.x-v.x,vy=b.y-v.y;let c=(ux*vx+uy*vy)/Math.hypot(ux,uy)/Math.hypot(vx,vy);return Math.acos(Math.max(-1,Math.min(1,c)))*180/Math.PI;});}
function shapeVertices(base){const original=base.vertices.map(v=>({x:v.x+randInt(-16,16),y:v.y+randInt(-16,16)}));const flip=Math.random()<.5;const angle=randInt(-15,15)*Math.PI/180;const p=centroid(original);let V=original.map(v=>{const dx=(flip?-1:1)*(v.x-p.x),dy=v.y-p.y;return {x:dx*Math.cos(angle)-dy*Math.sin(angle),y:dx*Math.sin(angle)+dy*Math.cos(angle)}});const left=Math.min(...V.map(v=>v.x)),right=Math.max(...V.map(v=>v.x)),top=Math.min(...V.map(v=>v.y)),bottom=Math.max(...V.map(v=>v.y));const scale=Math.min(220/(right-left),175/(bottom-top));const midX=(left+right)/2,midY=(top+bottom)/2;return V.map(v=>({x:170+(v.x-midX)*scale,y:130+(v.y-midY)*scale}));}
function nextType(level,channel,mode){if(mode!=='mixed')return mode;const queue=rotating[channel][level];if(!queue.length)queue.push(...shuffle(['triangle','quad']));return queue.shift()}
// The physical vertices and numerical angles are generated first, independently of
// the algebra. Algebraic expressions are then chosen to evaluate EXACTLY to those
// numerical angles. This avoids mathematically false diagrams.
function makeNumericalQuestion(level,shape){const step=stepByLevel[level];for(let attempt=0;attempt<1000;attempt++){
 const index=randInt(0,templates[shape].length-1),vertices=shapeVertices(templates[shape][index]);if(!isConvex(vertices))continue;
 const actual=interiorAngles(vertices),missingIndex=randInt(0,vertices.length-1),total=vertices.length===3?180:360;
 if(actual.some(a=>shape==='triangle'?(a<27||a>126):(a<48||a>155)))continue;
 const values=actual.map((a,i)=>i===missingIndex?0:Math.round(a/step)*step);
 values[missingIndex]=total-values.reduce((a,b)=>a+b,0);
 if(values.some(v=>v<25||v>158||v%step!==0))continue;
 if(Math.abs(values[missingIndex]-actual[missingIndex])>step*1.6)continue;
 return {type:shape,level,templateIndex:index,vertices,values,missingIndex,answer:values[missingIndex],total,unit:'degrees',family:'numeric',responseKind:'angle',exprs:Array(values.length).fill(null)};
 }throw Error('Unable to make polygon geometry for '+level+'/'+shape);
}
function exprText(e){if(!e)return '';const a=e.a===1?'x':e.a+'x';return e.b>0?`${a} + ${e.b}°`:e.b<0?`${a} − ${Math.abs(e.b)}°`:`${a}°`}
function evaluateExpr(e,x){return e.a*x+e.b}
function algebraCandidates(v,x){const out=[];for(let a=1;a<=4;a++){
 const b=v-a*x;
 if(b < -40 || b > 65 || (Math.abs(b)>0&&Math.abs(b)%5!==0))continue;
 if(a===1&&b===0)continue;
 out.push({a,b});
 }return out;}
function addSimple(q){const i=q.missingIndex,v=q.values[i],poss=[];
 for(const a of [2,3,4])if(v%a===0&&v/a>=6&&v/a<=90)poss.push({a,b:0,x:v/a});
 for(const d of [5,10,15,20,25,30]){
  if(v-d>=6)poss.push({a:1,b:d,x:v-d});
  if(v+d<=145)poss.push({a:1,b:-d,x:v+d});
 }
 if(!poss.length)return null;
 const p=choose(poss);q.family='simple';q.exprs[i]={a:p.a,b:p.b};q.xValue=p.x;q.answer=p.x;q.responseKind='x';return q;
}
function addAlgebra(q){ // 2 or (occasionally on quads) 3 different angle expressions.
 const n=q.values.length,indices=shuffle([...Array(n).keys()]);
 for(let attempt=0;attempt<85;attempt++){
  const x=randInt(12,52),count=n===4&&Math.random()<0.27?3:2,chosen=indices.slice(0,count);
  const candidates=chosen.map(i=>algebraCandidates(q.values[i],x));if(candidates.some(a=>!a.length))continue;
  const selection=candidates.map(a=>choose(a));
  if(selection.reduce((a,e)=>a+e.a,0)<3||!selection.some(e=>e.a>1)||!selection.some(e=>e.b!==0))continue;
  if(selection.every(e=>e.a===1))continue;
  chosen.forEach((i,j)=>q.exprs[i]=selection[j]);
  q.family='algebra';q.missingIndex=chosen[0];q.xValue=x;q.answer=x;q.responseKind='x';q.targetIndex=chosen[0];return q;
 }return null;
}
function addRelationship(q){ // Two linked angle expressions, student finds a real angle.
 const n=q.values.length,order=shuffle([...Array(n).keys()]);
 for(const i of order)for(const j of shuffle(order.filter(k=>k!==i))){
  const d=q.values[j]-q.values[i];
  if(d<5||d>55||d%5!==0)continue;
  q.family='relation';q.exprs[i]={a:1,b:0};q.exprs[j]={a:1,b:d};
  q.missingIndex=i;q.targetIndex=j;q.xValue=q.values[i];q.answer=q.values[j];q.responseKind='angle';
  q.relationOffset=d;return q;
 }
 return null;
}
// Occasional true 1:2 ratio relationships: x° and 2x°.
// Unlike relabeling a fixed template, this constructs a convex polygon whose
// geometry really does have the selected angles.
function verticesForAngleValues(values){
 const n=values.length,dirs=[0];for(let i=1;i<n;i++)dirs.push(dirs[i-1]+(180-values[i])*Math.PI/180);
 const u=dirs.map(t=>({x:Math.cos(t),y:Math.sin(t)}));
 function solve(f0,f1){const rhsX=-f0*u[0].x-f1*u[1].x,rhsY=-f0*u[0].y-f1*u[1].y;
  if(n===3){const det=u[1].x*u[2].y-u[1].y*u[2].x;
    if(Math.abs(det)<1e-7)return null;
    const a=(rhsX*u[2].y-rhsY*u[2].x)/det,b=(u[1].x*rhsY-u[1].y*rhsX)/det;
    return [f0,a,b];
  }
  const det=u[2].x*u[3].y-u[2].y*u[3].x;
  if(Math.abs(det)<1e-7)return null;
  return [f0,f1,(rhsX*u[3].y-rhsY*u[3].x)/det,(u[2].x*rhsY-u[2].y*rhsX)/det];
 }
 let len=null;
 for(let t=0;t<250;t++){
  const f0=.75+Math.random()*.65,f1=n===3?0:.2+Math.random()*2.3;
  const arr=solve(f0,f1);if(arr&&arr.every(x=>x>.1&&x<7)){len=arr;break;}
 }
 if(!len)return null;
 let V=[{x:0,y:0}];for(let i=0;i<n-1;i++)V.push({x:V[i].x+len[i]*u[i].x,y:V[i].y+len[i]*u[i].y});
 const p=centroid(V),a=randInt(-170,170)*Math.PI/180,flip=Math.random()<.5;
 V=V.map(v=>{let x=(v.x-p.x)*(flip?-1:1),y=v.y-p.y;return {x:x*Math.cos(a)-y*Math.sin(a),y:x*Math.sin(a)+y*Math.cos(a)}});
 const loX=Math.min(...V.map(v=>v.x)),hiX=Math.max(...V.map(v=>v.x)),loY=Math.min(...V.map(v=>v.y)),hiY=Math.max(...V.map(v=>v.y));
 const scale=Math.min(204/(hiX-loX),166/(hiY-loY));return V.map(v=>({x:170+(v.x-(loX+hiX)/2)*scale,y:130+(v.y-(loY+hiY)/2)*scale}));
}
function makeRatioQuestion(level,shape){
 for(let attempt=0;attempt<160;attempt++){
  const x=shape==='triangle'?randInt(26,49):randInt(42,69);
  const values=shape==='triangle'?[x,2*x,180-3*x]:null;
  if(shape==='quad'){
   const rem=360-3*x,lo=Math.max(51,rem-155),hi=Math.min(155,rem-51);
   if(lo>hi)continue;const y=randInt(lo,hi);
   // Quad list built independently because values for triangle is const.
   const quad=[x,2*x,y,rem-y],perm=shuffle([...Array(4).keys()]),angles=perm.map(i=>quad[i]);
   const vertices=verticesForAngleValues(angles);if(!vertices||!isConvex(vertices))continue;
   const actual=interiorAngles(vertices);if(actual.some((a,i)=>Math.abs(a-angles[i])>1e-5))continue;
   const i=perm.indexOf(0),j=perm.indexOf(1),exprs=angles.map(()=>null);exprs[i]={a:1,b:0};exprs[j]={a:2,b:0};
   return {type:shape,level,templateIndex:-1,vertices,values:angles,missingIndex:i,targetIndex:j,answer:2*x,xValue:x,exprs,family:'relation',responseKind:'angle',total:360,unit:'degrees',ratio:true};
  }
  const perm=shuffle([0,1,2]),angles=perm.map(i=>values[i]),vertices=verticesForAngleValues(angles);if(!vertices||!isConvex(vertices))continue;
  const actual=interiorAngles(vertices);if(actual.some((a,i)=>Math.abs(a-angles[i])>1e-5))continue;
  const i=perm.indexOf(0),j=perm.indexOf(1),exprs=angles.map(()=>null);exprs[i]={a:1,b:0};exprs[j]={a:2,b:0};
  return {type:shape,level,templateIndex:-1,vertices,values:angles,missingIndex:i,targetIndex:j,answer:2*x,xValue:x,exprs,family:'relation',responseKind:'angle',total:180,unit:'degrees',ratio:true};
 }
 return null;
}
function makeQuestion(level,type=null,family=null){const shape=type||choose(['triangle','quad']),want=family||'numeric';
 for(let attempt=0;attempt<800;attempt++){
  const q=want==='relation'&&Math.random()<.33?(makeRatioQuestion(level,shape)||makeNumericalQuestion(level,shape)):makeNumericalQuestion(level,shape);
  let built=q.ratio?q:want==='numeric'?q:want==='simple'?addSimple(q):want==='algebra'?addAlgebra(q):addRelationship(q);
  if(!built)continue;
  // Ensure the result cannot be produced by a second, inconsistent interpretation.
  built.signature=[shape,want,built.values.join('-'),built.missingIndex,built.targetIndex??'',built.exprs.map(e=>e?e.a+','+e.b:'-').join('/')].join('|');
  return built;
 }
 throw Error('Unable to construct '+level+'/'+shape+'/'+want);
}
function validateQuestion(q){
 if(!q||!['triangle','quad'].includes(q.type)||!levels.includes(q.level)||!q.vertices||!isConvex(q.vertices))return false;
 const n=q.type==='triangle'?3:4;
 if(q.values.length!==n||q.vertices.length!==n||q.exprs?.length!==n||q.values.reduce((a,b)=>a+b,0)!==(n===3?180:360))return false;
 const step=stepByLevel[q.level];if(q.values.some(v=>!Number.isInteger(v)||v<=0||v>=180||v%step!==0))return false;
 const actual=interiorAngles(q.vertices);if(!q.values.every((v,i)=>Math.abs(v-actual[i])<=step*1.6+0.001))return false;
 const expressed=q.exprs.map((e,i)=>e?i:-1).filter(i=>i>=0);
 if(q.family==='numeric')return expressed.length===0&&q.responseKind==='angle'&&q.answer===q.values[q.missingIndex];
 if(!Number.isInteger(q.xValue)||q.xValue<1||q.xValue>160||!expressed.every(i=>evaluateExpr(q.exprs[i],q.xValue)===q.values[i]))return false;
 if(q.family==='simple')return q.level==='medium'&&expressed.length===1&&q.responseKind==='x'&&q.answer===q.xValue;
 if(q.family==='algebra')return q.level==='hard'&&expressed.length>=2&&q.responseKind==='x'&&q.answer===q.xValue&&expressed.reduce((s,i)=>s+q.exprs[i].a,0)>=3;
 if(q.family==='relation')return q.level==='hard'&&expressed.length===2&&q.responseKind==='angle'&&q.answer===q.values[q.targetIndex]&&q.exprs[q.missingIndex].a===1&&(q.ratio?(q.exprs[q.targetIndex].a===2&&q.exprs[q.targetIndex].b===0):q.exprs[q.targetIndex].a===1);
 return false;
}
function generateQuestion(level,channel='game',local=null,forced=null){
 const mode=forced|| (channel==='game'?polygonChoice:'mixed'),selected=nextType(level,channel,mode),family=nextFamily(level,channel),history=recent[channel][level];
 for(let attempt=0;attempt<450;attempt++){
  const q=makeQuestion(level,selected,family);
  if(!validateQuestion(q)||history.includes(q.signature)||local?.has(q.signature))continue;
  history.push(q.signature);if(history.length>100)history.shift();local?.add(q.signature);return q;
 }
 history.length=0;return generateQuestion(level,channel,local,selected);
}
function safeText(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function svgHTML(q){
 const V=q.vertices,p=centroid(V);
 const layout=V.map((v,i)=>{
  const prev=V[(i+V.length-1)%V.length],next=V[(i+1)%V.length],u={x:prev.x-v.x,y:prev.y-v.y},w={x:next.x-v.x,y:next.y-v.y};
  const un=Math.hypot(u.x,u.y),wn=Math.hypot(w.x,w.y),a={x:u.x/un,y:u.y/un},b={x:w.x/wn,y:w.y/wn};
  const bis={x:a.x+b.x,y:a.y+b.y},len=Math.hypot(bis.x,bis.y)||1;bis.x/=len;bis.y/=len;
  const label=q.exprs[i]?exprText(q.exprs[i]):i===q.missingIndex&&q.family==='numeric'?'x°':q.values[i]+'°';
  const marked=(q.exprs[i]!==null)||(q.family==='numeric'&&i===q.missingIndex);
  const width=Math.max(43,Math.min(121,label.length*8+17));
  return {v,a,b,bis,label,marked,width,x:v.x+bis.x*(q.type==='triangle'?49:42),y:v.y+bis.y*(q.type==='triangle'?49:42),lx:v.x-bis.x*18,ly:v.y-bis.y*18};
 });
 // Relax overlapping labels; permit larger bounding boxes for algebraic forms.
 for(let pass=0;pass<30;pass++){
  let changed=false;
  for(let i=0;i<layout.length;i++)for(let j=i+1;j<layout.length;j++){
   const a=layout[i],b=layout[j],dx=b.x-a.x,dy=b.y-a.y,reqX=(a.width+b.width)/2+7,reqY=33;
   if(Math.abs(dx)>=reqX||Math.abs(dy)>=reqY)continue;
   changed=true;const gapX=reqX-Math.abs(dx),gapY=reqY-Math.abs(dy);
   if(gapX<=gapY||Math.abs(dy)<4){const sign=dx>=0?1:-1,shift=(gapX+1)/2;a.x-=sign*shift;b.x+=sign*shift;}
   else{const sign=dy>=0?1:-1,shift=(gapY+1)/2;a.y-=sign*shift;b.y+=sign*shift;}
  }
  for(const o of layout){o.x=Math.max(o.width/2+5,Math.min(340-o.width/2-5,o.x));o.y=Math.max(20,Math.min(240,o.y));}
  if(!changed)break;
 }
 const accessible=q.values.map((v,i)=>`angle ${labels[i]} ${q.exprs[i]?exprText(q.exprs[i]).replace('°',' degrees'):i===q.missingIndex&&q.family==='numeric'?'unknown':v+' degrees'}`).join(', ');
 let out=`<svg class="angle-svg" viewBox="0 0 340 260" role="img" aria-label="${shapeName(q.type)} showing ${safeText(accessible)}"><polygon points="${V.map(v=>`${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ')}" fill="rgba(232,241,255,.35)" stroke="#2d4054" stroke-width="3.2" stroke-linejoin="round" />`;
 layout.forEach((o,i)=>{
  const {v,a,b,bis,label,width,lx,ly,marked}=o,ix=o.x,iy=o.y;
  out+=`<path d="M ${(v.x+a.x*20).toFixed(1)} ${(v.y+a.y*20).toFixed(1)} Q ${(v.x+bis.x*25).toFixed(1)} ${(v.y+bis.y*25).toFixed(1)} ${(v.x+b.x*20).toFixed(1)} ${(v.y+b.y*20).toFixed(1)}" fill="none" stroke="#5e83a8" stroke-width="1.6"/>`;
  out+=`<rect x="${(ix-width/2).toFixed(1)}" y="${(iy-14).toFixed(1)}" width="${width}" height="28" rx="7" fill="${marked?'#fff0ba':'#f4f7fc'}" stroke="${marked?'#d1a14a':'#cbd7e5'}" stroke-width="${marked?1.7:1}"/><text x="${ix.toFixed(1)}" y="${(iy+4.5).toFixed(1)}" text-anchor="middle" font-size="${label.length>8?'13':label.length>6?'14':'16'}" font-weight="800" fill="${marked?'#855c12':'#284159'}">${safeText(label)}</text>`;
  out+=`<text x="${lx.toFixed(1)}" y="${(ly+5).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="750" fill="#3c596f">${labels[i]}</text>`;
 });return out+'</svg>';
}
function questionHTML(q){
 const task=q.family==='numeric'?'Find the missing interior angle <strong>x</strong>.':q.responseKind==='x'?'Find the value of <strong>x</strong>.':`Find the size of <strong>angle ${labels[q.targetIndex]}</strong> in degrees.`;
 return `<div class="angle-prompt">${task}<span class="angle-prompt-context"> ${q.type==='triangle'?'Triangle':'Quadrilateral'} · interior angles</span></div>${svgHTML(q)}<div class="angle-under-note">Diagram not drawn to scale. Use the labeled angles.</div>`;
}
function stepsHTML(q){
 const names=q.values.map((v,i)=>q.exprs[i]?exprText(q.exprs[i]):q.family==='numeric'&&i===q.missingIndex?'x°':v+'°');
 const sum=q.total,known=q.values.filter((_,i)=>i!==q.missingIndex);
 if(q.family==='numeric')return `<div class="whole-working-line">The interior angles add to <strong>${sum}°</strong>.</div><div class="whole-working-line">Known angles: ${known.join('° + ')}° = <strong>${known.reduce((a,b)=>a+b,0)}°</strong>.</div><div class="whole-working-line">x = ${sum}° − ${known.reduce((a,b)=>a+b,0)}° = <strong>${q.answer}°</strong>.</div>`;
 const expressed=q.exprs.filter(Boolean),a=expressed.reduce((s,e)=>s+e.a,0),b=expressed.reduce((s,e)=>s+e.b,0)+q.values.reduce((s,v,i)=>s+(q.exprs[i]?0:v),0);
 const sumText=names.map(t=>`(${safeText(t)})`).join(' + ');
 let result=`<div class="whole-working-line">The interior angles add to <strong>${sum}°</strong>.</div>`;
 result+=`<div class="whole-working-line">Equation: ${sumText} = ${sum}°.</div>`;
 result+=`<div class="whole-working-line">Collect terms: ${a}x ${b<0?'− '+(-b):'+ '+b} = ${sum}.</div>`;
 result+=`<div class="whole-working-line">${a}x = ${sum} − (${b}) = ${a*q.xValue}, so <strong>x = ${q.xValue}</strong>.</div>`;
 if(q.responseKind==='angle')result+=`<div class="whole-working-line">Angle ${labels[q.targetIndex]} = ${safeText(exprText(q.exprs[q.targetIndex]).replace('°',''))} = <strong>${q.answer}°</strong> when x = ${q.xValue}.</div>`;
 return result;
}
function hintFor(q){if(q.family==='numeric')return `A ${shapeName(q.type)} has an interior angle sum of ${q.total}°. Add the labeled angles, then subtract their sum from ${q.total}°.`;
 return `The interior angles total ${q.total}°. Add all the angle expressions, collect the x terms, and solve. ${q.responseKind==='angle'?'Then substitute x into the requested angle expression.':'The answer is the value of x, not the angle in degrees.'}`;
}
function parseAnswer(raw){const s=String(raw??'').trim().replace(/[°\s]/g,'');if(!/^\d+$/.test(s))return {valid:false,message:'Enter a positive whole number.'};const n=Number(s);if(!Number.isInteger(n)||n<=0||n>=180)return {valid:false,message:'Enter a whole number from 1 to 179.'};return {valid:true,answer:String(n)}}
function formatAnswer(q){return q.responseKind==='x'?'x = '+q.answer:q.answer+'°'}
const appSoundFiles={correct:'sounds/correct.wav',incorrect:'sounds/incorrect.wav',lock:'sounds/unlock-click.wav',unlock:'sounds/achievement.wav',timerTick:'sounds/timer-tick.wav',timerFinished:'sounds/timer-finished.wav'};
const appSoundVolumes={correct:1,incorrect:.48,lock:.44,unlock:.35,timerTick:.38,timerFinished:.72};
const appSounds={};Object.entries(appSoundFiles).forEach(([k,v])=>{const a=new Audio(v);a.preload='auto';a.volume=appSoundVolumes[k]??1;appSounds[k]=a});
function playAppSound(type){try{const a=appSounds[type];if(!a)return;a.pause();a.currentTime=0;const p=a.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
const el=id=>document.getElementById(id);
const orbLevels=['easy','medium','hard'];
function initialLevels(){return {easy:{unlock:0,unlocked:true,session:null,q:null,resolved:false,transitioning:false,notice:''},medium:{unlock:0,unlocked:false,session:null,q:null,resolved:false,transitioning:false,notice:''},hard:{unlock:0,unlocked:false,session:null,q:null,resolved:false,transitioning:false,notice:''}}}
const state={mode:'student',activeLevel:'easy',timerId:null,timeLeft:0,...initialLevels()};
const completedResults={easy:null,medium:null,hard:null};
function clearOrbTimer(level){const orb=document.querySelector(`.level-orb[data-level="${level}"]`);if(!orb)return;orb.classList.remove('timer-ready','timer-running','timer-finished');orb.style.removeProperty('--timer-progress');orb.style.removeProperty('--progress');const v=orb.querySelector('.orb-timer-value');if(v)v.textContent=''}
function clearAllOrbTimers(){orbLevels.forEach(clearOrbTimer)}
function showOrbTimer(level,value,status='ready',progress=1){clearAllOrbTimers();const orb=document.querySelector(`.level-orb[data-level="${level}"]`);if(!orb)return;orb.classList.add(`timer-${status}`);orb.style.setProperty('--progress',Math.max(0,Math.min(1,progress)));const v=orb.querySelector('.orb-timer-value');if(v)v.textContent=value}
function formatSessionTime(s){const n=Math.max(0,Math.round(Number(s)||0));return n<60?`${n} sec`:`${Math.floor(n/60)}m ${n%60}s`}
function sessionReportNote(level,u){return u>=3?`${levelName(level)} is unlocked for continued practice.`:`Keep practicing — ${3-u} more correct ${3-u===1?'answer':'answers'} to complete this level.`}
function recordCompletedResult(level,session,accuracy){completedResults[level]={correct:session.correct,incorrect:session.incorrect,total:session.total,accuracy,mode:session.mode,timeLimit:session.timeLimit}}
function clearCompletedResults(){orbLevels.forEach(l=>completedResults[l]=null)}
function printCombinedResults(){
 const rows=orbLevels.filter(l=>completedResults[l]).map(l=>{const r=completedResults[l];return `<tr><td>${levelName(l)}</td><td>${r.correct}</td><td>${r.incorrect}</td><td>${r.accuracy}%</td></tr>`}).join('');
 const w=window.open('','_blank','width=820,height=700');if(!w)return;
 w.document.write(`<title>Missing Interior Angles — Results</title><h1>Missing Interior Angles</h1><table border="1" cellspacing="0" cellpadding="8"><tr><th>Level</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th></tr>${rows||'<tr><td colspan="4">No completed sessions yet.</td></tr>'}</table>`);w.document.close();w.print();
}
function updateLiveStats(level){const box=el(level+'LiveStats'),s=state[level].session;if(!box||!s)return;if(state[level].unlock>=3){box.textContent=`This session: ${s.correct} correct · ${s.incorrect} incorrect`;box.classList.remove('hidden')}else box.classList.add('hidden')}
function renderStart(level){el(level+'Body').innerHTML=`<button class="start" data-level="${level}">Start</button>`;el(level+'Body').querySelector('button').onclick=()=>newSession(level)}
function newSession(level){
  if(!state[level].unlocked)return;
  if(state.activeLevel&&state.activeLevel!==level&&state[state.activeLevel].session)finishSession(state.activeLevel);
  clearAllOrbTimers();state.activeLevel=level;
  state[level].session={correct:0,incorrect:0,total:0,mode:state.mode,timeLimit:state.mode==='timer'?Number(el('duration').value):0,startedAt:Date.now()};
  state[level].resolved=false;state[level].transitioning=false;state[level].q=generateQuestion(level,'game');renderQuestion(level);startTimer();
}
function startTimer(){
  clearInterval(state.timerId);state.timerId=null;if(state.mode!=='timer'){clearAllOrbTimers();return}
  const level=state.activeLevel,total=Number(el('duration').value);state.timeLeft=total;showOrbTimer(level,total,'ready',1);
  state.timerId=setInterval(()=>{state.timeLeft--;showOrbTimer(level,Math.max(0,state.timeLeft),'running',state.timeLeft/total);if(state.timeLeft>0&&state.timeLeft<=5)playAppSound('timerTick');if(state.timeLeft<=0){clearInterval(state.timerId);state.timerId=null;playAppSound('timerFinished');finishSession(level,{timerExpired:true})}},1000);
}
function renderQuestion(level){
 const s=state[level],q=s.q;s.resolved=false;s.transitioning=false;q.hint=hintFor(q);
 const content=`<div class="whole-question foa-question question-fade-in" id="${level}Problem"><div class="angle-task">${questionHTML(q)}</div></div><div class="whole-answer-row foa-answer-row angle-answer-row"><div class="whole-answer-box"><input id="${level}Answer" class="angle-answer" inputmode="numeric" autocomplete="off" enterkeyhint="done" aria-label="${q.responseKind==='x'?'Value of x':'Angle in degrees'}" placeholder="${q.responseKind==='x'?'x = ?':'Angle = ?'}"></div>${q.responseKind==='angle'?'<span class="angle-degree">°</span>':''}<button class="primary" id="${level}Check">Check</button></div>`;
 el(level+'Body').innerHTML=`${content}<div class="whole-answer-note angle-note">${q.responseKind==='x'?'Enter the value of x (a number, not degrees).':'Enter the requested angle in whole degrees.'}</div><div class="actions"><button class="primary hidden" id="${level}Next">Next</button><button class="done" id="${level}Done">Done</button></div><div class="feedback" id="${level}Feedback"></div><div class="live-session hidden" id="${level}LiveStats" aria-live="polite"></div>${s.notice?`<div class="unlock-guidance">${s.notice}</div>`:''}<div class="bubble hidden" id="${level}Bubble"><div class="bubble-title">Let’s think about it</div><div id="${level}Hint"></div><div class="whole-working">${stepsHTML(q)}</div></div>`;
 el(level+'Check').onclick=()=>check(level);el(level+'Next').onclick=()=>nextQuestion(level);el(level+'Done').onclick=()=>finishSession(level);
 const input=el(level+'Answer');input.addEventListener('input',()=>input.value=input.value.replace(/[^0-9°]/g,'').slice(0,5));
 input.addEventListener('keydown',e=>{if(e.key!=='Enter')return;e.preventDefault();if(e.repeat)return;if(!el(level+'Next').classList.contains('hidden'))nextQuestion(level);else check(level)});
 updateLiveStats(level);input.focus();
}
function check(level){
 const s=state[level];if(!s.session||s.resolved||s.transitioning)return;
 const q=s.q,input=el(level+'Answer'),feedback=el(level+'Feedback');
 const parsed=parseAnswer(input.value);
 if(!parsed.valid){feedback.textContent=parsed.message;feedback.className='feedback incorrect';input.focus();return}
 s.resolved=true;s.session.total++;const correct=parsed.answer===String(q.answer);
 if(correct){
  s.session.correct++;
  if(s.unlock<3){s.unlock++;el(level+'Progress').textContent=`${s.unlock} / 3`;if(s.unlock===3){const next=level==='easy'?'medium':level==='medium'?'hard':null;if(next&&!state[next].unlocked)unlock(next)}}
  feedback.innerHTML='<span class="correct-callout">Correct!</span>';feedback.className='feedback correct';playAppSound('correct');
 }else{
  s.session.incorrect++;feedback.innerHTML=`Incorrect. The correct answer is <strong>${formatAnswer(q)}</strong>.`;feedback.className='feedback incorrect';el(level+'Hint').textContent=q.hint;el(level+'Bubble').classList.remove('hidden');playAppSound('incorrect');
 }
 input.disabled=true;el(level+'Check').disabled=true;el(level+'Check').classList.add('hidden');el(level+'Next').classList.remove('hidden');el(level+'Next').focus();updateLiveStats(level);
}
function nextQuestion(level){
  const s=state[level];if(!s.session||!s.resolved||s.transitioning)return;s.transitioning=true;
  const p=el(level+'Problem');if(p)p.classList.add('question-fade-out');
  setTimeout(()=>{s.q=generateQuestion(level,'game');renderQuestion(level)},170);
}
function finishSession(level,{timerExpired=false}={}){
  const s=state[level];if(!s.session)return;clearInterval(state.timerId);state.timerId=null;
  const session=s.session,acc=session.total?Math.round(session.correct/session.total*100):0;recordCompletedResult(level,session,acc);
  const elapsed=Math.round((Date.now()-session.startedAt)/1000);
  el(level+'Body').innerHTML=`<div class="report"><div class="report-title">Session Report</div><div class="report-grid${session.mode==='timer'?' has-time':''}"><div class="stat"><strong>${session.correct}</strong><span>Correct</span></div><div class="stat"><strong>${session.incorrect}</strong><span>Incorrect</span></div><div class="stat"><strong>${acc}%</strong><span>Accuracy</span></div>${session.mode==='timer'?`<div class="stat"><strong>${formatSessionTime(Math.min(elapsed,session.timeLimit||elapsed))}</strong><span>Time Used</span></div>`:''}</div><div class="report-note">${timerExpired?'Time is up. ':''}${sessionReportNote(level,s.unlock)}</div><div class="report-actions"><button class="restart" id="${level}Restart">Start Again</button><button class="print-results-button" id="${level}PrintResults" type="button">Print Results</button></div></div>`;
  el(level+'Restart').onclick=()=>newSession(level);el(level+'PrintResults').onclick=printCombinedResults;s.session=null;s.resolved=false;s.transitioning=false;clearAllOrbTimers();
}
function positionUnlockCelebration(anchorLevel){
  const banner=document.getElementById('banner');
  if(!banner)return;
  if(window.innerWidth<=900){
    banner.style.left='';
    banner.style.top='';
    return;
  }
  const card=document.getElementById(anchorLevel+'Card');
  const column=document.querySelector('.practice-main-column');
  if(!card||!column)return;
  if(banner.parentElement!==column)column.appendChild(banner);
  const cardRect=card.getBoundingClientRect();
  const columnRect=column.getBoundingClientRect();
  const bannerWidth=banner.offsetWidth||330;
  const bannerHeight=banner.offsetHeight||92;
  const inset=14;
  const gap=10;
  const left=Math.max(inset,Math.min(cardRect.right-columnRect.left-bannerWidth-inset,columnRect.width-bannerWidth-inset));
  const top=Math.max(8,cardRect.top-columnRect.top-bannerHeight-gap);
  banner.style.left=`${Math.round(left)}px`;
  banner.style.top=`${Math.round(top)}px`;
}

function showUnlockCelebration(modeName,anchorLevel){
  const banner=document.getElementById('banner');
  if(!banner)return;
  banner.innerHTML=`<span class="unlock-celebration-icon" aria-hidden="true">✦</span><span class="unlock-celebration-kicker">Level unlocked</span><strong class="unlock-celebration-title">${modeName} Unlocked</strong><span class="unlock-celebration-sub">You can now practice this mode whenever you’re ready.</span>`;
  banner.classList.remove('show');
  positionUnlockCelebration(anchorLevel);
  void banner.offsetWidth;
  banner.classList.add('show');
  playAppSound('unlock');
  clearTimeout(banner._unlockCelebrationTimer);
  banner._unlockCelebrationTimer=setTimeout(()=>banner.classList.remove('show'),4900);
}

function unlock(level){
  const card=el(level+'Card'),lock=el(level+'Lock');if(!card||state[level].unlocked)return;
  if(lock){lock.classList.add('shake');setTimeout(()=>{lock.classList.remove('shake');lock.classList.add('open');playAppSound('lock')},350)}
  setTimeout(()=>{state[level].unlocked=true;card.classList.remove('locked');card.classList.add('active');el(level+'Progress').classList.remove('hidden');renderStart(level);const prev=level==='medium'?'easy':'medium';state[prev].notice=`${levelName(level)} is now available. You can continue practicing in ${levelName(prev)} until you feel ready to move on.`;showUnlockCelebration(levelName(level),prev)},900);
}
function setMode(mode){
  if(state.activeLevel&&state[state.activeLevel].session)finishSession(state.activeLevel);
  state.mode=mode;el('studentMode').classList.toggle('active',mode==='student');el('timerMode').classList.toggle('active',mode==='timer');el('durationWrap').classList.toggle('show',mode==='timer');
  el('modeTip').textContent=mode==='student'?'Student Mode lets you work without a countdown. Incorrect answers reveal the correct answer and a teaching hint. Press Enter or Next to continue.':'Timer Mode is a speed challenge. The colored circle for the level you are practicing becomes the countdown timer.';
  if(mode==='timer')showOrbTimer(state.activeLevel||'easy',el('duration').value,'ready',1);else clearAllOrbTimers();
}
el('studentMode').onclick=()=>setMode('student');el('timerMode').onclick=()=>setMode('timer');el('duration').onchange=()=>{if(state.mode==='timer'&&!state[state.activeLevel]?.session)showOrbTimer(state.activeLevel||'easy',el('duration').value,'ready',1)};
const resetModalBackdrop=el('resetModalBackdrop'),resetProgressButton=el('resetProgressButton'),resetCancelButton=el('resetCancelButton'),resetConfirmButton=el('resetConfirmButton');
function closeResetModal(){resetModalBackdrop.classList.remove('show');resetProgressButton.focus()}
function openResetModal(){resetModalBackdrop.classList.add('show');resetCancelButton.focus()}
function resetAllProgress(){
 clearCompletedResults();clearInterval(state.timerId);state.timerId=null;state.mode='student';state.activeLevel='easy';
 const initial=initialLevels();orbLevels.forEach(l=>state[l]=initial[l]);
 for(const channel of Object.values(recent))for(const l of orbLevels)channel[l]=[];
 Object.keys(foundationQueues).forEach(channel=>foundationQueues[channel]=[]);
 el('studentMode').classList.add('active');el('timerMode').classList.remove('active');el('durationWrap').classList.remove('show');clearAllOrbTimers();refreshLevelCards();closeResetModal();
}
function refreshLevelCards(){
 for(const l of orbLevels){const s=state[l],card=el(l+'Card');card.className=`card ${s.unlocked?'active':'locked'}`;el(l+'Progress').textContent=`${s.unlock} / 3`;el(l+'Progress').classList.toggle('hidden',!s.unlocked);if(s.unlocked)renderStart(l);else el(l+'Body').innerHTML=`<div class="lock" id="${l}Lock"><div class="shackle"></div><div class="lockbody"></div></div>`;}
}
resetProgressButton.addEventListener('click',openResetModal);resetCancelButton.addEventListener('click',closeResetModal);resetConfirmButton.addEventListener('click',resetAllProgress);resetModalBackdrop.addEventListener('click',e=>{if(e.target===resetModalBackdrop)closeResetModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&resetModalBackdrop.classList.contains('show'))closeResetModal()});



el('angPolyMode').onchange=e=>{polygonChoice=e.target.value;const l=state.activeLevel;if(state[l]?.session){state[l].q=generateQuestion(l,'game');renderQuestion(l)}};
renderStart('easy');
})();
