interface InitiativeBurn {
  initiativeId: number;
  initiativeName: string;
  personDaysConsumed: number;
  isDefaultBucket: boolean;
}

interface InitiativeBurnChartProps {
  burnByInitiative: InitiativeBurn[];
}

export function InitiativeBurnChart({ burnByInitiative }: InitiativeBurnChartProps) {
  const maxBurn = Math.max(...burnByInitiative.map((b) => b.personDaysConsumed), 1);

  return (
    <div className="rounded-lg bg-white/5 p-6">
      <h2 className="text-lg font-semibold">Burn by Initiative</h2>

      {burnByInitiative.length === 0 ? (
        <p className="mt-4 text-white/50">No time logged yet</p>
      ) : (
        <div className="mt-4 space-y-3">
          {burnByInitiative.map((burn) => (
            <div key={burn.initiativeId}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate pr-2">
                  {burn.initiativeName}
                  {burn.isDefaultBucket && (
                    <span className="ml-2 text-xs text-white/40">(exploration)</span>
                  )}
                </span>
                <span className="text-white/60">
                  {burn.personDaysConsumed.toFixed(1)} pd
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full transition-all ${burn.isDefaultBucket ? "bg-blue-500" : "bg-purple-500"}`}
                  style={{ width: `${(burn.personDaysConsumed / maxBurn) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-4 border-t border-white/10 pt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-white/60">Exploration</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          <span className="text-white/60">Structured initiatives</span>
        </div>
      </div>
    </div>
  );
}
