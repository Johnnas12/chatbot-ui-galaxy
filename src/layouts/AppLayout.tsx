import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useChat } from "@/hooks/useChat.tsx";
import { useEffect } from "react";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayoutInner = ({ children }: AppLayoutProps) => {
  const {
    sessions,
    activeSessionId,
    createNewSession,
    selectSession,
    initializeChat,
    isInitialized,
  } = useChat();

  // Initialize chat on component mount only once
  useEffect(() => {
    if (!isInitialized) {
      initializeChat();
    }
  }, [initializeChat, isInitialized]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" side="left">
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSessionSelect={selectSession}
          onNewChat={createNewSession}
        />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export const AppLayout = ({ children }: AppLayoutProps) => (
  <AppLayoutInner>{children}</AppLayoutInner>
);