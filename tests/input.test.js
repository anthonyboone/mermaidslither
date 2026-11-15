import test from 'node:test';
import assert from 'node:assert/strict';
import { keyboardDirection, SwipeGesture } from '../js/input.js';

test('keyboard accepts arrows and WASD, but not repeats or browser shortcuts',()=>{
  for(const [key,direction] of [['ArrowUp','up'],['ArrowDown','down'],['a','left'],['D','right']])assert.equal(keyboardDirection({key}),direction);
  for(const extra of [{repeat:true},{ctrlKey:true},{metaKey:true},{altKey:true}])assert.equal(keyboardDirection({key:'ArrowUp',...extra}),null);
  assert.equal(keyboardDirection({key:'Enter'}),null);
});
test('short swipes fire on movement, not finger-up, and permit continuous corners',()=>{
  const s=new SwipeGesture();s.start(1,100,100);assert.equal(s.move(1,111,100),null);assert.equal(s.move(1,112,100),'right');assert.equal(s.move(1,112,88),'up');assert.equal(s.move(1,100,88),'left');
});
test('small movements accumulate without jitter triggering a turn',()=>{
  const s=new SwipeGesture();s.start(1,0,0);for(let i=1;i<12;i++)assert.equal(s.move(1,i,0),null);assert.equal(s.move(1,12,0),'right');
});
test('secondary fingers and unrelated cancellations do not hijack a swipe',()=>{
  const s=new SwipeGesture();assert.equal(s.start(1,0,0),true);assert.equal(s.start(2,50,50),false);assert.equal(s.move(2,100,50),null);s.end(2);assert.equal(s.move(1,0,-12),'up');
});
test('release, cancellation and pause reset prevent ghost swipes after resuming',()=>{
  const s=new SwipeGesture();s.start(1,0,0);s.end(1);assert.equal(s.move(1,0,40),null);s.start(2,0,0);s.reset();assert.equal(s.move(2,40,0),null);
});
