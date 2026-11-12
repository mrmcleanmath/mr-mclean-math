'use strict';
window.practiceModel=(()=>{
const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const pad2 = (n) => String(n).padStart(2, "0");

  function mulberry32(seed){
    let t = seed >>> 0;
    return function(){
      t += 0x6D2B79F5;
      let x = t;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function todaySeed(){
    const d = new Date();
    return (d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate()) >>> 0;
  }
  function timeToMinutes(h, m){ return h * 60 + m; }
  function minutesToTime(mins){
    mins = ((mins % 1440) + 1440) % 1440;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return {h, m};
  }
  function fmtClock(h, m){ return `${pad2(h)}:${pad2(m)}`; }
  function fmtDurationHM(h, m){ return `${h} h ${m} min`; }
  function fmtDurationDHM(d, h, m){
    const dWord = d === 1 ? "day" : "days";
    return `${d} ${dWord} ${h} h ${m} min`;
  }

  const names = [
    "Noomi","Elliot","Jennifer","Maja","Oskar","Amina","Leo","Alva","Nora","William",
    "Sofia","Liam","Emma","Oliver","Ava","Ella","Lucas","Mila","Hugo","Freya",
    "Isak","Thea","Aron","Ines","Axel","Saga","Elin","Vera","Molly","Felix",
    "Adam","Jasmine","Amir","Sara","Omar","Linnea","Ebba","Hanna","Ida","Klara",
    "Malik","Yara","Nina","Tobias","Samuel","Elias","Aria","Zara","Daniel","Mason",
    "Chloe","Grace","Henry","Ivy","Jack","Layla","Noah","Ruby","Theo","Zoe",
    "Callum","Fatima","Yusuf","Aisha","Mariam","Kian","Sienna","Emilia","Jonas","Matteo"
  ];
  const contexts = [
    "a film", "a lesson", "a train trip", "a bus ride", "football practice",
    "swim practice", "a study session", "a meeting", "a rehearsal", "a class",
    "a workout", "a museum visit", "a library visit", "a concert"
  ];

  // NEW pools for "end time" questions (added, minimal change)
  const travelTypes = ["train", "bus", "tram", "ferry"];
  const cities = ["Stockholm","Uppsala","Gothenburg","Malmo","Oslo","Copenhagen","Helsinki","Berlin","Hamburg","Paris","London"];
  const funEvents = ["a football match","a movie","a gaming session","a concert","a training session","a TV show","a basketball game","a swim practice"];

  function niceMinute(rng){ return pick(rng, [0,5,10,15,20,25,30,35,40,45,50,55]); }
  function anyMinute(rng){ return randInt(rng, 0, 59); }

  function genStartTime(mode, rng){
    if (mode === "regular"){
      return { h: randInt(rng, 6, 22), m: niceMinute(rng) };
    }
    return { h: randInt(rng, 0, 23), m: anyMinute(rng) };
  }

  function signature(q){
    const a = q.answer;
    return [
      q.mode, q.type, q.prompt,
      a.days ?? "", a.hours ?? "", a.minutes ?? "", a.minutesOnly ?? "",
      a.clockH ?? "", a.clockM ?? "", a.dayOffset ?? ""
    ].join("|").slice(0, 450);
  }

  // NEW helper: make friendly durations for end-time questions (no multi-digit x multi-digit required)
  function pickFriendlyDurationRegular(rng){
    // Common book-style durations: quarters + some simple ones
    const choices = [
      {h:0,m:15},{h:0,m:30},{h:0,m:45},
      {h:1,m:0},{h:1,m:15},{h:1,m:30},{h:1,m:45},
      {h:2,m:0},{h:2,m:15},{h:2,m:30},{h:2,m:45},
      {h:3,m:0}
    ];
    return pick(rng, choices);
  }
  function pickFriendlyDurationAdvanced(rng){
    const choices = [
      {h:0,m:12},{h:0,m:25},{h:0,m:40},{h:0,m:55},
      {h:1,m:10},{h:1,m:20},{h:1,m:35},{h:1,m:45},
      {h:2,m:5},{h:2,m:15},{h:2,m:30},{h:2,m:45},
      {h:3,m:20},{h:4,m:10}
    ];
    return pick(rng, choices);
  }

  function makeEndTimePrompt(rng, who, start, dur, mode){
    const style = pick(rng, ["travel","event","generic"]);
    if (style === "travel"){
      const vehicle = pick(rng, travelTypes);
      let from = pick(rng, cities);
      let to = pick(rng, cities);
      if (to === from) to = pick(rng, cities.filter(c=>c!==from));
      return `At ${fmtClock(start.h,start.m)}, ${who} traveled by ${vehicle} from ${from} to ${to}. The trip took ${fmtDurationHM(dur.h, dur.m)}. When did they arrive? Answer with the end time (hours and minutes).`;
    }
    if (style === "event"){
      const ev = pick(rng, funEvents);
      return `${ev} lasts ${fmtDurationHM(dur.h, dur.m)}. It starts at ${fmtClock(start.h,start.m)}. When does it end? Answer with the end time (hours and minutes).`;
    }
    return `Suppose the time is ${fmtClock(start.h,start.m)}. What time will it be after ${fmtDurationHM(dur.h, dur.m)}? Answer with the end time (hours and minutes).`;
  }

  function makeQuestion(mode){
    const rng = Math.random;
    const who = pick(rng, names);
    const ctx = pick(rng, contexts);


    if (mode === "regular"){
      // NEW: some regular questions are "end time" (addition) for variety
      // Keep most as original elapsed-time questions.
      const endTimeChance = 0.28; // \~28% addition style, rest unchanged
      const doEndTime = (rng() < endTimeChance);

      if (doEndTime){
        const start = genStartTime("regular", rng);
        const dur = pickFriendlyDurationRegular(rng);
        const durMin = dur.h*60 + dur.m;

        // Ensure no midnight crossover in regular mode
        let guard = 0;
        while (timeToMinutes(start.h,start.m) + durMin >= 1440 && guard < 50){
          guard++;
          start.h = randInt(rng, 6, 22);
          start.m = niceMinute(rng);
        }

        const endMin = timeToMinutes(start.h,start.m) + durMin;
        const end = minutesToTime(endMin);

        const prompt = makeEndTimePrompt(rng, who, start, dur, mode);

        return {
          mode,
          type: "end_time",
          fields: 2,
          prompt,
          startH: start.h, startM: start.m,
          durH: dur.h, durM: dur.m,
          answer: { clockH: end.h, clockM: end.m },
          steps: () => {
            const startTotal = timeToMinutes(start.h, start.m);
            const endTotal = startTotal + durMin;
            const endH = Math.floor((endTotal % 1440) / 60);
            const endM = endTotal % 60;
            return [
              `Add the duration to the start time:`,
              `start = ${fmtClock(start.h,start.m)}`,
              `duration = ${dur.h} h ${dur.m} min`,
              ``,
              `Convert start to minutes: ${start.h}x60 + ${start.m} = ${startTotal}`,
              `Convert duration to minutes: ${dur.h}x60 + ${dur.m} = ${durMin}`,
              `end total minutes = ${startTotal} + ${durMin} = ${endTotal}`,
              `Convert back to time: ${endH}:${pad2(endM)}`
            ].join("\n");
          }
        };
      }

      // ORIGINAL regular elapsed questions (unchanged)
      const start = genStartTime("regular", rng);

      const wantUnderHour = (rng() < 0.35); // about 35% minutes-only

      let elapsed;
      if (wantUnderHour){
        elapsed = pick(rng, [5,10,15,20,25,30,35,40,45,50,55]);
      } else {
        const h = randInt(rng, 1, 6);
        const m = niceMinute(rng);
        elapsed = h*60 + m;
        if (elapsed < 60) elapsed = 60;
      }

      while (timeToMinutes(start.h, start.m) + elapsed >= 1440){
        start.h = randInt(rng, 6, 22);
        start.m = niceMinute(rng);
      }

      const end = minutesToTime(timeToMinutes(start.h, start.m) + elapsed);

      const base = (rng() < 0.5)
        ? `${who} had ${ctx} from ${fmtClock(start.h,start.m)} to ${fmtClock(end.h,end.m)}.`
        : `Between ${fmtClock(start.h,start.m)} and ${fmtClock(end.h,end.m)}:`;

      if (elapsed < 60){
        return {
          mode,
          type: "elapsed_minutes",
          fields: 1,
          prompt: `${base} How many minutes is that? Answer in minutes.`,
          startH: start.h, startM: start.m, endH: end.h, endM: end.m,
          answer: { minutesOnly: elapsed },
          steps: () => {
            const s = timeToMinutes(start.h, start.m);
            const e = timeToMinutes(end.h, end.m);
            const diff = e - s;
            return [
              `Convert to minutes:`,
              `start = ${start.h}x60 + ${start.m} = ${s}`,
              `end = ${end.h}x60 + ${end.m} = ${e}`,
              `difference = ${e} - ${s} = ${diff} minutes`
            ].join("\n");
          }
        };
      } else {
        const H = Math.floor(elapsed / 60);
        const M = elapsed - H*60;
        return {
          mode,
          type: "elapsed_hm",
          fields: 2,
          prompt: `${base} How long was it? Answer in hours and minutes.`,
          startH: start.h, startM: start.m, endH: end.h, endM: end.m,
          answer: { hours: H, minutes: M },
          steps: () => {
            const s = timeToMinutes(start.h, start.m);
            const e = timeToMinutes(end.h, end.m);
            const diff = e - s;
            const hh = Math.floor(diff/60);
            const mm = diff - hh*60;
            return [
              `Convert to minutes:`,
              `start = ${start.h}x60 + ${start.m} = ${s}`,
              `end = ${end.h}x60 + ${end.m} = ${e}`,
              `difference = ${e} - ${s} = ${diff} minutes`,
              `convert back: ${diff} = ${hh} h ${mm} min`
            ].join("\n");
          }
        };
      }
    }

    // ADVANCED
    // Some questions include day differences up to 3 days.
    // For the remaining (non-day) questions: minutes-only about 30%, rest hours+minutes.
    const allowDays = true;
    const dayQuestionChance = 0.22;
    const minutesOnlyTarget = 0.30;

    const start = genStartTime("advanced", rng);

    const doDay = allowDays && rng() < dayQuestionChance;

    if (doDay){
      let d = randInt(rng, 1, 3);
      let h = randInt(rng, 0, 23);
      let m = anyMinute(rng);

      if (h === 0 && m === 0 && rng() < 0.6) m = 15;

      const total = d*1440 + h*60 + m;
      const end = minutesToTime(timeToMinutes(start.h, start.m) + (total % 1440));
      const endDayOffset = d + Math.floor((timeToMinutes(start.h,start.m) + (h*60+m)) / 1440);

      const base = (rng() < 0.5)
        ? `${who} started ${ctx} at ${fmtClock(start.h,start.m)} and finished ${endDayOffset} day${endDayOffset===1?"":"s"} later at ${fmtClock(end.h,end.m)}.`
        : `Start: ${fmtClock(start.h,start.m)}. End: ${endDayOffset} day${endDayOffset===1?"":"s"} later at ${fmtClock(end.h,end.m)}.`;

      return {
        mode,
        type: "elapsed_dhm",
        fields: 3,
        prompt: `${base} How long was it? Answer in days, hours, and minutes.`,
        startH: start.h, startM: start.m, endH: end.h, endM: end.m, dayOffset: endDayOffset,
        answer: { days: d, hours: h, minutes: m },
        steps: () => {
          const startMin = timeToMinutes(start.h, start.m);
          const endMinSameDay = timeToMinutes(end.h, end.m);
          const endTotal = endDayOffset*1440 + endMinSameDay;
          const diff = endTotal - startMin;
          const dd = Math.floor(diff/1440);
          const rem = diff - dd*1440;
          const hh = Math.floor(rem/60);
          const mm = rem - hh*60;
          return [
            `Treat the end time as a later day:`,
            `start (minutes) = ${start.h}x60 + ${start.m} = ${startMin}`,
            `end (same-day minutes) = ${end.h}x60 + ${end.m} = ${endMinSameDay}`,
            `end total minutes = ${endDayOffset}x1440 + ${endMinSameDay} = ${endTotal}`,
            `difference = ${endTotal} - ${startMin} = ${diff} minutes`,
            `convert: ${diff} = ${dd} day(s), ${hh} h, ${mm} min`
          ].join("\n");
        }
      };
    }

    // Non-day advanced question
    const wantMinutesOnly = rng() < minutesOnlyTarget;

    // NEW: some advanced non-day questions are end-time (addition)
    const endTimeChanceAdv = 0.33; // \~33% of non-day advanced become end-time questions
    const doEndTimeAdv = !wantMinutesOnly && (rng() < endTimeChanceAdv);

    if (doEndTimeAdv){
      const dur = pickFriendlyDurationAdvanced(rng);
      const durMin = dur.h*60 + dur.m;
      if (durMin === 0) dur.m = 17;

      const startTotal = timeToMinutes(start.h, start.m);
      const endTotal = startTotal + durMin;
      const end = minutesToTime(endTotal);
      const crosses = (endTotal >= 1440);

      const promptBase = makeEndTimePrompt(rng, who, start, dur, mode);
      const prompt = crosses
        ? (promptBase + " (It ends the next day.)")
        : promptBase;

      return {
        mode,
        type: crosses ? "end_time_nextday" : "end_time",
        fields: 2,
        prompt,
        startH: start.h, startM: start.m,
        durH: dur.h, durM: dur.m,
        answer: { clockH: end.h, clockM: end.m, dayOffset: crosses ? 1 : 0 },
        steps: () => {
          const endH = Math.floor(((endTotal % 1440) + 1440) % 1440 / 60);
          const endM = ((endTotal % 60) + 60) % 60;
          return [
            `Add the duration to the start time:`,
            `start = ${fmtClock(start.h,start.m)}`,
            `duration = ${dur.h} h ${dur.m} min`,
            ``,
            `Convert start to minutes: ${start.h}x60 + ${start.m} = ${startTotal}`,
            `Convert duration to minutes: ${dur.h}x60 + ${dur.m} = ${durMin}`,
            `end total minutes = ${startTotal} + ${durMin} = ${endTotal}` + (crosses ? " (next day)" : ""),
            `Convert back to time: ${endH}:${pad2(endM)}` + (crosses ? " (next day)" : "")
          ].join("\n");
        }
      };
    }

    // Original advanced elapsed (minutes-only or HM)
    let hDur = randInt(rng, 0, 10);
    let mDur = anyMinute(rng);
    if (hDur === 0 && mDur === 0) mDur = 17;

    const elapsed = hDur*60 + mDur;
    const end = minutesToTime(timeToMinutes(start.h, start.m) + elapsed);

    const base = (rng() < 0.5)
      ? `${who} had ${ctx} from ${fmtClock(start.h,start.m)} to ${fmtClock(end.h,end.m)}.`
      : `Between ${fmtClock(start.h,start.m)} and ${fmtClock(end.h,end.m)}:`;

    if (wantMinutesOnly){
      return {
        mode,
        type: "elapsed_minutes",
        fields: 1,
        prompt: `${base} How long was it? Answer in minutes.`,
        startH: start.h, startM: start.m, endH: end.h, endM: end.m,
        answer: { minutesOnly: elapsed },
        steps: () => {
          const s = timeToMinutes(start.h, start.m);
          const e = timeToMinutes(end.h, end.m);
          const crosses = (e < s);
          const e2 = crosses ? e + 1440 : e;
          const diff = e2 - s;
          return [
            `Convert to minutes:`,
            `start = ${start.h}x60 + ${start.m} = ${s}`,
            `end = ${end.h}x60 + ${end.m} = ${e}` + (crosses ? ` (next day, add 1440)` : ``),
            crosses ? `adjusted end = ${e} + 1440 = ${e2}` : `adjusted end = ${e2}`,
            `difference = ${e2} - ${s} = ${diff} minutes`
          ].join("\n");
        }
      };
    } else {
      const H = Math.floor(elapsed/60);
      const M = elapsed - H*60;
      return {
        mode,
        type: "elapsed_hm",
        fields: 2,
        prompt: `${base} How long was it? Answer in hours and minutes.`,
        startH: start.h, startM: start.m, endH: end.h, endM: end.m,
        answer: { hours: H, minutes: M },
        steps: () => {
          const s = timeToMinutes(start.h, start.m);
          const e = timeToMinutes(end.h, end.m);
          const crosses = (e < s);
          const e2 = crosses ? e + 1440 : e;
          const diff = e2 - s;
          const hh = Math.floor(diff/60);
          const mm = diff - hh*60;
          return [
            `Convert to minutes:`,
            `start = ${start.h}x60 + ${start.m} = ${s}`,
            `end = ${end.h}x60 + ${end.m} = ${e}` + (crosses ? ` (next day, add 1440)` : ``),
            crosses ? `adjusted end = ${e} + 1440 = ${e2}` : `adjusted end = ${e2}`,
            `difference = ${e2} - ${s} = ${diff} minutes`,
            `convert back: ${diff} = ${hh} h ${mm} min`
          ].join("\n");
        }
      };
    }
  }

  
function make(level,type){
 let p;
 do {p=makeQuestion(level==='challenge'?'advanced':'regular');}
 while(level==='foundation' && (p.type!=='elapsed_minutes' || p.endH<p.startH));
 if(!p.dayOffset && p.endH*60+p.endM<p.startH*60+p.startM)p.prompt+=' The finish is on the following day.';
 const a=p.answer;
 const labels=p.type.startsWith('end_time')?['Hour (0–23)','Minute']:p.fields===3?['Days','Hours','Minutes']:p.fields===2?['Hours','Minutes']:['Minutes'];
 return {prompt:p.prompt,labels,answers:Object.entries(a).filter(([k])=>k!=='dayOffset').map(([,v])=>String(v)),steps:p.steps().replace(/\n/g,'<br>'),raw:p,key:[p.type,p.startH,p.startM,p.endH,p.endM,p.durH,p.durM,p.dayOffset].join('|')};
}
return {id:"time",title:"Time Difference Practice",make};
})();