import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useChat } from "@/hooks/useChat";
import { useEffect } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const {
    sessions,
    activeSessionId,
    createNewSession,
    selectSession,
    initializeChat,
  } = useChat();

  // Initialize chat on component mount
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={selectSession}
        onNewChat={createNewSession}
      />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};