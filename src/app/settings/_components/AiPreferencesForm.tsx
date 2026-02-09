"use client";

import { useEffect, useState } from "react";

import { AiPreferencesFields } from "~/app/_components/AiPreferencesFields";

const DEFAULT_TONE_OF_VOICE =
  "Professional yet approachable. Clear and concise. Focus on demonstrating value to the prospect without being pushy. Use natural language, avoid jargon.";

interface AiPreferences {
  companyKnowledge: string | null;
  toneOfVoice: string | null;
  exampleMessages: string[];
  signature: string | null;
  userName: string;
}

export function AiPreferencesForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [companyKnowledge, setCompanyKnowledge] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState(DEFAULT_TONE_OF_VOICE);
  const [exampleMessages, setExampleMessages] = useState<string[]>([]);
  const [signature, setSignature] = useState("");

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch("/api/ai-preferences");
        if (!response.ok) {
          throw new Error("Failed to load preferences");
        }
        const preferences = (await response.json()) as AiPreferences;

        setCompanyKnowledge(preferences.companyKnowledge ?? "");
        setToneOfVoice(preferences.toneOfVoice ?? DEFAULT_TONE_OF_VOICE);
        setExampleMessages(preferences.exampleMessages ?? []);
        setSignature(preferences.signature ?? preferences.userName);
      } catch {
        setErrorMessage("Failed to load preferences. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }
    void fetchPreferences();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/ai-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyKnowledge: companyKnowledge || undefined,
          toneOfVoice: toneOfVoice || undefined,
          exampleMessages,
          signature: signature.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      setSuccessMessage("Preferences saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setErrorMessage("Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-white/50">Loading preferences...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-8">
      {errorMessage && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {successMessage}
        </div>
      )}

      <AiPreferencesFields
        signature={signature}
        onSignatureChange={setSignature}
        companyKnowledge={companyKnowledge}
        onCompanyKnowledgeChange={setCompanyKnowledge}
        toneOfVoice={toneOfVoice}
        onToneOfVoiceChange={setToneOfVoice}
        exampleMessages={exampleMessages}
        onExampleMessagesChange={setExampleMessages}
      />
      <button
        type="submit"
        disabled={isSaving}
        className="self-start rounded-lg bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-500 disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Preferences"}
      </button>
    </form>
  );
}
