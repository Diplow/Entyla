**To:** wizard@posthog.com
**Subject:** Feedback on the Next.js App Router wizard — smooth experience, a few architectural notes

Hi PostHog team,

Thanks for the wizard — the setup went really smoothly overall. Getting client-side analytics, the reverse proxy config, and EU region all wired up in one pass was great. The generated skill/reference docs were thorough and useful.

I wanted to share a couple of things I cleaned up afterward, in case it's helpful for improving the wizard's output. The project is open-source, so here's the commit with the wizard's changes for full context: https://github.com/Diplow/ai-boilerplate/commit/f9db1a3

And here's the cleanup commit: https://github.com/Diplow/ai-boilerplate/commit/240dcdd

Three things I adjusted:

1. **Server-side PostHog client kept inside the logging subsystem.** The coupling already existed before the wizard ran — the PostHog client lived in `src/lib/logging/`. But when the wizard added new use cases (business events in API routes) that have nothing to do with logging, it kept importing from there instead of extracting the client into its own subsystem. I moved it into `src/lib/analytics/` so the dependency makes sense.

2. **Redundant `_server` business events in API routes.** The wizard added manual `posthog.capture()` calls in each API route handler (e.g. `contact_created_server`, `conversation_created_server`), but these routes were already wrapped with `withApiLogging`, which automatically tracks every API call. The manual events were pure duplication.

3. **Orphaned `POSTHOG_KEY` env var.** The wizard correctly switched the actual code to use `NEXT_PUBLIC_POSTHOG_KEY`, but was lazy about the cleanup and left the old `POSTHOG_KEY` declaration as dead code in `env.js`.

These are minor — the overall integration worked on first try and the instructions were clear. Thanks again for building this, it saved a lot of time!

Best,
Ulysse
