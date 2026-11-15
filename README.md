# Mermaid Slither

A little ocean magic: a responsive, iPhone-first Snake game with four modes, custom underwater art, a mermaid wardrobe, and three very encouraging ocean friends.

**[Play Mermaid Slither](https://anthonyboone.github.io/mermaidslither/)** · [Source on GitHub](https://github.com/anthonyboone/mermaidslither) · [Test & deployment runs](https://github.com/anthonyboone/mermaidslither/actions/workflows/ci.yml)

## Play on iPhone

Open the live game link in Safari. After the offline-ready message appears, use **Share → Add to Home Screen → Add**. Player progress remains on that device; the public GitHub repository does not contain or receive player saves.

## GitHub workflow and deployment

- `main` is stable. Make changes on `feat/...`, `fix/...`, or `docs/...` branches and open pull requests.
- CI runs core/asset/package checks plus desktop Chromium and iPhone-sized WebKit browser tests.
- After checks pass and the change is merged, GitHub Pages automatically deploys the game over HTTPS.
- Pull requests do not deploy the live game. Use squash merge; merged branches are deleted automatically.
- Full commands and contribution/review guidance: [CONTRIBUTING.md](CONTRIBUTING.md).

To create a clean static-site folder for other hosting services, run `npm run build` and upload **`dist/`**. The build includes only runtime files and generates an offline cache revision from their contents. No dependencies, documentation, saved player data or test output are published.

## Play locally

Requires Node.js 20 or newer. The game has **no production dependencies** and needs no build step.

```sh
npm start
```

Open **http://localhost:4173**. Use a served URL, not a double-clicked `index.html`.

For a different port, set the `PORT` environment variable before starting. To play on an iPhone, deploy these static files to an HTTPS host; plain HTTP on another device’s LAN address does not support service-worker installation/offline caching.

## Included in V1

- **Classic Snake Run:** grow, collect pearls, chase a personal best.
- **Time Twist:** a full 60-second round; collisions subtract points and safely respawn you.
- **Speedy Star:** faster currents, checkpoints, and a personal-best pace comparison.
- **Candy Coral Maze:** eight connected handcrafted reefs, progression, and three-star goals.
- Chill, Adventure, Turbo; separate mode/difficulty records.
- Four power-ups, golden pearls, ×5 combos, six-second Pearl Parties.
- Nickname, three free starter skins, twelve skins total, three cosmetic buddies.
- Earned pearls, cosmetic shop, twelve achievements, three no-deadline rotating quests.
- Local top-five scores, automatic saves, safe pause/resume, sound/music settings.
- Reduced motion, high contrast, left/right touch controls, install manifest, offline caching.

## Controls

| Device | Steer | Pause |
| --- | --- | --- |
| iPhone / touch | Swipe on the board or tap arrows | Pause button |
| Computer | Arrow keys or WASD | Space / Escape |

Turns are buffered; reversing directly into your neck is not allowed. Switching apps/tabs pauses the game. Resuming starts a three-second countdown. Start with the optional safe tutorial or choose Chill for a slower swim and a protective bubble.

### Scoring and rewards
White pearls start at 10 points, golden pearls at 30. Collect within four seconds to raise your combo. Five quick collections start Pearl Party. Double Treasure and Pearl Party can multiply collection points. The result screen itemizes earned currency; achievements/quests pay once per completion.

Maze stars: finish the reef for one; beat its time target for two; beat its stricter time target without a crash/shield recovery for three. Difficulty has its own stage progression and stars.

## Install and play offline

On an HTTPS deployment, visit once online and let the app finish caching. On iPhone Safari: **Share → Add to Home Screen**. Other supporting browsers may offer an install action. The app announces when initial offline caching is ready. All runtime art, code, and audio are local; no CDNs or remote fonts are used.

Updates install in the background and wait until old app windows are closed; a game is never swapped mid-swim. The GitHub Pages build generates a cache version automatically from runtime contents. If deploying source files without `npm run build`, increment the cache version in `sw.js` manually. Keep all files in `FILES` present on the host; a missing file prevents installation rather than leaving a partial offline app.

## Privacy and safety

No accounts, ads, payments, chat, tracking, public leaderboards, or fake human rivals. Everything stays in localStorage in the current browser. Private browsing or storage restrictions may make progress temporary. Clearing site data can erase it. An unreadable/unknown save is preserved, not silently overwritten; Settings offers an explicitly confirmed reset. No cloud or cross-device sync.

There are no expiring missions, streak penalties, loot boxes, or reward wheels. A gentle reminder offers a break after about 20 active minutes.

## Tests

```sh
npm test
```

Core and save tests use Node’s built-in test runner, with no install needed.

For browser tests (development dependencies only):

```sh
npm ci
npx playwright install chromium webkit
npm run test:browser
```

Playwright covers desktop Chromium and an iPhone-sized WebKit context, including onboarding, four-mode navigation, run settlement, pause, collection, persistence, touch event handling, malformed saves, and offline reload. Screenshots and traces go to ignored `test-results/`. Emulation is **not physical iPhone certification**. See `QA.md` for executed checks and remaining release checks.

## Project map

| File | Responsibility |
| --- | --- |
| `PLAN.md` | Approved V1 scope and phase gates |
| `ROADMAP.md` | Complete release sequence and deferred work |
| `SPEC.md` | Rules, architecture, economy, persistence, acceptance criteria |
| `index.html`, `style.css` | Responsive accessible UI shell |
| `js/engine.js` | Pure seeded simulation |
| `js/data.js` | Modes, mazes, skins, missions, achievements |
| `js/storage.js` | Validated saves and atomic run reward settlement |
| `js/render.js`, `js/art.js` | Canvas ocean, snake rendering, custom SVG art |
| `js/audio.js` | Synthesized sound and optional music |
| `js/app.js` | Screens, dialogs, controls, active-time game loop |
| `sw.js`, `manifest.webmanifest`, `assets/` | Offline/install support and icons |
| `server.mjs` | Minimal static development server |
| `tests/` | Unit and browser checks |

AI Rival Race (one opponent), Daily Challenge, Endless Explorer, and full ghost replays are future releases, not hidden unfinished V1 buttons. See the roadmap.
