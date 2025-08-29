import { ChatArea } from "@/components/chat/ChatArea";
import { AppLayout } from "@/layouts/AppLayout";
import { useChat } from "@/hooks/useChat";

const Index = () => {
  const {
    messages,
    isLoading,
    sendMessage,
  } = useChat();

  return (
    <AppLayout>
      <ChatArea
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </AppLayout>
  );
};

export default Index;
