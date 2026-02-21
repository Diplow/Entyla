# Finance Domain

Owns the business definition of AI experimentation budgets, initiatives, and time tracking.

## Mental Model

Finance answers: "How much time has the organization invested in AI experimentation, and where is it going?" It tracks monthly person-day budgets, manages initiatives (both the default exploration bucket and formal proposals), and records time entries.

## Responsibilities

- Define `Budget`, `Initiative`, and `TimeEntry` entities
- Manage budget lifecycle (creation, active period lookup)
- Handle initiative workflow (propose → approve/reject → pause/stop)
- Record and aggregate time entries
- Provide reporting via the `reporting` subdomain

## Child Subsystems

- **objects/** — `Budget`, `Initiative`, `TimeEntry` type definitions
- **repositories/** — Repository interfaces + Drizzle implementations
- **actions/** — Pure business logic functions
- **services/** — `FinanceService` entry point
- **subdomains/reporting/** — Budget summary, burn calculations, signals

## Known Impurities

None.
