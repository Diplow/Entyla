import type { MessageRepository } from "../repositories";
import type { MessageCreateInput } from "../objects";

export async function addMessage(
  repository: MessageRepository,
  input: MessageCreateInput,
) {
  return repository.create(input);
}

export async function getConversationMessages(
  repository: MessageRepository,
  conversationId: number,
) {
  return repository.findByConversationId(conversationId);
}
