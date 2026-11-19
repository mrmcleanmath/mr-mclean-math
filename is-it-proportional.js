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
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
    function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
    function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

    function parseFlexibleNumber(raw){
      if(raw == null) return NaN;
      let s = String(raw).trim();
      if(!s) return NaN;
      s = s.replace(/\s+/g, "");
      const hasDot = s.includes(".");
      const hasComma = s.includes(",");
      if(hasDot && hasComma){
        const lastDot = s.lastIndexOf(".");
        const lastComma = s.lastIndexOf(",");
        if(lastDot > lastComma){ s = s.replace(/,/g, ""); }
        else { s = s.replace(/\./g, ""); s = s.replace(",", "."); }
      }else if(hasComma && !hasDot){
        const commas = (s.match(/,/g) || []).length;
        if(commas >= 2){ s = s.replace(/,/g, ""); }
        else { s = s.replace(",", "."); }
      }
      if(!/^[+-]?\d*\.?\d*$/.test(s)) return NaN;
      const n = Number(s);
      return Number.isFinite(n) ? n : NaN;
    }

    function roundTo(n, dp){
      const p = Math.pow(10, dp);
      return Math.round((n + Number.EPSILON) * p) / p;
    }

    function countDecimals(n){
      const s = String(n);
      const i = s.indexOf(".");
      return i === -1 ? 0 : (s.length - i - 1);
    }

    // IMPORTANT FIX (kept): never strip integer trailing zeros.
    function formatNumber(n, dpMax){
      if(!Number.isFinite(n)) return "—";
      const dp = clamp(dpMax, 0, 6);
      if(dp === 0){
        return String(Math.round(n));
      }
      let fixed = Number(n).toFixed(dp);
      fixed = fixed.replace(/(\.\d*?)0+$/,"$1").replace(/\.$/,"");
      return fixed;
    }

    // Count helper: correct singular/plural, no "piece" anywhere.
    function formatCount(q, singular, plural){
      const n = Math.round(q);
      return (n === 1) ? `1 ${singular}` : `${n} ${plural}`;
    }

    // "count" no longer uses a fake unit like "piece".
    // Canonical unit will come from the template (e.g., "bottle").
    const measureTypes = {
      count: { canonical: "item", units: [{u:"", factorToCanonical:1}] },
      mass:  { canonical: "kg", units: [{u:"g",factorToCanonical:0.001},{u:"hg",factorToCanonical:0.1},{u:"kg",factorToCanonical:1}] },
      volume:{ canonical: "L",  units: [{u:"mL",factorToCanonical:0.001},{u:"dL",factorToCanonical:0.1},{u:"L",factorToCanonical:1}] },
      distance:{ canonical:"km", units:[{u:"m",factorToCanonical:0.001},{u:"km",factorToCanonical:1}] }
    };

    const templates = [
      {
        type:"count",
        item:"juice",
        people:["Elliot","Jennifer"],
        canonUnit:"bottle",
        countUnitSingular:"bottle",
        countUnitPlural:"bottles",
        prompt:(A,B,item,t)=> `${A.name} buys ${A.qDisp} of ${item} for ${A.pDisp} crowns, and ${B.name} buys ${B.qDisp} of ${item} for ${B.pDisp} crowns. Did they pay the same price per ${t.canonUnit}?`
      },
      { type:"mass", item:"candy", people:["Sarah","Herman"],
        prompt:(A,B,item)=> `${A.name} buys ${A.qDisp} of ${item} for ${A.pDisp} crowns, and ${B.name} buys ${B.qDisp} of ${item} for ${B.pDisp} crowns. Is the price proportional to the amount of ${item}?`
      },
      { type:"volume", item:"paint", people:["A jar","Another jar"],
        prompt:(A,B,item)=> `A jar contains ${A.qDisp} of ${item} and costs ${A.pDisp} crowns. Another jar contains ${B.qDisp} of the same ${item} and costs ${B.pDisp} crowns. Is the price proportional to the volume?`
      },
      { type:"distance", item:"taxi ride", people:["Trip A","Trip B"],
        prompt:(A,B,item)=> `${A.name} is a ${A.qDisp} ${item} that costs ${A.pDisp} crowns. ${B.name} is a ${B.qDisp} ${item} that costs ${B.pDisp} crowns. Is cost proportional to distance?`
      },
      { type:"volume", item:"juice", people:["Mina","Noah"],
        prompt:(A,B,item)=> `${A.name} buys ${A.qDisp} of ${item} for ${A.pDisp} crowns, and ${B.name} buys ${B.qDisp} of ${item} for ${B.pDisp} crowns. Is the price proportional to the volume?`
      },
      { type:"mass", item:"rice", people:["Lea","Omar"],
        prompt:(A,B,item)=> `${A.name} buys ${A.qDisp} of ${item} for ${A.pDisp} crowns, and ${B.name} buys ${B.qDisp} of ${item} for ${B.pDisp} crowns. Did they pay the same price per 1 ${measureTypes.mass.canonical}?`
      }
    ];

    // Easy mode constraints (kept):
    // - quantity: 1..9 (single digit)
    // - price: 10..99 (two digits)
    // - unit price: integer only (no decimals)
    function chooseEasyQuantities(){
      let qA = randInt(1, 9);
      let qB = randInt(1, 9);
      let guard = 0;
      while(qB === qA && guard < 50){
        qB = randInt(1, 9);
        guard++;
      }
      return { qA, qB };
    }

    function generateEasyCase(targetProportional){
      const { qA, qB } = chooseEasyQuantities();

      let unitA = 1;
      let priceA = 0;

      let guardA = 0;
      while(guardA < 200){
        unitA = randInt(2, 25);
        priceA = unitA * qA;
        if(priceA >= 10 && priceA <= 99) break;
        guardA++;
      }
      if(!(priceA >= 10 && priceA <= 99)) return null;

      let unitB = unitA;
      let priceB = 0;

      let guardB = 0;
      while(guardB < 300){
        if(targetProportional){
          unitB = unitA;
        }else{
          unitB = randInt(2, 25);
          if(unitB === unitA){ guardB++; continue; }
        }
        priceB = unitB * qB;
        if(priceB >= 10 && priceB <= 99) break;
        guardB++;
      }
      if(!(priceB >= 10 && priceB <= 99)) return null;

      return {
        qA_canon: qA,
        qB_canon: qB,
        priceA,
        priceB,
        unitA,
        unitB
      };
    }

    function generateUnitPrice(diff){
      if(diff === "easy"){
        return randInt(5, 60);
      }
      if(diff === "med"){
        const base = randInt(5, 80);
        const tenths = pick([0, 0, 0, 0, 0.5, 0.2, 0.8, 0.1, 0.3, 0.7, 0.9]);
        return roundTo(base + tenths, 1);
      }
      const base = randInt(5, 120);
      const mode = Math.random() < 0.45 ? 1 : 2;
      if(mode === 1){
        const tenths = pick([0,0,0.5,0.2,0.8,0.1,0.3,0.7,0.9,0.4,0.6]);
        return roundTo(base + tenths, 1);
      }else{
        const hundredths = pick([0, 0.25, 0.5, 0.75, 0.2, 0.4, 0.6, 0.8, 0.1, 0.3, 0.7, 0.9, 0.05, 0.15, 0.35, 0.55, 0.65, 0.85, 0.95]);
        return roundTo(base + hundredths, 2);
      }
    }

    function chooseQuantities(type, diff){
      if(diff === "easy"){
        return { qA_canon: randInt(1,9), qB_canon: randInt(1,9) };
      }

      let qA, qB;
      if(type === "count"){ qA = randInt(1, 6); qB = randInt(7, 18); }
      else if(type === "mass"){ qA = randInt(1, 8); qB = randInt(2, 12); }
      else if(type === "volume"){ qA = randInt(1, 8); qB = randInt(2, 12); }
      else { qA = randInt(1, 10); qB = randInt(2, 16); }

      if(qA === qB) qB++;
      if(Math.random() < 0.35){ const t = qA; qA = qB; qB = t; }
      return {qA_canon:Math.max(1,qA), qB_canon:Math.max(1,qB)};
    }

    function chooseDisplayUnit(type, diff, allowMixed){
      const mt = measureTypes[type];
      if(type === "count") return mt.units[0];
      if(diff !== "hard") return mt.units[mt.units.length-1];
      if(!allowMixed) return mt.units[mt.units.length-1];
      return (Math.random() < 0.6) ? pick(mt.units) : mt.units[mt.units.length-1];
    }

    function convertCanonicalToDisplay(qCanon, unitObj){
      return qCanon / unitObj.factorToCanonical;
    }

    function formatQuantity(q, unitObj, diff){
      const dp = (diff === "easy") ? 0 : (diff === "med" ? 1 : 2);
      const unit = unitObj.u ? (" " + unitObj.u) : "";
      return formatNumber(roundTo(q, dp), dp) + unit;
    }

    function enforceNiceDisplayQuantities(type, diff, unitObj){
      if(diff !== "hard") return null;
      if(type === "mass" && unitObj.u === "g")  return pick([0.25,0.5,0.75,1,1.25,1.5,2,2.5,3,4,5,6,7,8,9,10]);
      if(type === "mass" && unitObj.u === "hg") return pick([0.5,1,1.5,2,2.5,3,3.5,4,5,6,7,8,9,10,11,12]);
      if(type === "volume" && unitObj.u === "mL") return pick([0.25,0.5,0.75,1,1.25,1.5,2,2.5,3,4,5,6,7,8,9,10]);
      if(type === "volume" && unitObj.u === "dL") return pick([0.5,1,1.5,2,2.5,3,3.5,4,5,6,7,8,9,10,11,12]);
      if(type === "distance" && unitObj.u === "m") return pick([0.25,0.5,0.75,1,1.25,1.5,2,2.5,3,4,5,6,7,8,9,10,12,14,16]);
      return null;
    }

    function makeProblem(diff){
      const template = pick(templates);
      const type = template.type;
      const mt = measureTypes[type];

      const targetProportional = Math.random() < 0.5;

      // Canonical unit name for proof/labels:
      // - For count templates, use template.canonUnit (e.g., "bottle")
      // - Otherwise use measureTypes[type].canonical (e.g., kg, L, km)
      const canonUnit = (type === "count" && template.canonUnit) ? template.canonUnit : mt.canonical;

      // EASY MODE
      if(diff === "easy"){
        const unitObj = mt.units[mt.units.length-1];

        let attempt = 0;
        let data = null;
        while(attempt < 400 && !data){
          const d = generateEasyCase(targetProportional);
          if(d) data = d;
          attempt++;
        }
        if(!data){
          return makeProblem("easy");
        }

        const A = {
          name: template.people[0],
          qCanon: data.qA_canon,
          p: data.priceA,
          qDisp: (type === "count")
            ? formatCount(data.qA_canon, template.countUnitSingular || canonUnit, template.countUnitPlural || (canonUnit + "s"))
            : formatQuantity(convertCanonicalToDisplay(data.qA_canon, unitObj), unitObj, "easy"),
          pDisp: formatNumber(data.priceA, 0)
        };
        const B = {
          name: template.people[1],
          qCanon: data.qB_canon,
          p: data.priceB,
          qDisp: (type === "count")
            ? formatCount(data.qB_canon, template.countUnitSingular || canonUnit, template.countUnitPlural || (canonUnit + "s"))
            : formatQuantity(convertCanonicalToDisplay(data.qB_canon, unitObj), unitObj, "easy"),
          pDisp: formatNumber(data.priceB, 0)
        };

        const dpUnit = 0;
        const calcUnitA = data.unitA;
        const calcUnitB = data.unitB;
        const isProportional = (calcUnitA === calcUnitB);

        if(isProportional !== targetProportional){
          return makeProblem("easy");
        }

        const promptText = template.prompt(A, B, template.item, template);

        const steps = [
          `Step 1: Find unit price for ${A.name}.`,
          `Unit price A = ${A.pDisp} ÷ ${formatNumber(A.qCanon, 0)} = ${formatNumber(calcUnitA, 0)} crowns per 1 ${canonUnit}.`,
          `Step 2: Find unit price for ${B.name}.`,
          `Unit price B = ${B.pDisp} ÷ ${formatNumber(B.qCanon, 0)} = ${formatNumber(calcUnitB, 0)} crowns per 1 ${canonUnit}.`,
          isProportional ? `Step 3: Compare. They are equal, so it is proportional.` : `Step 3: Compare. They are different, so it is not proportional.`
        ];

        return {
          diff:"easy",
          type,
          canonUnit,
          prompt: promptText,
          A, B,
          unitA: calcUnitA,
          unitB: calcUnitB,
          proportional: isProportional,
          labels: {
            A: `${A.name}: price per 1 ${canonUnit}`,
            B: `${B.name}: price per 1 ${canonUnit}`
          },
          dpUnit,
          steps
        };
      }

      // MED/HARD
      const allowMixedUnits = (diff === "hard") && (type === "mass" || type === "volume" || type === "distance") && (Math.random() < 0.75);

      let unitA = chooseDisplayUnit(type, diff, allowMixedUnits);
      let unitB = chooseDisplayUnit(type, diff, allowMixedUnits);

      let {qA_canon, qB_canon} = chooseQuantities(type, diff);

      if(diff === "hard"){
        const niceA = enforceNiceDisplayQuantities(type, diff, unitA);
        const niceB = enforceNiceDisplayQuantities(type, diff, unitB);
        if(niceA != null) qA_canon = niceA;
        if(niceB != null) qB_canon = niceB;
      }

      if(Math.abs(qA_canon - qB_canon) < 1e-9) qB_canon += type === "count" ? 1 : 0.5;

      let unitPriceA = generateUnitPrice(diff);
      let unitPriceB = targetProportional ? unitPriceA : generateUnitPrice(diff);
      if(!targetProportional){
        let guard = 0;
        while(Math.abs(unitPriceB - unitPriceA) < 1e-9 && guard < 20){
          unitPriceB = generateUnitPrice(diff);
          guard++;
        }
      }

      if(Math.abs(unitPriceA*qA_canon*100-Math.round(unitPriceA*qA_canon*100))>1e-7 || Math.abs(unitPriceB*qB_canon*100-Math.round(unitPriceB*qB_canon*100))>1e-7)return makeProblem(diff);
const maxDpPrice = (diff === "med") ? 1 : 2;
      let priceA = roundTo(unitPriceA * qA_canon, maxDpPrice);
      let priceB = roundTo(unitPriceB * qB_canon, maxDpPrice);

      if(diff === "med"){
        unitPriceA = roundTo(unitPriceA, 1);
        unitPriceB = roundTo(unitPriceB, 1);
        priceA = roundTo(unitPriceA * qA_canon, 1);
        priceB = roundTo(unitPriceB * qB_canon, 1);
        unitA = mt.units[mt.units.length-1];
        unitB = mt.units[mt.units.length-1];
      }else{
        unitPriceA = roundTo(unitPriceA, 2);
        unitPriceB = roundTo(unitPriceB, 2);
        priceA = roundTo(unitPriceA * qA_canon, 2);
        priceB = roundTo(unitPriceB * qB_canon, 2);
      }

      const qA_display = convertCanonicalToDisplay(qA_canon, unitA);
      const qB_display = convertCanonicalToDisplay(qB_canon, unitB);

      const A = {
        name: template.people[0],
        qCanon: qA_canon,
        p: priceA,
        qDisp: (type === "count")
          ? formatCount(qA_canon, template.countUnitSingular || canonUnit, template.countUnitPlural || (canonUnit + "s"))
          : formatQuantity(qA_display, unitA, diff),
        pDisp: formatNumber(priceA, maxDpPrice)
      };
      const B = {
        name: template.people[1],
        qCanon: qB_canon,
        p: priceB,
        qDisp: (type === "count")
          ? formatCount(qB_canon, template.countUnitSingular || canonUnit, template.countUnitPlural || (canonUnit + "s"))
          : formatQuantity(qB_display, unitB, diff),
        pDisp: formatNumber(priceB, maxDpPrice)
      };

      const dpUnit = (diff === "med" ? 1 : 2);
      const calcUnitA = roundTo(A.p / A.qCanon, dpUnit);
      const calcUnitB = roundTo(B.p / B.qCanon, dpUnit);

      const isProportional = Math.abs(calcUnitA - calcUnitB) < 1e-9;
      if(isProportional !== targetProportional) return makeProblem(diff);

      const promptText = template.prompt(A, B, template.item, template);

      const steps = [
        `Step 1: Find unit price for ${A.name}.`,
        `Unit price A = ${A.pDisp} ÷ ${formatNumber(A.qCanon, 2)} = ${formatNumber(calcUnitA, dpUnit)} crowns per 1 ${canonUnit}.`,
        `Step 2: Find unit price for ${B.name}.`,
        `Unit price B = ${B.pDisp} ÷ ${formatNumber(B.qCanon, 2)} = ${formatNumber(calcUnitB, dpUnit)} crowns per 1 ${canonUnit}.`,
        isProportional ? `Step 3: Compare. They are equal, so it is proportional.` : `Step 3: Compare. They are different, so it is not proportional.`
      ];

      return {
        diff, type, canonUnit,
        prompt: promptText,
        A, B,
        unitA: calcUnitA,
        unitB: calcUnitB,
        proportional: isProportional,
        labels: {
          A: `${A.name}: price per 1 ${canonUnit}`,
          B: `${B.name}: price per 1 ${canonUnit}`
        },
        dpUnit,
        steps
      };
    }




function make(level){
 let p;
 for(let attempt=0;attempt<2000;attempt++){
  const candidate=makeProblem({foundation:'easy',core:'med',challenge:'hard'}[level]);
  if([candidate.A,candidate.B].every(offer=>allowedDivisor(offer.qCanon))){p=candidate;break;}
 }
 if(!p)throw Error('No suitable unit-price division');
 p.steps=[
  'Unit price A: '+divisionWorking(p.A.pDisp,p.A.qCanon,p.unitA)+' Crowns per 1 '+p.canonUnit+'.',
  'Unit price B: '+divisionWorking(p.B.pDisp,p.B.qCanon,p.unitB)+' Crowns per 1 '+p.canonUnit+'.',
  p.proportional?'The unit prices are equal, so the prices are proportional to the quantities.':'The unit prices are different, so the prices are not proportional to the quantities.'
 ];
 const conversion=[p.A,p.B].map((a,i)=>a.qDisp+' = '+formatNumber(a.qCanon,2)+' '+p.canonUnit+' for offer '+(i?'B':'A')+'.');
 return {prompt:p.prompt,kind:'proportionality',answers:[p.proportional?'Yes':'No'],labels:['Your choice'],options:['Yes','No'],proof:[String(p.unitA),String(p.unitB)],proofLabels:[p.labels.A,p.labels.B],steps:conversion.concat(p.steps).join('<br>'),raw:p,key:p.type+'|'+[p.A.qCanon+':'+p.A.p,p.B.qCanon+':'+p.B.p].sort().join('|')};
}

return {id:"proportionality",title:"Proportionality: Is It Proportional?",make};})();