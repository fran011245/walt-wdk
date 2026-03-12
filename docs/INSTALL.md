# WaltWDK — Installation Guide

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

## Repository setup

```bash
git clone https://github.com/your-org/walt-wdk.git
cd walt-wdk
npm install
npm run build
```

## Installing skills in OpenClaw

Each skill can be installed via ClawHub (when published) or from the local path:

```bash
# From ClawHub (when published)
clawhub install wdk-wallet
clawhub install wdk-pay
clawhub install wdk-agent-guard

# From local path (development)
clawhub install ./skills/wdk-wallet
clawhub install ./skills/wdk-pay
clawhub install ./skills/wdk-agent-guard
```

## Configuration

Add to your OpenClaw agent config as needed (see each skill's SKILL.md for options).

## Running tests

From the repo root:

```bash
npm test
```

This runs tests for core and all three skills.

## See also

- [ARCHITECTURE.md](ARCHITECTURE.md) — design and data flow
- [HACKATHON_SUBMISSION.md](HACKATHON_SUBMISSION.md) — submission checklist
- [VIDEO_SCRIPT.md](VIDEO_SCRIPT.md) — 2–3 min demo script

## License

Apache-2.0
