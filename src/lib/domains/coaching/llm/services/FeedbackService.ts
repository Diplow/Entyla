import { AnthropicCoachRepository } from "../repositories";
import { generateInitiation, generateFeedback } from "../actions";
import type { CoachingContext } from "../../objects";
import type { FeedbackRequest } from "../objects";

const coachRepository = new AnthropicCoachRepository();

export const FeedbackService = {
  generateInitiation: (context: CoachingContext) =>
    generateInitiation(coachRepository, context),

  generateFeedback: (request: FeedbackRequest) =>
    generateFeedback(coachRepository, request),
};
