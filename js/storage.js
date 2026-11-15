import { SKINS, BUDDIES, MODES, DIFFICULTIES, ACHIEVEMENTS, MISSION_TYPES } from './data.js';
export const SAVE_KEY='mermaid-slither-v1';
const num=(v,max=1e9)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;
const str=v=>typeof v==='string';
const skinIds=SKINS.map(s=>s.id);
export function freshSave() {
  return { version:1, onboarded:false, name:'Pearl', buddy:'turtle', skin:'lagoon', owned:[], pearls:0,
    settings:{difficulty:'adventure',music:false,sound:true,reduced:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false,contrast:false,dpad:true,hand:'right'},
    totals:{runs:0,food:0,modes:[]},achievements:[],missions:[0,1,2].map(type=>({type,progress:0})),missionCursor:3,
    records:{},stars:{chill:Array(8).fill(0),adventure:Array(8).fill(0),turbo:Array(8).fill(0)},settled:[],
  };
}
export function validateSave(s) {
  if(!s||s.version!==1||typeof s.onboarded!=='boolean'||!str(s.name)||s.name.length<1||s.name.length>16)return false;
  if(!BUDDIES.some(b=>b.id===s.buddy)||!skinIds.includes(s.skin)||!Array.isArray(s.owned)||s.owned.length>12||new Set(s.owned).size!==s.owned.length||!s.owned.every(v=>skinIds.includes(v)))return false;
  if(s.onboarded&&(!s.owned.includes(s.skin)||s.owned.length<3))return false;
  if(!num(s.pearls)||!s.settings||!DIFFICULTIES[s.settings.difficulty]||!['left','right'].includes(s.settings.hand))return false;
  if(!['music','sound','reduced','contrast','dpad'].every(k=>typeof s.settings[k]==='boolean'))return false;
  if(!s.totals||!num(s.totals.runs)||!num(s.totals.food)||!Array.isArray(s.totals.modes)||s.totals.modes.length>4||!s.totals.modes.every(m=>Object.keys(MODES).includes(m)))return false;
  if(!Array.isArray(s.achievements)||s.achievements.length>12||!s.achievements.every(id=>ACHIEVEMENTS.some(a=>a.id===id)))return false;
  if(!Array.isArray(s.missions)||s.missions.length!==3||!s.missions.every(m=>m&&Number.isInteger(m.type)&&m.type>=0&&m.type<MISSION_TYPES.length&&num(m.progress))||!num(s.missionCursor))return false;
  if(!s.stars||!Object.keys(DIFFICULTIES).every(d=>Array.isArray(s.stars[d])&&s.stars[d].length===8&&s.stars[d].every(v=>Number.isInteger(v)&&v>=0&&v<=3)))return false;
  if(!s.records||typeof s.records!=='object'||Array.isArray(s.records)||Object.keys(s.records).length>12)return false;
  for(const [k,list] of Object.entries(s.records)) {
    if(!Object.keys(MODES).some(m=>Object.keys(DIFFICULTIES).some(d=>`${m}:${d}`===k))||!Array.isArray(list)||list.length>5)return false;
    if(!list.every(r=>r&&num(r.score)&&str(r.name)&&r.name.length<=16&&str(r.date)&&r.date.length<=30&&num(r.elapsed)))return false;
  }
  return Array.isArray(s.settled)&&s.settled.length<=100&&s.settled.every(id=>str(id)&&id.length<100);
}
export class SaveStore {
  constructor(storage=globalThis.localStorage) {
    this.storage=storage;this.warning='';this.blocked=false;this.value=freshSave();
    if(!storage)this.warning='Storage is unavailable. Your progress is temporary until this tab closes.';
    try {
      const raw=storage?.getItem(SAVE_KEY);
      if(raw){const parsed=JSON.parse(raw);if(!validateSave(parsed))throw new Error('Invalid save');this.value=parsed;}
    } catch {this.blocked=true;this.warning='Your saved data could not be read. It has not been overwritten. You can play temporarily, or reset it in Settings.';}
  }
  persist() {
    if(this.blocked)return false;
    try {this.storage.setItem(SAVE_KEY,JSON.stringify(this.value));return true;}
    catch {this.warning='Storage is unavailable. Your progress is temporary until this tab closes.';return false;}
  }
  reset(){this.value=freshSave();this.blocked=false;return this.persist();}
  buy(id) {
    const s=SKINS.find(v=>v.id===id);if(!s)return false;
    if(this.value.owned.includes(id)){this.value.skin=id;this.persist();return true;}
    if(this.value.pearls<s.cost)return false;
    this.value.pearls-=s.cost;this.value.owned.push(id);this.value.skin=id;this.persist();return true;
  }
  settle(r) {
    const s=this.value;
    if(s.settled.includes(r.id))return null;
    s.settled.push(r.id);s.settled=s.settled.slice(-100);
    s.totals.runs++;s.totals.food+=r.food;if(!s.totals.modes.includes(r.mode))s.totals.modes.push(r.mode);
    const base=r.food*2+Math.floor(r.score/50)+(r.won&&(r.mode==='maze'||r.mode==='classic'||r.mode==='speed')?10:0);
    let bonus=0;const awards=[];
    for(const a of ACHIEVEMENTS)if(!s.achievements.includes(a.id)&&a.test(s,r)){s.achievements.push(a.id);bonus+=a.reward;awards.push({name:a.name,reward:a.reward});}
    for(const m of s.missions){
      if(m.done){m.type=s.missionCursor++%MISSION_TYPES.length;m.progress=0;delete m.done;}
      const def=MISSION_TYPES[m.type];m.progress=Math.min(def.target,m.progress+def.progress(r));
      if(m.progress>=def.target){m.done=true;bonus+=def.reward;awards.push({name:def.name,reward:def.reward});}
    }
    s.pearls+=base+bonus;
    const k=`${r.mode}:${r.difficulty}`, records=s.records[k]||[];
    const best=records[0]?.score||0,newBest=r.score>best;
    s.records[k]=[...records,{name:s.name,score:r.score,date:new Date().toISOString(),elapsed:r.elapsed}].sort((a,b)=>b.score-a.score).slice(0,5);
    if(r.mode==='maze')s.stars[r.difficulty][r.stage]=Math.max(s.stars[r.difficulty][r.stage],r.stars);
    this.persist();return {base,bonus,total:base+bonus,awards,newBest,best};
  }
}
