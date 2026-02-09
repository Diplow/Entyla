# Contacts Page

## Mental Model
The contacts page is the "address book" of the platform - it lets users manage their sales contacts with full CRUD operations and quick access to messaging and LinkedIn profiles.

## Responsibilities
- Display the list of contacts for the current user
- Create, edit, and delete contacts
- Provide quick actions (message, edit, LinkedIn link) per contact

## Non-Responsibilities
- Authentication / session management → See `src/lib/domains/iam`
- Contact business logic / persistence → Handled by `/api/contacts` routes
- Messaging conversations → See `src/app/messaging`

## Interface
See `dependencies.json` for what this subsystem can import.
