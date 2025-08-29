import { useState, useCallback, createContext, useContext } from "react";
import { toast } from "@/hooks/use-toast";
import type { Message } from "@/components/chat/ChatMessage";

// Configuration for your local model API
const API_CONFIG = {
  baseUrl: "http://localhost:8000",
  endpoint: "/suggest-tools-enhanced",
  model: "local-model",
} as const;

const ENDPOINT_MAP: Record<string, string> = {
  "tool-suggest": "/suggest-tools-enhanced",
  "workflow-suggest": "/suggest-workflows-enhanced",
  "workflow-execution": "/workflow-execution",
};

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

const useChatState = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get active session
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  // Create new chat session
  const createNewSession = useCallback(() => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat",
      timestamp: new Date(),
      messages: [],
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    return newId;
  }, []);

  // Select a session
  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  // Update session title based on first message
  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    const trimmed = title.trim().replace(/\s+/g, " ");
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, title: trimmed.slice(0, 50) + (trimmed.length > 50 ? '...' : '') }
        : session
    ));
  }, []);

  // Send message to your local model
  const sendMessage = useCallback(async (content: string, endpointKey?: string) => {
    // Ensure there is an active session and capture the id synchronously
    const sessionId = activeSessionId ?? createNewSession();

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
    };

    // Add user message immediately and set title if first message (in the same update to avoid stale state)
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;
      const isFirstMessage = session.messages.length === 0;
      const updatedMessages = [...session.messages, userMessage];
      if (isFirstMessage) {
        const trimmed = content.trim().replace(/\s+/g, " ");
        const newTitle = trimmed.slice(0, 50) + (trimmed.length > 50 ? "..." : "");
        return { ...session, title: newTitle, messages: updatedMessages };
      }
      return { ...session, messages: updatedMessages };
    }));

    setIsLoading(true);

    try {
      // Call your local model API
      const path = (endpointKey && ENDPOINT_MAP[endpointKey]) || API_CONFIG.endpoint;
      const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
            query: content, // Send only the user's message as a string
            top_k: 5,       // Optional: add top_k if needed by your API
          }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract response content (adjust based on your API response format)
      const assistantContent = (data.results && data.results.trim()) ? data.results
        : data.choices?.[0]?.message?.content
        || data.response
        || "Sorry, I couldn't process your request.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        role: "assistant",
        timestamp: new Date(),
      };

      // Add assistant message
      setSessions(prev => prev.map(session => 
        session.id === sessionId
          ? { ...session, messages: [...session.messages, assistantMessage] }
          : session
      ));

    } catch (error) {
      console.error("Error calling local model:", error);
      
      toast({
        title: "Error",
        description: "Failed to get response from your local model. Please check your API configuration and ensure your model is running.",
        variant: "destructive",
      });

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, but I'm having trouble connecting to the local model. Please check that your model is running and the API configuration is correct.",
        role: "assistant",
        timestamp: new Date(),
      };

      setSessions(prev => prev.map(session => 
        session.id === sessionId
          ? { ...session, messages: [...session.messages, errorMessage] }
          : session
      ));
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, createNewSession]);

  // Initialize with a default session if none exist
  const initializeChat = useCallback(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, [sessions.length, createNewSession]);

  return {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    sendMessage,
    createNewSession,
    selectSession,
    initializeChat,
  };
};

type ChatContextValue = ReturnType<typeof useChatState> | null;
const ChatContext = createContext<ChatContextValue>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useChatState();
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return ctx;
};


