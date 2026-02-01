Always use descriptive variable names

Always use `model: "opus"` when spawning Task subagents.

Never run `pnpm dev` — the user runs it. Ask the user to check dev server output when needed.

## Feedback Commands

Run these after implementation to validate changes:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm check:architecture
pnpm check:ruleof6
```

## Rule of 6

The codebase follows the **Rule of 6** for consistent organization (enforced by `pnpm check:ruleof6`):

- **Subsystems**: Max 6 declared child subsystems per parent. Group related children into a router subsystem.
- **Files**: Try to minimize functions per file (warning starting from 6 functions)
- **Functions**: Try to minimize lines per file (warning starting from 50 lines).

Custom thresholds via `.ruleof6-exceptions` files:

```
# Function-specific: file:function:threshold
src/path/file.ts:complexFunction: 150  # Justification for exception

# File-specific: file:threshold
src/path/file.ts: 10  # Justification for exception
```

## Subsystem Architecture

A subsystem is a way to think about a system in a simplified way: clear responsibility, clear interactions, and just the right context — its own and its parent's. The boundaries ensure you have exactly what you need to reason about change, no more, no less.

Each subsystem directory contains:

- `dependencies.json` — declares allowed imports and subsystem type
- `index.ts` — public API (all external imports must go through this)
- `README.md` — mental model, responsibilities, child subsystems

**Constraints** (enforced by `pnpm check:architecture`):

- Import only through `index.ts`, never reach into internals
- Only import declared dependencies
- No cross-domain imports
- Subsystems exceeding 1000 LoC must have a `README.md`

**Discovery:** `pnpm subsystem-tree`

### Planning Workflow

1. Draft a rough plan identifying impacted subsystems
2. Run `/plan-subsystem <path>` for each impacted subsystem to check the plan against its reality
3. Iterate based on feedback — surface dependency issues, boundary violations, missing abstractions
4. Run `pnpm check:architecture` after implementation to validate

### Handling Architecture Feedback

When `pnpm check:architecture` reports an undeclared dependency, treat it as a design question. Each dependency is a deliberate choice to add complexity to the mental model. Fewer is better, but not at the cost of hiding real coupling behind god-objects. If a dependency was not anticipated during planning, question the design before declaring it.

## DDD Architecture

```
Frontend  →  API  →  Domain  →  Database Schema
```

- **Frontend** (`src/app`): Next.js pages/components. Calls API routes only.
- **API** (`src/server/api`): Orchestrates domains. Only layer that combines multiple domains.
- **Domain** (`src/lib/domains/<name>`): The pure expression of business logic, free of implementation details. A domain is our model, our world view - how we understand the business independent of technical choices. See [`src/lib/domains/README.md`](src/lib/domains/README.md) for structure and patterns.
- **Database Schema** (`src/server/db`): Drizzle schema. Only imported by repositories.

Use `/plan-feature <description>` to plan features using this architecture.

## Product Context

Sales prospection platform that helps sales teams automate their prospection workflow. Core concepts:

- **Prospects**: Potential customers being tracked
- **Contacts**: Individual people within prospect organizations
