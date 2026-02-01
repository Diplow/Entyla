import { and, lte, gte, sql } from "drizzle-orm";
import { db, creditBalance } from "~/server/db";
import type { CreditRepository } from "../../CreditRepository";
import type { CreditBalance, CreateBalanceInput } from "../../../objects";

export class DrizzleCreditRepository implements CreditRepository {
  async findActiveBalance(userId: string): Promise<CreditBalance | null> {
    const now = new Date();
    const rows = await db
      .select()
      .from(creditBalance)
      .where(
        and(
          sql`${creditBalance.userId} = ${userId}`,
          lte(creditBalance.periodStart, now),
          gte(creditBalance.periodEnd, now),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  async createBalance(input: CreateBalanceInput): Promise<CreditBalance> {
    const rows = await db
      .insert(creditBalance)
      .values({
        userId: input.userId,
        remainingCredits: input.remainingCredits,
        monthlyAllowance: input.monthlyAllowance,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      })
      .onConflictDoNothing({
        target: [creditBalance.userId, creditBalance.periodStart, creditBalance.periodEnd],
      })
      .returning();

    if (rows[0]) {
      return rows[0];
    }

    const existingRows = await db
      .select()
      .from(creditBalance)
      .where(
        and(
          sql`${creditBalance.userId} = ${input.userId}`,
          sql`${creditBalance.periodStart} = ${input.periodStart}`,
          sql`${creditBalance.periodEnd} = ${input.periodEnd}`,
        ),
      )
      .limit(1);

    return existingRows[0]!;
  }

  async tryDeductCredits(
    balanceId: number,
    cost: number,
  ): Promise<{ deducted: true; remainingCredits: number } | { deducted: false }> {
    const rows = await db
      .update(creditBalance)
      .set({
        remainingCredits: sql`${creditBalance.remainingCredits} - ${cost}`,
      })
      .where(
        and(
          sql`${creditBalance.id} = ${balanceId}`,
          gte(creditBalance.remainingCredits, cost),
        ),
      )
      .returning({ remainingCredits: creditBalance.remainingCredits });

    if (rows.length === 0) {
      return { deducted: false };
    }

    return { deducted: true, remainingCredits: rows[0]!.remainingCredits };
  }
}
