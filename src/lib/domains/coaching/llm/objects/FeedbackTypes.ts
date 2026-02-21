import type { CoachingContext } from "../../objects";

export interface ReportEntry {
  initiativeName: string;
  personDays: number;
  note: string | null;
}

export interface UserReport {
  entries: ReportEntry[];
  freeformNote: string | null;
}

export interface FeedbackRequest {
  context: CoachingContext;
  userReport: UserReport;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface FeedbackResult {
  content: string;
  suggestFormalization: boolean;
  flaggedStall: boolean;
  usage: TokenUsage;
}

export interface InitiationResult {
  content: string;
  usage: TokenUsage;
}
