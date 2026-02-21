import type { CoachingMessage } from "./CoachingMessage";

export interface InitiativeSummary {
  id: number;
  name: string;
  description: string | null;
  status: string;
  isDefaultBucket: boolean;
}

export interface TimeEntrySummary {
  initiativeId: number;
  initiativeName: string;
  personDays: number;
  weekOf: Date;
  note: string | null;
}

export interface CoachingContext {
  userName: string;
  initiatives: InitiativeSummary[];
  recentTimeEntries: TimeEntrySummary[];
  currentWeekEntries: TimeEntrySummary[];
  previousMessages: CoachingMessage[];
}
