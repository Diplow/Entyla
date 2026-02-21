interface Initiative {
  id: number;
  name: string;
  description: string | null;
  status: string;
  isDefaultBucket: boolean;
}

interface InitiativeListProps {
  initiatives: Initiative[];
}

function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case "active":
      return { label: "Active", className: "bg-green-500/20 text-green-300" };
    case "pending":
      return { label: "Pending", className: "bg-yellow-500/20 text-yellow-300" };
    case "paused":
      return { label: "Paused", className: "bg-gray-500/20 text-gray-300" };
    case "stopped":
      return { label: "Stopped", className: "bg-red-500/20 text-red-300" };
    case "rejected":
      return { label: "Rejected", className: "bg-red-500/20 text-red-300" };
    default:
      return { label: status, className: "bg-white/10 text-white/60" };
  }
}

export function InitiativeList({ initiatives }: InitiativeListProps) {
  const sortedInitiatives = [...initiatives].sort((a, b) => {
    if (a.isDefaultBucket) return -1;
    if (b.isDefaultBucket) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="rounded-lg bg-white/5 p-6">
      <h2 className="text-lg font-semibold">All Initiatives</h2>

      {sortedInitiatives.length === 0 ? (
        <p className="mt-4 text-white/50">No initiatives yet</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-sm text-white/60">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Description</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedInitiatives.map((initiative) => {
                const badge = getStatusBadge(initiative.status);
                return (
                  <tr
                    key={initiative.id}
                    className="border-b border-white/5 text-sm"
                  >
                    <td className="py-3 pr-4">
                      {initiative.name}
                      {initiative.isDefaultBucket && (
                        <span className="ml-2 text-xs text-white/40">(default)</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-white/60">
                      {initiative.description ?? "—"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
