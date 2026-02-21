# Entyla POC — AI Experimentation Portfolio Tracker

## Concept

A Slack-first tool that gives leaders a weekly, decision-grade view of their AI experimentation portfolio. A company defines an AI experimentation budget, team members timesheet against it via a Slackbot, and structured initiatives emerge organically from exploration — validated by an admin before becoming official.

The flow is: **open exploration → surface what's promising → formalize into initiatives → track burn across the portfolio.** The result is a live dashboard showing how the experimentation budget is being consumed, what's emerging, and what deserves more investment.

The Slackbot is powered by an LLM that does more than collect data — it actively **coaches and encourages** participants. Innovation is hard, and most experiments die not because the idea was bad, but because the person behind it lost momentum. The bot keeps people engaged by giving feedback on their initiative, suggesting next steps, and cheering them through the hard parts. This makes timesheeting something people actually want to do, because they get something back.

This is the Entyla cost-steering loop (budget → burn → weekly signal → steer) scoped to a bounded, high-relevance use case: AI experimentation.

## Why AI experimentation as the wedge

- Every company is telling teams to "experiment with AI" but has no structured way to track what's happening, what it's costing, or what's worth continuing.
- AI experiments tend to persist by momentum — nobody kills a pilot because nobody sees the cumulative cost.
- It's a timely, easy-to-explain entry point that maps directly to the full Entyla vision.
- The budget is bounded and new (no legacy process to displace), which makes adoption easier.

## Target customer for POC

- **Company:** 50+ employees, already encouraging AI experimentation across the organization but lacking visibility into what's running and what it's producing.
- **Buyer:** Any executive or senior leader (CEO, COO, VP Product, VP Ops, Director of Engineering, Head of AI/Innovation) accountable for making AI experimentation productive — not just busy.
- **Who experiments:** Anyone in the company — engineers, ops teams, sales, customer support, finance, HR. AI tools and workflows are relevant across all functions, not just technical teams.
- **Budget scope:** ~20 person-days/month allocated to AI experimentation across the org (roughly 4-5 people spending a half day/week, or 2-3 people spending a full day/week).

## How it works

### Setup (Week 0)

1. Admin defines an **AI experimentation budget** in person-days per month for the org.
2. A single default initiative is created: **"AI Experimentation"** — an open exploration bucket. All participants timesheet against this initiative to start.
3. Team members are enrolled in the Slackbot and can start logging time immediately.

There are no predefined sub-initiatives at this stage. The goal is to let people explore freely within the budget envelope.

### Phase 1 — Open exploration (Weeks 1-2)

Team members explore AI tools, workflows, and ideas on their own. The Slackbot handles timesheeting with a weekly prompt:

**Slackbot message (timesheeting):**
> Hey [name], time to log your AI experimentation for this week.
> - How much time did you invest? (half day / full day / more / none)
> - What did you explore or learn? (one-liner)

The bot then **responds with LLM-generated feedback** based on what the person logged. This is what makes the interaction valuable rather than extractive:

> *Example — person logged "Tried using Claude to draft customer emails, results were hit or miss":*
> That's a solid start — email generation is one of the highest-ROI AI use cases once you nail the prompt. A common pattern is to feed it 3-4 examples of your best past emails and ask it to match the tone. Want to try that angle next week?

> *Example — person logged "none" for the second week in a row:*
> No worries — weeks get busy. Just a heads up: a lot of AI experiments stall around week 2-3, not because the idea is bad but because the first attempt didn't click. If you're stuck, what was the last thing you tried? Sometimes a 15-minute pivot is all it takes.

> *Example — person logged "Built a working prototype for auto-categorizing support tickets":*
> That's real progress — auto-categorization is exactly the kind of thing that compounds. How accurate is it so far? If it's above 70%, this might be ready to test on live tickets with a human in the loop. Could be worth proposing as a formal initiative.

The copywriting matters here — this is framed as **"investing time" and "capturing learnings"**, not as surveillance. The tone is: *we gave you this time, help us understand what's emerging so we can double down on the best ideas.* And critically, the bot **gives back** — feedback, encouragement, and practical suggestions — so the interaction feels like coaching, not reporting.

At the end of week 2, the Slackbot prompts participants who have been active:

**Slackbot message (initiative suggestion):**

Because the LLM has context on what the person has been logging, it can make the suggestion feel natural and specific rather than generic:

> Based on what you've shared the last 2 weeks, your work on auto-categorizing support tickets sounds like it's gaining traction. Do you think it deserves its own initiative?
> - Yes — I'd like to propose one (name + one-line goal)
> - Not yet — still exploring
> - I've paused for now

Proposed initiatives go to the **admin for validation**. The admin can approve, merge similar proposals, or ask for clarification before an initiative becomes official.

### Phase 2 — Structured initiatives emerge (Weeks 3+)

Once approved, new initiatives appear alongside the original "AI Experimentation" bucket. Team members can now timesheet against:

- **AI Experimentation** (the general exploration bucket — always available)
- **[Approved initiative 1]** (e.g., "AI-assisted customer support triage")
- **[Approved initiative 2]** (e.g., "Automated invoice processing pilot")

The weekly Slackbot timesheeting adapts:

**Slackbot message (timesheeting, Phase 2):**
> Hey [name], time to log your AI time for this week.
> Which initiative(s) did you work on?
> - AI Experimentation (general) — [time selector]
> - AI-assisted customer support triage — [time selector]
> - Automated invoice processing pilot — [time selector]
>
> Anything to flag? (optional one-liner)

The bot responds with context-aware feedback on each active initiative, drawing from the full history of what has been logged:

> Nice — 3 weeks into the support triage project and you've moved from prototype to live testing. That's fast. What's the accuracy looking like on real tickets?

The budget is **shared across all initiatives** — the general exploration bucket and the specific ones all draw from the same monthly person-day envelope. This is what makes the portfolio view meaningful: you can see how time shifts from open exploration toward structured bets, and across which functions (engineering, ops, sales, etc.).

### Dashboard (live, updated weekly)

The admin/delivery leader sees:

- **Budget overview:** total person-days consumed vs. remaining for the month
- **Burn by initiative:** how much time goes to general exploration vs. each specific initiative
- **Trend:** is time shifting from exploration into structured initiatives? (a healthy sign)
- **Signals:** initiatives approaching their budget slice, initiatives with no logged time for 2+ weeks, new initiative proposals pending validation
- **Forecast:** at current burn rate, when does the experimentation budget run out

### Retrospective (Week 4)

At the end of the pilot month, deliver a retrospective report:

- How the budget was spent: exploration vs. structured initiatives
- Which initiatives emerged and how much they consumed
- Which initiatives are worth continuing, scaling, or stopping
- What decisions would have been different with earlier visibility

## What the POC proves

1. **The weekly signal changes behavior.** Leaders make at least one stop/scale/rescope decision during the pilot that they wouldn't have made without the dashboard.
2. **The Slack check-in is lightweight enough to sustain.** Response rates stay above 80% across the 4 weeks.
3. **The mechanism generalizes.** At the end of the pilot, the customer sees how this same loop could apply to their full initiative portfolio.

## What to build for the POC

| Component | Implementation | Effort |
|-----------|---------------|--------|
| Slackbot timesheeting + AI coaching | Slack API (Bot), scheduled weekly messages, interactive reply, LLM-powered responses (feedback, encouragement, suggestions) | Core |
| Slackbot initiative proposal flow | Prompted at week 2+, collects name + one-liner, routes to admin | Core |
| Admin validation interface | Simple approval flow (Slack DM or minimal web UI) for proposed initiatives | Core |
| Initiative registry | List of active initiatives with budget slices, drawn from a shared budget | Core |
| Data store | Simple database or even a spreadsheet for v0 | Core |
| Dashboard | Lightweight web page or Notion/Google Sheets embed showing burn by initiative | Core |
| Retrospective report | Manual or semi-automated summary at week 4 | Manual for now |

The POC should be buildable in **1-2 weeks** with minimal infrastructure. The Slackbot (timesheeting + initiative proposals) and a simple dashboard are the only required pieces.

## Copywriting and AI coaching principles

Timesheeting has a bad reputation. The Slackbot must make it feel like **a conversation with a supportive coach, not a form to fill out**:

**Tone principles:**
- "Log" or "capture", not "report" or "submit"
- "How much time did you invest?" not "How many hours did you work?"
- "What did you explore?" not "What did you produce?"
- Celebrate logged time ("The team invested 12 person-days in AI exploration this month") rather than flagging gaps
- Frame initiative proposals as recognition: "Your exploration looks like it could become something — want to make it official?"

**AI coaching principles:**
- **Always give something back.** Every time someone logs time, the bot responds with encouragement, feedback, or a practical suggestion. The interaction is never extractive.
- **Normalize difficulty.** When someone is stuck or logged no time, acknowledge that innovation is hard. Don't guilt-trip — offer a small, concrete next step.
- **Build on context.** The LLM remembers what the person logged previously. Responses should reference past entries ("Last week you mentioned X — how did that go?") to show continuity and make the person feel heard.
- **Nudge toward formalization.** When the bot detects momentum (progress logged 2+ weeks, concrete outputs mentioned), it should gently suggest proposing a formal initiative.
- **Flag stalls without blaming.** If an initiative has had no activity for 2 weeks, the bot reaches out with curiosity ("Haven't heard from you on X in a bit — are you stuck, reprioritized, or done?") not judgment.
- **Keep it short.** LLM responses should be 2-3 sentences max. This is Slack, not an essay.

## Competitive landscape

### Closest competitors

| Tool | What it does | Slack-native? | Budget tracking? | Pricing |
|------|-------------|---------------|-----------------|---------|
| **Gryzzly** (gryzzly.io) | Conversational Slack bot for daily time logging per project, with budget alerts and profitability tracking | Yes — daily chat-based check-in | Yes — per-project budgets with overspend alerts | From ~4/user/month |
| **NikaTime** (nikatime.com) | Daily Slack check-in (~5pm) asking what you worked on, with AI insights and spending limits | Yes — daily check-in | Yes — per-project spending limits | $4.99/user/month |
| **Harvest** (getharvest.com) | Full time-tracking platform with Slack slash commands for timers and budget reports | Partial — Slack is a secondary interface | Yes — full project budget tracking | $10.80/user/month |

These are the most relevant tools. All are oriented toward **agencies/consultancies tracking billable client hours on a daily basis** — not internal R&D or experimentation budgets.

### Adjacent tools worth knowing

- **Geekbot / Standuply** — async standup bots with recurring Slack surveys. Could be repurposed for weekly check-ins, but have no time tracking or budget features.
- **IdeaKeep** — idea collection and voting in Slack. Handles the "surface ideas" part but has no time or budget layer.
- **Pariveda Initiative Tracker** — open-source Slack bot for tracking initiative status and participation. No time or budget features. Validates the concept but is bare-bones.
- **ZeroTime Bot (Replicon)** — natural language time entry in Slack via an enterprise HR platform. Powerful NLP but heavyweight and enterprise-priced.

### What no existing tool does

The Entyla POC sits in an unoccupied niche at the intersection of four things no competitor combines:

1. **Weekly cadence** — every tool found uses daily check-ins or real-time start/stop timers. Nobody does a weekly allocation model, which is more natural for exploratory work.
2. **Experiment-to-initiative pipeline** — no tool connects time tracking to a workflow where promising experiments get surfaced and promoted to formal initiatives with admin validation.
3. **AI experimentation framing** — time trackers track hours on projects; ML tools (MLflow, W&B) track model runs. Nothing bridges "how much time is the team spending on AI experiments" with "which are worth formalizing."
4. **Innovation budget dashboard** — Gryzzly/NikaTime track client-billable budgets. No tool provides a budget view framed around internal experimentation spend.
5. **LLM-powered coaching** — no timesheet tool responds with contextual feedback, encouragement, or practical suggestions. Every existing tool is extractive (collects data, gives nothing back). Entyla's bot actively helps keep experiments alive by coaching people through the hard parts of innovation.

### Competitive risk

The real risk is not a direct clone but companies cobbling together **Gryzzly** (time tracking) + **Geekbot** (weekly surveys) + **IdeaKeep** (idea voting) + a spreadsheet (budget). Entyla's value is unifying that into one coherent Slack-native flow with a single dashboard.

## What is explicitly out of scope for the POC

- Calendar or Jira integration (future: auto-detect time spent)
- Employee suggestion / resource matching
- Multi-currency or accounting-grade cost models
- Self-serve onboarding (the POC is white-glove)
- Per-initiative budget caps (all initiatives share the global experimentation budget for now)

## Path to full Entyla

| Phase | Scope |
|-------|-------|
| **POC** | AI experimentation budget, Slack timesheeting, initiative proposal flow, simple dashboard |
| **V1** | Any initiative type (not just AI), per-initiative budget caps, self-serve admin setup |
| **V2** | Jira/Monday/calendar integration for auto-detection, forecast models, full portfolio view |
| **V3** | Finance-facing assumptions layer, multi-portfolio comparison, API for BI tools |

## Success criteria for the POC

- [ ] At least one customer completes a 4-week pilot
- [ ] Weekly Slackbot response rate > 80%
- [ ] At least one stop/scale/rescope decision made during the pilot attributed to the visibility
- [ ] Customer expresses willingness to extend to more initiatives or to pay for a V1
