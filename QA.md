# Mermaid Slither — verification and release checklist

## Implemented scope
V1 code covers all four game modes, eight mazes, three difficulties, four power-ups, combos/party scoring, personalization, twelve skins, three buddies, twelve achievements, rolling quests, device-local records/saves, accessibility settings, and offline/install support. Future modes remain separate in ROADMAP.md.

## Automated checks executed

### Core, persistence and assets
`npm test` checks seeded placement, buffered turns, reversal rejection, tail movement, growth, collisions, shield recovery, timed penalties/endings, active-time effects, speed caps, reachable maze layouts, food placement, full-board handling, combo limits, magnets, maze stars, safe practice, save validation, storage failures, idempotent settlement, one-time rewards, mission replacement, purchases, record separation, persistence, offline asset completeness, and PNG icon dimensions.

**Result: 38/38 passing** (`npm test`), including production package validation and safe handling of unknown output folders.

### Browser flows
Playwright uses desktop Chromium at 1440 × 1080 and WebKit with an iPhone 13 device configuration. **Final result: 24/24 passing** (`npm run test:browser`), including profile-edit economy regression and landscape layout checks.

Covered flows:
- Home rendering, custom Canvas art and no horizontal overflow.
- Name / buddy / exactly-three-starter-skins onboarding and safe practice launch.
- Classic end, exactly-once reward settlement, retry, and reload persistence.
- Time Twist pause invariance and safe resume countdown.
- Speed and maze navigation, rules, all eight stages, sequential unlocks.
- Cosmetic purchases, buddy choices and accessible preferences persisted across reload.
- 375 × 667 small-phone board layout, all direction buttons in view, 44px touch targets, synthetic touch events without page scrolling.
- Blur pauses an active swim, including a countdown.
- Malformed original save remains intact and the warning is visible.
- Successful service-worker installation and offline page/module reload with saved profile and mode launch.
- Page-level JavaScript error checks in every test.

Screenshots and failure traces are generated under ignored `test-results/`. Browser emulation and synthetic touch events do not certify real iPhone touch behavior, audio, or GPU performance.

## Remaining physical-device / release checks
- [ ] On a physical iPhone in Safari, complete several runs with actual swipes and both handed arrow layouts.
- [ ] Confirm notch/home-indicator safe areas in portrait, landscape and standalone mode.
- [ ] Check audio unlock, separate music/effects settings, phone lock and app interruption recovery.
- [ ] Measure actual frame times on an iPhone 12-class device. Smooth 60 fps is a target, not an asserted measured result.
- [ ] Deploy over HTTPS, Add to Home Screen on iPhone, close/reopen, then launch and play with networking disabled.
- [ ] Verify desktop Safari and Edge on their actual platforms; automated Chromium and WebKit are not branded-browser certification.
- [ ] Playtest difficulty, power-up visibility and three-star time goals with the intended age group.
- [ ] Review save migration and offline update behavior before shipping a subsequent version.

## Known limitations
- Progress belongs to the current browser/device. No sync, account, or export feature; clearing site data can erase it.
- Browser storage restrictions may make progress temporary; the app warns instead of pretending saves succeeded.
- An unknown/corrupt save is retained until an explicitly confirmed reset; temporary new progress cannot replace it silently.
- Runtime files are cached as a set. Deploy every listed asset and increment `CACHE` in `sw.js` on changes. Existing app windows must close before a waiting update activates.
- The development server is not a production hosting/security solution. Production install/offline support needs HTTPS.
- Canvas action gameplay is visual and is not claimed to be fully screen-reader playable. Menus, settings, HUD text, controls and dialogs use semantic HTML.
- No AI opponent, daily mode, endless mode, ghost replay or online leaderboard in V1.
