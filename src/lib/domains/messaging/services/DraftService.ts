import { DrizzleMessageRepository } from "../repositories";
import { addMessage } from "../actions";
import { DraftService as CopywritingDraftService } from "../copywriting";
import type { DraftRequest } from "../copywriting";

const messageRepository = new DrizzleMessageRepository();

export const DraftService = {
  generateAndPersist: async (conversationId: number, request: DraftRequest) => {
    const draftResult = await CopywritingDraftService.generateDraft(request);
    await addMessage(messageRepository, {
      conversationId,
      role: "prospect",
      content: draftResult.content,
    });
    return draftResult;
  },
};
