import type {
  CoachingSession,
  CoachingSessionCreateInput,
  CoachingMessage,
  CoachingMessageCreateInput,
  SessionStatus,
} from "../objects";

export interface SessionRepository {
  createSession(input: CoachingSessionCreateInput): Promise<CoachingSession>;
  findSessionById(sessionId: number): Promise<CoachingSession | null>;
  findActiveSessionByUser(
    userId: string,
    weekOf: Date,
  ): Promise<CoachingSession | null>;
  findRecentSessionsByUser(
    userId: string,
    weeksBack: number,
  ): Promise<CoachingSession[]>;
  updateSessionStatus(
    sessionId: number,
    status: SessionStatus,
  ): Promise<CoachingSession | null>;

  addMessage(input: CoachingMessageCreateInput): Promise<CoachingMessage>;
  findMessagesBySession(sessionId: number): Promise<CoachingMessage[]>;
  findRecentMessagesByUser(
    userId: string,
    weeksBack: number,
  ): Promise<CoachingMessage[]>;
}
