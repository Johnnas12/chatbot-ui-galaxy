import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, MessageSquareIcon, SettingsIcon, FolderIcon, HistoryIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

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
  const { state } = useSidebar();
  return (
    <>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-sm font-semibold text-foreground">Navigation</h2>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button 
              onClick={onNewChat}
              size="icon" 
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-muted"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <NavLink to={item.href} className={({ isActive }) => "block"}>
                    <SidebarMenuButton isActive={location.pathname === item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="px-1">
              <div className="space-y-1">
                {sessions.map((session) => (
                  <Button
                    key={session.id}
                    onClick={() => onSessionSelect(session.id)}
                    variant={activeSessionId === session.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left h-auto p-2"
                  >
                    <MessageSquareIcon className="h-4 w-4 mr-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{session.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {session.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  </Button>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-6">
                    No chat sessions yet.
                    <br />
                    Start a new conversation!
                  </div>
                )}
              </div>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-start">
            <SettingsIcon className="h-4 w-4 mr-3" />
            Settings
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
};