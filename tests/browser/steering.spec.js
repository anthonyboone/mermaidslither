import { test, expect } from '@playwright/test';
import { freshSave, SAVE_KEY } from '../../js/storage.js';

const errorsByPage=new WeakMap();
test.beforeEach(async({page})=>{const errors=[];errorsByPage.set(page,errors);page.on('pageerror',e=>errors.push(e.message));});
test.afterEach(async({page})=>expect(errorsByPage.get(page)).toEqual([]));

async function setup(page){
  await page.clock.install({time:new Date('2026-11-01T00:00:00Z')});
  const s=freshSave();Object.assign(s,{onboarded:true,owned:['lagoon','rose','lilac']});
  await page.addInitScript(({s,key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));},{s,key:SAVE_KEY});
  await page.goto('/');await expect(page.locator('.mode-card')).toHaveCount(4);
  // Observe the real renderer; don't expose or alter game state in the shipped app.
  await page.evaluate(async()=>{
    const {OceanRenderer}=await import('./js/render.js');
    const draw=OceanRenderer.prototype.draw;
    OceanRenderer.prototype.draw=function(g,progress,...args){
      window.steering={head:{...g.snake[0]},direction:g.direction,queue:[...g.queue],elapsed:g.elapsed,progress,steps:g.stepCount,at:performance.now()};
      return draw.call(this,g,progress,...args);
    };
    const snake=OceanRenderer.prototype.snake;
    OceanRenderer.prototype.snake=function(points,skin,cell,...args){
      if(this.canvas.id==='game-canvas')window.steering.visual={x:points[0].x/cell-.5,y:points[0].y/(this.height/26)-.5};
      return snake.call(this,points,skin,cell,...args);
    };
  });
  // Keep automation/IPC latency out of millisecond input assertions. All game
  // time after this point advances only through explicit runFor calls.
  await page.clock.pauseAt(new Date('2026-11-01T00:01:00Z'));
  await page.locator('[data-action="mode"][data-value="classic"]').click();
  await page.clock.runFor(3300);await expect(page.locator('#countdown')).toBeHidden();
}

test('held-key repeats cannot sneak an extra turn into a quick two-corner sequence',async({page})=>{
  await setup(page);
  await page.keyboard.press('ArrowUp');await page.clock.runFor(200);
  await page.keyboard.press('ArrowLeft');
  await page.locator('body').dispatchEvent('keydown',{key:'ArrowUp',code:'ArrowUp',repeat:true,bubbles:true});
  await page.clock.runFor(16);
  const observed=await page.evaluate(()=>window.steering);
  expect(observed.queue).not.toContain('up');
});

test('a key just after a visible corner uses that corner, not the following square',async({page})=>{
  await setup(page);
  const before=await page.evaluate(()=>({...window.steering,now:performance.now()}));
  const toCorner=(1-before.progress)*155-(before.now-before.at);
  await page.clock.runFor(Math.max(0,toCorner)+5);
  // The renderer is sampled on rAF; allow one display frame after arrival.
  await page.keyboard.press('ArrowUp');await page.clock.runFor(175);
  const after=await page.evaluate(()=>window.steering);
  expect(after.head.x).toBe(before.head.x+1);expect(after.head.y).toBe(before.head.y-1);
  expect(after.visual.x).toBeCloseTo(before.head.x+1,6);
  expect(after.direction).toBe('up');
});

test('off-board swipe pad supports short continuous turns without covering or scrolling the board',async({page},info)=>{
  await page.setViewportSize({width:375,height:667});await setup(page);
  const board=await page.locator('#game-canvas').boundingBox(),pad=await page.locator('#swipe-pad').boundingBox();
  expect(pad.y).toBeGreaterThan(board.y+board.height);expect(pad.y+pad.height).toBeLessThanOrEqual(667);
  expect(await page.locator('#swipe-pad').evaluate(el=>getComputedStyle(el).touchAction)).toBe('none');
  const x=pad.x+pad.width/2,y=pad.y+pad.height/2,scroll=await page.evaluate(()=>scrollY);
  const before=await page.evaluate(()=>window.steering);
  await page.locator('#swipe-pad').dispatchEvent('pointerdown',{pointerId:1,clientX:x,clientY:y,pointerType:'touch'});
  await page.locator('#swipe-pad').dispatchEvent('pointermove',{pointerId:1,clientX:x,clientY:y-13,pointerType:'touch'});
  await expect(page.locator('#steering-status')).toHaveAttribute('data-direction','up');
  await page.clock.runFor(200);const up=await page.evaluate(()=>window.steering);expect(up.direction).toBe('up');expect(up.head.y).toBeLessThan(before.head.y);
  await page.locator('#swipe-pad').dispatchEvent('pointermove',{pointerId:1,clientX:x-13,clientY:y-13,pointerType:'touch'});
  await page.clock.runFor(200);const left=await page.evaluate(()=>window.steering);expect(left.direction).toBe('left');expect(left.head.x).toBeLessThan(up.head.x);
  await page.locator('#swipe-pad').dispatchEvent('pointercancel',{pointerId:1,pointerType:'touch'});
  await page.locator('#swipe-pad').dispatchEvent('pointermove',{pointerId:1,clientX:x-13,clientY:y+40,pointerType:'touch'});
  expect(await page.evaluate(()=>scrollY)).toBe(scroll);
  await page.screenshot({path:`test-results/${info.project.name}-swipe-pad.png`,animations:'disabled'});
});

test('larger arrows have nonoverlapping targets, respond on press, and save the chosen style',async({page})=>{
  await page.setViewportSize({width:375,height:667});await setup(page);await page.locator('#arrows-mode').click();
  await expect(page.locator('#swipe-pad')).toBeHidden();const rects=[];
  for(const b of await page.locator('#dpad button').all()){
    const r=await b.boundingBox();expect(r.width).toBeGreaterThanOrEqual(48);expect(r.height).toBeGreaterThanOrEqual(48);expect(r.y+r.height).toBeLessThanOrEqual(667);rects.push(r);
  }
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
    const a=rects[i],b=rects[j];expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);
  }
  await page.locator('[data-direction="up"]').dispatchEvent('pointerdown',{pointerId:2,pointerType:'touch'});
  await expect(page.locator('#steering-status')).toHaveAttribute('data-direction','up');
  await page.reload();await page.locator('[data-action="mode"][data-value="classic"]').click();await expect(page.locator('#dpad')).toBeVisible();
});

test('native pointer capture keeps a drag steering when it leaves the swipe pad',async({page})=>{
  await page.setViewportSize({width:375,height:667});await setup(page);
  const pad=await page.locator('#swipe-pad').boundingBox(),x=pad.x+pad.width/2,y=pad.y+pad.height/2;
  // Status bubbles can visually overlap the pad on a first offline install;
  // they must never intercept a real finger/mouse press.
  await page.evaluate(()=>{const toast=document.getElementById('toast');toast.textContent='Your ocean is ready for offline adventures.';toast.hidden=false;});
  expect(await page.evaluate(({x,y})=>document.elementFromPoint(x,y).closest('#swipe-pad')?.id,{x,y})).toBe('swipe-pad');
  await page.mouse.move(x,y);await page.mouse.down();await expect(page.locator('#swipe-pad')).toHaveClass(/steering-active/);
  await page.mouse.move(x,y-13);await expect(page.locator('#steering-status')).toHaveAttribute('data-direction','up');
  await page.clock.runFor(200);await page.mouse.move(pad.x-15,y-13);
  await expect(page.locator('#steering-status')).toHaveAttribute('data-direction','left');
  await page.mouse.up();await expect(page.locator('#swipe-pad')).not.toHaveClass(/steering-active/);
});

test('pause and countdown preserve the exact visible position and cancel unfinished swipes',async({page})=>{
  await page.setViewportSize({width:375,height:667});await setup(page);
  const before=await page.evaluate(()=>window.steering.visual);
  const pad=await page.locator('#swipe-pad').boundingBox();
  await page.locator('#swipe-pad').dispatchEvent('pointerdown',{pointerId:7,clientX:pad.x+30,clientY:pad.y+40,pointerType:'touch'});
  await page.keyboard.press('Space');await page.clock.runFor(32);
  expect(await page.evaluate(()=>window.steering.visual)).toEqual(before);
  await page.clock.fastForward(30000);expect(await page.evaluate(()=>window.steering.visual)).toEqual(before);
  await page.locator('[data-action="resume"]').click();await page.clock.runFor(2900);
  expect(await page.evaluate(()=>window.steering.visual)).toEqual(before);
  await page.clock.runFor(300);
  await page.locator('#swipe-pad').dispatchEvent('pointermove',{pointerId:7,clientX:pad.x+30,clientY:pad.y+10,pointerType:'touch'});
  await page.clock.runFor(16);expect((await page.evaluate(()=>window.steering)).direction).toBe('right');
});
