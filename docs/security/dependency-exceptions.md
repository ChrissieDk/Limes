# Dependency Security Exceptions

`security-exceptions.json` is the machine-checked exception register for known high/critical dependency findings. Exceptions are temporary risk records, not declarations that packages are safe.

## Policy

- Each exception names package families, potential reachability, rationale, owner, tracking task, and expiry date.
- `node scripts/check-security-exceptions.mjs` fails after an exception expires.
- GitHub dependency-audit jobs remain advisory while an unexpired exception exists, but findings remain visible as separate jobs.
- Remediation must isolate upgrades, review changelogs and lockfile changes, and run `npm run verify` plus relevant emulator/browser tests.
- Never use `npm audit fix --force` automatically.

## Current risk

The root application has no open high/critical exceptions: the React Router finding tracked through 2026-08-17 was resolved by upgrading to `react-router@8.3.0` ([GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2)). Functions currently have moderate transitive `uuid` findings; the available fix requires a breaking Firebase Admin upgrade and is tracked separately in `tasks/todo.md`.
