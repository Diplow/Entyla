interface BudgetSummary {
  totalPersonDays: number;
  consumedPersonDays: number;
  remainingPersonDays: number;
  burnRate: number;
  forecastExhaustionDate: string | null;
}

interface BudgetOverviewProps {
  budgetSummary: BudgetSummary | null;
}

export function BudgetOverview({ budgetSummary }: BudgetOverviewProps) {
  if (!budgetSummary) {
    return (
      <div className="rounded-lg bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Budget Overview</h2>
        <p className="mt-4 text-white/50">No active budget configured</p>
      </div>
    );
  }

  const percentageConsumed =
    (budgetSummary.consumedPersonDays / budgetSummary.totalPersonDays) * 100;
  const isWarning = percentageConsumed >= 80;

  return (
    <div className="rounded-lg bg-white/5 p-6">
      <h2 className="text-lg font-semibold">Budget Overview</h2>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-white/60">Total</p>
          <p className="text-2xl font-bold">{budgetSummary.totalPersonDays}</p>
          <p className="text-xs text-white/40">person-days</p>
        </div>
        <div>
          <p className="text-sm text-white/60">Consumed</p>
          <p className="text-2xl font-bold">{budgetSummary.consumedPersonDays.toFixed(1)}</p>
          <p className="text-xs text-white/40">person-days</p>
        </div>
        <div>
          <p className="text-sm text-white/60">Remaining</p>
          <p className="text-2xl font-bold">{budgetSummary.remainingPersonDays.toFixed(1)}</p>
          <p className="text-xs text-white/40">person-days</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Budget utilization</span>
          <span className={isWarning ? "text-yellow-400" : "text-white"}>
            {percentageConsumed.toFixed(0)}%
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full transition-all ${isWarning ? "bg-yellow-500" : "bg-purple-500"}`}
            style={{ width: `${Math.min(percentageConsumed, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
        <div>
          <p className="text-sm text-white/60">Burn rate</p>
          <p className="text-lg font-semibold">
            {budgetSummary.burnRate.toFixed(1)} <span className="text-sm text-white/40">pd/week</span>
          </p>
        </div>
        <div>
          <p className="text-sm text-white/60">Forecast exhaustion</p>
          <p className="text-lg font-semibold">
            {budgetSummary.forecastExhaustionDate
              ? new Date(budgetSummary.forecastExhaustionDate).toLocaleDateString()
              : "On track"}
          </p>
        </div>
      </div>
    </div>
  );
}
