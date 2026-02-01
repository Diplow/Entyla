export interface CreditBalance {
  id: number;
  userId: string;
  remainingCredits: number;
  monthlyAllowance: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface CreateBalanceInput {
  userId: string;
  remainingCredits: number;
  monthlyAllowance: number;
  periodStart: Date;
  periodEnd: Date;
}
