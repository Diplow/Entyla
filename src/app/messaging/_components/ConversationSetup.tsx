"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";

import { CompanyKnowledgePrompt } from "~/app/messaging/_components/CompanyKnowledgePrompt";
import { ContactSelectionForm } from "~/app/messaging/_components/ContactSelectionForm";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  company: string | null;
}

interface ConversationContact {
  firstName: string;
  lastName: string;
  company: string | null;
}

interface EnrichedConversation {
  id: number;
  contactId: number;
  createdAt: string;
  contact: ConversationContact | null;
}

interface OnboardingStatus {
  completed: boolean;
  hasCompanyKnowledge: boolean;
}

interface ConversationSetupProps {
  onConversationCreated: (conversationId: number) => void;
  onBack: () => void;
  existingConversations: EnrichedConversation[];
  initialContactId?: number | null;
}

export function ConversationSetup({
  onConversationCreated,
  onBack,
  existingConversations,
  initialContactId,
}: ConversationSetupProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch("/api/contacts");
        if (response.ok) {
          const fetchedContacts = (await response.json()) as Contact[];
          setContacts(fetchedContacts);
          if (initialContactId && fetchedContacts.some((contact) => contact.id === initialContactId)) {
            setSelectedContactId(initialContactId);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoadingContacts(false);
      }
    }
    void fetchContacts();
  }, [initialContactId]);

  useEffect(() => {
    async function fetchOnboardingStatus() {
      try {
        const response = await fetch("/api/onboarding");
        if (response.ok) {
          setOnboardingStatus((await response.json()) as OnboardingStatus);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoadingOnboarding(false);
      }
    }
    void fetchOnboardingStatus();
  }, []);

  const matchingConversation =
    selectedContactId !== ""
      ? existingConversations.find((conversation) => conversation.contactId === selectedContactId)
      : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedContactId) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: selectedContactId }),
      });
      if (!response.ok) throw new Error("Failed to create conversation");
      const conversationResponse = (await response.json()) as { conversation: { id: number } };

      posthog.capture("conversation_started", {
        contact_id: selectedContactId,
      });

      onConversationCreated(conversationResponse.conversation.id);
    } catch (error) {
      posthog.captureException(error);
      alert("Failed to create conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const isInitialLoading = isLoadingContacts || isLoadingOnboarding;
  const needsCompanyKnowledge = onboardingStatus && !onboardingStatus.hasCompanyKnowledge;

  if (isInitialLoading)
    return <p className="text-white/50">Loading...</p>;
  if (contacts.length === 0)
    return (
      <p className="text-white/50">No contacts yet. Add contacts first.</p>
    );

  if (needsCompanyKnowledge) {
    return <CompanyKnowledgePrompt onBack={onBack} />;
  }

  return (
    <ContactSelectionForm
      contacts={contacts}
      selectedContactId={selectedContactId}
      onSelectedContactIdChange={setSelectedContactId}
      matchingConversation={matchingConversation ?? null}
      onConversationCreated={onConversationCreated}
      onBack={onBack}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
