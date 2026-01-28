# Domains

Domains are subsystems that serve as **namespaces for business logic**. Each domain defines its own world view through objects, exposes capabilities through services, and implements business rules through actions.

```
domain/
├── dependencies.json
├── index.ts              # Public API (services only)
├── README.md
├── services/             # Entry points for API layer
├── objects/              # Types, entities, value objects, aggregates
├── actions/              # Pure business logic
├── repositories/         # Interfaces + infrastructure implementations
│   ├── UserRepository.ts # Interface (contract)
│   └── infrastructure/   # Implementations (drizzle/, in-memory/, etc.)
└── subdomains/           # Optional nested domains
```

## Services

Services are the **only way** for the API layer to interact with a domain. Each service should be a dedicated subsystem.

When a domain has many services, group them under a `services/` router subsystem to occupy a single child slot (Rule of 6).

Services orchestrate repositories and actions. They contain minimal logic - primarily:
- Instantiating repositories
- Calling actions with the right data
- Rare validation when there's technical mismatch between service and action signatures

## Objects

Objects define the domain's **vocabulary**: types, value objects, entities, and aggregates. They live in an `objects/` router subsystem, with important objects getting their own child subsystem.

**Objects have no external dependencies.** This is fundamental - a domain defines its own world view. If two domains conceptually share a similar object (e.g., both have a "Money" concept), each defines its own type. The API layer can bridge between domains when types are compatible.

Within a domain, objects can import other objects, but:
- **No circular dependencies** - if A imports B, then B must be understandable without A
- Main objects are imported by specialized objects, not the reverse
- Many-to-many relationships don't appear in objects - use collections (aggregates) instead

**Validation in objects** is for intrinsic structural invariants - constraints that define what makes a valid instance regardless of context. Example: "A product's secondary color cannot be the same taint as its primary color."

Validation that depends on state or context belongs in actions. Implementation details (string length limits) belong in the API layer and database schema.

## Actions

Actions contain **pure business logic**. They operate on domain objects obtained from repositories (passed in by services).

- Actions receive data, they don't fetch it
- Actions can call other actions within the same domain
- Business rules that depend on state or context live here

Example: "A product that was on sale last period cannot be put on sale in the next period" - this is action-level validation because it depends on state.

## Repositories

Repositories abstract data access. They're defined in two parts:

1. **Interface** (`repositories/SomeRepository.ts`) - Pure contract, no implementation details
2. **Implementation** (`repositories/infrastructure/<impl>/`) - Concrete implementations (Drizzle, in-memory, etc.)

The infrastructure folder is a router subsystem with one child subsystem per implementation. This colocation keeps interfaces near their implementations while the codebase is young. May move to `lib/infrastructure` later when sharing across domains becomes necessary.

Repositories handle all database complexity (joins, many-to-many tables, etc.) so the domain works with clean objects and aggregates.

## Subdomains

Domains can contain subdomains for further organization. Subdomains follow the same structure but:

- **Cannot be exposed directly** - the root domain must implement a service to expose subdomain capabilities
- Sibling subdomains (same nesting level) can use each other's objects/services only when declared in `dependencies.json`

If siblings need to share objects frequently, either:
- The object should live in the parent domain
- Reorganize so one subdomain becomes a child of the other

## Validation Hierarchy

Where validation lives depends on what's being validated:

| Location | What belongs here | Example |
|----------|------------------|---------|
| **Object** | Structural invariants (always true for valid instance) | Two colors can't share the same taint |
| **Action** | Business rules depending on state/context | Can't put on sale if was on sale last period |
| **Service** | Rare - technical mismatches between contracts | Adapter validation |
| **API layer** | Input sanitization, implementation constraints | String length limits |

The closer validation is to domain objects, the better. Prefer: Object > Action > Service > API layer.
