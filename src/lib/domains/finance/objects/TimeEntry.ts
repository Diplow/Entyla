export type TimeEntryId = number;

export interface TimeEntry {
  id: TimeEntryId;
  userId: string;
  initiativeId: number;
  personDays: number;
  weekOf: Date;
  note: string | null;
  createdAt: Date;
}

export interface TimeEntryCreateInput {
  userId: string;
  initiativeId: number;
  personDays: number;
  weekOf: Date;
  note?: string | null;
}
