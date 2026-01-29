# IAM Domain

Owns the business definition of identity and access — who is the current user.

## Mental Model

IAM answers one question: "Who is making this request?" It defines the `User` type that other domains reference by ID, and provides `IamService.getCurrentUser()` as the single entry point for authentication.

## Responsibilities

- Define the canonical `User` and `Session` types
- Provide `getCurrentUser(headers)` to resolve the authenticated user
- Abstract away the authentication provider (better-auth) behind a repository

## Child Subsystems

- **objects/** — `User`, `Session` type definitions
- **repositories/** — `UserRepository` interface + infrastructure implementations
- **services/** — `IamService` entry point for API layer

## Known Impurities

- `UserRepository.getCurrentUser(headers: Headers)` — HTTP `Headers` leak into the domain layer. This is a pragmatic trade-off: authentication inherently depends on the request context. Documented here rather than hidden.
