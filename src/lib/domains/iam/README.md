# IAM Domain

Owns the business definition of identity, organization membership, and access.

## Mental Model

IAM answers three questions: "Who is making this request?", "Which organization do they belong to?", and "What is their role?" It defines the `User`, `Organization`, and `Membership` types that other domains reference by ID.

## Responsibilities

- Define the canonical `User`, `Session`, `Organization`, and `Membership` types
- Provide `getCurrentUser()` to resolve the authenticated user
- Provide `getCurrentOrganization()` and `getUserRole()` for org-scoped access
- Abstract away the authentication provider (better-auth) behind a repository

## Child Subsystems

- **objects/** — `User`, `Session`, `Organization`, `Membership` type definitions
- **repositories/** — `UserRepository`, `MembershipRepository` interfaces + infrastructure implementations
- **services/** — `IamService` entry point for API layer

## Known Impurities

None.
