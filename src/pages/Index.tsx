import { ChatArea } from "@/components/chat/ChatArea";
import { AppLayout } from "@/layouts/AppLayout";
import { useChat } from "@/hooks/useChat.tsx";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { loading, user } = useAuth();
  const {
    messages,
    isLoading,
    sendMessage,
  } = useChat();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="size-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">Loading</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <a href="/login" className="text-primary underline">Login to continue</a>
      </div>
    );
  }

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
