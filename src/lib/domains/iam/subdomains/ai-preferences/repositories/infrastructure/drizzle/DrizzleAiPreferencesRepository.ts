import { sql } from "drizzle-orm";
import { db, aiPreferences } from "~/server/db";
import type { AiPreferencesRepository } from "../../AiPreferencesRepository";
import type { AiPreferences as AiPreferencesType, AiPreferencesInput } from "../../../objects";

function parseExampleMessages(jsonString: string | null): string[] {
  if (!jsonString) {
    return [];
  }
  try {
    const parsed = JSON.parse(jsonString) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

function toAiPreferences(row: typeof aiPreferences.$inferSelect): AiPreferencesType {
  return {
    userId: row.userId,
    companyKnowledge: row.companyKnowledge,
    toneOfVoice: row.toneOfVoice,
    exampleMessages: parseExampleMessages(row.exampleMessages),
    onboardingCompleted: row.onboardingCompleted === 1,
  };
}

export class DrizzleAiPreferencesRepository implements AiPreferencesRepository {
  async findByUserId(userId: string): Promise<AiPreferencesType | null> {
    const rows = await db
      .select()
      .from(aiPreferences)
      .where(sql`${aiPreferences.userId} = ${userId}`)
      .limit(1);

    return rows[0] ? toAiPreferences(rows[0]) : null;
  }

  async upsert(userId: string, input: AiPreferencesInput): Promise<AiPreferencesType> {
    const exampleMessagesJson = input.exampleMessages
      ? JSON.stringify(input.exampleMessages)
      : undefined;

    const rows = await db
      .insert(aiPreferences)
      .values({
        userId,
        companyKnowledge: input.companyKnowledge ?? null,
        toneOfVoice: input.toneOfVoice ?? null,
        exampleMessages: exampleMessagesJson ?? null,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: aiPreferences.userId,
        set: {
          ...(input.companyKnowledge !== undefined && { companyKnowledge: input.companyKnowledge }),
          ...(input.toneOfVoice !== undefined && { toneOfVoice: input.toneOfVoice }),
          ...(exampleMessagesJson !== undefined && { exampleMessages: exampleMessagesJson }),
        },
      })
      .returning();

    return toAiPreferences(rows[0]!);
  }

  async markOnboardingCompleted(userId: string): Promise<void> {
    await db
      .insert(aiPreferences)
      .values({
        userId,
        onboardingCompleted: 1,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: aiPreferences.userId,
        set: {
          onboardingCompleted: 1,
        },
      });
  }
}
