import { useState, useCallback, createContext, useContext, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ensureDate } from "@/lib/utils";
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
  user_id: string;
}

const useChatState = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get active session
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const { user } = useAuth();

  // Load sessions from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setSessions([]);
      setActiveSessionId(null);
      setIsInitialized(false);
      return;
    }

    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (error) {
          console.error('Error loading sessions:', error);
          toast({
            title: "Error",
            description: "Failed to load chat sessions",
            variant: "destructive",
          });
          return;
        }

        const loadedSessions = data.map(session => ({
          ...session,
          timestamp: ensureDate(session.timestamp),
          messages: (session.messages || []).map((msg: any) => ({
            ...msg,
            timestamp: ensureDate(msg.timestamp)
          }))
        }));

        setSessions(loadedSessions);
        setActiveSessionId(loadedSessions[0]?.id ?? null);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [user]);

  // Subscribe to real-time updates for chat sessions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
                                           if (payload.eventType === 'INSERT') {
              const newSession = {
                ...payload.new,
                timestamp: ensureDate(payload.new.timestamp),
                messages: (payload.new.messages || []).map((msg: any) => ({
                  ...msg,
                  timestamp: ensureDate(msg.timestamp)
                }))
              };
              setSessions(prev => [newSession, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedSession = {
                ...payload.new,
                timestamp: ensureDate(payload.new.timestamp),
                messages: (payload.new.messages || []).map((msg: any) => ({
                  ...msg,
                  timestamp: ensureDate(msg.timestamp)
                }))
              };
             setSessions(prev => prev.map(session => 
               session.id === updatedSession.id ? updatedSession : session
             ));
                       } else if (payload.eventType === 'DELETE') {
              setSessions(prev => {
                const updatedSessions = prev.filter(session => session.id !== payload.old.id);
                // If we deleted the active session, select the first available session
                if (activeSessionId === payload.old.id) {
                  setActiveSessionId(updatedSessions[0]?.id ?? null);
                }
                return updatedSessions;
              });
            }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeSessionId, sessions]);

  // Create new chat session
  const createNewSession = useCallback(async () => {
    if (!user) return null;

    const newId = crypto.randomUUID();
    const newSession: Omit<ChatSession, 'id'> = {
      title: "New Chat",
      timestamp: new Date(),
      messages: [],
      user_id: user.id,
    };

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .insert([{ id: newId, ...newSession }]);

      if (error) {
        console.error('Error creating session:', error);
        toast({
          title: "Error",
          description: "Failed to create new chat session",
          variant: "destructive",
        });
        return null;
      }

      setActiveSessionId(newId);
      return newId;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }, [user]);

  // Select a session
  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  // Update session title based on first message
  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    if (!user) return;

    const trimmed = title.trim().replace(/\s+/g, " ");
    const newTitle = trimmed.slice(0, 50) + (trimmed.length > 50 ? '...' : '');

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating session title:', error);
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  }, [user]);

  // Send message to your local model
  const sendMessage = useCallback(async (content: string, endpointKey?: string) => {
    if (!user) return;

    // Ensure there is an active session and capture the id synchronously
    const sessionId = activeSessionId ?? await createNewSession();
    if (!sessionId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
    };

    // Add user message immediately
    const updatedMessages = [...(activeSession?.messages || []), userMessage];
    
    try {
      // Update session with new message
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          messages: updatedMessages,
          title: activeSession?.messages.length === 0 ? content.trim().slice(0, 50) + (content.length > 50 ? '...' : '') : activeSession.title
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating session:', error);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }

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
        id: crypto.randomUUID(),
        content: assistantContent,
        role: "assistant",
        timestamp: new Date(),
      };

      // Add assistant message to database
      const finalMessages = [...updatedMessages, assistantMessage];
      
      const { error } = await supabase
        .from('chat_sessions')
        .update({ messages: finalMessages })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating session with assistant message:', error);
      }

    } catch (error) {
      console.error("Error calling local model:", error);
      
      toast({
        title: "Error",
        description: "Failed to get response from your local model. Please check your API configuration and ensure your model is running.",
        variant: "destructive",
      });

      // Add error message to database
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "I'm sorry, but I'm having trouble connecting to the local model. Please check that your model is running and the API configuration is correct.",
        role: "assistant",
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, errorMessage];
      
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ messages: finalMessages })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating session with error message:', updateError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, createNewSession, user, activeSession]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting session:', error);
        toast({
          title: "Error",
          description: "Failed to delete chat session",
          variant: "destructive",
        });
        return;
      }

      // Update local state immediately for better UX
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // If we deleted the active session, select the first available session
      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(session => session.id !== sessionId);
        setActiveSessionId(remainingSessions[0]?.id ?? null);
      }

      toast({
        title: "Success",
        description: "Chat session deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      });
    }
  }, [user, activeSessionId, sessions]);

  // Initialize chat (no automatic session creation)
  const initializeChat = useCallback(async () => {
    if (!user || isInitialized) return;
    // Do nothing - let users manually create sessions when they want to
  }, [user, isInitialized]);

  return {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    sendMessage,
    createNewSession,
    selectSession,
    deleteSession,
    initializeChat,
    isInitialized,
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


