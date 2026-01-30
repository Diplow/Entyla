import { AnthropicCopywriterRepository } from "../repositories";
import { draftMessage } from "../actions";
import type { DraftRequest } from "../objects";

const copywriterRepository = new AnthropicCopywriterRepository();

export const DraftService = {
  generateDraft: (request: DraftRequest) =>
    draftMessage(copywriterRepository, request),
};
