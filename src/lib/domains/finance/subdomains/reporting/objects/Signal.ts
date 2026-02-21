export type SignalType =
  | "stale_initiative"
  | "pending_proposal"
  | "budget_warning";

export interface Signal {
  type: SignalType;
  initiativeId?: number;
  message: string;
}
