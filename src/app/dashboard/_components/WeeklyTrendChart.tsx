interface WeeklyTrendPoint {
  weekOf: string;
  explorationPersonDays: number;
  structuredPersonDays: number;
  totalPersonDays: number;
}

interface WeeklyTrendChartProps {
  weeklyTrend: WeeklyTrendPoint[];
}

export function WeeklyTrendChart({ weeklyTrend }: WeeklyTrendChartProps) {
  const maxTotal = Math.max(...weeklyTrend.map((w) => w.totalPersonDays), 1);

  function formatWeekLabel(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="rounded-lg bg-white/5 p-6">
      <h2 className="text-lg font-semibold">Weekly Trend</h2>
      <p className="text-sm text-white/60">
        Shift from exploration to structured initiatives
      </p>

      {weeklyTrend.length === 0 ? (
        <p className="mt-4 text-white/50">No weekly data available</p>
      ) : (
        <div className="mt-4 flex items-end gap-2" style={{ height: "150px" }}>
          {weeklyTrend.map((week, index) => {
            const explorationHeight = (week.explorationPersonDays / maxTotal) * 100;
            const structuredHeight = (week.structuredPersonDays / maxTotal) * 100;

            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="flex w-full flex-col justify-end"
                  style={{ height: "120px" }}
                >
                  <div
                    className="w-full bg-purple-500 transition-all"
                    style={{ height: `${structuredHeight}%` }}
                    title={`Structured: ${week.structuredPersonDays.toFixed(1)} pd`}
                  />
                  <div
                    className="w-full bg-blue-500 transition-all"
                    style={{ height: `${explorationHeight}%` }}
                    title={`Exploration: ${week.explorationPersonDays.toFixed(1)} pd`}
                  />
                </div>
                <span className="text-xs text-white/40">
                  {formatWeekLabel(week.weekOf)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex gap-4 border-t border-white/10 pt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-white/60">Exploration</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          <span className="text-white/60">Structured</span>
        </div>
      </div>
    </div>
  );
}
