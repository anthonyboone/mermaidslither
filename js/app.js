import { MODES, DIFFICULTIES, SKINS, BUDDIES, MAZES, ACHIEVEMENTS, MISSION_TYPES, POWERS, COLS, ROWS } from './data.js';
import { createGame, turn, interval, advance, step, runSummary } from './engine.js';
import { SaveStore } from './storage.js';
import { OceanRenderer } from './render.js';
import { OceanAudio } from './audio.js';
import { icon, buddyArt, skinArt } from './art.js';

const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storage;
try{storage=window.localStorage;}catch{storage=null;}
const store=new SaveStore(storage),save=()=>store.value;
const audio=new OceanAudio(save().settings);
const hero=new OceanRenderer($('hero-canvas'),save().settings),renderer=new OceanRenderer($('game-canvas'),save().settings);
let view='home',game=null,phase='idle',accumulator=0,simulationAccumulator=0,lastFrame=0,countdownAt=0;
let modalType='',toastTimer,messageTimer,settlement=null,breakActive=0,breakShown=false;
let draft={},onboardStep=0,editingProfile=false,pendingMode='classic';
let recordMode='classic';

function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4300);}
function updateSettings(){
  const s=save().settings;
  document.body.classList.toggle('reduced-motion',s.reduced);document.body.classList.toggle('high-contrast',s.contrast);
  $('dpad').hidden=!s.dpad;$('touch-controls').classList.toggle('hand-left',s.hand==='left');
  $('game-sound').style.opacity=s.sound?'1':'.45';$('game-sound').setAttribute('aria-pressed',String(s.sound));
  hero.settings=s;renderer.settings=s;audio.settings=s;
  if(s.music&&!document.hidden)audio.play();else audio.stop();
  if(store.warning){$('storage-warning').textContent=store.warning;$('storage-warning').hidden=false;}else $('storage-warning').hidden=true;
}
function best(mode,difficulty=save().settings.difficulty){return save().records[`${mode}:${difficulty}`]?.[0]?.score||0;}
function updateChrome(){
  $('wallet').textContent=save().pearls.toLocaleString();$('profile-letter').textContent=save().name.slice(0,1).toUpperCase();
  $('welcome-name').textContent=save().onboarded?`Welcome back, ${save().name}.`:'A new adventure, just for you.';
  const pet=BUDDIES.find(b=>b.id===save().buddy);
  $('home-buddy').innerHTML=buddyArt(pet.id);$('buddy-name').textContent=`Meet ${pet.name}`;$('buddy-line').textContent=pet.line;
  $('mobile-buddy-art').innerHTML=buddyArt(pet.id);$('mobile-buddy-name').textContent=`${pet.name}’s cheering for you.`;$('mobile-buddy-line').textContent=pet.line;
  const max=Math.max(...Object.keys(MODES).map(m=>best(m)));
  $('home-record').textContent=max?`${max.toLocaleString()} points of pure magic.`:'Your first best is waiting.';
  updateSettings();
}
function renderHome(){
  updateChrome();
  $('difficulty-switch').innerHTML=Object.entries(DIFFICULTIES).map(([id,d])=>`<button data-action="difficulty" data-value="${id}" class="${id===save().settings.difficulty?'active':''}" aria-pressed="${id===save().settings.difficulty}" title="${d.description}">${d.name}</button>`).join('');
  $('mode-grid').innerHTML=Object.entries(MODES).map(([id,m])=>`<button class="mode-card" data-action="mode" data-value="${id}" style="--mode-color:${m.color}" aria-label="Play ${m.name}"><span class="mode-icon">${icon(m.icon)}</span><span class="mode-tag">${m.tag}</span><h3>${m.name}</h3><p>${m.description}</p><span class="mode-card-bottom"><span>${icon(id==='maze'?'star':'trophy')}${id==='maze'?save().stars[save().settings.difficulty].reduce((a,b)=>a+b,0)+' / 24 stars':best(id)?'Best: '+best(id).toLocaleString():'A fresh adventure'}</span>${icon('arrow')}</span></button>`).join('');
  $('home-missions').innerHTML=save().missions.map(m=>{const d=MISSION_TYPES[m.type];return `<div><div class="mission-name">${d.name}${m.done?' ✓':''}</div><div class="mission-progress"><span>${m.done?'Complete!':d.description}</span><span>+${d.reward}</span></div><div class="progress-track"><i style="width:${Math.min(100,m.progress/d.target*100)}%"></i></div></div>`;}).join('');
}
function renderCollection(){
  updateChrome();const s=save();
  $('skin-count').textContent=`${s.owned.length} / ${SKINS.length} collected`;
  $('skin-grid').innerHTML=SKINS.map(sk=>{const owned=s.owned.includes(sk.id),equipped=s.skin===sk.id&&owned;return `<article class="skin-card ${equipped?'equipped':''}">${skinArt(sk)}<h3>${sk.name}</h3><button class="button ${equipped?'primary':'secondary'}" data-action="skin" data-value="${sk.id}" ${!owned&&s.pearls<sk.cost?'disabled':''}>${equipped?icon('check')+'Swimming in this':owned?'Wear this skin':icon('pearl')+`${sk.cost} pearls`}</button></article>`;}).join('');
  $('pet-grid').innerHTML=BUDDIES.map(p=>`<button class="pet-card ${s.buddy===p.id?'selected':''}" data-action="buddy" data-value="${p.id}" aria-pressed="${s.buddy===p.id}">${buddyArt(p.id)}<div><h3>${p.name}</h3><p>${p.type}</p><span class="pet-status">${s.buddy===p.id?'Your sidekick ✓':'Choose this friend'}</span></div></button>`).join('');
  $('achievement-count').textContent=`${s.achievements.length} / 12 discovered`;
  $('achievement-grid').innerHTML=ACHIEVEMENTS.map(a=>`<article class="achievement-card ${s.achievements.includes(a.id)?'earned':''}">${icon(s.achievements.includes(a.id)?'trophy':'lock')}<div><h3>${a.name}</h3><p>${a.description} · +${a.reward}</p></div></article>`).join('');
  $('record-mode').innerHTML=Object.entries(MODES).map(([id,m])=>`<option value="${id}" ${recordMode===id?'selected':''}>${m.name}</option>`).join('');renderRecords();
}
function renderRecords(){
  const rows=save().records[`${recordMode}:${save().settings.difficulty}`]||[];
  $('record-list').innerHTML=rows.length?`<p class="muted">${DIFFICULTIES[save().settings.difficulty].name} · saved on this device</p>`+rows.map((r,i)=>`<div class="record-row"><span>#${i+1}</span><span>${esc(r.name)}</span><time>${new Date(r.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</time><strong>${r.score.toLocaleString()}</strong></div>`).join(''):'<p class="empty-state">A little empty, a lot of possibility. Play a swim on this difficulty to set your first record.</p>';
}
function starsHTML(n){return `<span class="stars" aria-label="${n} out of 3 stars">${'★'.repeat(n)}<span class="empty">${'☆'.repeat(3-n)}</span></span>`;}
function renderMazes(){
  updateChrome();const stars=save().stars[save().settings.difficulty];
  $('maze-difficulty').textContent=`${DIFFICULTIES[save().settings.difficulty].name} currents · complete a reef to open the next`;
  $('maze-grid').innerHTML=MAZES.map((m,i)=>{const locked=i>0&&stars[i-1]===0;return `<button class="maze-card" data-action="stage" data-value="${i}" ${locked?'disabled':''}><span class="stage-number">REEF ${String(i+1).padStart(2,'0')}</span><span class="maze-preview" aria-hidden="true">${m.rects.map(([x,y,w,h])=>`<i style="left:${x/COLS*100}%;top:${y/ROWS*100}%;width:${w/COLS*100}%;height:${h/ROWS*100}%"></i>`).join('')}</span><h3>${m.name}</h3><span class="stage-goal">${locked?'Finish the previous reef':`${m.target} pearls · ${m.perfect}s for ★★★`}</span>${locked?icon('lock'):starsHTML(stars[i])}</button>`;}).join('');
}
function setView(next){
  view=next;
  document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==`${next}-view`);
  document.body.classList.toggle('game-active',next==='game');
  $('site-footer').hidden=next==='game';
  $('nav-play').classList.toggle('active',next!=='collection');$('nav-collection').classList.toggle('active',next==='collection');
  if(next==='home')renderHome();if(next==='collection')renderCollection();if(next==='maze')renderMazes();
  window.scrollTo({top:0,behavior:'instant'});
}
function openModal(type,html){
  modalType=type;$('modal-content').innerHTML=html;
  if(!$('modal').open)$('modal').showModal();
  hydrateIcons($('modal'));
}
function closeModal(){if($('modal').open)$('modal').close();modalType='';}
const closeButton='<button class="icon-button modal-close" data-action="close-modal" aria-label="Close"><span data-icon="close"></span></button>';
function ensurePlay(mode){
  pendingMode=mode;
  if(!save().onboarded){beginProfile(false);return;}
  if(mode==='maze')setView('maze');else startGame(mode);
}
function beginProfile(edit=save().onboarded){
  editingProfile=edit;draft={name:save().name,buddy:save().buddy,skins:edit?save().owned.filter(id=>SKINS.find(s=>s.id===id)?.starter).slice(0,3):['lagoon','rose','lilac']};
  onboardStep=0;renderOnboarding();
}
function renderOnboarding(){
  const totalSteps=editingProfile?2:3;
  const finalStep=onboardStep===totalSteps-1;
  const dots=`<div class="step-dots">${Array.from({length:totalSteps},(_,i)=>`<i class="${i===onboardStep?'active':''}"></i>`).join('')}</div>`;
  const titles=['Every mermaid needs a name.','A friend for the journey.','Three little pieces of you.'];
  const desc=['What should we call your snake? A nickname is perfect.','Pick your sidekick. They’re all very good cheerleaders.','Choose exactly three free starter skins. You can earn the rest.'];
  let body='';
  if(onboardStep===0)body=`<div class="modal-art">${skinArt(SKINS.find(s=>s.id===save().skin))}</div><label class="field-label" for="snake-name">YOUR SNAKE’S NICKNAME</label><input id="snake-name" type="text" maxlength="16" value="${esc(draft.name)}" autocomplete="off" autocapitalize="words" spellcheck="false"><p class="muted" style="font-size:10px">Only saved here. Never shared with anyone.</p>`;
  else if(onboardStep===1)body=`<div class="onboard-options">${BUDDIES.map(p=>`<button class="onboard-pet ${draft.buddy===p.id?'selected':''}" data-action="draft-buddy" data-value="${p.id}" aria-pressed="${draft.buddy===p.id}">${buddyArt(p.id)}<strong>${p.name}</strong><span>${p.type}</span></button>`).join('')}</div>`;
  else body=`<div class="onboard-options">${SKINS.filter(s=>s.starter).map(s=>`<button class="onboard-skin ${draft.skins.includes(s.id)?'selected':''}" data-action="draft-skin" data-value="${s.id}" aria-pressed="${draft.skins.includes(s.id)}">${skinArt(s)}${s.name}${draft.skins.includes(s.id)?' ✓':''}</button>`).join('')}</div><p class="muted">${draft.skins.length} of 3 selected${editingProfile?' · your owned skins stay yours':''}</p>`;
  openModal('onboarding',`<div class="modal-inner">${closeButton}<span class="eyebrow">${editingProfile?'MAKE IT YOUR OWN':'WELCOME TO YOUR OCEAN'} · ${onboardStep+1} / ${totalSteps}</span><h2>${titles[onboardStep]}</h2><p class="muted">${desc[onboardStep]}</p>${body}${editingProfile&&finalStep?'<p class="muted" style="font-size:10px">Change your outfit anytime in Your treasures.</p>':''}<div class="modal-actions"><button class="button primary" data-action="onboard-next" ${onboardStep===2&&draft.skins.length!==3?'disabled':''}>${finalStep?(editingProfile?'Save my sparkle':'Meet your ocean'):'Next little step'}${icon('arrow')}</button>${onboardStep>0?'<button class="text-button" style="justify-content:center" data-action="onboard-back">Back</button>':''}</div>${dots}</div>`);
}
function onboardNext(){
  if(onboardStep===0){const name=$('snake-name').value.trim();if(!name){$('snake-name').focus();toast('A little nickname, please!');return;}draft.name=name.slice(0,16);}
  if(onboardStep<(editingProfile?1:2)){onboardStep++;renderOnboarding();return;}
  if(!editingProfile&&draft.skins.length!==3)return;
  const s=save();s.name=draft.name;s.buddy=draft.buddy;if(!editingProfile)s.owned=[...new Set([...s.owned,...draft.skins])];
  if(!s.owned.includes(s.skin))s.skin=draft.skins[0];s.onboarded=true;store.persist();updateChrome();
  if(editingProfile){closeModal();if(view==='collection')renderCollection();if(view==='game'&&phase==='paused')pauseDialog();toast('Looking wonderfully you.');}
  else tutorialPrompt();
}
function tutorialPrompt(){openModal('tutorial-prompt',`<div class="modal-inner"><div class="modal-art">${buddyArt(save().buddy)}</div><span class="eyebrow">A TINY PRACTICE, A BIG ADVENTURE</span><h2>Let’s find our fins.</h2><p class="muted">Swipe to turn, or use the arrow keys. Collect three pearls. Your practice bubble keeps you safe!</p><div class="modal-actions"><button class="button primary" data-action="tutorial">Show me how ${icon('arrow')}</button><button class="button secondary" data-action="skip-tutorial">I’m ready to play</button></div></div>`);}
function startGame(mode='classic',stage=0,tutorial=false){
  closeModal();audio.unlock();audio.play();
  game=createGame({mode,difficulty:tutorial?'chill':save().settings.difficulty,stage,tutorial});settlement=null;renderer.particles=[];renderer.popups=[];
  accumulator=0;simulationAccumulator=0;phase='countdown';countdownAt=performance.now();
  setView('game');$('countdown').hidden=false;$('countdown-number').textContent='3';
  $('game-title').textContent=tutorial?'Find your fins':mode==='maze'?MAZES[stage].name:MODES[mode].name;
  $('game-difficulty').textContent=tutorial?'A SAFE LITTLE PRACTICE':`${DIFFICULTIES[game.difficulty].name.toUpperCase()}${mode==='maze'?` · REEF ${stage+1} / 8`:''}`;
  const buddy=BUDDIES.find(p=>p.id===save().buddy);
  $('game-buddy').innerHTML=buddyArt(buddy.id);$('game-buddy-name').textContent=buddy.name;$('game-buddy-line').textContent=buddy.line;
  $('mode-instruction').textContent=tutorial?'Collect three pearls. Your practice shield will always help you try again.':MODES[mode].goal;
  $('game-hint').textContent=tutorial?'Collect 3 pearls. Swipe or tap arrows to turn.':'Swipe anywhere on the ocean to steer';
  updateHUD();game.events=[];
}
function updateHUD(){
  if(!game)return;
  $('hud-score').textContent=game.score.toLocaleString();$('hud-best').textContent=best(game.mode,game.difficulty).toLocaleString();
  $('hud-goal-label').textContent=game.tutorial?'PRACTICE':game.mode==='time'?'SECONDS LEFT':game.mode==='maze'?'PEARLS':game.mode==='speed'?'CHECKPOINT':'PEARLS';
  $('hud-goal').textContent=game.tutorial?`${game.collected} / 3`:game.mode==='time'?Math.max(0,Math.ceil(60-game.elapsed)):game.mode==='maze'?`${game.collected} / ${MAZES[game.stage].target}`:game.mode==='speed'?`${Math.floor(game.elapsed/10)} ✦`:game.collected;
  const inParty=game.partyUntil>game.elapsed;
  const label=inParty?`✧ Pearl Party · ${Math.ceil(game.partyUntil-game.elapsed)}s`:(game.combo>1?`×${game.combo} combo · keep your sparkle!`:'Find your flow ✧');
  if($('combo-label').textContent!==label)$('combo-label').textContent=label;
  const effects=Object.entries(game.effects).filter(([id,t])=>id==='shield'?t:t>game.elapsed).map(([id,t])=>`<span class="effect-pill">${POWERS[id].symbol} ${id==='shield'?'Shield':Math.ceil(t-game.elapsed)+'s'}</span>`).join('');
  if($('effect-pills').innerHTML!==effects)$('effect-pills').innerHTML=effects;
  if(game.mode==='speed'&&best('speed',game.difficulty)>0)$('game-hint').textContent=game.score>=best('speed',game.difficulty)?'You’re ahead of your personal best!':`${best('speed',game.difficulty)-game.score} points to catch your best`;
}
function boardMessage(text){$('board-message').textContent=text;$('board-message').classList.add('visible');clearTimeout(messageTimer);messageTimer=setTimeout(()=>$('board-message').classList.remove('visible'),1800);}
function pause(show=true){
  if(!game||!['playing','countdown'].includes(phase))return;
  phase='paused';$('countdown').hidden=true;accumulator=0;simulationAccumulator=0;audio.stop();
  if(show)pauseDialog();
}
function pauseDialog(){openModal('pause',`<div class="modal-inner"><div class="modal-art">${buddyArt(save().buddy)}</div><span class="eyebrow">A LITTLE BREATHER</span><h2>Your ocean can wait.</h2><p class="muted">Stretch your fingers. Your swim is right where you left it.</p><div class="modal-actions"><button class="button primary" data-action="resume">${icon('play')}Keep swimming</button><button class="button secondary" data-action="restart-confirm">Start a fresh swim</button><button class="text-button" style="justify-content:center" data-action="leave-confirm" data-value="home">Back to the ocean</button></div></div>`);}
function resume(){if(!game||game.ended)return;closeModal();audio.unlock();audio.play();phase='countdown';countdownAt=performance.now();$('countdown').hidden=false;$('countdown-number').textContent='3';accumulator=0;simulationAccumulator=0;}
function requestNavigate(next){
  if(view==='game'&&game&&!game.ended){pause(false);confirmLeave(next);return;}
  closeModal();phase='idle';setView(next);
}
function confirmLeave(next='home',restart=false){openModal('confirm',`<div class="modal-inner"><span class="eyebrow">JUST CHECKING</span><h2>${restart?'A fresh little start?':'Leave this swim?'}</h2><p class="muted">This unfinished swim won’t earn pearls or a record. Your earlier treasures are safe.</p><div class="modal-actions"><button class="button primary" data-action="${restart?'restart':'leave'}" data-value="${next}">${restart?'Start again':'Leave swim'}</button><button class="button secondary" data-action="pause-dialog">Keep this swim</button></div></div>`);}
function finishRun(){
  if(phase==='results')return;
  phase='results';$('countdown').hidden=true;audio.stop();
  if(game.tutorial){
    openModal('tutorial-finished',`<div class="modal-inner"><div class="modal-art">${buddyArt(save().buddy)}</div><span class="eyebrow">YOU FOUND YOUR FINS!</span><h2>Hello, little mermaid.</h2><p class="muted">You’re ready! Chase pearls, try power-ups, and make the ocean your own. Practice doesn’t affect your records.</p><div class="modal-actions"><button class="button primary" data-action="skip-tutorial">Let’s go on an adventure ${icon('arrow')}</button></div></div>`);return;
  }
  const r=runSummary(game);settlement=store.settle(r);updateChrome();
  const reward=settlement||{total:0,base:0,bonus:0,awards:[],newBest:false};
  openModal('results',`<div class="modal-inner"><span class="eyebrow">${MODES[game.mode].name.toUpperCase()} · ${DIFFICULTIES[game.difficulty].name.toUpperCase()}</span><h2>${game.mode==='maze'&&game.won?'Reef-tastic!':reward.newBest?'Your kind of magic.':game.mode==='time'?'What a lovely minute!':'That was a lovely swim.'}</h2><p class="muted">${esc(game.reason)}</p><div class="result-score">${r.score.toLocaleString()}</div><span class="result-label">POINTS OF PURE MAGIC</span>${reward.newBest?`<div><span class="best-badge">${icon('trophy')}New personal best!</span></div>`:''}${game.mode==='maze'?`<div>${starsHTML(r.stars)}</div>`:''}<div class="result-stats"><div><strong>${r.food}</strong><span>PEARLS FOUND</span></div><div><strong>${Math.floor(r.elapsed)}s</strong><span>TIME SWIMMING</span></div><div><strong>${r.maxLength}</strong><span>LONGEST TAIL</span></div></div><div class="reward-box">${icon('pearl')} +${reward.total} pearls for your treasure chest<span>${r.food*2} collected + ${Math.floor(r.score/50)} score bonus${reward.base>r.food*2+Math.floor(r.score/50)?' + 10 completion bonus':''}${reward.bonus?` + ${reward.bonus} quest & badge bonuses`:''}</span></div>${reward.awards.length?`<div class="award-list">${reward.awards.map(a=>`<div><span>✧ ${a.name}</span><span>+${a.reward} pearls</span></div>`).join('')}</div>`:''}<div class="modal-actions">${game.mode==='maze'&&game.won&&game.stage<7?'<button class="button primary" data-action="next-stage">Next magical reef '+icon('arrow')+'</button>':''}<button class="button ${game.mode==='maze'&&game.won&&game.stage<7?'secondary':'primary'}" data-action="retry">${icon('play')}Another little adventure</button><button class="text-button" style="justify-content:center" data-action="results-home">Back to my ocean</button></div>${breakActive>=1200&&!breakShown?'<p class="muted" style="margin-top:15px">You’ve made lots of waves! How about a little stretch and a drink of water?</p>':''}</div>`);
  if(breakActive>=1200)breakShown=true;
}
function settingsDialog(){
  if(view==='game'&&!game.ended)pause(false);
  const s=save().settings;
  const rows=[['sound','Sound effects','Pearl pops and happy little splashes'],['music','Ocean music','A gentle, synthesized ocean melody'],['reduced','Reduced motion','Less drift, no particles or camera effects'],['contrast','High contrast','Clearer text, obstacles and boundaries'],['dpad','On-screen arrows','An alternative to swipe controls']];
  openModal('settings',`<div class="modal-inner">${closeButton}<span class="eyebrow">MAKE YOURSELF AT HOME</span><h2>Your kind of ocean.</h2><div class="settings-list">${rows.map(([id,title,desc])=>`<label class="setting-row"><span><strong>${title}</strong><small>${desc}</small></span><input type="checkbox" data-setting="${id}" ${s[id]?'checked':''}></label>`).join('')}<label class="setting-row"><strong>Arrow position</strong><select data-setting="hand"><option value="left" ${s.hand==='left'?'selected':''}>Left-handed</option><option value="right" ${s.hand==='right'?'selected':''}>Right-handed</option></select></label><label class="setting-row"><span><strong>Difficulty for new swims</strong><small>Each difficulty has its own records</small></span><select data-setting="difficulty">${Object.entries(DIFFICULTIES).map(([id,d])=>`<option value="${id}" ${s.difficulty===id?'selected':''}>${d.name}</option>`).join('')}</select></label></div><p class="settings-foot">Progress stays in this browser on this device. Clearing browser data can erase it. No accounts, tracking, purchases, or online chat.<br><br>On iPhone: open in Safari, tap Share, then Add to Home Screen. Offline play is available after the app has cached successfully.</p><button class="text-button danger-button" data-action="reset-confirm">Reset this device’s progress</button><div class="modal-actions"><button class="button primary" data-action="close-modal">Just right ${icon('check')}</button></div></div>`);
}
function helpDialog(){
  if(view==='game'&&!game.ended)pause(false);
  openModal('help',`<div class="modal-inner">${closeButton}<span class="eyebrow">A LITTLE KNOW-HOW</span><h2>Find your flow.</h2><div class="help-list"><div>${icon('wave')}<section><h3>Follow your fins</h3><p>Swipe up, down, left or right on the ocean. Use on-screen arrows, arrow keys or WASD. Your snake keeps swimming; you can’t turn straight back into yourself.</p></section></div><div>${icon('pearl')}<section><h3>A little pearl magic</h3><p>White pearls start at 10 points. Golden ones start at 30! Find pearls within 4 seconds to build a ×5 combo. Five in a row starts a six-second Pearl Party.</p></section></div><div>${icon('shell')}<section><h3>Collect a little help</h3><p>◇ shields one crash · ❄ slows your snake · U collects nearby pearls · ×2 doubles your points. Glowing symbols show what’s active.</p></section></div><div>${icon('heart')}<section><h3>Play your own way</h3><p>Chill starts slower with a shield. Classic and Speedy end on an unprotected crash; Time Twist respawns you with a 30-point penalty. Maze stars reward finishing, good time, and a clean fast swim.</p></section></div><div>${icon('trophy')}<section><h3>Your only competition is you</h3><p>Earn pearls, complete little quests, and dress up your snake. Scores stay on this device. No strangers, deadlines, or lost streaks. Press Space or Escape to take a break.</p></section></div></div><div class="modal-actions"><button class="button primary" data-action="close-modal">Ready to make waves</button><button class="text-button" style="justify-content:center" data-action="practice-request">Try the safe practice swim</button></div></div>`);
}
function dismissModal(){
  if(['pause','confirm'].includes(modalType)){pauseDialog();return;}
  if(['results','tutorial-finished'].includes(modalType)){closeModal();phase='idle';setView('home');return;}
  closeModal();
  if(view==='game'&&phase==='paused')pauseDialog();
}

document.addEventListener('click',event=>{
  const b=event.target.closest('[data-action]');if(!b||b.disabled)return;
  const {action,value}=b.dataset;audio.unlock();
  if(action==='home')requestNavigate('home');
  else if(action==='collection')requestNavigate('collection');
  else if(action==='quickplay')ensurePlay('classic');
  else if(action==='mode')ensurePlay(value);
  else if(action==='stage')startGame('maze',Number(value));
  else if(action==='difficulty'){save().settings.difficulty=value;store.persist();renderHome();}
  else if(action==='profile'){if(view==='game'&&!game.ended)pause(false);beginProfile();}
  else if(action==='draft-buddy'){draft.buddy=value;renderOnboarding();}
  else if(action==='draft-skin'){if(draft.skins.includes(value))draft.skins=draft.skins.filter(v=>v!==value);else if(draft.skins.length<3)draft.skins.push(value);else toast('Unselect one skin to make room for another.');renderOnboarding();}
  else if(action==='onboard-next')onboardNext();
  else if(action==='onboard-back'){onboardStep--;renderOnboarding();}
  else if(action==='tutorial')startGame('classic',0,true);
  else if(action==='skip-tutorial'){closeModal();phase='idle';if(pendingMode==='maze')setView('maze');else startGame(pendingMode||'classic');}
  else if(action==='skin'){if(!save().onboarded){beginProfile(false);return;}if(store.buy(value)){renderCollection();toast('A fresh splash of sparkle.');}}
  else if(action==='buddy'){save().buddy=value;store.persist();renderCollection();}
  else if(action==='settings')settingsDialog();
  else if(action==='help')helpDialog();
  else if(action==='close-modal')dismissModal();
  else if(action==='pause'){if(phase==='paused')pauseDialog();else pause();}
  else if(action==='pause-dialog')pauseDialog();
  else if(action==='resume')resume();
  else if(action==='game-sound'){save().settings.sound=!save().settings.sound;store.persist();updateSettings();}
  else if(action==='restart-confirm')confirmLeave('home',true);
  else if(action==='leave-confirm')confirmLeave(value);
  else if(action==='restart'||action==='retry')startGame(game.mode,game.stage,game.tutorial);
  else if(action==='leave'){closeModal();phase='idle';setView(value||'home');}
  else if(action==='results-home'){closeModal();phase='idle';setView('home');}
  else if(action==='next-stage')startGame('maze',game.stage+1);
  else if(action==='practice-request'){if(view==='game'&&game&&!game.ended){toast('Finish or leave your current swim first.');return;}if(!save().onboarded){pendingMode='classic';beginProfile(false);}else startGame('classic',0,true);}
  else if(action==='reset-confirm')openModal('reset',`<div class="modal-inner"><span class="eyebrow">THIS CAN’T BE UNDONE</span><h2>A completely fresh ocean?</h2><p class="muted">This erases this device’s nickname, pearls, skins, quests, and scores${store.blocked?', including the original unreadable save':''}.</p><div class="modal-actions"><button class="button secondary danger-button" data-action="reset">Yes, erase my progress</button><button class="button primary" data-action="settings">Keep my treasures</button></div></div>`);
  else if(action==='reset'){closeModal();store.reset();audio.stop();audio.settings=save().settings;phase='idle';game=null;setView('home');toast('A fresh ocean is ready.');}
});
document.addEventListener('change',event=>{
  const setting=event.target.dataset.setting;
  if(setting){save().settings[setting]=event.target.type==='checkbox'?event.target.checked:event.target.value;store.persist();updateSettings();if(view==='home')renderHome();if(view==='collection')renderCollection();if(view==='maze')renderMazes();}
  if(event.target.id==='record-mode'){recordMode=event.target.value;renderRecords();}
});
$('modal').addEventListener('cancel',e=>{e.preventDefault();dismissModal();});
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,select,textarea'))return;
  if($('modal').open){if(e.key==='Enter'&&modalType==='results'&&e.target===document.body){e.preventDefault();startGame(game.mode,game.stage);}return;}
  if(view!=='game')return;
  const map={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
  if(map[e.key]){e.preventDefault();if(phase==='playing')turn(game,map[e.key]);}
  if((e.code==='Space'||e.key==='Escape')&&!e.repeat){e.preventDefault();pause();}
});
let pointer=null;
$('game-canvas').addEventListener('pointerdown',e=>{
  if(phase!=='playing')return;e.preventDefault();pointer={x:e.clientX,y:e.clientY,id:e.pointerId};
  if(e.isTrusted)$('game-canvas').setPointerCapture(e.pointerId);
});
$('game-canvas').addEventListener('pointermove',e=>{
  if(!pointer||pointer.id!==e.pointerId||phase!=='playing')return;
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
  if(Math.max(Math.abs(dx),Math.abs(dy))<16)return;
  turn(game,Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');pointer.x=e.clientX;pointer.y=e.clientY;
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('game-canvas').addEventListener(event,()=>pointer=null);
$('dpad').addEventListener('pointerdown',e=>{const button=e.target.closest('[data-direction]');if(!button)return;e.preventDefault();audio.unlock();if(phase==='playing')turn(game,button.dataset.direction);});
function backgrounded(){
  pointer=null;
  if(view==='game'&&game&&!game.ended&&['playing','countdown'].includes(phase))pause();
  audio.suspend();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)backgrounded();});
window.addEventListener('blur',backgrounded);
window.addEventListener('pagehide',backgrounded);
let lastHud=0;
function frame(now){
  const dt=lastFrame?Math.min((now-lastFrame)/1000,.05):0;lastFrame=now;
  if(view==='home')hero.hero(save().settings.reduced?0:now/1000,save().skin);
  if(view==='game'&&game){
    if(phase==='countdown'&&!document.hidden){const elapsed=(now-countdownAt)/1000;$('countdown-number').textContent=String(Math.max(1,3-Math.floor(elapsed)));if(elapsed>=3){phase='playing';$('countdown').hidden=true;lastFrame=now;accumulator=0;simulationAccumulator=0;}}
    else if(phase==='playing'&&!document.hidden){
      simulationAccumulator+=dt;breakActive+=dt;
      while(simulationAccumulator>=1/60&&!game.ended){
        advance(game,1/60);simulationAccumulator-=1/60;accumulator+=1000/60;
        if(!game.ended&&accumulator>=interval(game)){accumulator-=interval(game);step(game);}
      }
      for(const e of game.events){audio.effect(e.type,game.combo);if(e.type==='eat')renderer.burst(e);if(e.text)boardMessage(e.text);}
      game.events=[];
      if(game.ended)finishRun();
      if(!breakShown&&breakActive>=1200&&!game.ended){breakShown=true;pause();toast('You’ve made lots of waves! Time for a stretch and a drink of water?');}
    }
    renderer.draw(game,phase==='playing'?Math.min(1,accumulator/interval(game)):1,save().settings.reduced?0:now/1000,save().skin);
    if(now-lastHud>100){updateHUD();lastHud=now;}
  }
  requestAnimationFrame(frame);
}
hydrateIcons();renderHome();requestAnimationFrame(frame);
if('serviceWorker'in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(reg=>{
    const ready=worker=>worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&!navigator.serviceWorker.controller)toast('Your ocean is ready for offline adventures.');});
    ready(reg.installing);reg.addEventListener('updatefound',()=>ready(reg.installing));
  }).catch(()=>toast('Offline caching is unavailable here. Online play still works.')));
}
