# Lib

Shared libraries and domain layer. Contains business logic independent of infrastructure.

## Responsibilities

- House domain subsystems with pure business logic
- Provide shared utilities (when needed)

## Child Subsystems

- **domains/** — Business domain subsystems (see [domains/README.md](domains/README.md))

## Constraints

- No infrastructure dependencies (database, auth, etc.)
- Domains define their own world view — no shared domain objects
