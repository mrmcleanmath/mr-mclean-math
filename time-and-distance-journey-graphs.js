'use strict';
window.practiceModel=(()=>{
// Make the divisor whole; allow 1..9 or a power of ten without cancellation.
function divisionParts(value){
 const s=String(value).replace(/ /g,'').replace(/^-/,'');
 if(!/^\d+(?:\.\d+)?$/.test(s))throw Error('Unsupported divisor '+value);
 const [whole,fraction='']=s.split('.');
 return {divisor:Number(whole+fraction),places:fraction.length};
}
function allowedDivisor(value){
 const d=divisionParts(value).divisor;
 return d>=1&&(d<=9||/^10+$/.test(String(d)));
}
function shiftForDivision(value,places){
 const s=String(value).replace(/ /g,''),negative=s.startsWith('-'),abs=negative?s.slice(1):s;
 const [w,f='']=abs.split('.'),digits=w+f,point=w.length+places;
 let result=point>=digits.length?digits+'0'.repeat(point-digits.length):digits.slice(0,point)+'.'+digits.slice(point);
 result=result.replace(/^0+(?=\d)/,'').replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'');
 return (negative?'-':'')+result;
}
function divisionWorking(numerator,denominator,answer){
 const {divisor,places}=divisionParts(denominator);
 if(!allowedDivisor(denominator))throw Error('Unsuitable student division');
 const first=numerator+' ÷ '+denominator;
 return places?first+' = '+shiftForDivision(numerator,places)+' ÷ '+divisor+' = '+answer+' (multiply both numbers by '+10**places+').':first+' = '+answer+'.';
}
const randInt=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const choice=a=>a[randInt(0,a.length-1)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=randInt(0,i);[a[i],a[j]]=[a[j],a[i]]}return a}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const approx=(a,b,e=1e-9)=>Math.abs(a-b)<e;
const round1=x=>Math.round(x*10)/10;

function formatTime(mins){
  const h=Math.floor(mins/60),m=mins%60;
  if(m===0)return h+" h";
  return h+":"+(m<10?"0":"")+m;
}
function formatInterval(a,b){return `${formatTime(a)} to ${formatTime(b)}`;}

function getSegments(g){
  const out=[];
  for(let i=0;i<g.times.length-1;i++){
    const t1=g.times[i],t2=g.times[i+1],d1=g.dist[i],d2=g.dist[i+1];
    const dtH=(t2-t1)/60,dd=d2-d1;
    out.push({i,t1,t2,d1,d2,dd,dtH,speed:dtH?dd/dtH:0});
  }
  return out;
}
const SPEEDS=[20,40,60,80,100],MIN_SPEED_DIFF=18;
function pickSeparated(existing){
  for(let k=0;k<30;k++){const s=choice(SPEEDS);if(existing.every(x=>Math.abs(x-s)>=MIN_SPEED_DIFF))return s}
  return choice(SPEEDS);
}

function generateGraph(advanced){
  const maxMins=360;
  const step=Math.random()<.4?30:60;
  const segCount=randInt(3,5);
  const times=[0];let t=0;
  while(times.length<segCount+1 && t+step<=maxMins){let add=(step===30&&Math.random()<.22)?60:step;t+=add;if(t<=maxMins)times.push(t)}
  while(times.length<4&&t+step<=maxMins){t+=step;times.push(t)}
  const dist=[0];let d=0,stops=randInt(0,2),hasMove=false,hasDown=false;const used=[];
  for(let i=1;i<times.length;i++){
    const dt=(times[i]-times[i-1])/60;let delta=0;
    if(stops>0&&Math.random()<.22){stops--;}
    else{
      const goDown=advanced&&d>0&&Math.random()<.22;
      let mag=pickSeparated(used)*dt;
      if(!approx(mag,Math.round(mag)))mag=round1(mag);
      if(approx(mag,Math.round(mag)))mag=Math.round(mag/10)*10;
      delta=goDown?-mag:mag;
      if(d+delta>420)delta=Math.floor((420-d)/10)*10;
      if(d+delta<0)delta=-Math.floor(d/10)*10;
      if(delta===0){
        mag=pickSeparated(used)*dt;
        if(!approx(mag,Math.round(mag)))mag=round1(mag);
        if(approx(mag,Math.round(mag)))mag=Math.round(mag/10)*10;
        delta=goDown?-mag:mag;
        if(d+delta>420)delta=420-d;
        if(d+delta<0)delta=-d;
      }
      if(delta!==0){hasMove=true;used.push(Math.abs(delta)/dt)}
      if(delta<0)hasDown=true;
    }
    d=clamp(d+delta,0,420);dist.push(d);
  }
  if(!hasMove && dist.length>1)dist[dist.length-1]=clamp(dist[dist.length-2]+60,0,420);
  if(advanced&&!hasDown&&Math.random()<.55&&dist.length>=3&&dist[dist.length-2]>0){
    dist[dist.length-1]=clamp(dist[dist.length-2]-Math.min(dist[dist.length-2],60),0,420);
  }
  const maxDist=Math.max(...dist);
  const yTop=maxDist<=150?200:maxDist<=250?300:maxDist<=350?400:500;
  const xTop=Math.ceil(Math.max(times[times.length-1],120)/60)*60;
  return {times,dist,xTop,yTop};
}

function totalDistance(segs){return segs.reduce((s,x)=>s+Math.abs(x.dd),0)}
function turningTime(segs){
  for(let i=1;i<segs.length;i++){if((segs[i-1].dd>0&&segs[i].dd<0)||(segs[i-1].dd<0&&segs[i].dd>0))return segs[i].t1}
  return null;
}
function maxDistance(g){return Math.max(...g.dist)}
function mc(prompt,opts,idx,explanation){return {type:"mc",prompt,options:opts,correctIndex:idx,answerText:opts[idx],explanation}}
function inputQ(prompt,value,unit,explanation){return {type:"input",prompt,correctValue:value,unit,explanation}}
function numericOptions(correct,unit,steps){
  const vals=new Set([correct]);
  const candidates=shuffle(steps.map(x=>Math.max(0,correct+x)));
  for(const v of candidates){vals.add(v);if(vals.size===4)break}
  while(vals.size<4)vals.add(correct+vals.size*10);
  const options=shuffle([...vals]).map(v=>`${v} ${unit}`);
  return {options,idx:options.indexOf(`${correct} ${unit}`)};
}
function safeTimeOptions(correct,g){
  // Use graph times first, then nearby grid times. This cannot loop forever.
  const pool=new Set(g.times.slice(1));
  const step=g.xTop<=240?30:60;
  for(let t=step;t<=g.xTop;t+=step)pool.add(t);
  pool.add(correct);
  let vals=shuffle([...pool].filter(Number.isFinite));
  if(!vals.includes(correct))vals.unshift(correct);
  vals=vals.slice(0,4);
  while(vals.length<4){const candidate=vals.length*step; if(!vals.includes(candidate))vals.push(candidate); else vals.push(g.xTop+vals.length*step)}
  const opts=shuffle(vals.map(formatTime));
  return {options:opts,idx:opts.indexOf(formatTime(correct))};
}

function generateQuestion(g,advanced,foundation=false){
  const segs=getSegments(g),moving=segs.filter(s=>s.dd!==0),down=segs.filter(s=>s.dd<0),stopped=segs.filter(s=>s.dd===0);
  const types=["endDistance","distanceBetween","distanceAtTime","greatest"];
  if(moving.length)types.push("fastest");
  if(moving.length>=2)types.push("slowest","compare");
  if(stopped.length)types.push("stopped","stopDuration");
  if(advanced){
    if(down.length)types.push("movingBack","totalTraveled");
    if(turningTime(segs)!==null)types.push("turnAround");
    types.push("distanceFromStartEnd");
  }
  const type=choice(types.filter(t=>advanced || !foundation || ["endDistance","distanceAtTime","greatest","stopped","stopDuration"].includes(t)));lastType=type;

  if(type==="fastest"||type==="slowest"){
    const target=moving.reduce((best,s)=>{
      if(!best)return s;
      return type==="fastest"?(Math.abs(s.speed)>Math.abs(best.speed)?s:best):(Math.abs(s.speed)<Math.abs(best.speed)?s:best);
    },null);
    let optsSeg=shuffle(segs);
    if(!optsSeg.some(s=>s.i===target.i))optsSeg.unshift(target);
    optsSeg=[target,...optsSeg.filter(s=>s.i!==target.i)].slice(0,Math.min(4,segs.length));
    const options=shuffle(optsSeg).map(s=>formatInterval(s.t1,s.t2));
    return mc(type==="fastest"?"Between which times was the person moving the fastest?":"Between which times was the person moving the slowest (but still moving)?",
      options,options.indexOf(formatInterval(target.t1,target.t2)),
      type==="fastest"?"Fastest means the steepest moving line.":"Slowest while moving means the least steep moving line.");
  }
  if(type==="stopped"){
    const s=choice(stopped);let opts=[s,...shuffle(segs.filter(x=>x.i!==s.i))].slice(0,Math.min(4,segs.length));
    const options=shuffle(opts).map(x=>formatInterval(x.t1,x.t2));
    return mc("Between which times was the person stopped (not moving)?",options,options.indexOf(formatInterval(s.t1,s.t2)),"A horizontal line means the distance stays the same.");
  }
  if(type==="movingBack"){
    const s=choice(down);let opts=[s,...shuffle(segs.filter(x=>x.i!==s.i))].slice(0,Math.min(4,segs.length));
    const options=shuffle(opts).map(x=>formatInterval(x.t1,x.t2));
    return mc("Between which times was the person moving back toward the start?",options,options.indexOf(formatInterval(s.t1,s.t2)),"A downward line means the distance from the start is decreasing.");
  }
  if(type==="turnAround"){
    const t=turningTime(segs),o=safeTimeOptions(t,g);
    return mc("At what time did the person turn around (change direction)?",o.options,o.idx,"Turning around is where the graph changes from rising to falling or falling to rising.");
  }
  if(type==="compare"){
    const [a,b]=shuffle(moving).slice(0,2);
    const options=[formatInterval(a.t1,a.t2),formatInterval(b.t1,b.t2),"They are the same speed"];
    let idx=2;if(Math.abs(a.speed)>Math.abs(b.speed))idx=0;else if(Math.abs(b.speed)>Math.abs(a.speed))idx=1;
    return mc("Which interval shows the faster speed?",options,idx,"Faster speed means a steeper line.");
  }
  if(type==="stopDuration"){
    const s=choice(stopped),mins=s.t2-s.t1,o=numericOptions(mins,"min",[-60,-30,-15,15,30,60]);
    return mc(`For how long was the person stopped between ${formatTime(s.t1)} and ${formatTime(s.t2)}?`,o.options,o.idx,"Find the time difference across the horizontal segment.");
  }
  if(type==="distanceBetween"){
    const s=choice(segs),v=Math.abs(s.dd),o=numericOptions(v,"km",[-60,-40,-20,20,40,60]);
    if(Number.isInteger(v)&&v%10===0&&Math.random()<.25)return inputQ(`How many kilometers did the person travel from ${formatTime(s.t1)} to ${formatTime(s.t2)}?`,v,"km","Travel distance is the absolute change in distance.");
    return mc(`How many kilometers did the person travel from ${formatTime(s.t1)} to ${formatTime(s.t2)}?`,o.options,o.idx,"Travel distance is the absolute change in distance.");
  }
  if(type==="distanceAtTime"){
    const i=randInt(1,g.times.length-1),v=g.dist[i],o=numericOptions(v,"km",[-80,-60,-40,-20,20,40,60,80]);
    if(Number.isInteger(v)&&v%10===0&&Math.random()<.25)return inputQ(`What is the distance at time ${formatTime(g.times[i])}?`,v,"km","Read the y-value at that time.");
    return mc(`What is the distance at time ${formatTime(g.times[i])}?`,o.options,o.idx,"Read the y-value at that time.");
  }
  if(type==="greatest"){
    const v=maxDistance(g),o=numericOptions(v,"km",[-80,-60,-40,-20,20,40,60,80]);
    return mc("What is the greatest distance from the start on this graph?",o.options,o.idx,"The greatest distance is the highest y-value on the graph.");
  }
  if(type==="totalTraveled"){
    const v=totalDistance(segs),o=numericOptions(v,"km",[-80,-60,-40,-20,20,40,60,80]);
    return mc("What total distance did the person travel in all?",o.options,o.idx,"Add every movement, including any distance traveled back toward the start.");
  }
  const v=g.dist[g.dist.length-1],o=numericOptions(v,"km",[-80,-60,-40,-20,20,40,60,80]);
  return mc(type==="distanceFromStartEnd"?"How far from the start is the person at the end of the graph?":"What distance is shown at the end of the graph?",o.options,o.idx,"Read the final y-value.");
}

const journeyStreams=new Map();
function resetSequence(level,channel='game'){
 const key=level+'|'+channel,old=journeyStreams.get(key);
 journeyStreams.set(key,{queue:[],number:0,recent:old?old.recent:[]});
}
function elapsedLabel(minutes){
 const h=Math.floor(minutes/60),m=minutes%60;
 return h?(h+' h'+(m?' '+m+' min':'')):m+' min';
}
function intervalLabel(s){return elapsedLabel(s.t1)+' to '+elapsedLabel(s.t2);}
function linkedQuestion(g,type,segmentIndex=0){
 const segs=getSegments(g),moving=segs.filter(s=>s.dd),stop=segs.find(s=>!s.dd),s=segs[segmentIndex];
 const elapsed=g.times.at(-1),stopMins=stop.t2-stop.t1;
 let prompt,answer,unit='km',steps,hint='Read the axes and use the graph.',options,choiceCodes,correctCode,parameter;
 const interval=intervalLabel(s),distance=Math.abs(s.dd),speed=Math.abs(s.speed);
 const readings='At '+elapsedLabel(s.t1)+' the distance from the start is '+s.d1+' km; at '+elapsedLabel(s.t2)+' it is '+s.d2+' km.';
 if(type==='distanceAtTime'){
  parameter=randInt(1,g.times.length-1);answer=g.dist[parameter];
  prompt='How far from the start is the vehicle after '+elapsedLabel(g.times[parameter])+'?';
  steps='Follow '+elapsedLabel(g.times[parameter])+' up to the line, then across to the distance axis: '+answer+' km.';
 }else if(type==='endDistance'||type==='distanceFromStartEnd'){
  answer=g.dist.at(-1);prompt='How far from the start is the vehicle at the end of this journey?';steps='Read the final point: '+answer+' km from the start.';
 }else if(type==='greatest'){
  answer=Math.max(...g.dist);prompt='What is the greatest distance from the start reached on this journey?';steps='The highest point is '+answer+' km from the start.';
 }else if(type==='stopDuration'){
  unit='minutes';answer=stopMins;prompt='For how many minutes was the vehicle stopped?';hint='Find the horizontal section, then read its start and end times.';
  steps='The horizontal section runs from '+elapsedLabel(stop.t1)+' to '+elapsedLabel(stop.t2)+'. '+stop.t2+' − '+stop.t1+' = '+answer+' minutes.';
 }else if(type==='elapsedTime'||type==='movingTime'){
  unit='minutes';answer=type==='elapsedTime'?elapsed:elapsed-stopMins;
  prompt=type==='elapsedTime'?'How many minutes did the whole journey take, including the stop?':'For how many minutes was the vehicle moving?';
  hint='Read the journey end time. Moving time excludes the stop.';
  steps='The journey lasts '+elapsedLabel(elapsed)+' = '+elapsed+' minutes. The stop lasts '+stopMins+' minutes.'+(type==='movingTime'?'<br>Moving time = '+elapsed+' − '+stopMins+' = '+answer+' minutes.':'');
 }else if(type==='distanceBetween'){
  answer=distance;prompt='How far did the vehicle travel from '+interval+'?';
  steps=readings+'<br>Distance travelled = '+Math.max(s.d1,s.d2)+' − '+Math.min(s.d1,s.d2)+' = '+answer+' km.';
 }else if(type==='totalTraveled'){
  answer=totalDistance(segs);prompt='What total distance did the vehicle travel, including the return section?';hint='Add the distance travelled on every moving section, including the return.';
  steps=moving.map(part=>intervalLabel(part)+': '+Math.max(part.d1,part.d2)+' − '+Math.min(part.d1,part.d2)+' = '+Math.abs(part.dd)+' km.').join('<br>')+'<br>Total = '+moving.map(part=>Math.abs(part.dd)).join(' + ')+' = '+answer+' km. The final distance from the start is '+g.dist.at(-1)+' km; that is a different measurement.';
 }else if(type==='segmentSpeed'){
  answer=speed;unit='km/h';prompt='What was the vehicle’s speed from '+interval+'?';hint='Speed = distance travelled ÷ time taken in hours.';
  steps=readings+'<br>It travels '+distance+' km in '+(s.t2-s.t1)+' minutes = '+s.dtH+' h.<br>'+divisionWorking(distance,s.dtH,answer)+' Speed = '+answer+' km/h.';
 }else if(type==='predictDistance'){
  parameter=randInt(2,3);answer=speed*parameter;
  prompt='Use the speed from '+interval+'. At that same speed on a new road, how far would the vehicle travel in '+parameter+' hours?';
  hint='Find the speed from the graph, then use distance = speed × time.';
  steps=readings+'<br>Speed: '+divisionWorking(distance,s.dtH,speed)+'<br>On the new road: '+speed+' × '+parameter+' = '+answer+' km.';
 }else if(type==='predictTime'){
  parameter=100*randInt(1,3);unit='hours';answer=parameter/speed;
  prompt='Use the speed from '+interval+'. At that same speed on a new road, how many hours would it take to travel '+parameter+' km?';
  hint='Find the speed from the graph, then use time = distance ÷ speed.';
  steps=readings+'<br>Speed: '+divisionWorking(distance,s.dtH,speed)+'<br>Time: '+divisionWorking(parameter,speed,answer)+' Required time: '+answer+' h.';
 }else{
  let choices;
  if(type==='stopped'||type==='fastest'||type==='slowest'){
   const target=type==='stopped'?stop:moving.reduce((a,b)=>(type==='fastest'?Math.abs(a.speed)>Math.abs(b.speed):Math.abs(a.speed)<Math.abs(b.speed))?a:b);
   prompt=type==='stopped'?'Which interval shows the vehicle stopped?':type==='fastest'?'Which interval shows the greatest speed?':'Which interval shows the slowest speed while still moving?';
   choices=segs.map(part=>({code:String(part.i),text:intervalLabel(part)}));correctCode=String(target.i);
   steps=type==='stopped'?'A horizontal line means the distance from the start is unchanged: the vehicle is stopped.':'Compare the steepness of the moving sections, ignoring whether they rise or fall. The '+(type==='fastest'?'steepest':'least steep moving')+' section is '+intervalLabel(target)+'.';
  }else if(type==='horizontalMeaning'){
   prompt='What does the horizontal section tell you about the vehicle?';correctCode='stopped';
   choices=[{code:'stopped',text:'It is stopped: its distance from the start stays the same.'},{code:'flatRoad',text:'It is moving along a flat road.'},{code:'constantSpeed',text:'It is moving at a steady speed away from the start.'}];
   steps='Time passes but the distance from the start does not change. The vehicle is stopped. This is a distance–time graph, not a picture of the road.';
  }else if(type==='returnMeaning'){
   prompt='What does the straight downward section show?';correctCode='returning';
   choices=[{code:'returning',text:'It is returning towards the start at a steady speed.'},{code:'slowing',text:'It is slowing down because the line goes down.'},{code:'downhill',text:'It is travelling downhill.'}];
   steps='The distance from the start decreases, so the vehicle is returning. The section is straight, so its speed is steady. The graph does not show hills.';
  }else{
   prompt='Why does a steeper straight section mean a greater speed?';correctCode='rate';
   choices=[{code:'rate',text:'More distance is travelled in the same amount of time.'},{code:'height',text:'The vehicle must be farther from the start.'},{code:'hill',text:'The road is a steeper hill.'}];
   steps='Speed compares distance travelled with time taken. A steeper section changes distance more in the same time. Height above the axis alone does not tell you the speed.';
  }
  choices=shuffle(choices);options=choices.map(c=>c.text);choiceCodes=choices.map(c=>c.code);answer=choiceCodes.indexOf(correctCode)+1;unit='Option number';
 }
 const question={type:options?'mc':'input',prompt,correctValue:answer,unit};
 return {prompt,kind:'journey',answers:[String(answer)],labels:[unit],options,steps,hint,raw:{graph:g,type,segmentIndex,parameter,choiceCodes,correctCode,question},key:JSON.stringify([g.times,g.dist,type,segmentIndex,parameter])};
}
function make(level,channel='game'){
 const key=level+'|'+channel;
 if(!journeyStreams.has(key))resetSequence(level,channel);
 const stream=journeyStreams.get(key);
 if(!stream.queue.length){
  let g,moving,signature;
  for(let attempt=0;attempt<5000;attempt++){
   const candidate=generateGraph(level==='challenge'),parts=getSegments(candidate),moves=parts.filter(s=>s.dd);
   if(parts.filter(s=>!s.dd).length!==1||moves.length<2)continue;
   if(new Set(moves.map(s=>Math.abs(s.speed))).size!==moves.length)continue;
   if(moves.some(s=>!Number.isInteger(s.d2)||s.d2%10||!allowedDivisor(s.dtH)))continue;
   if(level==='challenge'&&(moves.filter(s=>s.dd<0).length!==1||!moves.some(s=>Math.abs(s.speed)===100)))continue;
   if(moves.slice(1).filter((s,i)=>s.dd*moves[i].dd<0).length>1)continue;
   signature=JSON.stringify([candidate.times,candidate.dist]);if(stream.recent.includes(signature))continue;
   g=candidate;moving=moves;break;
  }
  if(!g)throw Error('No suitable linked journey');
  stream.recent.push(signature);if(stream.recent.length>20)stream.recent.shift();stream.number++;
  const segment=choice(moving).i;
  const types=level==='foundation'?[choice(['distanceAtTime','endDistance','greatest']),'stopped','stopDuration','elapsedTime','horizontalMeaning']:level==='core'?['distanceBetween',choice(['movingTime','stopDuration']),'segmentSpeed','predictDistance',choice(['fastest','slowest','slopeMeaning'])]:['distanceFromStartEnd','totalTraveled',choice(['movingTime','elapsedTime']),choice(['segmentSpeed','predictDistance','predictTime']),'returnMeaning'];
  stream.queue=types.map((type,i)=>{
   const index=type==='predictTime'?moving.find(s=>Math.abs(s.speed)===100).i:segment;
   const q=linkedQuestion(g,type,index);q.sequence={journey:stream.number,part:i+1,total:5};return q;
  });
 }
 return stream.queue.shift();
}



return {id:"journey",title:"Time and Distance: Journey Graphs",make,resetSequence};})();