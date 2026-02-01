const MICROCENTS_PER_DOLLAR = 10_000;

const MODEL_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  "claude-sonnet-4-20250514": { inputPerMillion: 3, outputPerMillion: 15 },
  "claude-haiku-3-5-20241022": { inputPerMillion: 0.80, outputPerMillion: 4 },
};

const DEFAULT_PRICING = { inputPerMillion: 3, outputPerMillion: 15 };

export function tokensToCreditCost(
  inputTokens: number,
  outputTokens: number,
  model: string,
): number {
  const pricing = MODEL_PRICING[model] ?? DEFAULT_PRICING;

  const inputCostDollars = (inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCostDollars = (outputTokens / 1_000_000) * pricing.outputPerMillion;
  const totalDollars = inputCostDollars + outputCostDollars;

  return Math.ceil(totalDollars * MICROCENTS_PER_DOLLAR);
}
