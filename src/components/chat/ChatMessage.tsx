import { cn, ensureDate } from "@/lib/utils";
import { BotIcon, UserIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date | string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={cn(
      "flex gap-3 p-4 hover:bg-muted/50 transition-smooth",
      isUser && "bg-muted/30"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        isUser 
          ? "bg-chat-message-user text-chat-message-user-foreground" 
          : "bg-chat-message-assistant text-chat-message-assistant-foreground border border-border"
      )}>
        {isUser ? (
          <UserIcon className="h-4 w-4" />
        ) : (
          <BotIcon className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? "You" : "Assistant"}
          </span>
          <span className="text-xs text-muted-foreground">
            {ensureDate(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="prose prose-sm max-w-none text-foreground">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};