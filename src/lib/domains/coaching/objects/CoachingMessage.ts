export type CoachingMessageId = number;

export type CoachingMessageRole = "coach" | "member";

export interface CoachingMessage {
  id: CoachingMessageId;
  sessionId: number;
  role: CoachingMessageRole;
  content: string;
  createdAt: Date;
}

export interface CoachingMessageCreateInput {
  sessionId: number;
  role: CoachingMessageRole;
  content: string;
}
