# Server

Server-side infrastructure: database, authentication, and API orchestration.

## Responsibilities

- Database connection and schema (Drizzle ORM)
- Authentication (better-auth)
- Orchestrate domain services for API layer

## Child Subsystems

- **db/** — Database schema and connection
- **better-auth/** — Authentication configuration and handlers

## Constraints

- Only this layer combines multiple domains
- Export auth client utilities for frontend via `index.ts`
