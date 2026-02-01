import { DrizzleCreditRepository } from "../repositories";
import { checkCredits, deductCredits } from "../actions";

const creditRepository = new DrizzleCreditRepository();

export const BillingService = {
  checkCredits: (userId: string) =>
    checkCredits(creditRepository, userId),

  recordUsage: (userId: string, inputTokens: number, outputTokens: number, model: string) =>
    deductCredits(creditRepository, userId, inputTokens, outputTokens, model),
};
