"use client";

interface Message {
  id: number;
  role: "prospect" | "contact";
  content: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isProspect = message.role === "prospect";

  return (
    <div className={`flex ${isProspect ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 ${
          isProspect
            ? "bg-purple-600 text-white"
            : "bg-white/10 text-white"
        }`}
      >
        <p className="text-xs font-medium opacity-70 mb-1">
          {isProspect ? "You (Prospect)" : "Contact"}
        </p>
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
      </div>
    </div>
  );
}
