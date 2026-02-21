import { eq, and, gte } from "drizzle-orm";

import { db, coachingSession, coachingMessage } from "~/server/db";
import type { SessionRepository } from "../../SessionRepository";
import type {
  CoachingSession,
  CoachingSessionCreateInput,
  CoachingMessage,
  CoachingMessageCreateInput,
  SessionStatus,
  CoachingMessageRole,
} from "../../../objects";

export class DrizzleSessionRepository implements SessionRepository {
  async createSession(
    input: CoachingSessionCreateInput,
  ): Promise<CoachingSession> {
    const [insertedSession] = await db
      .insert(coachingSession)
      .values({
        ...input,
        status: "initiated",
      })
      .returning();

    return this.mapSession(insertedSession!);
  }

  async findSessionById(sessionId: number): Promise<CoachingSession | null> {
    const foundSession = await db.query.coachingSession.findFirst({
      where: eq(coachingSession.id, sessionId),
    });

    return foundSession ? this.mapSession(foundSession) : null;
  }

  async findActiveSessionByUser(
    userId: string,
    weekOf: Date,
  ): Promise<CoachingSession | null> {
    const foundSession = await db.query.coachingSession.findFirst({
      where: and(
        eq(coachingSession.userId, userId),
        eq(coachingSession.weekOf, weekOf),
      ),
    });

    return foundSession ? this.mapSession(foundSession) : null;
  }

  async findRecentSessionsByUser(
    userId: string,
    weeksBack: number,
  ): Promise<CoachingSession[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - weeksBack * 7);

    const sessions = await db.query.coachingSession.findMany({
      where: and(
        eq(coachingSession.userId, userId),
        gte(coachingSession.weekOf, cutoffDate),
      ),
      orderBy: (session, { desc }) => [desc(session.weekOf)],
    });

    return sessions.map((session) => this.mapSession(session));
  }

  async updateSessionStatus(
    sessionId: number,
    status: SessionStatus,
  ): Promise<CoachingSession | null> {
    const completedAt = status === "completed" ? new Date() : null;

    const [updatedSession] = await db
      .update(coachingSession)
      .set({ status, completedAt })
      .where(eq(coachingSession.id, sessionId))
      .returning();

    return updatedSession ? this.mapSession(updatedSession) : null;
  }

  async addMessage(
    input: CoachingMessageCreateInput,
  ): Promise<CoachingMessage> {
    const [insertedMessage] = await db
      .insert(coachingMessage)
      .values(input)
      .returning();

    return this.mapMessage(insertedMessage!);
  }

  async findMessagesBySession(sessionId: number): Promise<CoachingMessage[]> {
    const messages = await db.query.coachingMessage.findMany({
      where: eq(coachingMessage.sessionId, sessionId),
      orderBy: (message, { asc }) => [asc(message.createdAt)],
    });

    return messages.map((message) => this.mapMessage(message));
  }

  async findRecentMessagesByUser(
    userId: string,
    weeksBack: number,
  ): Promise<CoachingMessage[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - weeksBack * 7);

    const sessions = await db.query.coachingSession.findMany({
      where: and(
        eq(coachingSession.userId, userId),
        gte(coachingSession.weekOf, cutoffDate),
      ),
      with: {
        messages: true,
      },
      orderBy: (session, { desc }) => [desc(session.weekOf)],
    });

    const allMessages: CoachingMessage[] = [];
    for (const session of sessions) {
      for (const message of session.messages) {
        allMessages.push(this.mapMessage(message));
      }
    }

    return allMessages;
  }

  private mapSession(row: typeof coachingSession.$inferSelect): CoachingSession {
    return {
      id: row.id,
      userId: row.userId,
      organizationId: row.organizationId,
      weekOf: row.weekOf,
      status: row.status as SessionStatus,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
    };
  }

  private mapMessage(row: typeof coachingMessage.$inferSelect): CoachingMessage {
    return {
      id: row.id,
      sessionId: row.sessionId,
      role: row.role as CoachingMessageRole,
      content: row.content,
      createdAt: row.createdAt,
    };
  }
}
