export type MessageRole = "prospect" | "contact";

export interface Message {
  id: number;
  conversationId: number;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface MessageCreateInput {
  conversationId: number;
  role: MessageRole;
  content: string;
}
