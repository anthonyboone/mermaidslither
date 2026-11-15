import { COLS, ROWS, DIFFICULTIES, MAZES, POWERS, wallsFor } from './data.js';

export const DIRS = { up: {x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
export const same = (a,b) => a.x === b.x && a.y === b.y;
export const key = p => `${p.x},${p.y}`;
export function seeded(seed = Date.now()) {
  let n = seed >>> 0;
  return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function createGame({ mode='classic', difficulty='adventure', stage=0, seed=Date.now(), tutorial=false } = {}) {
  const g = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, mode, difficulty, stage, tutorial,
    rng: seeded(seed), snake: [], previous: [], direction:'right', queue:[], walls: mode === 'maze' ? wallsFor(stage) : [],
    food:[], item:null, effects:{shield:difficulty === 'chill',slow:0,magnet:0,double:0},
    score:0, collected:0, gold:0, powers:0, maxLength:4, elapsed:0, combo:1, comboCount:0, lastEat:-99,
    partyUntil:0, partyCooldown:0, parties:0, crashes:0, shieldUsed:0, ended:false, won:false, reason:'', events:[], stepCount:0,
  };
  resetSnake(g);
  if (tutorial) { g.food = [{ x:11,y:19,gold:false },{x:14,y:16,gold:false},{x:10,y:12,gold:true}]; g.effects.shield = true; }
  else fillFood(g);
  return g;
}
function resetSnake(g) {
  // Reserved starting corridor in every handcrafted layout.
  g.snake = [{x:7,y:19},{x:6,y:19},{x:5,y:19},{x:4,y:19}];
  g.previous = g.snake.map(p => ({...p})); g.direction = 'right'; g.queue = [];
  // Items originally spawned here must not overlap a recovering snake.
  g.food = g.food.filter(p => !g.snake.some(s => same(s,p)));
  if (g.item && g.snake.some(s => same(s,g.item))) g.item = null;
}
export function turn(g, direction) {
  if (!DIRS[direction] || g.ended || g.queue.length >= 2) return false;
  const last = g.queue.at(-1) || g.direction;
  if (last === direction || (DIRS[last].x + DIRS[direction].x === 0 && DIRS[last].y + DIRS[direction].y === 0)) return false;
  g.queue.push(direction); return true;
}
export function reachable(g) {
  const blocked = new Set(g.walls.map(key));
  const start = g.snake[0]; const visited = new Set([key(start)]); const out = [start];
  for (let i=0;i<out.length;i++) {
    const p = out[i];
    for (const d of Object.values(DIRS)) {
      const q = {x:p.x+d.x,y:p.y+d.y}; const k=key(q);
      if (q.x<0||q.y<0||q.x>=COLS||q.y>=ROWS||blocked.has(k)||visited.has(k)) continue;
      visited.add(k); out.push(q);
    }
  }
  return out;
}
export function freeCell(g) {
  const occupied = new Set([...g.snake,...g.food,...(g.item?[g.item]:[])].map(key));
  const cells = reachable(g).filter(p => !occupied.has(key(p)));
  return cells.length ? {...cells[Math.floor(g.rng()*cells.length)]} : null;
}
export function fillFood(g) {
  const target = g.mode === 'maze' ? 2 : 3;
  while (g.food.length < target) {
    const p = freeCell(g); if (!p) break;
    g.food.push({...p,gold:g.rng()<0.12});
  }
  // A power-up must never occupy the final available pearl cell.
  if(!g.food.length&&g.item){g.food.push({x:g.item.x,y:g.item.y,gold:false});g.item=null;}
  if (!g.food.length && !g.ended) finish(g,true,'An ocean full of you!');
}
export function interval(g) {
  const d=DIFFICULTIES[g.difficulty];
  const increase = g.mode === 'speed' ? Math.floor(g.elapsed/10)*12 : g.mode === 'classic' ? Math.floor(g.collected/5)*5 : 0;
  return Math.max(d.min,d.start-increase) * (g.effects.slow>g.elapsed ? 1.5 : 1);
}
export function advance(g, seconds) {
  if (g.ended) return;
  g.elapsed += seconds;
  if (g.elapsed-g.lastEat > 4) {g.combo=1;g.comboCount=0;}
  if (g.mode === 'time' && g.elapsed >= 60) {g.elapsed=60;finish(g,true,'A minute of ocean magic!');}
}
function finish(g,won,reason) {g.ended=true;g.won=won;g.reason=reason;g.events.push({type:won?'win':'end'});}
export function crash(g) {
  g.crashes++;
  if (g.tutorial || g.effects.shield || g.mode === 'time') {
    if (g.effects.shield) {g.effects.shield=false;g.shieldUsed++;}
    else if (g.mode === 'time') g.score=Math.max(0,g.score-30);
    resetSnake(g);fillFood(g);g.events.push({type:'recover',text:g.tutorial?'Try a gentle turn!':'Fresh bubbles. Keep going!'});
  } else finish(g,false,'Every great swim starts with a splash.');
}
export function collect(g, food, grow=true) {
  g.food = g.food.filter(f=>f!==food);
  if (g.elapsed-g.lastEat <= 4) g.comboCount++; else g.comboCount=1;
  g.combo=Math.min(5,g.comboCount);g.lastEat=g.elapsed;
  if (g.comboCount>=5 && g.elapsed>=g.partyCooldown) {
    g.partyUntil=g.elapsed+6;g.partyCooldown=g.elapsed+14;g.parties++;g.events.push({type:'party',text:'Pearl Party!'});
  }
  const points=(food.gold?30:10)*g.combo*(g.effects.double>g.elapsed?2:1)*(g.partyUntil>g.elapsed?2:1);
  g.score+=points;g.collected++;if(food.gold)g.gold++;
  if (grow) { const tail=g.snake.at(-1);g.snake.push({...tail}); }
  g.maxLength=Math.max(g.maxLength,g.snake.length);
  g.events.push({type:'eat',x:food.x,y:food.y,points,gold:food.gold});
  if (g.tutorial && g.collected>=3) {finish(g,true,'Ready for the big blue?');return;}
  if (g.mode === 'maze' && g.collected>=MAZES[g.stage].target) {finish(g,true,'Reef explored. Magic discovered!');return;}
  if (g.collected%5===0 && !g.item) {
    const p=freeCell(g);if(p){const types=Object.keys(POWERS);g.item={...p,type:types[Math.floor(g.rng()*types.length)]};}
  }
}
export function step(g,{consumeTurn=true}={}) {
  if(g.ended)return;
  g.stepCount++;g.previous=g.snake.map(p=>({...p}));
  if(consumeTurn&&g.queue.length)g.direction=g.queue.shift();
  const d=DIRS[g.direction],head={x:g.snake[0].x+d.x,y:g.snake[0].y+d.y};
  const food=g.food.find(f=>same(f,head));
  const body=food?g.snake:g.snake.slice(0,-1);
  if(head.x<0||head.y<0||head.x>=COLS||head.y>=ROWS||g.walls.some(w=>same(w,head))||body.some(p=>same(p,head))){crash(g);return;}
  g.snake.unshift(head);g.snake.pop();
  if(food)collect(g,food);
  if(g.ended)return;
  if(g.item&&same(g.item,head)) {
    const type=g.item.type;g.item=null;g.powers++;
    if(type==='shield')g.effects.shield=true;else g.effects[type]=g.elapsed+POWERS[type].duration;
    g.events.push({type:'power',power:type,text:POWERS[type].name});
  }
  if(g.effects.magnet>g.elapsed) {
    for(const f of [...g.food]) { if(Math.abs(f.x-head.x)+Math.abs(f.y-head.y)<=2){collect(g,f);if(g.ended)break;} }
  }
  if(!g.ended)fillFood(g);
}
export function mazeStars(g) {
  if(g.mode!=='maze'||!g.won)return 0;
  const m=MAZES[g.stage];
  return 1+(g.elapsed<=m.time?1:0)+(g.elapsed<=m.perfect&&g.crashes===0&&g.shieldUsed===0?1:0);
}
export function runSummary(g) {
  return {id:g.id,mode:g.mode,difficulty:g.difficulty,stage:g.stage,score:g.score,food:g.collected,gold:g.gold,powers:g.powers,maxLength:g.maxLength,elapsed:g.elapsed,parties:g.parties,won:g.won,stars:mazeStars(g)};
}
