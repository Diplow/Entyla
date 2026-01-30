"use client";

import { useState } from "react";

import { ConversationSetup } from "~/app/messaging/_components/ConversationSetup";
import { ConversationThread } from "~/app/messaging/_components/ConversationThread";

interface Conversation {
  id: number;
  contactId: number;
  sellingContext: string;
  createdAt: string;
}

export function MessagingPageContent() {
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  function handleConversationCreated(conversation: Conversation) {
    setActiveConversation(conversation);
  }

  function handleBackToSetup() {
    setActiveConversation(null);
  }

  if (activeConversation) {
    return (
      <ConversationThread
        conversationId={activeConversation.id}
        onBack={handleBackToSetup}
      />
    );
  }

  return (
    <ConversationSetup onConversationCreated={handleConversationCreated} />
  );
}
