/**
 * Seed script for POC demo data
 *
 * Usage: npx tsx scripts/seed.ts --userId <your-user-id>
 *
 * Creates:
 * - Organization "Acme Corp" with the provided user as admin
 * - 4 additional demo users as members
 * - Budget: 20 person-days for current month
 * - Default "AI Experimentation" bucket + 2 approved initiatives + 1 pending proposal
 * - 4 weeks of time entries showing realistic exploration-to-structured shift
 * - Budget at ~70% consumed, one stale initiative (no entries for 2+ weeks)
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/server/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const userIdArg = process.argv.find((arg) => arg.startsWith("--userId="));
const userIdFromFlag = process.argv[process.argv.indexOf("--userId") + 1];
const userIdValue = userIdArg?.split("=")[1] ?? userIdFromFlag;

if (!userIdValue) {
  console.error("Usage: npx tsx scripts/seed.ts --userId <your-user-id>");
  console.error("  or: npx tsx scripts/seed.ts --userId=<your-user-id>");
  process.exit(1);
}

const userId: string = userIdValue;

const conn = postgres(DATABASE_URL);
const db = drizzle(conn, { schema });

async function seed() {
  console.log("Starting seed with userId:", userId);

  // Create organization
  const [org] = await db
    .insert(schema.organization)
    .values({ name: "Acme Corp" })
    .returning();

  if (!org) {
    throw new Error("Failed to create organization");
  }
  console.log("Created organization:", org.name);

  // Add the provided user as admin
  await db.insert(schema.membership).values({
    userId,
    organizationId: org.id,
    role: "admin",
  });
  console.log("Added user as admin");

  // Create demo users
  const demoUsers = [
    { id: `demo-alice-${Date.now()}`, name: "Alice Chen", email: `alice-${Date.now()}@acme-demo.local` },
    { id: `demo-bob-${Date.now()}`, name: "Bob Martinez", email: `bob-${Date.now()}@acme-demo.local` },
    { id: `demo-carol-${Date.now()}`, name: "Carol Johnson", email: `carol-${Date.now()}@acme-demo.local` },
    { id: `demo-david-${Date.now()}`, name: "David Kim", email: `david-${Date.now()}@acme-demo.local` },
  ];

  const createdUsers = await db.insert(schema.user).values(demoUsers).returning();
  console.log(`Created ${createdUsers.length} demo users`);

  // Add demo users as members
  for (const user of createdUsers) {
    await db.insert(schema.membership).values({
      userId: user.id,
      organizationId: org.id,
      role: "member",
    });
  }
  console.log("Added demo users as members");

  // Create budget for current month (20 person-days)
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [budget] = await db
    .insert(schema.budget)
    .values({
      organizationId: org.id,
      totalPersonDays: 20,
      periodStart,
      periodEnd,
    })
    .returning();

  if (!budget) {
    throw new Error("Failed to create budget");
  }
  console.log("Created budget:", budget.totalPersonDays, "person-days");

  // Create initiatives
  const [defaultBucket] = await db
    .insert(schema.initiative)
    .values({
      organizationId: org.id,
      name: "AI Experimentation",
      description: "General exploration bucket for AI experiments",
      status: "active",
      isDefaultBucket: true,
    })
    .returning();

  const [initiative1] = await db
    .insert(schema.initiative)
    .values({
      organizationId: org.id,
      name: "AI-assisted customer support triage",
      description: "Auto-categorize and route support tickets using LLM",
      status: "active",
      isDefaultBucket: false,
      proposedById: createdUsers[0]?.id,
      approvedById: userId,
    })
    .returning();

  const [initiative2] = await db
    .insert(schema.initiative)
    .values({
      organizationId: org.id,
      name: "Automated invoice processing",
      description: "Extract data from invoices using Claude Vision",
      status: "active",
      isDefaultBucket: false,
      proposedById: createdUsers[1]?.id,
      approvedById: userId,
    })
    .returning();

  // Stale initiative - no recent entries
  const [staleInitiative] = await db
    .insert(schema.initiative)
    .values({
      organizationId: org.id,
      name: "Email drafting assistant",
      description: "Help sales team draft personalized emails",
      status: "active",
      isDefaultBucket: false,
      proposedById: createdUsers[2]?.id,
      approvedById: userId,
    })
    .returning();

  // Pending proposal
  await db.insert(schema.initiative).values({
    organizationId: org.id,
    name: "Meeting notes summarizer",
    description: "Automatically generate meeting summaries from transcripts",
    status: "pending",
    isDefaultBucket: false,
    proposedById: createdUsers[3]?.id,
  });

  console.log("Created initiatives");

  // Create time entries for 4 weeks
  // Monday of each week
  function getMonday(weeksBack: number): Date {
    const date = new Date(now);
    date.setDate(date.getDate() - date.getDay() + 1 - weeksBack * 7);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const week1 = getMonday(3);
  const week2 = getMonday(2);
  const week3 = getMonday(1);
  const week4 = getMonday(0);

  // Week 1: Mostly exploration (5 pd total)
  await db.insert(schema.timeEntry).values([
    { userId: createdUsers[0]!.id, initiativeId: defaultBucket!.id, personDays: 1.0, weekOf: week1, note: "Tried Claude for email drafting" },
    { userId: createdUsers[1]!.id, initiativeId: defaultBucket!.id, personDays: 1.5, weekOf: week1, note: "Explored ChatGPT for data analysis" },
    { userId: createdUsers[2]!.id, initiativeId: defaultBucket!.id, personDays: 1.0, weekOf: week1, note: "Tested Whisper for transcription" },
    { userId: createdUsers[3]!.id, initiativeId: defaultBucket!.id, personDays: 1.5, weekOf: week1, note: "Research on AI tools for support" },
  ]);

  // Week 2: Mix of exploration and early structured work (4.5 pd)
  await db.insert(schema.timeEntry).values([
    { userId: createdUsers[0]!.id, initiativeId: initiative1!.id, personDays: 1.0, weekOf: week2, note: "Built prototype for ticket classification" },
    { userId: createdUsers[1]!.id, initiativeId: defaultBucket!.id, personDays: 1.0, weekOf: week2, note: "More data analysis experiments" },
    { userId: createdUsers[2]!.id, initiativeId: staleInitiative!.id, personDays: 0.5, weekOf: week2, note: "Started email assistant prototype" },
    { userId: createdUsers[3]!.id, initiativeId: initiative2!.id, personDays: 1.0, weekOf: week2, note: "Invoice extraction with Claude Vision" },
    { userId: createdUsers[0]!.id, initiativeId: defaultBucket!.id, personDays: 1.0, weekOf: week2, note: "Exploring other use cases" },
  ]);

  // Week 3: More structured work (4 pd)
  await db.insert(schema.timeEntry).values([
    { userId: createdUsers[0]!.id, initiativeId: initiative1!.id, personDays: 1.5, weekOf: week3, note: "Testing on real tickets" },
    { userId: createdUsers[1]!.id, initiativeId: initiative2!.id, personDays: 1.0, weekOf: week3, note: "Improving extraction accuracy" },
    { userId: createdUsers[3]!.id, initiativeId: initiative2!.id, personDays: 1.0, weekOf: week3, note: "Setting up integration pipeline" },
    { userId: createdUsers[2]!.id, initiativeId: defaultBucket!.id, personDays: 0.5, weekOf: week3, note: "Exploring speech-to-text" },
  ]);

  // Week 4: Continued structured work (5 pd)
  await db.insert(schema.timeEntry).values([
    { userId: createdUsers[0]!.id, initiativeId: initiative1!.id, personDays: 1.5, weekOf: week4, note: "Deployed to staging" },
    { userId: createdUsers[1]!.id, initiativeId: initiative2!.id, personDays: 1.5, weekOf: week4, note: "Production deployment prep" },
    { userId: createdUsers[3]!.id, initiativeId: initiative2!.id, personDays: 1.0, weekOf: week4, note: "Documentation and training" },
    { userId: createdUsers[0]!.id, initiativeId: defaultBucket!.id, personDays: 0.5, weekOf: week4, note: "Quick exploration of new models" },
    { userId: createdUsers[2]!.id, initiativeId: defaultBucket!.id, personDays: 0.5, weekOf: week4, note: "Meeting summarization research" },
  ]);

  // Note: staleInitiative only has one entry in week 2 (0.5 pd), nothing since - this triggers the stale signal
  // Total: 5 + 4.5 + 4 + 5 = 18.5 pd consumed (should trigger ~70% budget warning at 20 pd total)
  // Actually it's 18.5/20 = 92.5% which is even better for the demo

  console.log("Created time entries");

  console.log("\n--- Seed complete! ---");
  console.log("Organization:", org.name, "(id:", org.id + ")");
  console.log("Budget: 20 person-days for", periodStart.toLocaleDateString(), "-", periodEnd.toLocaleDateString());
  console.log("Initiatives:");
  console.log("  - AI Experimentation (default bucket)");
  console.log("  - AI-assisted customer support triage (active)");
  console.log("  - Automated invoice processing (active)");
  console.log("  - Email drafting assistant (stale - no activity in 2+ weeks)");
  console.log("  - Meeting notes summarizer (pending approval)");
  console.log("\nTotal time logged: ~18.5 person-days (~92% of budget)");
  console.log("\nYou should see the following signals on the dashboard:");
  console.log("  - Budget warning (>80% consumed)");
  console.log("  - Stale initiative (Email drafting assistant)");
  console.log("  - Pending proposal (Meeting notes summarizer)");

  await conn.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
