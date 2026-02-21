import type { SessionRepository } from "../repositories";
import type { CoachingSession, CoachingContext, CoachingMessage } from "../objects";
import type { UserReport } from "../llm";
import { FeedbackService } from "../llm";

export interface InitiateSessionResult {
  session: CoachingSession;
  initiationMessage: string;
}

export interface RespondToReportResult {
  feedbackMessage: string;
  suggestFormalization: boolean;
}

export async function initiateSession(
  repository: SessionRepository,
  userId: string,
  organizationId: number,
  weekOf: Date,
  context: CoachingContext,
): Promise<InitiateSessionResult> {
  // Idempotent: return existing session if already initiated this week
  const existingSession = await repository.findActiveSessionByUser(userId, weekOf);
  if (existingSession) {
    const messages = await repository.findMessagesBySession(existingSession.id);
    const initiationMsg = messages.find((m) => m.role === "coach");
    return {
      session: existingSession,
      initiationMessage: initiationMsg?.content ?? "",
    };
  }

  const session = await repository.createSession({
    userId,
    organizationId,
    weekOf,
  });

  // Generate LLM-powered initiation message
  const initiationResult = await FeedbackService.generateInitiation(context);

  await repository.addMessage({
    sessionId: session.id,
    role: "coach",
    content: initiationResult.content,
  });

  return {
    session,
    initiationMessage: initiationResult.content,
  };
}

export async function respondToReport(
  repository: SessionRepository,
  sessionId: number,
  report: UserReport,
  context: CoachingContext,
): Promise<RespondToReportResult> {
  const session = await repository.findSessionById(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  // Persist the user's report as a member message
  const reportSummary = formatReportAsMessage(report);
  await repository.addMessage({
    sessionId,
    role: "member",
    content: reportSummary,
  });

  // Update session status to active
  await repository.updateSessionStatus(sessionId, "active");

  // Generate coaching feedback
  const feedbackResult = await FeedbackService.generateFeedback({
    context,
    userReport: report,
  });

  // Persist the coaching response
  await repository.addMessage({
    sessionId,
    role: "coach",
    content: feedbackResult.content,
  });

  // Mark session as completed after feedback
  await repository.updateSessionStatus(sessionId, "completed");

  return {
    feedbackMessage: feedbackResult.content,
    suggestFormalization: feedbackResult.suggestFormalization,
  };
}

export async function getSessionHistory(
  repository: SessionRepository,
  userId: string,
  weeksBack: number,
): Promise<CoachingSession[]> {
  return repository.findRecentSessionsByUser(userId, weeksBack);
}

export async function getRecentMessages(
  repository: SessionRepository,
  userId: string,
  weeksBack: number,
): Promise<CoachingMessage[]> {
  return repository.findRecentMessagesByUser(userId, weeksBack);
}

function formatReportAsMessage(report: UserReport): string {
  const lines = report.entries.map((entry) => {
    const note = entry.note ? ` - ${entry.note}` : "";
    return `${entry.initiativeName}: ${entry.personDays} day(s)${note}`;
  });
  if (report.freeformNote) {
    lines.push(`Note: ${report.freeformNote}`);
  }
  return lines.join("\n");
}
