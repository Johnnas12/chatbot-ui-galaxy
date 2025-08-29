import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatMessage, type Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

const endpoints = [
  { value: "tool-suggest", label: "Tool Suggest" },
  { value: "workflow-suggest", label: "Workflow Suggest" },
  { value: "workflow-execution", label: "Workflow Execution" },
];

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatArea = ({ messages, onSendMessage, isLoading = false }: ChatAreaProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState("tool-suggest");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-chat-background">
      {/* Endpoint Selection */}
      <div className="border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select endpoint" />
            </SelectTrigger>
            <SelectContent>
              {endpoints.map((endpoint) => (
                <SelectItem key={endpoint.value} value={endpoint.value}>
                  {endpoint.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-0">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                <p className="text-sm">
                  Send a message to begin chatting with {endpoints.find(e => e.value === selectedEndpoint)?.label}.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chat-message-assistant text-chat-message-assistant-foreground border border-border">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Assistant</span>
                  <span className="text-xs text-muted-foreground">typing...</span>
                </div>
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.1s" }} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading}
        placeholder="Message your AI assistant..."
      />
    </div>
  );
};