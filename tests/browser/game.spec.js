import { test, expect } from '@playwright/test';
import { freshSave, SAVE_KEY } from '../../js/storage.js';

const errorsByPage=new WeakMap();
test.beforeEach(async({page})=>{const errors=[];errorsByPage.set(page,errors);page.on('pageerror',e=>errors.push(e.message));});
test.afterEach(async({page})=>{expect(errorsByPage.get(page)).toEqual([]);});

async function prepared(page,overrides={}){
  const s=freshSave();Object.assign(s,{onboarded:true,owned:['lagoon','rose','lilac'],pearls:200},overrides);
  await page.addInitScript(({s,key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));},{s,key:SAVE_KEY});
  await page.goto('/');await expect(page.locator('#mode-grid button')).toHaveCount(4);
}
async function click(page,action,scope='body'){await page.locator(`${scope} [data-action="${action}"]`).first().click();}
async function start(page,mode='classic'){
  await page.locator(`[data-action="mode"][data-value="${mode}"]`).click();
  if(mode==='maze')await page.locator('[data-action="stage"][data-value="0"]').click();
  await expect(page.locator('#countdown')).toBeVisible();
}
async function timedPrepared(page){
  await page.clock.install({time:new Date('2026-11-01T00:00:00Z')});
  await prepared(page);
  await page.clock.pauseAt(new Date('2026-11-01T00:01:00Z'));
}

test('home has four adventures, no horizontal overflow, and custom ocean art',async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('#mode-grid button')).toHaveCount(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('#hero-canvas').evaluate(c=>c.width>100&&c.height>100)).toBe(true);
  await page.screenshot({path:`test-results/${info.project.name}-home.png`,fullPage:true,animations:'disabled'});
  expect(errors).toEqual([]);
});

test('nickname, buddy, three starter skins, and tutorial onboarding persist',async({page})=>{
  await page.goto('/');await click(page,'quickplay');
  await page.locator('#snake-name').fill('Marina');await click(page,'onboard-next','#modal');
  await page.locator('[data-action="draft-buddy"][data-value="dolphin"]').click();await click(page,'onboard-next','#modal');
  await expect(page.locator('.onboard-skin.selected')).toHaveCount(3);
  await page.locator('[data-action="draft-skin"][data-value="rose"]').click();await expect(page.locator('[data-action="onboard-next"]')).toBeDisabled();
  await page.locator('[data-action="draft-skin"][data-value="sunny"]').click();await click(page,'onboard-next','#modal');
  await expect(page.getByRole('heading',{name:'Let’s find our fins.'})).toBeVisible();
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
  expect(saved.name).toBe('Marina');expect(saved.buddy).toBe('dolphin');expect(saved.owned).toEqual(['lagoon','lilac','sunny']);
  await click(page,'tutorial','#modal');await expect(page.locator('#game-title')).toHaveText('Find your fins');
});

test('classic runs, settles once, can retry, and preserves records on reload',async({page})=>{
  await timedPrepared(page);await start(page);
  await page.clock.runFor(7000);await expect(page.locator('#modal')).toBeVisible();
  await expect(page.locator('[data-action="retry"]')).toBeVisible();
  const s=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);expect(s.totals.runs).toBe(1);expect(s.records['classic:adventure']).toHaveLength(1);
  await page.clock.fastForward(5000);expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).totals.runs,SAVE_KEY)).toBe(1);
  await click(page,'retry','#modal');await expect(page.locator('#countdown')).toBeVisible();
  await page.reload();expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).totals.runs,SAVE_KEY)).toBe(1);
});

test('pause freezes Time Twist and resumes with a countdown',async({page})=>{
  await timedPrepared(page);await start(page,'time');await page.clock.runFor(3700);
  await click(page,'pause');const before=await page.locator('#hud-goal').textContent();
  await page.clock.fastForward(30000);expect(await page.locator('#hud-goal').textContent()).toBe(before);
  await expect(page.getByRole('heading',{name:'Your ocean can wait.'})).toBeVisible();
  await click(page,'resume','#modal');await expect(page.locator('#countdown-number')).toHaveText('3');
  await page.clock.runFor(4500);expect(Number(await page.locator('#hud-goal').textContent())).toBeLessThan(Number(before));
});

test('all remaining modes open with correct rules and safe navigation',async({page})=>{
  await prepared(page);await start(page,'speed');await expect(page.locator('#game-title')).toHaveText('Speedy Star');
  await click(page,'home','.site-header');await expect(page.getByRole('heading',{name:'Leave this swim?'})).toBeVisible();
  await click(page,'leave','#modal');await start(page,'maze');await expect(page.locator('#game-title')).toHaveText('Sugar Shallows');
  await expect(page.locator('#hud-goal')).toHaveText('0 / 8');
  await click(page,'home','.site-header');await click(page,'leave','#modal');
  await page.locator('[data-action="mode"][data-value="maze"]').click();await expect(page.locator('.maze-card')).toHaveCount(8);await expect(page.locator('.maze-card:disabled')).toHaveCount(7);
});

test('shop, buddies, preferences and nickname are local and persist',async({page})=>{
  await prepared(page);await page.locator('[data-action="collection"]:visible').first().click();
  await expect(page.locator('.skin-card')).toHaveCount(12);await page.locator('[data-action="skin"][data-value="moon"]').click();
  await expect(page.locator('#wallet')).toHaveText('100');
  await page.locator('[data-action="buddy"][data-value="cat"]').click();
  await click(page,'settings');await page.locator('[data-setting="reduced"]').check();await page.locator('[data-setting="contrast"]').check();await click(page,'close-modal','#modal');
  await page.reload();const s=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
  expect(s.skin).toBe('moon');expect(s.buddy).toBe('cat');expect(s.pearls).toBe(100);expect(s.settings.reduced).toBe(true);expect(s.settings.contrast).toBe(true);
});

test('profile edits do not grant more free skins',async({page})=>{
  await prepared(page);await page.locator('[data-action="profile"]:visible').first().click();
  await page.locator('#snake-name').fill('Bubbles');await click(page,'onboard-next','#modal');
  await page.locator('[data-action="draft-buddy"][data-value="cat"]').click();await click(page,'onboard-next','#modal');
  await expect(page.locator('#modal')).not.toBeVisible();
  const s=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
  expect(s.name).toBe('Bubbles');expect(s.buddy).toBe('cat');expect(s.owned).toEqual(['lagoon','rose','lilac']);
});

test('landscape keeps the board and arrows in the viewport',async({page})=>{
  await page.setViewportSize({width:844,height:390});await prepared(page);await start(page);
  const board=await page.locator('#game-canvas').boundingBox();expect(board.height).toBeGreaterThan(180);expect(board.y+board.height).toBeLessThan(390);
  await page.locator('#arrows-mode').click();
  for(const b of await page.locator('#dpad button').all()){const rect=await b.boundingBox();expect(rect.y+rect.height).toBeLessThanOrEqual(390);}
});

test('board fits a small phone and touch steering does not scroll',async({page},info)=>{
  await page.setViewportSize({width:375,height:667});await timedPrepared(page);await start(page);await page.clock.runFor(3300);
  const board=await page.locator('#game-canvas').boundingBox();
  expect(board.width).toBeGreaterThan(250);
  const pad=await page.locator('#swipe-pad').boundingBox();expect(pad.y).toBeGreaterThan(board.y+board.height);expect(pad.y+pad.height).toBeLessThanOrEqual(667);
  await page.locator('#arrows-mode').click();
  for(const b of await page.locator('#dpad button').all()){const rect=await b.boundingBox();expect(rect.y+rect.height).toBeLessThanOrEqual(667);expect(rect.height).toBeGreaterThanOrEqual(48);}
  await page.locator('#swipe-mode').click();
  const scroll=await page.evaluate(()=>scrollY);
  await page.locator('#game-canvas').dispatchEvent('pointerdown',{pointerId:1,clientX:board.x+80,clientY:board.y+100,pointerType:'touch'});
  await page.locator('#game-canvas').dispatchEvent('pointermove',{pointerId:1,clientX:board.x+80,clientY:board.y+50,pointerType:'touch'});
  await page.locator('#game-canvas').dispatchEvent('pointerup',{pointerId:1,pointerType:'touch'});
  expect(await page.evaluate(()=>scrollY)).toBe(scroll);
  await page.screenshot({path:`test-results/${info.project.name}-game-mobile.png`,animations:'disabled'});
});

test('backgrounding pauses an active swim',async({page})=>{
  await timedPrepared(page);await start(page);await page.clock.runFor(3300);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('heading',{name:'Your ocean can wait.'})).toBeVisible();await expect(page.locator('#countdown')).toBeHidden();
});

test('malformed saves remain intact with a visible warning',async({page})=>{
  await page.addInitScript(key=>localStorage.setItem(key,'{original unreadable save'),SAVE_KEY);await page.goto('/');
  await expect(page.locator('#storage-warning')).toContainText('not been overwritten');
  await click(page,'quickplay');expect(await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY)).toBe('{original unreadable save');
});

test('cached app reloads offline with all modes and saved profile',async({page,context})=>{
  await prepared(page);await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);await page.reload();await expect(page.locator('#mode-grid button')).toHaveCount(4);await expect(page.locator('#welcome-name')).toContainText('Pearl');
  await page.locator('[data-action="mode"][data-value="time"]').click();await expect(page.locator('#game-title')).toHaveText('Time Twist');await context.setOffline(false);
});
