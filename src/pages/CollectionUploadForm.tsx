import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCwIcon, FolderPlusIcon } from "lucide-react";
import { useGalaxy } from "@/hooks/useGalaxy";

interface Props {
  historyId: string;
}

const CollectionUploadForm = ({ historyId }: Props) => {
  const { uploadCollectionToHistory } = useGalaxy();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [collectionType, setCollectionType] = useState("list");
  const [collectionName, setCollectionName] = useState("");
  const [structure, setStructure] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length || !collectionName || !structure) return;
    setUploading(true);
    await uploadCollectionToHistory(historyId, files, collectionType, collectionName, structure);
    setUploading(false);
    setFiles([]);
    setCollectionName("");
    setStructure("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4 p-2 border rounded bg-muted/30">
      <div className="flex gap-2 items-center">
        <Input
          type="file"
          name="files"
          multiple
          required
          onChange={e => setFiles(Array.from(e.target.files || []))}
          disabled={uploading}
        />
        <Input
          type="text"
          name="collectionName"
          placeholder="Collection Name"
          value={collectionName}
          onChange={e => setCollectionName(e.target.value)}
          required
          disabled={uploading}
        />
        <select
          name="collectionType"
          value={collectionType}
          onChange={e => setCollectionType(e.target.value)}
          required
          disabled={uploading}
          className="border rounded px-2 py-1 bg-background text-foreground"
        >
          <option value="list">list</option>
          <option value="paired">paired</option>
          <option value="list:paired">list:paired</option>
        </select>
      </div>
      <Input
        type="text"
        name="structure"
        placeholder='Structure (e.g. [["sample1_R1.fq", "sample1_R2.fq"], ["sample2_R1.fq", "sample2_R2.fq"]])'
        value={structure}
        onChange={e => setStructure(e.target.value)}
        required
        disabled={uploading}
      />
      <Button type="submit" disabled={uploading || !files.length || !collectionName || !structure} className="flex items-center gap-2">
        {uploading ? <RefreshCwIcon className="h-4 w-4 animate-spin" /> : <FolderPlusIcon className="h-4 w-4" />}
        {uploading ? "Uploading..." : "Upload Collection"}
      </Button>
    </form>
  );
};

export default CollectionUploadForm;