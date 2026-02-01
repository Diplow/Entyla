import type { CreditRepository } from "../repositories";
import { tokensToCreditCost } from "../utils";
import { ensureActivePeriod } from "./ensureActivePeriod";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient credits");
    this.name = "InsufficientCreditsError";
  }
}

export async function deductCredits(
  repository: CreditRepository,
  userId: string,
  inputTokens: number,
  outputTokens: number,
  model: string,
): Promise<{ creditCost: number; remainingCredits: number }> {
  const balance = await ensureActivePeriod(repository, userId);
  const creditCost = tokensToCreditCost(inputTokens, outputTokens, model);
  const result = await repository.tryDeductCredits(balance.id, creditCost);

  if (!result.deducted) {
    throw new InsufficientCreditsError();
  }

  return { creditCost, remainingCredits: result.remainingCredits };
}
