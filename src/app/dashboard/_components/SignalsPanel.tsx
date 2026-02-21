interface Signal {
  type: "pending_proposal" | "budget_warning" | "stale_initiative";
  initiativeId?: number;
  message: string;
}

interface SignalsPanelProps {
  signals: Signal[];
}

function getSignalIcon(type: Signal["type"]): string {
  switch (type) {
    case "pending_proposal":
      return "📋";
    case "budget_warning":
      return "⚠️";
    case "stale_initiative":
      return "💤";
    default:
      return "📌";
  }
}

function getSignalColor(type: Signal["type"]): string {
  switch (type) {
    case "pending_proposal":
      return "border-blue-500/50 bg-blue-500/10";
    case "budget_warning":
      return "border-yellow-500/50 bg-yellow-500/10";
    case "stale_initiative":
      return "border-orange-500/50 bg-orange-500/10";
    default:
      return "border-white/20 bg-white/5";
  }
}

export function SignalsPanel({ signals }: SignalsPanelProps) {
  return (
    <div className="rounded-lg bg-white/5 p-6">
      <h2 className="text-lg font-semibold">Signals</h2>

      {signals.length === 0 ? (
        <p className="mt-4 text-white/50">No signals requiring attention</p>
      ) : (
        <div className="mt-4 space-y-3">
          {signals.map((signal, index) => (
            <div
              key={index}
              className={`rounded-md border p-3 ${getSignalColor(signal.type)}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getSignalIcon(signal.type)}</span>
                <p className="text-sm">{signal.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
