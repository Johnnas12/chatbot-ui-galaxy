import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface GalaxyHistory {
  id: string;
  name: string;
}

interface GalaxyDataset {
  id: string;
  name: string;
  type: 'dataset';
}

interface GalaxyCollection {
  id: string;
  name: string;
  type: 'collection';
}

interface GalaxyContents {
  datasets: GalaxyDataset[];
  collections: GalaxyCollection[];
}

interface GalaxyConfig {
  baseUrl: string;
  apiKey: string;
}

const GALAXY_CONFIG_KEY = 'galaxy_config';

export const useGalaxy = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [bearerToken, setBearerToken] = useState<string | null>(null);
  const [config, setConfig] = useState<GalaxyConfig | null>(null);
  const [histories, setHistories] = useState<GalaxyHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<GalaxyHistory | null>(null);
  const [historyContents, setHistoryContents] = useState<GalaxyContents | null>(null);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(GALAXY_CONFIG_KEY);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        // Try to reconnect if we have saved config
        connectToGalaxy(parsedConfig.baseUrl, parsedConfig.apiKey);
      } catch (error) {
        console.error('Error loading Galaxy config:', error);
      }
    }
  }, []);

  const connectToGalaxy = useCallback(async (baseUrl: string, apiKey: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/register-key`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_api_key: apiKey
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const token = data.token;

      if (!token) {
        throw new Error('No token received from Galaxy API');
      }

      // Save config and token
      const newConfig = { baseUrl, apiKey };
      setConfig(newConfig);
      setBearerToken(token);
      setIsConnected(true);
      
      // Save to localStorage
      localStorage.setItem(GALAXY_CONFIG_KEY, JSON.stringify(newConfig));
      localStorage.setItem('galaxy_token', token);

      toast({
        title: "Connected to Galaxy",
        description: "Successfully connected to Galaxy instance",
      });

      // Fetch histories after successful connection
      await fetchHistories(token, baseUrl);

    } catch (error) {
      console.error('Error connecting to Galaxy:', error);
      setIsConnected(false);
      setBearerToken(null);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Galaxy",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectFromGalaxy = useCallback(() => {
    setIsConnected(false);
    setBearerToken(null);
    setConfig(null);
    setHistories([]);
    setSelectedHistory(null);
    setHistoryContents(null);
    
    // Clear from localStorage
    localStorage.removeItem(GALAXY_CONFIG_KEY);
    localStorage.removeItem('galaxy_token');

    toast({
      title: "Disconnected",
      description: "Disconnected from Galaxy instance",
    });
  }, []);

  const fetchHistories = useCallback(async (token?: string, baseUrl?: string) => {
    const currentToken = token || bearerToken;
    const currentBaseUrl = baseUrl || config?.baseUrl;

    if (!currentToken || !currentBaseUrl) {
      console.error('No token or base URL available');
      return;
    }

    try {
      const response = await fetch(`${currentBaseUrl}/api/histories/`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'USER-API-TOKEN': currentToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch histories: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setHistories(data);
    } catch (error) {
      console.error('Error fetching histories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Galaxy histories",
        variant: "destructive",
      });
    }
  }, [bearerToken, config?.baseUrl]);

  const fetchHistoryContents = useCallback(async (historyId: string) => {
    if (!bearerToken || !config?.baseUrl) {
      console.error('No token or base URL available');
      return;
    }

    try {
      const response = await fetch(`${config.baseUrl}/api/histories/${historyId}/contents`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'USER-API-TOKEN': bearerToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch history contents: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setHistoryContents(data);
      return data;
    } catch (error) {
      console.error('Error fetching history contents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch history contents",
        variant: "destructive",
      });
      return null;
    }
  }, [bearerToken, config?.baseUrl]);

  const createHistory = useCallback(async (name: string) => {
    if (!bearerToken || !config?.baseUrl) {
      console.error('No token or base URL available');
      return null;
    }

    try {
      const response = await fetch(`${config.baseUrl}/api/histories/create?name=${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'USER-API-TOKEN': bearerToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create history: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Refresh histories list
      await fetchHistories();
      
      toast({
        title: "History Created",
        description: `"${name}" has been created successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating history:', error);
      toast({
        title: "Error",
        description: "Failed to create Galaxy history",
        variant: "destructive",
      });
      return null;
    }
  }, [bearerToken, config?.baseUrl, fetchHistories]);

  const selectHistory = useCallback(async (history: GalaxyHistory) => {
    setSelectedHistory(history);
    await fetchHistoryContents(history.id);
  }, [fetchHistoryContents]);

    // Upload file to a history
    const uploadFileToHistory = useCallback(
      async (historyId: string, file: File) => {
        if (!bearerToken || !config?.baseUrl) {
          toast({
            title: "Error",
            description: "Not connected to Galaxy.",
            variant: "destructive",
          });
          return null;
        }
        try {
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch(`${config.baseUrl}/api/histories/${historyId}/upload-file`, {
            method: "POST",
            headers: {
              "accept": "application/json",
              "USER-API-TOKEN": bearerToken,
              // Do NOT set Content-Type, browser will set it for multipart
            },
            body: formData,
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data?.message || "Upload failed");
          }
          toast({
            title: "File Uploaded",
            description: data?.message || "File uploaded successfully.",
          });
          // Optionally refresh contents
          await fetchHistoryContents(historyId);
          return data;
        } catch (error) {
          toast({
            title: "Upload Error",
            description: error instanceof Error ? error.message : "Failed to upload file.",
            variant: "destructive",
          });
          return null;
        }
      },
      [bearerToken, config?.baseUrl, fetchHistoryContents]
    );

      // Upload collection to a history
      const uploadCollectionToHistory = useCallback(
        async (
          historyId: string,
          files: File[],
          collectionType: string,
          collectionName: string,
          structure: string
        ) => {
          if (!bearerToken || !config?.baseUrl) {
            toast({
              title: "Error",
              description: "Not connected to Galaxy.",
              variant: "destructive",
            });
            return null;
          }
          try {
            const formData = new FormData();
            files.forEach(file => formData.append("files", file));
            formData.append("collection_type", collectionType);
            formData.append("collection_name", collectionName);
            formData.append("structure", structure);
            const response = await fetch(`${config.baseUrl}/api/histories/${historyId}/upload-collection`, {
              method: "POST",
              headers: {
                "accept": "application/json",
                "USER-API-TOKEN": bearerToken,
                // Do NOT set Content-Type, browser will set it for multipart
              },
              body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data?.message || "Upload failed");
            }
            toast({
              title: "Collection Uploaded",
              description: `Collection '${collectionName}' uploaded successfully.`,
            });
            await fetchHistoryContents(historyId);
            return data;
          } catch (error) {
            toast({
              title: "Upload Error",
              description: error instanceof Error ? error.message : "Failed to upload collection.",
              variant: "destructive",
            });
            return null;
          }
        },
        [bearerToken, config?.baseUrl, fetchHistoryContents]
      );

  // Download a dataset by id
  const downloadDataset = useCallback(async (datasetId: string) => {
    if (!config?.baseUrl || !bearerToken) {
      toast({ title: "Error", description: "Missing Galaxy config or token", variant: "destructive" });
      return;
    }
    const url = `${config.baseUrl}/api/histories/download?dataset_ids=${datasetId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "USER-API-TOKEN": bearerToken,
        },
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      let filename = "downloaded_file";
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Download Started", description: filename });
    } catch (error) {
      toast({ title: "Download Error", description: error instanceof Error ? error.message : "Failed to download.", variant: "destructive" });
    }
  }, [config, bearerToken]);

  // Download a collection by id
  const downloadCollection = useCallback(async (collectionId: string) => {
    if (!config?.baseUrl || !bearerToken) {
      toast({ title: "Error", description: "Missing Galaxy config or token", variant: "destructive" });
      return;
    }
    const url = `${config.baseUrl}/api/histories/download?collection_ids=${collectionId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "USER-API-TOKEN": bearerToken,
        },
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      let filename = "downloaded_file";
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Download Started", description: filename });
    } catch (error) {
      toast({ title: "Download Error", description: error instanceof Error ? error.message : "Failed to download.", variant: "destructive" });
    }
  }, [config, bearerToken]);

  return {
    // State
    isConnected,
    loading,
    histories,
    selectedHistory,
    historyContents,
    config,

    // Actions
    connectToGalaxy,
    disconnectFromGalaxy,
    fetchHistories,
    fetchHistoryContents,
    createHistory,
    selectHistory,
    uploadFileToHistory,
    uploadCollectionToHistory,
    downloadDataset,
    downloadCollection,
  };
};
