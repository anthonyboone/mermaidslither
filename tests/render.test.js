import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, step } from '../js/engine.js';
import { OceanRenderer } from '../js/render.js';

function renderedHead(g,progress){
  const gradient={addColorStop(){}};
  const context=new Proxy({}, {get:(_,name)=>name==='createLinearGradient'||name==='createRadialGradient'?()=>gradient:()=>{},set:()=>true});
  const renderer=new OceanRenderer({getContext:()=>context},{reduced:true});
  renderer.resize=()=>{renderer.width=220;renderer.height=260;};
  let points;renderer.snake=p=>points=p;
  renderer.draw(g,progress,1);
  return {x:points[0].x/10-.5,y:points[0].y/10-.5};
}
test('display starts each leg at the committed cell, not one cell behind',()=>{
  const g=createGame({seed:42});step(g);
  assert.deepEqual(renderedHead(g,0),g.snake[0]);
});
test('display interpolates towards the next cell without adding a whole-tick input lag',()=>{
  const g=createGame({seed:42});step(g);
  assert.deepEqual(renderedHead(g,.5),{x:g.snake[0].x+.5,y:g.snake[0].y});
});
