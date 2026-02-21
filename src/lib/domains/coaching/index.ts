import { CoachingService as _CoachingService } from "./services";
import { withLogging } from "~/lib/logging";

export const CoachingService = withLogging("CoachingService", _CoachingService);

export type {
  CoachingSessionId,
  SessionStatus,
  CoachingSession,
  CoachingSessionCreateInput,
  CoachingMessageId,
  CoachingMessageRole,
  CoachingMessage,
  CoachingMessageCreateInput,
  InitiativeSummary,
  TimeEntrySummary,
  CoachingContext,
} from "./objects";

export type {
  InitiateSessionResult,
  RespondToReportResult,
} from "./actions";

export type { UserReport, ReportEntry } from "./llm";
