import Link from "next/link";

interface CompanyKnowledgePromptProps {
  onBack: () => void;
}

export function CompanyKnowledgePrompt({ onBack }: CompanyKnowledgePromptProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <button
        onClick={onBack}
        className="self-start text-sm text-white/50 transition hover:text-white"
      >
        &larr; Back to conversations
      </button>

      <div className="rounded-lg bg-purple-500/10 px-6 py-5 text-center">
        <p className="mb-4 text-white/80">
          Before starting a conversation, you need to set up your company information.
        </p>
        <Link
          href="/settings"
          className="inline-block rounded-lg bg-purple-600 px-4 py-2 font-medium transition hover:bg-purple-500"
        >
          Set up in Settings
        </Link>
      </div>
    </div>
  );
}
