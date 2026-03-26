# Contributing

Thanks for helping improve WaltWDK.

## Development setup

- **Node.js** 18 or 20
- Clone the repo, then:

```bash
npm install
npm run build
npm run typecheck
npm run lint
npm run format:check
npm test
```

## Pull requests

- Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md).
- Keep changes focused; match existing code style (Prettier + ESLint are enforced in CI).
- Add or update tests when you change behavior.

## Workspace layout

| Path                     | Package                                                 |
| ------------------------ | ------------------------------------------------------- |
| `src/core`               | `@walt-wdk/core` — WDK client, config, security helpers |
| `skills/wdk-wallet`      | Wallet create/list/balance/export                       |
| `skills/wdk-pay`         | Send, request, history, prices                          |
| `skills/wdk-agent-guard` | Limits, approval flow, audit log                        |

## Human approval (`wdk-agent-guard`)

For amounts over `requireApproval.overAmount`:

- **`approvalChannel`: `"file"` (recommended for real approvals)** — writes `~/.walt-wdk/pending-approvals/<id>.json`. Edit `status` to `approved` or `rejected` and save before the timeout.
- **`approvalChannel`: `"console"`** or omit — logs a warning and rejects quickly (useful for CI/tests; not interactive).

## Security

- Do not commit real seeds, API keys, or `~/.walt-wdk` contents.
- Report vulnerabilities per [SECURITY.md](SECURITY.md).

## License

By contributing, you agree your contributions are licensed under the same terms as the project ([Apache-2.0](LICENSE)).
