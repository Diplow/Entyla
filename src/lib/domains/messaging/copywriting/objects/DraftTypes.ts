export interface ContactInfo {
  firstName: string;
  lastName: string;
  company: string | null;
  jobTitle: string | null;
}

export interface ConversationMessage {
  role: "prospect" | "contact";
  content: string;
}

export interface DraftRequest {
  contactInfo: ContactInfo;
  sellingContext: string;
  conversationHistory: ConversationMessage[];
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface DraftResult {
  content: string;
  usage: TokenUsage;
}
