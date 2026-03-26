# Handoff: README refresh → branch & PR

Use this brief when opening a PR so reviewers (Francisco + team) can approve a **docs-only** change.

## What changed

- `README.md` was refreshed: stronger hero, **The Story**, **Built with**, **Architecture** (peer skills + `@walt-wdk/core`, no misleading linear pipeline), **Quick start** with `npm ci`, accurate **ESLint vs Prettier** commands, **Security highlights**, pointer to **CONTRIBUTING.md**, full retention of **RPC / env / config** sections.
- Test count stated as **50+** (matches current Vitest totals across workspaces).
- CI is described accurately: **build, typecheck, lint, tests, coverage** (Prettier is local via `npm run format:check`; see [CONTRIBUTING.md](../CONTRIBUTING.md)).

## Your tasks (Walt / agent)

1. **Branch** — From the repo default branch (usually `main`), create a dedicated branch, for example:
   ```bash
   git fetch origin
   git checkout origin/main
   git pull --ff-only
   git checkout -b docs/readme-refresh
   ```
   If `README.md` (and this handoff) already live on another branch, cherry-pick those commits or copy the files; avoid mixing unrelated changes (e.g. Dependabot config) in the same PR.

2. **Verify locally**
   ```bash
   npm ci
   npm run build
   npm test
   npm run lint
   npm run typecheck
   npm run format:check
   ```

3. **Commit** — Single focused commit is ideal:
   ```bash
   git add README.md .github/walt-readme-pr-handoff.md
   git commit -m "docs: refresh README and add PR handoff for Walt"
   ```

4. **Push & open PR**
   ```bash
   git push -u origin docs/readme-refresh
   ```
   - **Title:** `docs: refresh README (story, architecture, quick start, security)`
   - **Body:** Summarize sections added/changed; note docs-only; confirm CI green.
   - Use the repo [PR template](PULL_REQUEST_TEMPLATE.md) if required.

5. **Do not** change application code in this PR unless a reviewer asks for a follow-up.

## Reviewer checklist

- [ ] Narrative matches project reality (OpenClaw skills + WDK, hackathon origin).
- [ ] No inaccurate claims (lint vs format, architecture flow, CI vs local checks).
- [ ] Operational sections (RPC, env table, `config.json`) still present and correct.

After merge, optional: delete this handoff file in a follow-up if you do not want it in `.github/` long term.
