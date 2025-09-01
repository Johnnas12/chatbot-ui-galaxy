import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/layouts/AppLayout"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/hooks/useAuth"
import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { 
  PlusIcon,
  FolderIcon,
  MessageSquareIcon,
  CalendarIcon,
  SearchIcon,
  TagIcon,
  ClockIcon,
  UsersIcon
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ensureDate } from "@/lib/utils"

// Define collection types
interface Collection {
  id: string
  name: string
  description: string
  color: string
  sessionIds: string[]
  createdAt: Date
}

const Collections = () => {
  const { sessions, selectSession, deleteSession } = useChat()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")

  // Mock collections data (in a real app, this would come from the database)
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "1",
      name: "Work Projects",
      description: "Professional conversations and project discussions",
      color: "bg-blue-500",
      sessionIds: [],
      createdAt: new Date()
    },
    {
      id: "2", 
      name: "Learning & Tutorials",
      description: "Educational content and how-to guides",
      color: "bg-green-500",
      sessionIds: [],
      createdAt: new Date()
    },
    {
      id: "3",
      name: "Personal Ideas",
      description: "Personal projects and brainstorming sessions",
      color: "bg-purple-500", 
      sessionIds: [],
      createdAt: new Date()
    }
  ])

  // Auto-assign sessions to collections based on content
  const autoAssignSessions = useMemo(() => {
    const updatedCollections = collections.map(collection => ({
      ...collection,
      sessionIds: sessions.filter(session => {
        const content = session.messages.map(m => m.content).join(' ').toLowerCase()
        const title = session.title.toLowerCase()
        
        switch (collection.name) {
          case "Work Projects":
            return content.includes('project') || content.includes('work') || 
                   content.includes('meeting') || content.includes('deadline') ||
                   title.includes('project') || title.includes('work')
          case "Learning & Tutorials":
            return content.includes('learn') || content.includes('tutorial') || 
                   content.includes('how to') || content.includes('guide') ||
                   title.includes('learn') || title.includes('tutorial')
          case "Personal Ideas":
            return content.includes('idea') || content.includes('personal') || 
                   content.includes('hobby') || content.includes('fun') ||
                   title.includes('idea') || title.includes('personal')
          default:
            return false
        }
      }).map(s => s.id)
    }))
    
    return updatedCollections
  }, [sessions, collections])

  // Filter collections and sessions
  const filteredCollections = useMemo(() => {
    return autoAssignSessions.filter(collection => 
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [autoAssignSessions, searchTerm])

  const selectedCollectionData = useMemo(() => {
    if (!selectedCollection) return null
    return autoAssignSessions.find(c => c.id === selectedCollection)
  }, [selectedCollection, autoAssignSessions])

  const sessionsInSelectedCollection = useMemo(() => {
    if (!selectedCollectionData) return []
    return sessions.filter(session => selectedCollectionData.sessionIds.includes(session.id))
  }, [selectedCollectionData, sessions])

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a collection name",
        variant: "destructive",
      })
      return
    }

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName.trim(),
      description: newCollectionDescription.trim() || "No description",
      color: "bg-gray-500",
      sessionIds: [],
      createdAt: new Date()
    }

    setCollections(prev => [...prev, newCollection])
    setNewCollectionName("")
    setNewCollectionDescription("")
    setShowCreateCollection(false)
    
    toast({
      title: "Collection Created",
      description: `"${newCollection.name}" has been created successfully.`,
    })
  }

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
        return `${diffInMinutes}m ago`
      }
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return dateObj.toLocaleDateString()
    }
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            Please log in to view your collections.
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Collections</h1>
          <p className="text-muted-foreground mt-2">
            Organize and manage your chat collections
          </p>
        </div>

        {/* Search and Create */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => setShowCreateCollection(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            New Collection
          </Button>
        </div>

        {/* Create Collection Modal */}
        {showCreateCollection && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="Enter collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Enter collection description (optional)"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateCollection}>
                  Create Collection
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateCollection(false)
                    setNewCollectionName("")
                    setNewCollectionDescription("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCollections.map((collection) => (
            <Card 
              key={collection.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedCollection === collection.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCollection(selectedCollection === collection.id ? null : collection.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${collection.color}`} />
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {collection.sessionIds.length} chats
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-3">
                  {collection.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>Created {formatDate(collection.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquareIcon className="h-3 w-3" />
                    <span>{collection.sessionIds.length} conversations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Collection Sessions */}
        {selectedCollectionData && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {selectedCollectionData.name} - Conversations
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedCollection(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-3">
              {sessionsInSelectedCollection.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <FolderIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No conversations in this collection yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sessionsInSelectedCollection.map((session) => (
                  <Card key={session.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.messages.length} messages • {formatDate(session.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewSession(session.id)
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSession(session.id, session.title)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FolderIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Collections</p>
                  <p className="text-2xl font-bold">{collections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquareIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Organized Chats</p>
                  <p className="text-2xl font-bold">
                    {autoAssignSessions.reduce((total, collection) => total + collection.sessionIds.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Unorganized</p>
                  <p className="text-2xl font-bold">
                    {sessions.length - autoAssignSessions.reduce((total, collection) => total + collection.sessionIds.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default Collections