import { eq } from "drizzle-orm";
import { db, message } from "~/server/db";
import type { MessageRepository } from "../../MessageRepository";
import type { Message, MessageCreateInput } from "../../../objects";

export class DrizzleMessageRepository implements MessageRepository {
  async create(input: MessageCreateInput): Promise<Message> {
    const [insertedMessage] = await db
      .insert(message)
      .values(input)
      .returning();
    return insertedMessage! as Message;
  }

  async findByConversationId(conversationId: number): Promise<Message[]> {
    const messageList = await db.query.message.findMany({
      where: eq(message.conversationId, conversationId),
    });
    return messageList as Message[];
  }
}
