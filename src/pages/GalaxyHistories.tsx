import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/layouts/AppLayout"
import { useGalaxy } from "@/hooks/useGalaxy"
import { useAuth } from "@/hooks/useAuth"
import { useState, useMemo } from "react"
import { 
  PlusIcon,
  DatabaseIcon,
  FolderIcon,
  SearchIcon,
  CalendarIcon,
  WifiIcon,
  WifiOffIcon,
  SettingsIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  DownloadIcon
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import FileUploadForm from "./FileUploadForm";
import CollectionUploadForm from "./CollectionUploadForm";
import { useRef } from "react";

const GalaxyHistories = () => {
  const { user } = useAuth()
  const {
    isConnected,
    loading,
    histories,
    selectedHistory,
    historyContents,
    config,
    connectToGalaxy,
    disconnectFromGalaxy,
    fetchHistories,
    createHistory,
    selectHistory,
    downloadDataset,
    downloadCollection
  } = useGalaxy()

  const [searchTerm, setSearchTerm] = useState("")
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newHistoryName, setNewHistoryName] = useState("")
  const [connectionConfig, setConnectionConfig] = useState({
    baseUrl: "http://100.67.47.42:8895",
    apiKey: ""
  })
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)
  const [downloadingIds, setDownloadingIds] = useState<string[]>([])

  // Filter histories based on search term
  const filteredHistories = useMemo(() => {
    return histories.filter(history => 
      history.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [histories, searchTerm])

  const handleConnect = async () => {
    if (!connectionConfig.baseUrl || !connectionConfig.apiKey) {
      toast({
        title: "Error",
        description: "Please enter both base URL and API key",
        variant: "destructive",
      })
      return
    }

    await connectToGalaxy(connectionConfig.baseUrl, connectionConfig.apiKey)
    setShowConnectionModal(false)
  }

  const handleCreateHistory = async () => {
    if (!newHistoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a history name",
        variant: "destructive",
      })
      return
    }

    await createHistory(newHistoryName.trim())
    setNewHistoryName("")
    setShowCreateModal(false)
  }

  const toggleHistoryExpansion = (historyId: string) => {
    setExpandedHistory(expandedHistory === historyId ? null : historyId)
  }

  // Download handler for dataset or collection
  const handleDownload = async (type: "dataset" | "collection", id: string) => {
    setDownloadingIds(prev => [...prev, id])
    try {
      if (type === "dataset") {
        await downloadDataset(id)
      } else {
        await downloadCollection(id)
      }
    } finally {
      setDownloadingIds(prev => prev.filter(did => did !== id))
    }
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            Please log in to view Galaxy histories.
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Galaxy Histories</h1>
              <p className="text-muted-foreground mt-2">
                Connect to and manage your Galaxy instance histories
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <WifiIcon className="h-4 w-4" />
                    <span>Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <WifiOffIcon className="h-4 w-4" />
                    <span>Disconnected</span>
                  </div>
                )}
              </div>
              
              {/* Connection Button */}
              {!isConnected ? (
                <Button 
                  onClick={() => setShowConnectionModal(true)}
                  className="flex items-center gap-2"
                >
                  <WifiIcon className="h-4 w-4" />
                  Connect to Galaxy
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    New History
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => disconnectFromGalaxy()}
                    className="flex items-center gap-2"
                  >
                    <WifiOffIcon className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Modal */}
        {showConnectionModal && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WifiIcon className="h-5 w-5" />
                Connect to Galaxy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Galaxy Base URL</label>
                <Input
                  placeholder="http://100.67.47.42:8895"
                  value={connectionConfig.baseUrl}
                  onChange={(e) => setConnectionConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">API Key</label>
                <Input
                  type="password"
                  placeholder="Enter your Galaxy API key"
                  value={connectionConfig.apiKey}
                  onChange={(e) => setConnectionConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleConnect}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCwIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <WifiIcon className="h-4 w-4" />
                  )}
                  {loading ? "Connecting..." : "Connect"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowConnectionModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create History Modal */}
        {showCreateModal && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                Create New History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">History Name</label>
                <Input
                  placeholder="Enter history name"
                  value={newHistoryName}
                  onChange={(e) => setNewHistoryName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateHistory}>
                  Create History
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewHistoryName("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        {isConnected && (
          <div className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search histories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Connection Required State */}
        {!isConnected && !showConnectionModal && (
          <Card>
            <CardContent className="p-8 text-center">
              <WifiOffIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Not Connected to Galaxy</h3>
              <p className="text-muted-foreground mb-4">
                Connect to your Galaxy instance to view and manage histories
              </p>
              <Button onClick={() => setShowConnectionModal(true)}>
                Connect to Galaxy
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Histories List */}
        {isConnected && (
          <div className="space-y-4">
            {filteredHistories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <DatabaseIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm ? "No histories found" : "No histories yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? "Try adjusting your search terms" 
                      : "Create your first Galaxy history to get started"
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowCreateModal(true)}>
                      Create Your First History
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredHistories.map((history) => (
                <Card key={history.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHistoryExpansion(history.id)}
                          className="p-1"
                        >
                          {expandedHistory === history.id ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <CardTitle className="text-lg">{history.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            ID: {history.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectHistory(history)}
                          className="flex items-center gap-1"
                        >
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {/* Expanded Content */}
                  {expandedHistory === history.id && (
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        {selectedHistory?.id === history.id && historyContents ? (
                          <div className="space-y-4">
                            {/* Datasets */}
                            {historyContents.datasets.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <DatabaseIcon className="h-4 w-4" />
                                  Datasets ({historyContents.datasets.length})
                                </h4>
                                <div className="space-y-2">
                                  {historyContents.datasets.map((dataset) => (
                                    <div key={dataset.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                      <div>
                                        <p className="font-medium text-sm">{dataset.name}</p>
                                        <p className="text-xs text-muted-foreground">ID: {dataset.id}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{dataset.type}</Badge>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          title="Download Dataset"
                                          onClick={() => handleDownload("dataset", dataset.id)}
                                          disabled={downloadingIds.includes(dataset.id)}
                                        >
                                          {downloadingIds.includes(dataset.id) ? (
                                            <RefreshCwIcon className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <DownloadIcon className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Collections */}
                            {historyContents.collections.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <FolderIcon className="h-4 w-4" />
                                  Collections ({historyContents.collections.length})
                                </h4>
                                <div className="space-y-2">
                                  {historyContents.collections.map((collection) => (
                                    <div key={collection.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                      <div>
                                        <p className="font-medium text-sm">{collection.name}</p>
                                        <p className="text-xs text-muted-foreground">ID: {collection.id}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{collection.type}</Badge>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          title="Download Collection"
                                          onClick={() => handleDownload("collection", collection.id)}
                                          disabled={downloadingIds.includes(collection.id)}
                                        >
                                          {downloadingIds.includes(collection.id) ? (
                                            <RefreshCwIcon className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <DownloadIcon className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {historyContents.datasets.length === 0 && historyContents.collections.length === 0 && (
                              <p className="text-muted-foreground text-sm">
                                No datasets or collections found in this history.
                              </p>
                            )}
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <FolderIcon className="h-4 w-4" />
                                  Upload Collection
                                   {/* Collection Upload Section */}
                                   <CollectionUploadForm historyId={history.id} />
                            </h4>

                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <FolderIcon className="h-4 w-4" />
                                  Upload Dataset
                                   {/* Collection Upload Section */}
                                    <FileUploadForm historyId={history.id} />
                            </h4>
                             {/* File Upload Section */}
                          
                           
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => selectHistory(history)}
                            >
                              Load Contents
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* Statistics */}
        {isConnected && histories.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DatabaseIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Histories</p>
                    <p className="text-2xl font-bold">{histories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FolderIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Collections</p>
                    <p className="text-2xl font-bold">
                      {histories.reduce((total, history) => {
                        // This would need to be calculated from actual data
                        return total + 0
                      }, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <SettingsIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Connected To</p>
                    <p className="text-sm font-bold truncate">
                      {config?.baseUrl || "Unknown"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default GalaxyHistories
