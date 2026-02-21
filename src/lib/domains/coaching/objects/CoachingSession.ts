export type CoachingSessionId = number;

export type SessionStatus = "initiated" | "active" | "completed";

export interface CoachingSession {
  id: CoachingSessionId;
  userId: string;
  organizationId: number;
  weekOf: Date;
  status: SessionStatus;
  createdAt: Date;
  completedAt: Date | null;
}

export interface CoachingSessionCreateInput {
  userId: string;
  organizationId: number;
  weekOf: Date;
}
