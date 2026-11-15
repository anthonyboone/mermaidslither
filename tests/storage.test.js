import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveStore, SAVE_KEY, freshSave, validateSave } from '../js/storage.js';
const memory=()=>({value:null,getItem(){return this.value;},setItem(k,v){assert.equal(k,SAVE_KEY);this.value=v;}});
const run=(overrides={})=>({id:'test-run',mode:'classic',difficulty:'adventure',stage:0,score:100,food:5,gold:0,powers:0,maxLength:9,elapsed:20,parties:0,won:false,stars:0,...overrides});

test('fresh save passes schema validation',()=>assert.ok(validateSave(freshSave())));
test('malformed and unknown-version saves are preserved, not overwritten',()=>{
  for(const value of ['{oops',JSON.stringify({version:99})]){const m=memory();m.value=value;const s=new SaveStore(m);assert.ok(s.blocked);s.persist();assert.equal(m.value,value);assert.ok(s.warning);}
});
test('failed persistence retains in-memory data and warns',()=>{
  const s=new SaveStore({getItem:()=>null,setItem:()=>{throw Error('quota');}});s.value.pearls=50;assert.equal(s.persist(),false);assert.equal(s.value.pearls,50);assert.ok(s.warning);
});
test('run settles exactly once',()=>{
  const s=new SaveStore(memory());const r=run();const a=s.settle(r);assert.ok(a);const balance=s.value.pearls;assert.equal(s.settle(r),null);assert.equal(s.value.pearls,balance);assert.equal(s.value.totals.runs,1);
});
test('achievements award only once across different runs',()=>{
  const s=new SaveStore(memory());const a=s.settle(run());assert.ok(a.awards.some(a=>a.name==='First Splash'));const b=s.settle(run({id:'second'}));assert.ok(!b.awards.some(a=>a.name==='First Splash'));assert.equal(new Set(s.value.achievements).size,s.value.achievements.length);
});
test('base rewards follow transparent formula',()=>{
  const s=new SaveStore(memory());const r=s.settle(run());assert.equal(r.base,12);assert.equal(r.total,r.base+r.bonus);
});
test('records are separated by difficulty and keep highest five',()=>{
  const s=new SaveStore(memory());for(let i=0;i<8;i++)s.settle(run({id:`a${i}`,score:i*20}));s.settle(run({id:'chill',difficulty:'chill',score:999}));
  assert.deepEqual(s.value.records['classic:adventure'].map(r=>r.score),[140,120,100,80,60]);assert.equal(s.value.records['classic:chill'][0].score,999);
});
test('shop does not overspend or charge again for owned skins',()=>{
  const s=new SaveStore(memory());assert.equal(s.buy('moon'),false);s.value.pearls=150;assert.equal(s.buy('moon'),true);assert.equal(s.value.pearls,50);assert.equal(s.buy('moon'),true);assert.equal(s.value.pearls,50);assert.equal(s.value.skin,'moon');
});
test('completed missions pay once and replace on a later run',()=>{
  const s=new SaveStore(memory());s.value.missions=[{type:0,progress:11},{type:1,progress:0},{type:2,progress:0}];
  const a=s.settle(run({food:1,score:0}));assert.ok(a.awards.some(a=>a.name==='Pearl picnic'));assert.equal(s.value.missions[0].done,true);assert.equal(s.value.missions[0].type,0);
  const b=s.settle(run({id:'next',food:1,score:0}));assert.equal(s.value.missions[0].type,3);assert.equal(s.value.missions[0].progress,0);assert.ok(!b.awards.some(a=>a.name==='Pearl picnic'));
});
test('maze stars never decrease and survive reload',()=>{
  const m=memory(),s=new SaveStore(m);s.settle(run({mode:'maze',won:true,stars:3}));s.settle(run({id:'worse',mode:'maze',won:true,stars:1}));assert.equal(s.value.stars.adventure[0],3);assert.equal(new SaveStore(m).value.stars.adventure[0],3);
});
test('invalid currency, IDs, records and settings fail validation',()=>{
  for(const mutate of [s=>s.pearls=-1,s=>s.pearls=Infinity,s=>s.buddy='bad',s=>s.owned=['bad'],s=>s.settings.music='yes',s=>s.stars.chill[0]=7,s=>s.records={'oops':[]},s=>s.name='<'.repeat(17)]){const s=freshSave();mutate(s);assert.equal(validateSave(s),false);}
});
test('reset requires explicit method, restores valid fresh data',()=>{const s=new SaveStore(memory());s.settle(run());s.reset();assert.equal(s.value.pearls,0);assert.equal(s.value.onboarded,false);assert.ok(validateSave(s.value));});
test('older saves gain swipe-pad preference without losing treasures or arrow settings',()=>{
  const m=memory(),old=freshSave();delete old.settings.touchMode;old.pearls=123;old.settings.dpad=false;m.value=JSON.stringify(old);
  const s=new SaveStore(m);assert.equal(s.blocked,false);assert.equal(s.value.settings.touchMode,'swipe');assert.equal(s.value.settings.dpad,false);assert.equal(s.value.pearls,123);assert.ok(validateSave(s.value));
});
test('touch style is validated and saved without changing the save version',()=>{
  const m=memory(),s=new SaveStore(m);s.value.settings.touchMode='arrows';s.persist();assert.equal(new SaveStore(m).value.settings.touchMode,'arrows');s.value.settings.touchMode='bad';assert.equal(validateSave(s.value),false);
});
