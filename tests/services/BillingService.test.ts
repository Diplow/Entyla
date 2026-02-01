import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import {
  initializeTestDb,
  cleanTestDb,
  teardownTestDb,
} from "../helpers/setupTestDb";

// --- Mock ~/server/db before any domain code loads ---

const testDbPromise = initializeTestDb();

vi.mock("~/server/db", async () => {
  const { db } = await testDbPromise;
  const { creditBalance } = await import("~/server/db/schema");
  return { db, creditBalance };
});

// --- Import the service and utilities AFTER the mock is set up ---

const { BillingService } = await import(
  "~/lib/domains/iam/subdomains/billing/services/BillingService"
);
const { InsufficientCreditsError } = await import(
  "~/lib/domains/iam/subdomains/billing/actions/deductCredits"
);
const { tokensToCreditCost } = await import(
  "~/lib/domains/iam/subdomains/billing/utils/tokensToCreditCost"
);

// --- Constants ---

const USER_A = "user-billing-a";
const USER_B = "user-billing-b";

const SONNET_MODEL = "claude-sonnet-4-20250514";
const HAIKU_MODEL = "claude-haiku-3-5-20241022";
const UNKNOWN_MODEL = "some-unknown-model";

const DEFAULT_MONTHLY_ALLOWANCE = 10_000;

// --- Helpers ---

async function seedTestUsers() {
  const { db } = await testDbPromise;
  const { user } = await import("~/server/db/schema");

  await db.insert(user).values([
    {
      id: USER_A,
      name: "Billing User A",
      email: "billing-a@test.com",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: USER_B,
      name: "Billing User B",
      email: "billing-b@test.com",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

// --- Lifecycle ---

beforeEach(async () => {
  await cleanTestDb();
  await seedTestUsers();
});

afterAll(async () => {
  await teardownTestDb();
});

// --- Tests ---

describe("tokensToCreditCost", () => {
  it("returns 0 for zero tokens", () => {
    const cost = tokensToCreditCost(0, 0, SONNET_MODEL);
    expect(cost).toBe(0);
  });

  it("calculates correct cost for sonnet model", () => {
    // Sonnet: $3/M input, $15/M output
    // 1M input = $3 = 30,000 credits
    // 1M output = $15 = 150,000 credits
    const cost = tokensToCreditCost(1_000_000, 1_000_000, SONNET_MODEL);
    expect(cost).toBe(180_000);
  });

  it("calculates correct cost for haiku model", () => {
    // Haiku: $0.80/M input, $4/M output
    // 1M input = $0.80 = 8,000 credits
    // 1M output = $4 = 40,000 credits
    const cost = tokensToCreditCost(1_000_000, 1_000_000, HAIKU_MODEL);
    expect(cost).toBe(48_000);
  });

  it("uses default pricing for unknown models", () => {
    // Default = sonnet pricing: $3/M input, $15/M output
    const unknownCost = tokensToCreditCost(1_000_000, 1_000_000, UNKNOWN_MODEL);
    const sonnetCost = tokensToCreditCost(1_000_000, 1_000_000, SONNET_MODEL);
    expect(unknownCost).toBe(sonnetCost);
  });

  it("rounds up fractional costs to nearest integer", () => {
    // 1 input token with sonnet: ($3 / 1M) * 10,000 = 0.03 → ceil → 1
    const cost = tokensToCreditCost(1, 0, SONNET_MODEL);
    expect(cost).toBe(1);
  });
});

describe("BillingService.checkCredits", () => {
  it("returns hasCredits true with full allowance for new user", async () => {
    const result = await BillingService.checkCredits(USER_A);

    expect(result.hasCredits).toBe(true);
    expect(result.remainingCredits).toBe(DEFAULT_MONTHLY_ALLOWANCE);
  });

  it("creates a billing period on first call", async () => {
    const result = await BillingService.checkCredits(USER_A);

    expect(result.remainingCredits).toBe(DEFAULT_MONTHLY_ALLOWANCE);
  });

  it("returns same balance on repeated calls within same period", async () => {
    const firstCall = await BillingService.checkCredits(USER_A);
    const secondCall = await BillingService.checkCredits(USER_A);

    expect(firstCall.remainingCredits).toBe(secondCall.remainingCredits);
  });

  it("returns correct remaining credits after usage", async () => {
    // Use some credits first
    const { creditCost } = await BillingService.recordUsage(
      USER_A,
      100_000,
      0,
      HAIKU_MODEL,
    );

    const result = await BillingService.checkCredits(USER_A);

    expect(result.remainingCredits).toBe(DEFAULT_MONTHLY_ALLOWANCE - creditCost);
  });

  it("returns hasCredits false when credits are exhausted", async () => {
    // Sonnet: 1M output tokens = 150,000 credits, way more than 10,000 allowance
    // Use a small enough amount that fits, then exhaust the rest
    // 1M input + 1M output with sonnet = 180,000 credits > 10,000
    // We need to exhaust exactly. Let's use haiku with specific token counts.
    // Haiku: $0.80/M input → 8000 credits per 1M input tokens
    // 10,000 credits / 8000 per M = 1.25M tokens for exact exhaustion
    // Use 1,250,000 input tokens with haiku: cost = (1.25M / 1M) * 0.80 * 10000 = 10,000
    await BillingService.recordUsage(USER_A, 1_250_000, 0, HAIKU_MODEL);

    const result = await BillingService.checkCredits(USER_A);

    expect(result.hasCredits).toBe(false);
    expect(result.remainingCredits).toBe(0);
  });
});

describe("BillingService.recordUsage", () => {
  it("deducts credits and returns cost and remaining", async () => {
    const inputTokens = 100_000;
    const outputTokens = 0;
    const result = await BillingService.recordUsage(
      USER_A,
      inputTokens,
      outputTokens,
      SONNET_MODEL,
    );

    const expectedCost = tokensToCreditCost(inputTokens, outputTokens, SONNET_MODEL);
    expect(result.creditCost).toBe(expectedCost);
    expect(result.remainingCredits).toBe(DEFAULT_MONTHLY_ALLOWANCE - expectedCost);
  });

  it("calculates correct cost for sonnet model", async () => {
    const inputTokens = 50_000;
    const outputTokens = 10_000;
    const result = await BillingService.recordUsage(
      USER_A,
      inputTokens,
      outputTokens,
      SONNET_MODEL,
    );

    const expectedCost = tokensToCreditCost(inputTokens, outputTokens, SONNET_MODEL);
    expect(result.creditCost).toBe(expectedCost);
    expect(result.remainingCredits).toBe(DEFAULT_MONTHLY_ALLOWANCE - expectedCost);
  });

  it("calculates correct cost for haiku model", async () => {
    const inputTokens = 100_000;
    const outputTokens = 50_000;
    const result = await BillingService.recordUsage(
      USER_A,
      inputTokens,
      outputTokens,
      HAIKU_MODEL,
    );

    const expectedCost = tokensToCreditCost(inputTokens, outputTokens, HAIKU_MODEL);
    expect(result.creditCost).toBe(expectedCost);
    expect(result.remainingCredits).toBe(DEFAULT_MONTHLY_ALLOWANCE - expectedCost);
  });

  it("uses default pricing for unknown model", async () => {
    const inputTokens = 100_000;
    const outputTokens = 0;
    const result = await BillingService.recordUsage(
      USER_A,
      inputTokens,
      outputTokens,
      UNKNOWN_MODEL,
    );

    const expectedCost = tokensToCreditCost(inputTokens, outputTokens, SONNET_MODEL);
    expect(result.creditCost).toBe(expectedCost);
  });

  it("creates billing period if none exists before deducting", async () => {
    const inputTokens = 100_000;
    const outputTokens = 0;
    const result = await BillingService.recordUsage(
      USER_A,
      inputTokens,
      outputTokens,
      HAIKU_MODEL,
    );

    const expectedCost = tokensToCreditCost(inputTokens, outputTokens, HAIKU_MODEL);
    expect(result.creditCost).toBe(expectedCost);
    expect(result.remainingCredits).toBe(DEFAULT_MONTHLY_ALLOWANCE - expectedCost);
  });

  it("allows multiple sequential deductions", async () => {
    const inputTokens = 100_000;
    const outputTokens = 0;
    const expectedCost = tokensToCreditCost(inputTokens, outputTokens, HAIKU_MODEL);

    const firstResult = await BillingService.recordUsage(
      USER_A,
      inputTokens,
      outputTokens,
      HAIKU_MODEL,
    );
    expect(firstResult.creditCost).toBe(expectedCost);

    const secondResult = await BillingService.recordUsage(
      USER_A,
      inputTokens,
      outputTokens,
      HAIKU_MODEL,
    );
    expect(secondResult.creditCost).toBe(expectedCost);
    expect(secondResult.remainingCredits).toBe(
      DEFAULT_MONTHLY_ALLOWANCE - expectedCost - expectedCost,
    );
  });

  it("throws InsufficientCreditsError when credits run out", async () => {
    // Exhaust credits first: 1,250,000 input tokens with haiku = 10,000 credits
    await BillingService.recordUsage(USER_A, 1_250_000, 0, HAIKU_MODEL);

    // Next deduction should fail
    await expect(
      BillingService.recordUsage(USER_A, 1, 0, HAIKU_MODEL),
    ).rejects.toThrow(InsufficientCreditsError);
  });
});
