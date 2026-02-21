import type { CoachRepository } from "../repositories";
import type { CoachingContext } from "../../objects";
import type { FeedbackRequest, FeedbackResult, InitiationResult } from "../objects";

export async function generateInitiation(
  repository: CoachRepository,
  context: CoachingContext,
): Promise<InitiationResult> {
  return repository.generateInitiation(context);
}

export async function generateFeedback(
  repository: CoachRepository,
  request: FeedbackRequest,
): Promise<FeedbackResult> {
  return repository.generateFeedback(request);
}
