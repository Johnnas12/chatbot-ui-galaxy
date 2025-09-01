import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppLayout } from "@/layouts/AppLayout"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/hooks/useAuth"
import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { 
  SearchIcon, 
  MessageSquareIcon, 
  CalendarIcon, 
  TrashIcon,
  EyeIcon,
  ClockIcon
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ensureDate } from "@/lib/utils"

const Histories = () => {
  const { sessions, selectSession, deleteSession } = useChat()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "title" | "messages">("date")

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(session => 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.messages.some(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

    // Sort sessions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "messages":
          return b.messages.length - a.messages.length
        default:
          return 0
      }
    })

    return filtered
  }, [sessions, searchTerm, sortBy])

  const handleViewSession = (sessionId: string) => {
    selectSession(sessionId)
    navigate("/")
  }

  const handleDeleteSession = async (sessionId: string, sessionTitle: string) => {
    try {
      await deleteSession(sessionId)
      toast({
        title: "Session Deleted",
        description: `"${sessionTitle}" has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = ensureDate(date)
    const now = new Date()
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60)
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
      }
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return dateObj.toLocaleDateString()
    }
  }

  const getMessagePreview = (messages: any[]) => {
    if (messages.length === 0) return "No messages yet"
    
    // Find the first user message
    const firstUserMessage = messages.find(msg => msg.role === "user")
    if (firstUserMessage) {
      const preview = firstUserMessage.content.slice(0, 100)
      return preview.length === 100 ? preview + "..." : preview
    }
    
    return "No user messages"
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            Please log in to view your chat histories.
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Chat Histories</h1>
          <p className="text-muted-foreground mt-2">
            Browse and manage your previous conversations
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "title" | "messages")}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="messages">Sort by Messages</option>
          </select>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquareIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Conversations</p>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Messages</p>
                  <p className="text-2xl font-bold">
                    {sessions.reduce((total, session) => total + session.messages.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Active This Week</p>
                  <p className="text-2xl font-bold">
                    {sessions.filter(session => {
                      const sessionDate = ensureDate(session.timestamp)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return sessionDate > weekAgo
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquareIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? "No conversations found" : "No conversations yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Start a new conversation to see it here"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate("/")}>
                    Start Your First Chat
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{session.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {getMessagePreview(session.messages)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge variant="secondary">
                        {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(session.timestamp)}</span>
                      </div>
                      {session.messages.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            {formatDate(session.messages[session.messages.length - 1].timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSession(session.id)}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id, session.title)}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default Histories