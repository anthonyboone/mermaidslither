import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, turn, step, advance, interval, collect, fillFood, freeCell, reachable, mazeStars, runSummary } from '../js/engine.js';
import { COLS, ROWS, MAZES, DIFFICULTIES } from '../js/data.js';

test('seeded food placement is repeatable',()=>{
  const a=createGame({seed:42}),b=createGame({seed:42});assert.deepEqual(a.food,b.food);
});
test('buffer accepts two turns; rejects reversals, duplicates, overflow',()=>{
  const g=createGame();assert.equal(turn(g,'left'),false);assert.equal(turn(g,'right'),false);
  assert.equal(turn(g,'up'),true);assert.equal(turn(g,'down'),false);assert.equal(turn(g,'left'),true);assert.equal(turn(g,'down'),false);
  step(g);assert.equal(g.direction,'up');step(g);assert.equal(g.direction,'left');
});
test('ordinary movement holds length and advances one cell',()=>{
  const g=createGame();g.food=[];step(g);assert.equal(g.snake.length,4);assert.deepEqual(g.snake[0],{x:8,y:19});
});
test('eating a pearl grows exactly once and scores',()=>{
  const g=createGame();g.food=[{x:8,y:19,gold:false}];step(g);assert.equal(g.snake.length,5);assert.equal(g.score,10);assert.equal(g.collected,1);
});
test('vacating tail is legal when not eating',()=>{
  const g=createGame();g.snake=[{x:2,y:2},{x:2,y:3},{x:1,y:3},{x:1,y:2}];g.direction='left';g.food=[];step(g);assert.equal(g.ended,false);assert.deepEqual(g.snake[0],{x:1,y:2});
});
test('non-vacating body collision ends classic',()=>{
  const g=createGame();g.snake=[{x:2,y:2},{x:2,y:3},{x:1,y:3},{x:1,y:2},{x:1,y:1}];g.direction='left';step(g);assert.equal(g.ended,true);assert.equal(g.won,false);
});
test('unshielded wall crash ends classic',()=>{
  const g=createGame();g.snake=[{x:21,y:19}];step(g);assert.ok(g.ended);assert.equal(g.crashes,1);
});
test('shield safely respawns once, clears queue and overlapping food',()=>{
  const g=createGame({difficulty:'chill'});g.snake=[{x:21,y:19}];g.food=[{x:7,y:19,gold:false}];step(g);
  assert.equal(g.ended,false);assert.equal(g.effects.shield,false);assert.equal(g.shieldUsed,1);assert.deepEqual(g.snake[0],{x:7,y:19});
  assert.ok(!g.food.some(f=>g.snake.some(p=>p.x===f.x&&p.y===f.y)));
});
test('Time Twist loses at most 30 points and continues',()=>{
  const g=createGame({mode:'time'});g.score=20;g.snake=[{x:21,y:19}];step(g);assert.equal(g.score,0);assert.equal(g.ended,false);
});
test('Time Twist finishes at 60 active seconds',()=>{
  const g=createGame({mode:'time'});advance(g,59.99);assert.equal(g.ended,false);advance(g,.1);assert.equal(g.elapsed,60);assert.equal(g.won,true);
});
test('no clock calls means no elapsed time or effect expiry',()=>{
  const g=createGame();g.effects.slow=6;const elapsed=g.elapsed;const i=interval(g);assert.equal(g.elapsed,elapsed);assert.equal(interval(g),i);
  advance(g,6);assert.equal(interval(g),DIFFICULTIES.adventure.start);
});
test('speed acceleration is capped on every difficulty',()=>{
  for(const difficulty of Object.keys(DIFFICULTIES)){const g=createGame({mode:'speed',difficulty});advance(g,10000);assert.equal(interval(g),DIFFICULTIES[difficulty].min);}
});
test('food spawns uniquely outside snake and walls for every maze',()=>{
  for(let stage=0;stage<8;stage++)for(let seed=0;seed<15;seed++){
    const g=createGame({mode:'maze',stage,seed});const blocked=new Set([...g.snake,...g.walls].map(p=>`${p.x},${p.y}`));
    assert.equal(g.food.length,2);for(const p of g.food){const k=`${p.x},${p.y}`;assert.ok(!blocked.has(k));blocked.add(k);}
  }
});
test('all maze open cells are connected and spawn corridor clear',()=>{
  for(let stage=0;stage<MAZES.length;stage++){const g=createGame({mode:'maze',stage});assert.equal(reachable(g).length,COLS*ROWS-g.walls.length,MAZES[stage].name);assert.ok(g.snake.every(p=>!g.walls.some(w=>w.x===p.x&&w.y===p.y)));}
});
test('filled board ends with a victory, not an endless spawn loop',()=>{
  const g=createGame();g.food=[];g.snake=Array.from({length:COLS*ROWS},(_,i)=>({x:i%COLS,y:Math.floor(i/COLS)}));assert.equal(freeCell(g),null);fillFood(g);assert.equal(g.won,true);assert.equal(g.ended,true);
});
test('a power-up in the final free cell becomes a pearl, not an early victory',()=>{
  const g=createGame();g.food=[];g.snake=Array.from({length:COLS*ROWS-1},(_,i)=>({x:i%COLS,y:Math.floor(i/COLS)}));g.item={x:COLS-1,y:ROWS-1,type:'shield'};
  fillFood(g);assert.equal(g.ended,false);assert.equal(g.item,null);assert.deepEqual(g.food,[{x:COLS-1,y:ROWS-1,gold:false}]);
});
test('combo capped at five and expires after four seconds',()=>{
  const g=createGame();for(let i=0;i<8;i++){collect(g,{x:10,y:10,gold:false},false);advance(g,.3);}assert.equal(g.combo,5);assert.equal(g.parties,1);advance(g,4.1);assert.equal(g.combo,1);
});
test('double treasure applies and expires based on active clock',()=>{
  const g=createGame();g.effects.double=8;collect(g,{x:10,y:10,gold:true},false);assert.equal(g.score,60);advance(g,9);collect(g,{x:10,y:10,gold:false},false);assert.equal(g.score,70);
});
test('power pickup activates the right timer',()=>{
  const g=createGame();g.item={x:8,y:19,type:'magnet'};g.food=[{x:20,y:0,gold:false}];step(g);assert.equal(g.powers,1);assert.equal(g.effects.magnet,8);assert.equal(g.item,null);
});
test('magnet collects nearby pearls without overlap or multiple respawns',()=>{
  const g=createGame();g.effects.magnet=8;g.food=[{x:9,y:19,gold:false},{x:8,y:20,gold:true}];step(g);assert.equal(g.collected,2);assert.equal(g.snake.length,6);assert.equal(g.gold,1);assert.equal(g.food.length,3);
});
test('maze completion and stars depend on time and clean play',()=>{
  const g=createGame({mode:'maze'});g.collected=MAZES[0].target-1;collect(g,{x:9,y:9,gold:false});assert.equal(g.won,true);assert.equal(mazeStars(g),3);
  g.crashes=1;assert.equal(mazeStars(g),2);g.elapsed=100;assert.equal(mazeStars(g),1);g.won=false;assert.equal(mazeStars(g),0);
});
test('practice has safe recovery and completes after three pearls',()=>{
  const g=createGame({tutorial:true});g.snake=[{x:21,y:19}];step(g);assert.equal(g.ended,false);
  for(let i=0;i<3;i++)collect(g,{x:10,y:10,gold:false});assert.equal(g.won,true);assert.equal(runSummary(g).food,3);
});
