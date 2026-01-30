import type { ConversationRepository } from "../repositories";
import type { ConversationCreateInput } from "../objects";

export async function createConversation(
  repository: ConversationRepository,
  ownerId: string,
  input: ConversationCreateInput,
) {
  return repository.create(ownerId, input);
}

export async function getConversation(
  repository: ConversationRepository,
  conversationId: number,
  ownerId: string,
) {
  return repository.findByIdAndOwner(conversationId, ownerId);
}

export async function listConversations(
  repository: ConversationRepository,
  ownerId: string,
) {
  return repository.findAllByOwner(ownerId);
}
