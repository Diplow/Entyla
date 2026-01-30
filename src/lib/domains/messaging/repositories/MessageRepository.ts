import type { Message, MessageCreateInput } from "../objects";

export interface MessageRepository {
  create(input: MessageCreateInput): Promise<Message>;
  findByConversationId(conversationId: number): Promise<Message[]>;
}
