export type InitiativeId = number;

export type InitiativeStatus =
  | "exploration"
  | "proposed"
  | "approved"
  | "paused"
  | "stopped";

export interface Initiative {
  id: InitiativeId;
  organizationId: number;
  name: string;
  description: string | null;
  status: InitiativeStatus;
  isDefaultBucket: boolean;
  proposedById: string | null;
  approvedById: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface InitiativeCreateInput {
  organizationId: number;
  name: string;
  description?: string | null;
  status: InitiativeStatus;
  isDefaultBucket?: boolean;
  proposedById?: string | null;
}

export interface InitiativeUpdateInput {
  name?: string;
  description?: string | null;
  status?: InitiativeStatus;
  approvedById?: string | null;
}
