import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, LoaderIcon } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput = ({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Type your message...",
  disabled = false
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Create a new chat session to start messaging..." : placeholder}
            disabled={isLoading || disabled}
            className="min-h-[60px] max-h-[200px] resize-none bg-chat-input border-chat-input-border focus:border-chat-input-focus focus:ring-chat-input-focus transition-smooth"
            rows={1}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          size="icon"
          className="h-[60px] w-[60px] shrink-0 bg-primary hover:bg-primary/90 transition-smooth"
        >
          {isLoading ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};