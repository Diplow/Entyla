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
          isProspect ? "bg-purple-600 text-white" : "bg-white/10 text-white"
        }`}
      >
        <p className="mb-1 text-xs font-medium opacity-70">
          {isProspect ? "You (Prospect)" : "Contact"}
        </p>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
