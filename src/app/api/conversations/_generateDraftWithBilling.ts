import { IamService } from "~/lib/domains/iam";
import { DraftService } from "~/lib/domains/messaging";
import type { DraftRequest, DraftResult } from "~/lib/domains/messaging";

export async function generateDraftWithBilling(
  userId: string,
  conversationId: number,
  request: DraftRequest,
): Promise<DraftResult | null> {
  const { hasCredits } = await IamService.checkCredits(userId);
  if (!hasCredits) return null;

  const draftResult = await DraftService.generateAndPersist(conversationId, request);

  try {
    const { usage } = draftResult;
    await IamService.recordUsage(userId, usage.inputTokens, usage.outputTokens, usage.model);
  } catch (error) {
    console.error("Failed to record credit usage:", error);
  }

  return draftResult;
}
