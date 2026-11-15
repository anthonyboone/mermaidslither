# Mermaid Slither — verification and release checklist

## Implemented scope
V1 code covers all four game modes, eight mazes, three difficulties, four power-ups, combos/party scoring, personalization, twelve skins, three buddies, twelve achievements, rolling quests, device-local records/saves, accessibility settings, and offline/install support. Future modes remain separate in ROADMAP.md.

## Automated checks executed

### Core, persistence and assets
`npm test` checks seeded placement, buffered turns, reversal rejection, tail movement, growth, collisions, shield recovery, timed penalties/endings, active-time effects, speed caps, reachable maze layouts, food placement, full-board handling, combo limits, magnets, maze stars, safe practice, save validation, storage failures, idempotent settlement, one-time rewards, mission replacement, purchases, record separation, persistence, offline asset completeness, and PNG icon dimensions.

**Result: 60/60 passing** (`npm test`), including production package validation, movement/render timing, swipe/keyboard regressions and backwards-compatible control preferences.

### Browser flows
Playwright uses desktop Chromium at 1440 × 1080 and WebKit with an iPhone 13 device configuration. The original release passed 24/24 browser checks. The steering update expands this to **36 checks (18 per engine)**, run with `npm run test:browser`. Both full-engine CI jobs must pass before merging; per-commit results are available in [GitHub Actions](https://github.com/anthonyboone/mermaidslither/actions/workflows/ci.yml).

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
- Near-corner input timing, held-key repeats, off-board continuous swipes, real captured pointer drags, saved control style, 56×48px nonoverlapping arrow targets and exact fractional pause position.

Screenshots and failure traces are generated under ignored `test-results/`. Browser emulation and synthetic touch events do not certify real iPhone touch behavior, audio, or GPU performance.

### GitHub integration
- Public source: https://github.com/anthonyboone/mermaidslither
- HTTPS game: https://anthonyboone.github.io/mermaidslither/
- Initial GitHub Actions run passed core/package checks, desktop Chromium, iPhone-sized WebKit, and Pages deployment.
- Deployed-site smoke check passed at the actual repository subpath: HTTP 200, four mode cards, onboarding, Classic launch/pause, offline reload with saved profile, offline Time Twist launch, correct service-worker scope, and no page-level JavaScript errors (mobile-sized Chromium context).
- Main requires pull requests, the three test checks, linear history and resolved conversations; force pushes and deletion are blocked, including for the maintainer.
- Only tested main commits deploy. Actions are pinned to verified release commits; CI uses Node 24 and Ubuntu 24.04.
- Production packaging allowlists runtime files and derives the service-worker cache revision automatically from their contents.

## Remaining physical-device / release checks
- [ ] On a physical iPhone in Safari, complete several runs with actual swipes and both handed arrow layouts.
- [ ] Confirm notch/home-indicator safe areas in portrait, landscape and standalone mode.
- [ ] Check audio unlock, separate music/effects settings, phone lock and app interruption recovery.
- [ ] Measure actual frame times on an iPhone 12-class device. Smooth 60 fps is a target, not an asserted measured result.
- [ ] Deploy over HTTPS, Add to Home Screen on iPhone, close/reopen, then launch and play with networking disabled.
- [ ] Verify desktop Safari and Edge on their actual platforms; automated Chromium and WebKit are not branded-browser certification.
- [ ] Playtest difficulty, power-up visibility and three-star time goals with the intended age group.
- [ ] Review save migration and offline update behavior before shipping a subsequent version.

## Steering-feedback regression workflow

Reproduced before changing runtime code:
- Two renderer assertions failed: at the start of a leg the logical head was x=8 while the display was x=7; halfway through it displayed x=7.5 rather than x=8.5. This was a full movement-interval visual lag.
- A real browser regression failed: a repeated held ArrowUp event injected an unwanted Up into a quick Up/Left sequence.

Steering changes:
- Render from the committed cell towards the planned next cell and commit logic on arrival, removing the full-cell display lag and initial stationary interval.
- Synchronize the clock at input time, ignore held-key repeats and allow a bounded near-centre turn window: at most 35ms and never more than a quarter of one cell interval. Later turns remain queued to the next safe centre; rapid input cannot generate extra movement or score.
- Keep the exact fractional position through pause/countdown, and reset unfinished gestures safely.
- Make an off-board swipe pad primary; retain board swipes and optional larger 56×48px nonoverlapping arrow buttons. Preserve existing saves and store the chosen style.
- Native-pointer testing found that an offline-ready toast could cover the controls and intercept a press. Informational toast/storage overlays now pass pointer events through; regression coverage checks real hit testing and captured drags with a visible toast.

Unit checks sweep inputs from 10ms before to 10ms after a corner on all difficulties and at maximum Speedy Star speed; compare 30/60/120/144Hz; check arrival-time growth, speed changes, timed endings, queue bounds and shield recovery. Browser checks cover near-corner keyboard input, key-repeat suppression, short continuous off-board swipes, scrolling, touch-target geometry, saved preferences and pause/cancel behavior. Timing-sensitive browser fixtures freeze virtual time before gameplay, so automation/network delays cannot move the snake between assertions; simulation and render deadlines still advance explicitly in the test.

Upgrade smoke test passed using the previous release's actual Git files on a temporary localhost origin, followed by the new runtime: the new worker waited for the old window to close, nickname/three owned skins/123 test pearls survived, and the new input/motion modules and swipe pad worked after an offline reload. No real player data was used or read.

Physical iPhone testing of thumb comfort and the perceived corner feel is still required. Browser automation cannot certify those subjective/device-specific aspects.

## Known limitations
- Progress belongs to the current browser/device. No sync, account, or export feature; clearing site data can erase it.
- Browser storage restrictions may make progress temporary; the app warns instead of pretending saves succeeded.
- An unknown/corrupt save is retained until an explicitly confirmed reset; temporary new progress cannot replace it silently.
- Runtime files are cached as a set. Use `npm run build` / GitHub Pages for automatic cache revisions; when deploying unbuilt sources, increment `CACHE` in `sw.js` on changes. Existing app windows must close before a waiting update activates.
- The development server is not a production hosting/security solution. Production install/offline support needs HTTPS.
- Canvas action gameplay is visual and is not claimed to be fully screen-reader playable. Menus, settings, HUD text, controls and dialogs use semantic HTML.
- No AI opponent, daily mode, endless mode, ghost replay or online leaderboard in V1.
