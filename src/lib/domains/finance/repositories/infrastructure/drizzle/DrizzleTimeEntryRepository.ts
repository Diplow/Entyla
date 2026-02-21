import { eq, and, gte, lte, sum } from "drizzle-orm";

import { db, timeEntry, initiative } from "~/server/db";
import type { TimeEntryRepository } from "../../TimeEntryRepository";
import type { TimeEntry, TimeEntryCreateInput } from "../../../objects";

export class DrizzleTimeEntryRepository implements TimeEntryRepository {
  async create(input: TimeEntryCreateInput): Promise<TimeEntry> {
    const [insertedEntry] = await db
      .insert(timeEntry)
      .values(input)
      .returning();

    return insertedEntry!;
  }

  async findByUserAndWeek(
    userId: string,
    initiativeId: number,
    weekOf: Date,
  ): Promise<TimeEntry | null> {
    const foundEntry = await db.query.timeEntry.findFirst({
      where: and(
        eq(timeEntry.userId, userId),
        eq(timeEntry.initiativeId, initiativeId),
        eq(timeEntry.weekOf, weekOf),
      ),
    });

    return foundEntry ?? null;
  }

  async findAllByInitiative(initiativeId: number): Promise<TimeEntry[]> {
    const entries = await db.query.timeEntry.findMany({
      where: eq(timeEntry.initiativeId, initiativeId),
      orderBy: (entry, { desc }) => [desc(entry.weekOf)],
    });

    return entries;
  }

  async findAllByOrganizationAndPeriod(
    organizationId: number,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<TimeEntry[]> {
    const entries = await db
      .select({
        id: timeEntry.id,
        userId: timeEntry.userId,
        initiativeId: timeEntry.initiativeId,
        personDays: timeEntry.personDays,
        weekOf: timeEntry.weekOf,
        note: timeEntry.note,
        createdAt: timeEntry.createdAt,
      })
      .from(timeEntry)
      .innerJoin(initiative, eq(timeEntry.initiativeId, initiative.id))
      .where(
        and(
          eq(initiative.organizationId, organizationId),
          gte(timeEntry.weekOf, periodStart),
          lte(timeEntry.weekOf, periodEnd),
        ),
      );

    return entries;
  }

  async sumByInitiativeAndPeriod(
    initiativeId: number,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number> {
    const result = await db
      .select({ total: sum(timeEntry.personDays) })
      .from(timeEntry)
      .where(
        and(
          eq(timeEntry.initiativeId, initiativeId),
          gte(timeEntry.weekOf, periodStart),
          lte(timeEntry.weekOf, periodEnd),
        ),
      );

    return Number(result[0]?.total ?? 0);
  }

  async sumByOrganizationAndPeriod(
    organizationId: number,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number> {
    const result = await db
      .select({ total: sum(timeEntry.personDays) })
      .from(timeEntry)
      .innerJoin(initiative, eq(timeEntry.initiativeId, initiative.id))
      .where(
        and(
          eq(initiative.organizationId, organizationId),
          gte(timeEntry.weekOf, periodStart),
          lte(timeEntry.weekOf, periodEnd),
        ),
      );

    return Number(result[0]?.total ?? 0);
  }

  async findRecentByUser(
    userId: string,
    weeksBack: number,
  ): Promise<TimeEntry[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - weeksBack * 7);

    const entries = await db.query.timeEntry.findMany({
      where: and(
        eq(timeEntry.userId, userId),
        gte(timeEntry.weekOf, cutoffDate),
      ),
      orderBy: (entry, { desc }) => [desc(entry.weekOf)],
    });

    return entries;
  }
}
