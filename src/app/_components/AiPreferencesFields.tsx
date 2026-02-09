"use client";

import { ExampleMessagesList } from "~/app/_components/ExampleMessagesList";

interface AiPreferencesFieldsProps {
  signature: string;
  onSignatureChange: (value: string) => void;
  companyKnowledge: string;
  onCompanyKnowledgeChange: (value: string) => void;
  toneOfVoice: string;
  onToneOfVoiceChange: (value: string) => void;
  exampleMessages: string[];
  onExampleMessagesChange: (messages: string[]) => void;
  disabled?: boolean;
}

export function AiPreferencesFields({
  signature,
  onSignatureChange,
  companyKnowledge,
  onCompanyKnowledgeChange,
  toneOfVoice,
  onToneOfVoiceChange,
  exampleMessages,
  onExampleMessagesChange,
  disabled,
}: AiPreferencesFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="signature" className="text-sm font-medium">
          Message Signature
        </label>
        <input
          id="signature"
          type="text"
          value={signature}
          onChange={(event) => onSignatureChange(event.target.value)}
          placeholder="Your name"
          className="rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-white/30"
          disabled={disabled}
        />
        <p className="text-sm text-white/40">
          How the AI will sign your messages
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="company-knowledge" className="text-sm font-medium">
          Company & Product Knowledge <span className="text-red-400">*</span>
        </label>
        <textarea
          id="company-knowledge"
          value={companyKnowledge}
          onChange={(event) => onCompanyKnowledgeChange(event.target.value)}
          placeholder="Describe your company, products, value propositions, and target market..."
          className="rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-white/30"
          rows={6}
          required
          disabled={disabled}
        />
        <p className="text-sm text-white/40">
          This information helps the AI craft relevant messages
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="tone-of-voice" className="text-sm font-medium">
          Tone of Voice
        </label>
        <textarea
          id="tone-of-voice"
          value={toneOfVoice}
          onChange={(event) => onToneOfVoiceChange(event.target.value)}
          className="rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-white/30"
          rows={3}
          disabled={disabled}
        />
        <p className="text-sm text-white/40">
          Describe the writing style you want the AI to use
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          Example Messages (Optional)
        </label>
        <p className="text-sm text-white/40">
          Provide up to 10 example messages that represent your preferred style
        </p>
        <ExampleMessagesList
          messages={exampleMessages}
          onChange={onExampleMessagesChange}
        />
      </div>
    </>
  );
}
