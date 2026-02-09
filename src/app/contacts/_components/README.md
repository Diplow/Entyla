# Contacts Components

## Mental Model
UI building blocks for the contacts page - each component handles a specific piece of the contact management interface, from listing and displaying contacts to importing from LinkedIn.

## Responsibilities
- Render contact list with search and filtering
- Display individual contact cards with edit/delete actions
- Handle LinkedIn profile import flow (URL input, preview, creation)
- Provide reusable form fields for contact creation and editing

## Non-Responsibilities
- API communication logic → Components call fetch directly to API routes
- Contact domain logic → See `src/lib/domains/prospect/README.md`

## Interface
*See `index.ts` for the public API - the ONLY exports other subsystems can use*
*See `dependencies.json` for what this subsystem can import*
