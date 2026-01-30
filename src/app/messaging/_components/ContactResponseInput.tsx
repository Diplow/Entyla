"use client";

import { useState } from "react";
import posthog from "posthog-js";

interface ContactResponseInputProps {
  onSubmit: (content: string) => Promise<void>;
  onGenerateReply: () => Promise<void>;
  isGenerating: boolean;
}

export function ContactResponseInput({
  onSubmit,
  onGenerateReply,
  isGenerating,
}: ContactResponseInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;

    setIsSending(true);
    try {
      await onSubmit(content.trim());
      posthog.capture("contact_response_sent", {
        response_length: content.trim().length,
      });
      setContent("");
    } catch (error) {
      posthog.captureException(error);
      alert("Failed to send response. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleGenerateReply() {
    posthog.capture("ai_reply_requested");
    await onGenerateReply();
  }

  return (
    <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Type a fake contact response..."
          className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-white placeholder:text-white/30"
          disabled={isSending || isGenerating}
        />
        <button
          type="submit"
          disabled={isSending || isGenerating || !content.trim()}
          className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/30 disabled:opacity-50"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>

      <button
        onClick={handleGenerateReply}
        disabled={isGenerating}
        className="rounded-lg bg-purple-600 px-4 py-2 font-medium transition hover:bg-purple-500 disabled:opacity-50"
      >
        {isGenerating ? "Generating Reply..." : "Generate Reply"}
      </button>
    </div>
  );
}
