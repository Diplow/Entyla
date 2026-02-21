import { DrizzleSessionRepository } from "../repositories";
import {
  initiateSession,
  respondToReport,
  getSessionHistory,
  getRecentMessages,
} from "../actions";
import type { CoachingContext } from "../objects";
import type { UserReport } from "../llm";

const sessionRepository = new DrizzleSessionRepository();

export const CoachingService = {
  initiateSession: (
    userId: string,
    organizationId: number,
    weekOf: Date,
    context: CoachingContext,
  ) => initiateSession(sessionRepository, userId, organizationId, weekOf, context),

  respondToReport: (
    sessionId: number,
    report: UserReport,
    context: CoachingContext,
  ) => respondToReport(sessionRepository, sessionId, report, context),

  getSessionHistory: (userId: string, weeksBack: number) =>
    getSessionHistory(sessionRepository, userId, weeksBack),

  getRecentMessages: (userId: string, weeksBack: number) =>
    getRecentMessages(sessionRepository, userId, weeksBack),
};
