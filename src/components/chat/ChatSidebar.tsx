import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, MessageSquareIcon, SettingsIcon, FolderIcon, HistoryIcon, LogOutIcon, UserIcon, DatabaseIcon } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

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
  { title: "Galaxy Histories", href: "/galaxy-histories", icon: DatabaseIcon },
];

export const ChatSidebar = ({ 
  sessions, 
  activeSessionId, 
  onSessionSelect, 
  onNewChat 
}: ChatSidebarProps) => {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const { deleteSession } = useChat();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      toast({
        title: "Session deleted",
        description: "Chat session has been deleted.",
      });
    } catch (error) {
      console.error("Delete session error:", error);
    }
  };

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
                  <div key={session.id} className="relative group">
                    <Button
                      onClick={() => onSessionSelect(session.id)}
                      variant={activeSessionId === session.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left h-auto p-2 pr-8"
                    >
                      <MessageSquareIcon className="h-4 w-4 mr-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{session.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {session.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </Button>
                    <Button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
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
        <div className="p-2 space-y-2">
          {user && (
            <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <SettingsIcon className="h-4 w-4 mr-3" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </>
  );
};