# Mermaid Slither — V1 implementation specification

## Product and platform
Ocean-themed Snake for ages 8–9. Portrait-first iPhone Safari, responsive desktop Safari/Chrome/Edge. Static HTML, CSS, JavaScript ES modules; Canvas 2D; no backend, external assets, trackers or production dependencies. Run through a local server, not file://. HTTPS required for production install/offline features.

## State and modules
- `index.html` / `style.css`: accessible shell, responsive views, dialogs, HUD.
- `js/data.js`: skins, buddies, mode/difficulty constants, handcrafted maze layouts, achievements and mission definitions.
- `js/engine.js`: pure seeded simulation, movement/collision/spawn/scoring/power-ups; no DOM dependencies.
- `js/motion.js`: cell-arrival movement clock, bounded corner forgiveness and forward-interpolated snake positions.
- `js/input.js`: repeat-safe keyboard mapping and single-pointer continuous swipe recognition.
- `js/storage.js`: versioned local save validation, run settlement, achievements, missions, purchase logic.
- `js/render.js`: interpolated Canvas renderer, particles, SVG snake previews, adaptive effects.
- `js/audio.js`: gesture-unlocked synthesized music/effects, mute/background suspension.
- `js/app.js`: UI state machine, onboarding, input, game clock, pause/resume, reward presentation.
- `sw.js` / `manifest.webmanifest` / local icons: install and offline shell.
- `server.mjs`: zero-dependency development server; `tests/*.test.js`: Node built-in tests.

Views: home, collection, maze selection, onboarding/tutorial, playing, pause, countdown, results and settings. Only active playing consumes time. No hidden-tab progression. Menu/settings cannot leave a running invisible simulation. Modal dialogs trap focus via native dialog behavior; keyboard focus returns to the invoking control.

## Board and movement
- 22 × 26 cells in every mode. Collision is grid exact; render positions interpolate.
- Discrete cell-arrival steps with continuous interpolation from the committed cell towards the planned next cell; the picture must not trail logical position by a complete movement interval. Movement duration is selected at each cell boundary, independent of display refresh rate.
- Synchronize active simulation time to each input before choosing its corner; bound per-update catch-up to 50ms after a stall. Pause freezes the exact fractional travel position; countdown time never advances the run.
- Direction changes buffered (maximum two future turns); reject reversal against the last queued direction. Ignore OS held-key repeats and modifier shortcuts. A fresh perpendicular turn may re-plan an otherwise unsteered leg within min(35ms, 25% of its duration) of a cell centre; no extra movement, score, reordered queued turns, or later mid-cell re-planning.
- Moving into the vacating tail is legal if not growing.
- Food cannot overlap the snake, obstacles, other food or power-ups.
- Spawn candidates must be reachable from the head considering static walls. A board with no remaining free cells is a victory; no empty-candidate random loops.
- Maze layouts preserve a safe starting corridor and all open cells are statically connected.
- Respawn restores a short snake in a known-safe corridor and clears input. Shield recovery uses the same rule; no repeated immediate crash.

## Modes and difficulties
| Mode | Goal / ending | Progress |
| --- | --- | --- |
| Classic | Endless score; unshielded collision ends, filled board wins | Best score and length |
| Time Twist | 60 active seconds; collision subtracts up to 30 points and resets snake, then play continues | Best score |
| Speedy Star | Survival with periodic speed increases, capped for each difficulty | Score and timed checkpoints; previous best pace marker |
| Candy Coral Maze | Eat stage target; crash ends, target completes stage | Eight stages, best stars by difficulty |

Chill: slowest, starting shield; Adventure: standard; Turbo: faster. Starting and minimum movement intervals live in data.js. Records keyed by mode + difficulty. All modes available immediately; maze stages unlock sequentially per difficulty (first always open).

## Scores and items
- Normal pearl: base 10; golden pearl: base 30, counts as one collection and one growth.
- Consecutive collections within 4 seconds raise combo (max ×5); expiry resets it. Five consecutive collections activate 6 seconds of Pearl Party double scoring, with a cooldown to prevent immediate retrigger.
- Double Treasure multiplies collection points by two for 8 seconds; Slow Current lasts 6 seconds; magnet lasts 8 seconds and collects within Manhattan distance 2. Timers use active simulation time only.
- One-hit shield; timed power-ups refresh duration rather than stack without limit.
- Three pearls present in open modes; maze has two. Gold chance 12%; item pickup spawn after every fifth collection when an item is not already on the board.
- No near-miss awards or unbounded passive point farming.
- HUD displays score, record, mode objective, combo and active effects. Results show score, pearls collected, duration, length, reward, new achievements/mission rewards and record.

## Maze stars
Eight fixed Candy Coral layouts; targets increase by stage. Completion awards one star; completion within the stage time target awards a second; no shield use/crash and within a stricter target awards the third. Failure does not award completion stars. Saved best is the maximum earned, not overwritten by a worse run. Next stage unlocks on any completion. Time targets and pearl targets are explicit data.

## Personalization and economy
- Local nickname 1–16 characters, trimmed; render with textContent, never raw HTML.
- Three buddies: sea kitten, turtle, dolphin. All cosmetic, always selectable.
- Six starter options; choose exactly three free. Twelve total skins; all remaining skins purchasable with earned currency. Owned/equipped state validated.
- Currency reward = collected pearls ×2 + floor(score/50) + 10 for a completed maze/filled board; achievements and missions add explicit fixed bonuses.
- Twelve one-time achievements (first collection/run, collection totals, scores, length, gold, combo/party, timed completion, speed checkpoint, maze completion, multi-mode exploration).
- Three active missions advance on completed runs, do not expire, award once, rotate on a later run (never apply the same run to the replacement).
- A run can settle only once via a unique run ID. Currency and all rewards commit together.
- Local records: five highest scores per mode/difficulty, retaining nickname, score and date; no fake online competitors.

## Persistence and privacy
One versioned localStorage record includes profile, owned skins, currency, settings, totals, achievements, missions, stage stars and records. Validate types, ranges, IDs and array lengths. Malformed/unsupported saves are not overwritten automatically; surface a warning and keep the original data until explicit reset. Failed writes use in-memory progress and warn the player. No nickname upload or cross-device sync. Reset requires confirmation. Clearing browser data can remove progress. Service-worker caches contain app files only, not player records.

## Input, audio and accessibility
- Default to an off-board swipe pad, below the ocean in portrait and beside it in landscape, so fingers do not hide the playfield. Retain board swipes and optional left/right-handed arrows. Save the chosen Swipe pad / Arrows style; older saves default to Swipe pad without losing progress or other settings.
- Swipes trigger at 12 CSS pixels of movement, not finger release; rebase after a recognised stroke to permit continuous corners. Ignore secondary fingers, and reset gestures on cancellation, pause, style change and backgrounding. Arrow buttons have separate, nonoverlapping 56×48px targets in an inverted-T layout. Keyboard arrows/WASD remain supported.
- Space/Escape pause; Enter retries from results. Direction input only affects gameplay, never typing fields.
- Touch controls are at least 44px. Safe-area insets, no browser scroll gestures on board, no global zoom blocking.
- On blur/visibility change: pause at the current fractional position, reset gestures and suspend audio. Resume with 3/2/1 countdown and a fresh time origin, without snapping the snake to another cell. Resume countdown canceled if backgrounded.
- AudioContext created/resumed following gesture only; separate music/effects switches. Synthesized ambient music and eat/gold/crash/win cues.
- Honor prefers-reduced-motion initially; setting available. Disable decorative drift/particles/shake in reduced motion. High-contrast obstacles and item shapes distinct from color alone.
- Break reminder after ~20 active minutes, at a safe pause/results boundary. No autoplay or punitive missed-day prompts.

## Visual/performance budget
Interpolated rounded gradient snake with fins, face and clear head direction; gold/normal pearls, identifiable power-up shapes, coral obstacles. Ocean scene with subtle light rays, reefs, bubbles and bioluminescent details. Canvas device pixel ratio capped at 2; particle count capped and reduced when frames slow. Target 60 fps on iPhone 12-class devices, not an unmeasured guarantee. Semantic HTML navigation and text HUD; Canvas action gameplay is not claimed to be fully screen-reader playable.

## Installation/offline
Manifest includes standalone display, theme/background colors, SVG app icon and PNG touch icon. Versioned service worker pre-caches the complete runtime. No third-party fonts/CDNs. Activate updates only on next launch/reload, not in the middle of play. After first successful caching, page loads and all modes play without a network. localhost allowed in development; HTTPS on deployment. iOS install instructions use Share → Add to Home Screen; no unsupported automatic install promise.

## Acceptance and verification
- Automated tests: seeded repeatability; opposite-turn rejection and buffering; vacating-tail behavior; crash/end/respawn; reachable/nonoverlapping spawns; power-up expiry; pause-time invariance via active clock; mode endings; board completion; all maze connectivity; combo bounds; score/difficulty records; idempotent reward settlement; one-time achievements/missions; purchases; malformed saves.
- Browser: onboarding → tutorial → each mode → pause/resume → results/retry → shop → reload. Keyboard and simulated touch, narrow viewport/landscape, settings, no runtime console errors, no external runtime network dependencies.
- Offline: after worker activation reload offline, load modules, start all modes, preserve save.
- Manual release checks: physical iPhone Safari swipe accuracy, audio interruptions, safe areas, Add to Home Screen/offline, measured frame times; desktop Safari/Chrome/Edge. Report unexecuted checks honestly.

## Deferred
One-opponent Rival Race, Daily Challenge, Endless Explorer, full ghost replays, moving hazards, portals, extra chapters/hats/trails/buddies. No multiplayer, cloud saves or public leaderboard without separate approval. ROADMAP.md is authoritative for future sequencing.
