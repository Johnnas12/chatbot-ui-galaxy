import { ChatArea } from "@/components/chat/ChatArea";
import { AppLayout } from "@/layouts/AppLayout";
import { useChat } from "@/hooks/useChat.tsx";

const Index = () => {
  const {
    messages,
    isLoading,
    sendMessage,
    activeSessionId,
  } = useChat();

  return (
    <AppLayout>
      <ChatArea
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isLoading}
        hasActiveSession={!!activeSessionId}
      />
    </AppLayout>
  );
};

export default Index;
