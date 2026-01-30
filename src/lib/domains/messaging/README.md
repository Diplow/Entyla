# Messaging Domain

Manages prospection conversations and AI-generated message drafting. Enables users to create conversations linked to contacts, generate AI prospection messages, and simulate conversations with fake contact responses.

## Responsibilities

- CRUD operations on conversations (ownership-scoped)
- Message persistence within conversations
- AI-powered prospection message drafting via the copywriting subdomain

## Child Subsystems

- **objects** — Conversation, Message types and create inputs
- **repositories** — ConversationRepository, MessageRepository interfaces + Drizzle implementations
- **actions** — Pure business logic functions for conversation and message operations
- **services** — ConversationService and DraftService wiring actions with repositories
- **copywriting** — Isolated subdomain for AI draft generation (ContactInfo, DraftRequest, CopywriterRepository + Anthropic implementation)
