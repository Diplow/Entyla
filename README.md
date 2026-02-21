# Entyla — AI Experimentation Portfolio Tracker

A Slack-first tool that gives leaders weekly, decision-grade visibility into their AI experimentation portfolio.

## What it does

Companies tell teams to "experiment with AI" but have no structured way to track what's happening, what it's costing, or what's worth continuing. Entyla provides that visibility through a simple flow:

**Open exploration → Surface what's promising → Formalize into initiatives → Track burn across the portfolio**

### Core features

- **Slack-based timesheeting** — Weekly check-ins that feel like conversations, not forms. Team members log time invested and what they explored.
- **AI coaching** — The bot responds with contextual feedback, encouragement, and practical suggestions. It keeps experiments alive by coaching people through the hard parts.
- **Initiative proposal flow** — When the bot detects momentum, it suggests formalizing work into a tracked initiative. Admins validate before it becomes official.
- **Budget dashboard** — Live view of person-days consumed vs. remaining, burn by initiative, trends, and signals requiring attention.

### Target users

- **Companies**: 50+ employees encouraging AI experimentation but lacking visibility
- **Buyer**: Any leader accountable for making AI experimentation productive
- **Participants**: Anyone in the company — engineers, ops, sales, support, finance, HR

## Stack

- **[Next.js](https://nextjs.org)** — React framework
- **[Drizzle](https://orm.drizzle.team)** — TypeScript ORM
- **[Tailwind CSS](https://tailwindcss.com)** — Utility-first CSS
- **[Better Auth](https://www.better-auth.com)** — Authentication
- **[Slack API](https://api.slack.com)** — Bot interactions and messaging

## Architecture

The codebase enforces two complementary architectural patterns:

### Subsystem Architecture

Code is organized into **subsystems** - directories with clear boundaries, declared dependencies, and public APIs. This keeps the codebase navigable as it grows.

- Enforced by [`subsystems-architecture`](https://github.com/Diplow/subsystems-architecture) submodule
- Run `pnpm check:architecture` to validate
- Run `pnpm subsystem-tree` to visualize

### Domain-Driven Design

Business logic lives in isolated **domains** under `src/lib/domains/`. Each domain has services (entry points), objects (types/entities), actions (pure logic), and repositories (data access).

See [`src/lib/domains/README.md`](src/lib/domains/README.md) for details.

## AI-Assisted Development

The `CLAUDE.md` file provides instructions for AI assistants (Claude Code, Cursor, etc.):

- **Rule of 6** - Consistent limits on complexity (max 6 children, 6 functions per file, etc.)
- **Subsystem constraints** - How to declare and respect boundaries
- **DDD patterns** - How to structure features across layers
- **Planning workflow** - Commands like `/plan-subsystem` and `/plan-feature`

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm check:architecture` | Validate subsystem boundaries |
| `pnpm check:ruleof6` | Check complexity limits |
| `pnpm subsystem-tree` | Display subsystem hierarchy |
