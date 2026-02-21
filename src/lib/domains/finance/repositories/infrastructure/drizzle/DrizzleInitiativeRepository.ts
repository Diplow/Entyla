import { eq, and } from "drizzle-orm";

import { db, initiative } from "~/server/db";
import type { InitiativeRepository } from "../../InitiativeRepository";
import type {
  Initiative,
  InitiativeCreateInput,
  InitiativeUpdateInput,
  InitiativeStatus,
} from "../../../objects";

export class DrizzleInitiativeRepository implements InitiativeRepository {
  async create(input: InitiativeCreateInput): Promise<Initiative> {
    const [insertedInitiative] = await db
      .insert(initiative)
      .values({
        ...input,
        isDefaultBucket: input.isDefaultBucket ?? false,
      })
      .returning();

    return this.mapToInitiative(insertedInitiative!);
  }

  async findById(initiativeId: number): Promise<Initiative | null> {
    const foundInitiative = await db.query.initiative.findFirst({
      where: eq(initiative.id, initiativeId),
    });

    return foundInitiative ? this.mapToInitiative(foundInitiative) : null;
  }

  async findByIdAndOrganization(
    initiativeId: number,
    organizationId: number,
  ): Promise<Initiative | null> {
    const foundInitiative = await db.query.initiative.findFirst({
      where: and(
        eq(initiative.id, initiativeId),
        eq(initiative.organizationId, organizationId),
      ),
    });

    return foundInitiative ? this.mapToInitiative(foundInitiative) : null;
  }

  async findAllByOrganization(organizationId: number): Promise<Initiative[]> {
    const initiatives = await db.query.initiative.findMany({
      where: eq(initiative.organizationId, organizationId),
      orderBy: (initiative, { asc }) => [asc(initiative.createdAt)],
    });

    return initiatives.map(this.mapToInitiative);
  }

  async findPendingByOrganization(
    organizationId: number,
  ): Promise<Initiative[]> {
    const initiatives = await db.query.initiative.findMany({
      where: and(
        eq(initiative.organizationId, organizationId),
        eq(initiative.status, "proposed"),
      ),
      orderBy: (initiative, { asc }) => [asc(initiative.createdAt)],
    });

    return initiatives.map(this.mapToInitiative);
  }

  async findDefaultByOrganization(
    organizationId: number,
  ): Promise<Initiative | null> {
    const foundInitiative = await db.query.initiative.findFirst({
      where: and(
        eq(initiative.organizationId, organizationId),
        eq(initiative.isDefaultBucket, true),
      ),
    });

    return foundInitiative ? this.mapToInitiative(foundInitiative) : null;
  }

  async update(
    initiativeId: number,
    input: InitiativeUpdateInput,
  ): Promise<Initiative | null> {
    const [updatedInitiative] = await db
      .update(initiative)
      .set(input)
      .where(eq(initiative.id, initiativeId))
      .returning();

    return updatedInitiative ? this.mapToInitiative(updatedInitiative) : null;
  }

  private mapToInitiative(row: typeof initiative.$inferSelect): Initiative {
    return {
      ...row,
      status: row.status as InitiativeStatus,
    };
  }
}
