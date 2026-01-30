# PostHog post-wizard report

The wizard has completed a deep integration of your project. PostHog analytics has been integrated into your Next.js App Router application with both client-side and server-side event tracking. The integration includes:

- **Client-side SDK** (`posthog-js`) initialized via `instrumentation-client.ts` for automatic pageview tracking and custom events
- **Server-side SDK** (`posthog-node`) configured with proper flushing for serverless environments
- **Reverse proxy** configured in `next.config.js` to route analytics requests through `/ingest` to avoid ad blockers
- **Error tracking** enabled with `capture_exceptions: true` and manual `captureException()` calls in error handlers
- **Environment variables** properly configured for both client and server environments

## Events Implemented

| Event Name | Description | File Path |
|------------|-------------|-----------|
| `sign_in_clicked` | User clicked the sign in with Google button | `src/app/_components/sign-in-button.tsx` |
| `sign_out_clicked` | User clicked the sign out button | `src/app/_components/sign-out-button.tsx` |
| `contact_form_opened` | User opened the new contact form | `src/app/contacts/_components/CreateContactForm.tsx` |
| `contact_created` | User successfully created a new contact | `src/app/contacts/_components/CreateContactForm.tsx` |
| `contact_delete_clicked` | User clicked delete on a contact | `src/app/contacts/_components/ContactCard.tsx` |
| `conversation_started` | User started a new conversation with AI-generated first message | `src/app/messaging/_components/ConversationSetup.tsx` |
| `ai_reply_requested` | User requested an AI-generated reply in a conversation | `src/app/messaging/_components/ContactResponseInput.tsx` |
| `contact_response_sent` | User sent a simulated contact response in a conversation | `src/app/messaging/_components/ContactResponseInput.tsx` |
| `contact_created_server` | Contact was successfully created (server-side) | `src/app/api/contacts/route.ts` |
| `contact_deleted_server` | Contact was successfully deleted (server-side) | `src/app/api/contacts/[id]/route.ts` |
| `conversation_created_server` | Conversation with AI draft message was created (server-side) | `src/app/api/conversations/route.ts` |
| `ai_draft_generated_server` | AI draft message was generated in a conversation (server-side) | `src/app/api/conversations/[id]/messages/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://eu.posthog.com/project/121153/dashboard/506473) - Main dashboard with all key metrics

### Insights
- [Contact Creation Funnel](https://eu.posthog.com/project/121153/insights/1PczDIlM) - Tracks users from opening the contact form to successfully creating a contact
- [User Sign-ins Over Time](https://eu.posthog.com/project/121153/insights/fYVmg2VO) - Tracks sign-in attempts over time to monitor user engagement
- [AI Messaging Usage](https://eu.posthog.com/project/121153/insights/KXCBGkeE) - Tracks conversation creation and AI reply generation to measure AI feature adoption
- [Contact to Conversation Funnel](https://eu.posthog.com/project/121153/insights/rytOmG5F) - Measures conversion from contact creation to starting a conversation
- [Contact Management Activity](https://eu.posthog.com/project/121153/insights/6E0F1s4w) - Tracks all contact-related actions including creation and deletion

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
