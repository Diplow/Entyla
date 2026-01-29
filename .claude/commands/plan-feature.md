---
description: Plan a feature across the DDD architecture layers, analyzing impacted subsystems and surfacing design issues
allowed-tools: ["Read", "Glob", "Grep", "Bash", "Task"]
model: opus
context: fork
---

Plan a feature using the DDD architecture.

## Feature: $ARGUMENTS

First, draft a rough plan:

1. Run `pnpm subsystem-tree` to see the current architecture
2. Identify which layers are impacted (Frontend, API, Domain, Database Schema)
3. For domain-layer changes, identify which domain(s) are affected or if a new domain is needed
4. Outline the changes at each layer

Then, refine the plan by running `/plan-subsystem <path>` for each impacted subsystem. This will surface:

- Boundary violations or responsibility mismatches
- Unanticipated dependencies (treat these as design questions)
- API changes needed
- Complexity thresholds being crossed

Iterate on the plan based on subsystem feedback until:

- All dependencies are anticipated and justified
- All changes fit within subsystem responsibilities
- No unexpected coupling emerges

## DDD Layer Reference

- **Frontend** (`src/app`): Next.js pages/components. Calls API routes only.
- **API** (`src/server/api`): Orchestrates domains for frontend requests. Only layer that can combine multiple domains.
- **Domain** (`src/lib/domains/<name>`): Isolated business logic. Internal structure: services/ (entry points), actions/ (pure logic), repositories/ (data access), objects/ (types), utils/ (helpers).
- **Database Schema** (`src/server/db`): Drizzle schema. Only imported by repositories.

## Output

Provide a structured plan with:

1. Summary of the feature
2. Changes per layer (with specific subsystems)
3. New subsystems to create (if any)
4. Dependencies to declare
5. Open questions or risks

## Implementation Note

Each implementation step should be executed by an opus subagent via the Task tool. Structure the plan so each step is self-contained enough for a subagent to execute independently.
