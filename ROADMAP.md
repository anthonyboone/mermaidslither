# Mermaid Slither — entire roadmap

This roadmap separates approved V1 delivery from future work that requires separate approval. No calendar promises; quality gates control release.

## Current delivery status
- V1 phases 1–3: implemented, with core/save tests and browser flow checks.
- V1 phase 4: polish, accessibility settings, install/offline code and automated checks implemented. Physical iPhone, branded-browser and performance sign-off remain open in QA.md.
- V1.1 and beyond: not implemented; separate approval required.

## V1 / Phase 1 — ocean foundation
- Static-site setup and modular Canvas architecture.
- Responsive ocean home, mode picker, game HUD, pause and result dialogs.
- Grid simulation, smooth visual interpolation, tail/wall collision handling, board-full victory.
- Swipe and keyboard controls, two-turn input buffer, optional handed D-pad.
- Classic mode, safe spawn, basic procedural audio.
- Automated core checks and browser smoke test.
- Gate: playable core; physical iPhone input testing required before release certification.

## V1 / Phase 2 — four-mode gameplay
- Classic, Time Twist (60 seconds), Speedy Star, Candy Coral Maze.
- Eight handcrafted maze layouts with reachability checks, stage targets, timed stars.
- Chill / Adventure / Turbo with capped speed and separate records.
- Normal/golden pearls, quick-collection combo, ×5 ceiling and Pearl Party.
- Shield / slow / magnet / double power-ups and visible status indicators.
- Tutorial, crash recovery for timed play, full-board completion, mode instructions.
- Gate: deterministic tests for scoring, collisions, spawning, countdowns, reachable objectives, and endings.

## V1 / Phase 3 — personality and collection
- Local nickname, buddy selection, choose three of six starter skins.
- Twelve skins, three buddies; earned pearl shop, no payment integrations.
- Twelve achievements, three rolling missions with no expiry.
- Per-mode/per-difficulty top-five records, personal best, maze stars.
- Save validation, versioning, unavailable-storage fallback, safe user reset.
- Gate: idempotent rewards, bounded storage, correct currency, reload persistence.

## V1 / Phase 4 — release polish
- Bespoke ocean illustration, expressive snakes, particles, lighting and sound.
- High contrast, reduced motion, audio options, readable instructions, focus handling.
- Gentle break reminder after about 20 active minutes.
- Install manifest, icons, service-worker cache, offline update behavior.
- Adaptive effects/resolution, portrait/landscape checks, desktop-browser checks.
- README with launch, install, privacy, controls, tests and limitations.
- Gate: SPEC acceptance checklist; physical iPhone Safari validation and real-device performance measurements remain explicit manual sign-off.

## V1.1 — Rival Race (future approval)
- One AI opponent per race, never a crowded arena.
- Adjustable skill; readable, fair rules shared by human and AI.
- Race to 25/50 pearls, simple personality lines, race trophies.
- No network, chat, or misrepresented human competitors.
- Test fairness, collision resolution, stalled AI recovery, difficulty tuning.

## V1.2 — daily and endless variety (future approval)
- Daily Challenge: date-derived seed, reproducible layout/modifiers, local records; no streak punishment.
- Endless Explorer: wrap-around edges, exploration challenges and milestones.
- More ocean regions, new mission templates and stickers.
- Daily consistency tests; clearly state that local scores are not a global leaderboard.

## V1.3 — expressive mastery (future approval)
- Full personal-best ghost replay with versioned input recordings.
- More maze chapters, carefully introduced portals and moving hazards.
- Hats, trails, buddy reactions and optional seasonal visual themes.
- Replay-size limits, effect-performance budgets, accessible hazard telegraphs.

## Unscheduled / not approved
- Same-device two-player (desktop-specific design required).
- Cloud sync, public leaderboards or online multiplayer (requires new privacy/security design and parental considerations).
- Content export/import and expanded accessibility input methods.

## Ongoing quality rules
- No ads, payments, loot boxes, coercive streaks, or private data collection.
- No pay-to-win or cosmetic mechanical advantages.
- Keep initial load small and touch latency low.
- Preserve/migrate saves across releases; never silently wipe a save on an unknown version.
- Mark measured results separately from aspirations and unverified device claims.
