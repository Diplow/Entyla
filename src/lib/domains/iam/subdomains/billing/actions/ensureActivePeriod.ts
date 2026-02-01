import type { CreditRepository } from "../repositories";
import type { CreditBalance } from "../objects";

const DEFAULT_MONTHLY_ALLOWANCE = 10_000;

function _computePeriodBounds(): { periodStart: Date; periodEnd: Date } {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { periodStart, periodEnd };
}

export async function ensureActivePeriod(
  repository: CreditRepository,
  userId: string,
): Promise<CreditBalance> {
  const existingBalance = await repository.findActiveBalance(userId);
  if (existingBalance) {
    return existingBalance;
  }

  const { periodStart, periodEnd } = _computePeriodBounds();
  return repository.createBalance({
    userId,
    remainingCredits: DEFAULT_MONTHLY_ALLOWANCE,
    monthlyAllowance: DEFAULT_MONTHLY_ALLOWANCE,
    periodStart,
    periodEnd,
  });
}
