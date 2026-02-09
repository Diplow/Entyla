type ConversationStopReason = "positive_outcome" | "unresponsive" | "negative_outcome";

function getStopReasonMessage(reason: ConversationStopReason | null): string {
  if (!reason) return "AI has stopped working on this conversation";
  const messages: Record<ConversationStopReason, string> = {
    positive_outcome: "Prospect showed interest - ready for manual follow-up",
    unresponsive: "Prospect hasn't responded after multiple attempts",
    negative_outcome: "Prospect declined - not interested",
  };
  return messages[reason];
}

interface ConversationStoppedBannerProps {
  stoppedReason: ConversationStopReason | null;
}

export function ConversationStoppedBanner({ stoppedReason }: ConversationStoppedBannerProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
      <span className="font-medium">Conversation ended:</span>{" "}
      {getStopReasonMessage(stoppedReason)}
    </div>
  );
}
