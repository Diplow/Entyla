import type { CreditRepository } from "../repositories";
import { ensureActivePeriod } from "./ensureActivePeriod";

export async function checkCredits(
  repository: CreditRepository,
  userId: string,
): Promise<{ hasCredits: boolean; remainingCredits: number }> {
  const balance = await ensureActivePeriod(repository, userId);
  return {
    hasCredits: balance.remainingCredits > 0,
    remainingCredits: balance.remainingCredits,
  };
}
