import type { CoachingContext } from "../../objects";
import type { FeedbackRequest, FeedbackResult, InitiationResult } from "../objects";

export interface CoachRepository {
  generateInitiation(context: CoachingContext): Promise<InitiationResult>;
  generateFeedback(request: FeedbackRequest): Promise<FeedbackResult>;
}
