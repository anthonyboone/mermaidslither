# Working on Mermaid Slither

## Normal workflow

`main` is the stable, deployable branch. Use short-lived branches and pull requests, not direct changes on main. No separate develop branch is needed for this project.

```sh
git switch main
git pull --ff-only
git switch -c feat/short-description
```

Make a small, focused change. Before committing:

```sh
npm ci
npm test
npm run build
npm run test:browser
git status
git diff
git add <specific-files>
git commit -m "feat: describe the change"
git push -u origin feat/short-description
```

Open a pull request against main on GitHub (or `gh pr create`). CI runs core/asset/build tests plus desktop Chromium and iPhone-sized WebKit. Address failures and review comments, then **squash merge** after all required checks pass. Merged branches are deleted on GitHub; keep local cleanup deliberate.

Suggested prefixes: `feat/`, `fix/`, `docs/`, `chore/`. Commit examples: `fix: keep shield recovery safe`, `docs: clarify iPhone installation`.

For a solo maintainer, zero external approvals are required; use the PR as a review checklist. Main branch protection, when enabled, blocks force pushes/deletion and requires the three test checks and resolved conversations. Do not force push main or bypass a failed check.

## Testing and development

- Node.js 20+; CI uses Node 24.
- `npm start`: development server on port 4173.
- `npm test`: dependency-free core/save/asset tests.
- `npx playwright install chromium webkit`: install local test browsers once.
- `npm run test:browser`: browser flows (requires dev dependencies).
- `npm run build`: allowlisted static app in ignored `dist/`, not node_modules or development docs.

Review `SPEC.md` before changing scoring, maze rules or the economy. Update `QA.md` with actual checks, not assumed device support. A browser configured like an iPhone is not a real iPhone hardware test.

## Deployment

A successful main push (including a merged PR) runs tests and publishes the packaged game through GitHub Pages. Pull requests never deploy the live site. Actions only has write permissions in the deploy job; there are no personal tokens in the workflow.

The production service-worker cache version is derived from the runtime contents during packaging, so game changes automatically create a fresh cache. Keep new runtime files in the service worker's offline list and the build allowlist. Never add `skipWaiting` without designing safe mid-game updates.

Existing app windows must close before a waiting update activates. The game is served under the repository subpath, so runtime URLs must stay relative (`./`, `js/...`), not root-absolute (`/js/...`).

## Safety and privacy

Never commit `.env`, tokens, private player saves, or screenshots with children's personal information. Don't add ads, payments, analytics, account systems or online chat without an explicit product/privacy review. Skins and buddies stay cosmetic; progression must not rely on coercive streaks or expiring rewards.

`dist/`, dependencies and test captures are generated and ignored. Do not manually add them to Git. Do not select a license on behalf of the owner; licensing can be decided separately.
