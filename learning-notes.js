/* Show the idle learning note only when it fits clear of the logo and Start. */
(() => {
 const note=document.getElementById('fractionLearning'),start=document.getElementById('startBtn');
 if(!note||!start)return;
 const banner=document.getElementById('mobileStartBanner');
 let frame;
 const update=()=>{
  note.hidden=start.classList.contains('hidden');
  if(note.hidden){note.classList.remove('note-fits');return;}
  const n=note.getBoundingClientRect(),b=start.getBoundingClientRect(),box=note.parentElement.getBoundingClientRect();
  const overlaps=r=>r.width>0&&r.height>0&&n.left<r.right+8&&n.right>r.left-8&&n.top<r.bottom+8&&n.bottom>r.top-8;
  const logo=banner&&!banner.classList.contains('hidden')?banner.getBoundingClientRect():null;
  note.classList.toggle('note-fits',n.height>0&&n.top>=box.top+8&&n.bottom<=box.bottom-3&&!overlaps(b)&&(!logo||!overlaps(logo)));
 };
 const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
 new MutationObserver(schedule).observe(start,{attributes:true,attributeFilter:['class']});
 if(banner){new MutationObserver(schedule).observe(banner,{attributes:true,attributeFilter:['class','src']});banner.addEventListener('load',schedule);}
 const ro=new ResizeObserver(schedule);[note,start,note.parentElement].forEach(el=>ro.observe(el));
 addEventListener('resize',schedule);document.fonts?.ready.then(schedule);schedule();
})();
