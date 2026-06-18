# ADR-001: Module-based architecture with feature folders

## Context
The app covers multiple business domains: auth, payments, subscriptions, catalog, CRM, RICA, warehouse, analytics. Each domain has its own components, services, hooks, and pages. Without explicit boundaries, cross-domain imports create tight coupling and make it hard to reason about dependencies.

## Decision
Organize source code by business domain (feature folders), not by technical layer. Each domain lives in `src/modules/<domain>/` with its own:

```
src/modules/<domain>/
├── components/     # Domain-specific UI
├── pages/          # Route-level components
├── services/       # API communication
├── hooks/          # Domain-specific React hooks
├── utils/          # Domain-specific helpers
├── config/         # Domain-specific configuration
└── validation/     # Form schemas
```

Shared code lives outside modules:
- `src/components/` — cross-cutting UI (ErrorBoundary, SEO)
- `src/config/` — app-wide config (Firebase, API client)
- `src/types/` — shared TypeScript types
- `src/utils/` — generic helpers (dateFormat, phoneFormat)

Rejected alternative: layer-based (`src/components/`, `src/services/`, `src/hooks/`). This scales poorly as the app grows — related code scatters across directories, and it's unclear which components belong to which domain.

Rejected alternative: flat `src/` with no modules. Too many files, no cohesion.

## Consequences
### Positive
- Clear domain boundaries. An agent working on payments touches only `src/modules/payment/`.
- Modules are independently testable. Service tests mock only the API client.
- Easy to onboard: the file structure mirrors the business domain.
- Page-level code splitting via `React.lazy()` maps naturally to module boundaries.

### Negative
- Some components are shared across domains (Button, TextField). These live in `src/components/` rather than any module, creating a "shared" bucket that can become a dumping ground.
- Module naming must match domain vocabulary (`auth`, `payment`, `subscription`) — miss a rename and it causes confusion.
- Cross-module imports (e.g., auth importing from payment for dynamic pricing) create indirect coupling. These are allowed but should be explicit.

### Mitigations
- `src/components/` is kept small — only truly cross-cutting UI. New shared components require justification.
- Domain terms are documented in `CONTEXT.md`. Module names match glossary terms.

## Status
accepted
