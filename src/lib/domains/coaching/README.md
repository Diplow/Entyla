# Coaching Domain

Manages AI experimentation coaching sessions and LLM-powered feedback for team members.

## Mental Model

The coaching domain answers: "How do we turn weekly timesheets into conversations that keep AI experiments alive?"

It owns:
- **Coaching sessions**: Weekly check-in conversations with team members
- **Coaching messages**: The back-and-forth between the LLM coach and team members
- **Feedback generation**: LLM-powered responses that encourage, suggest, and keep experiments alive

## Boundaries

- Does NOT own initiatives, budgets, or time entries (finance domain)
- Does NOT own user data (IAM domain)
- Receives context from the API layer via `CoachingContext`

## Subsystems

- `objects/` - Domain types (CoachingSession, CoachingMessage, CoachingContext)
- `repositories/` - Session persistence
- `actions/` - Business logic for session lifecycle
- `services/` - Public API (CoachingService)
- `llm/` - LLM interaction subdomain for feedback generation
