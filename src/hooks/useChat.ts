import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import type { Message } from "@/components/chat/ChatMessage";

// Configuration for your local model API
const API_CONFIG = {
  // Change this to your local model endpoint
  baseUrl: "http://localhost:8000", // Update with your local model URL
  endpoint: "/suggest-tools-enhanced", // Update with your specific endpoint
  model: "local-model", // Update with your model name
};

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get active session
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  // Create new chat session
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      timestamp: new Date(),
      messages: [],
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, []);

  // Select a session
  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  // Update session title based on first message
  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, title: title.slice(0, 50) + (title.length > 50 ? '...' : '') }
        : session
    ));
  }, []);

  // Send message to your local model
  const sendMessage = useCallback(async (content: string) => {
    if (!activeSessionId) {
      createNewSession();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    // Add user message immediately
    setSessions(prev => prev.map(session => 
      session.id === activeSessionId
        ? { ...session, messages: [...session.messages, userMessage] }
        : session
    ));

    // Update title if this is the first message
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (currentSession && currentSession.messages.length === 0) {
      updateSessionTitle(activeSessionId, content);
    }

    setIsLoading(true);

    try {
      // Call your local model API
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`, {
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
        session.id === activeSessionId
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
        session.id === activeSessionId
          ? { ...session, messages: [...session.messages, errorMessage] }
          : session
      ));
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, sessions, createNewSession, updateSessionTitle, messages]);

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