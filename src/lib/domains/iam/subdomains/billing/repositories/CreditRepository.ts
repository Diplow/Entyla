import type { CreditBalance, CreateBalanceInput } from "../objects";

export interface CreditRepository {
  findActiveBalance(userId: string): Promise<CreditBalance | null>;
  createBalance(input: CreateBalanceInput): Promise<CreditBalance>;
  tryDeductCredits(
    balanceId: number,
    cost: number,
  ): Promise<{ deducted: true; remainingCredits: number } | { deducted: false }>;
}
