# Mermaid Slither — approved V1 build plan

## Outcome
A delightful, competitive, ocean-themed browser Snake game for an 8–9-year-old. iPhone first; computer second. Four complete modes, expressive graphics, responsive controls, and skill-led replay value. No ads, accounts, purchases, strangers, or manipulative retention mechanics.

## Player journey
Name a snake, pick a sea kitten / baby turtle / dolphin buddy, choose three free skins from six starter options, and play a short interactive tutorial. All choices can change later. Choose a mode, play, see transparent results/rewards, and retry in one tap.

## V1 scope
- **Classic Snake Run:** collect pearls, grow, avoid walls/tail, gentle capped acceleration.
- **Time Twist:** 60 active-play seconds; crashes deduct points and safely respawn, not end the round.
- **Speedy Star:** increasing capped speed, checkpoints, personal-best pace display (not a ghost replay).
- **Candy Coral Maze:** eight handcrafted, stationary-obstacle stages, pearl targets, and three-star goals.
- Chill / Adventure / Turbo with separate records; Chill begins with a shield.
- Combo multiplier capped at ×5; short Pearl Party; rare golden pearls.
- Bubble Shield, Slow Current, Pearl Magnet, Double Treasure.
- Twelve skins, three cosmetic buddies, earned-only pearl currency, twelve achievements, three persistent rotating missions, local top-five records, maze medals.
- Swipe, optional left/right D-pad, arrows/WASD, buffered turns, pause, safe resume countdown.
- Reduced motion, high contrast, separate audio controls, break reminder.
- Static app, versioned local saves, install manifest, offline cache after first online load.

## Art and engineering
Pearlescent turquoise/lavender ocean, animated mermaid fins, layered reef scenery, bubbles, shafts of light, restrained particles. Clear board boundaries and readable obstacles. HTML/CSS/JS modules and Canvas; fixed-step logic and interpolated rendering; no production dependencies or backend. Audio begins only after a gesture. Adaptive rendering targets smooth 60 fps on iPhone 12-class hardware; physical-device verification required.

## Delivery phases and gates
1. **Foundation:** responsive shell, Classic, touch/keyboard input, movement, collisions, pause/retry, audio. Gate: responsive, enjoyable core; physical iPhone verification remains a release requirement.
2. **Four-mode game:** three remaining modes, eight mazes, scoring, four power-ups, tutorial, results, difficulty records. Gate: all win/loss/retry flows work.
3. **Progression:** onboarding, all skins/buddies, shop, missions, achievements, stars, validated persistence. Gate: one-time rewards stay one-time; balances survive reloads.
4. **Release polish:** final ocean art/audio, accessibility, offline/install support, performance/device tests, launch docs. Gate: acceptance criteria in SPEC.md; do not label untested devices verified.

## Excluded from V1
AI racing, daily challenge, endless wrap-around, ghost replays, moving maze hazards, portals, hats/trails, online play, cloud saves, same-keyboard multiplayer. See ROADMAP.md for the full future sequence.

## Safety and fairness
Cosmetics do not affect performance. No streak losses, loot boxes, reward wheels, fake human rivals, or deadlines on missions. Difficulty and mode records remain separate. Saves are device-local and can be lost if browser data is cleared. No network required after successful offline caching; initial installation requires a served site (HTTPS for deployed service workers, localhost for development).
