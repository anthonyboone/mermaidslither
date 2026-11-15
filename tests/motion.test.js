import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../js/engine.js';
import { GridMotion, snakePositions } from '../js/motion.js';

function setup(options={}){
  const g=createGame({seed:42,...options});g.food=[{x:0,y:0,gold:false},{x:1,y:0,gold:false},{x:2,y:0,gold:false}];
  return {g,m:new GridMotion(g)};
}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);

test('snake moves visibly during its first interval without committing a cell early',()=>{
  const {g,m}=setup();m.update(10);assert.equal(g.snake[0].x,7);close(snakePositions(g,m.progress)[0].x,7+10/155);assert.equal(g.stepCount,0);
});
test('committed and displayed positions meet exactly at cell boundaries',()=>{
  const {g,m}=setup();const endpoint=snakePositions(g,1);m.update(155);
  assert.deepEqual(snakePositions(g,0),endpoint);assert.equal(m.progress,0);assert.equal(g.snake[0].x,8);
});
test('near-corner timing sweep does not turn one square too late at any difficulty',()=>{
  for(const difficulty of ['chill','adventure','turbo'])for(const offset of [-10,-1,0,1,10]){
    const {g,m}=setup({difficulty});const duration=m.durationMs;m.update(duration+offset);assert.equal(m.turn('up'),true);
    m.update(duration-offset);assert.deepEqual(g.snake[0],{x:8,y:18},`${difficulty}, offset ${offset}ms`);
  }
  const {g,m}=setup({mode:'speed',difficulty:'turbo'});g.elapsed=100;m.beginLeg();const duration=m.durationMs;
  m.update(duration+10);m.turn('up');m.update(duration-10);assert.deepEqual(g.snake[0],{x:8,y:18});
});
test('input after the grace window waits for the next safe centre, not a mid-cell teleport',()=>{
  const {g,m}=setup();m.update(155+40);const before=snakePositions(g,m.progress);m.turn('up');
  assert.equal(g.direction,'right');assert.deepEqual(snakePositions(g,m.progress),before);
  m.update(115);assert.deepEqual(g.snake[0],{x:9,y:19});assert.equal(g.direction,'up');m.update(155);assert.deepEqual(g.snake[0],{x:9,y:18});
});
test('corner correction is bounded and never grants movement or score',()=>{
  const {g,m}=setup();m.update(155+20);const elapsed=g.elapsed,steps=g.stepCount,progress=m.progress;
  m.turn('up');assert.equal(g.elapsed,elapsed);assert.equal(g.stepCount,steps);assert.equal(m.progress,progress);assert.equal(g.score,0);assert.ok(progress<=.25);
});
test('two quick corners are preserved on separate legs and cannot reverse',()=>{
  const {g,m}=setup();assert.equal(m.turn('left'),false);assert.equal(m.turn('up'),true);assert.equal(m.turn('left'),true);assert.equal(m.turn('right'),false);
  m.update(155);assert.deepEqual(g.snake[0],{x:7,y:18});m.update(155);assert.deepEqual(g.snake[0],{x:6,y:18});
});
test('buffer remains bounded when many inputs arrive in one frame',()=>{
  const {g,m}=setup();m.update(80);m.turn('up');m.turn('left');for(let i=0;i<100;i++)m.turn('down');assert.equal(g.queue.length,2);assert.equal(g.stepCount,0);
});
test('movement and timers match at 30, 60, 120 and 144 Hz',()=>{
  const states=[];
  for(const fps of [30,60,120,144]){const {g,m}=setup();for(let i=0;i<fps;i++)m.update(1000/fps);states.push({g,m});}
  for(const {g,m} of states){assert.deepEqual(g.snake,states[0].g.snake);close(g.elapsed,1);close(m.progress,states[0].m.progress);}
});
test('food and growth occur on arrival, not while the picture is still a square behind',()=>{
  const {g,m}=setup();g.food=[{x:8,y:19,gold:false}];m.update(154);assert.equal(g.score,0);assert.equal(g.snake.length,4);
  m.update(1);assert.equal(g.score,10);assert.equal(g.snake.length,5);assert.deepEqual(snakePositions(g,m.progress)[0],{x:8,y:19});
});
test('shield recovery resets the planned travel leg and clears old turns',()=>{
  const {g,m}=setup({difficulty:'chill'});g.snake=[{x:21,y:19},{x:20,y:19}];m.update(205);assert.equal(g.crashes,1);assert.equal(g.ended,false);assert.equal(m.progress,0);assert.equal(g.direction,'right');assert.deepEqual(g.queue,[]);assert.deepEqual(g.snake[0],{x:7,y:19});
});
test('speed changes apply at cell boundaries without a mid-leg jump',()=>{
  const {g}=setup();g.elapsed=5.9;g.effects.slow=6;const m=new GridMotion(g);assert.equal(m.durationMs,232.5);
  m.update(120);assert.equal(m.durationMs,232.5);m.update(112.5);assert.equal(m.durationMs,155);assert.equal(m.progress,0);
});
test('timed mode ends at exactly 60 active seconds even across many movement deadlines',()=>{
  const {g,m}=setup({mode:'time'});m.update(60001);assert.equal(g.elapsed,60);assert.equal(g.ended,true);assert.equal(g.won,true);
});
test('invalid clock deltas cannot advance or poison a run',()=>{
  const {g,m}=setup();for(const d of [-10,NaN,Infinity,0])m.update(d);assert.equal(g.elapsed,0);assert.equal(m.progress,0);
});
