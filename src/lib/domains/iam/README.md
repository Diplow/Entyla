# IAM Domain

Owns the business definition of identity and access — who is the current user.

## Mental Model

IAM answers two questions: "Who is making this request?" and "Can they afford this action?" It defines the `User` type that other domains reference by ID, provides `IamService.getCurrentUser()` for authentication, and `IamService.checkCredits()`/`IamService.recordUsage()` for credit-based billing.

## Responsibilities

- Define the canonical `User` and `Session` types
- Provide `getCurrentUser()` to resolve the authenticated user
- Abstract away the authentication provider (better-auth) behind a repository
- Manage monthly credit allowances and usage tracking via the billing subdomain

## Child Subsystems

- **objects/** — `User`, `Session` type definitions
- **repositories/** — `UserRepository` interface + infrastructure implementations
- **services/** — `IamService` entry point for API layer
- **billing/** — Credit balance management, cost conversion, usage tracking

## Known Impurities

None. The `UserRepository` uses the React `cache`-wrapped `getSession()` internally, keeping HTTP details out of the domain interface.
