#!/usr/bin/env sh
set -eu

required_node='v22.22.2'
current_node="$(node --version)"
if [ "$current_node" != "$required_node" ]; then
  printf '%s\n' "Expected Node $required_node for the root workspace; found $current_node" >&2
  exit 1
fi

required_npm='10.9.4'
current_npm="$(npm --version)"
if [ "$current_npm" != "$required_npm" ]; then
  printf '%s\n' "Expected npm $required_npm; found $current_npm" >&2
  exit 1
fi

printf '%s\n' 'Installing locked repository dependencies...'
npm ci
npm --prefix functions ci

printf '%s\n' 'Validating temporary dependency-security exceptions...'
node scripts/check-security-exceptions.mjs

printf '%s\n' 'Running the local Definition of Done...'
npm run verify

printf '%s\n' 'Bootstrap complete. Read AGENTS.md before starting work.'
printf '%s\n' 'Agent skills are host tooling and are intentionally not installed automatically.'
printf '%s\n' 'Validated skill-pack revision: bdf76c7c6b7b3b3e01bb15c9fdc42ac5351855c1'
