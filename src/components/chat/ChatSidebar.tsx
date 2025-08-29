import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, MessageSquareIcon, SettingsIcon, FolderIcon, HistoryIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

const navigationItems = [
  { title: "Chat", href: "/", icon: MessageSquareIcon },
  { title: "Collections", href: "/collections", icon: FolderIcon },
  { title: "Histories", href: "/histories", icon: HistoryIcon },
];

export const ChatSidebar = ({ 
  sessions, 
  activeSessionId, 
  onSessionSelect, 
  onNewChat 
}: ChatSidebarProps) => {
  return (
    <div className="flex h-full w-64 flex-col bg-chat-sidebar border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            onClick={onNewChat}
            size="sm" 
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-border">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-2">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Chats</h3>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {sessions.map((session) => (
              <Button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                variant={activeSessionId === session.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left h-auto p-3 hover:bg-muted transition-smooth"
              >
                <MessageSquareIcon className="h-4 w-4 mr-3 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{session.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {session.timestamp.toLocaleDateString()}
                  </div>
                </div>
              </Button>
            ))}
            {sessions.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No chat sessions yet.
                <br />
                Start a new conversation!
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start">
          <SettingsIcon className="h-4 w-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );
};