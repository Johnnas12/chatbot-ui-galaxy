import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCwIcon, UploadIcon } from "lucide-react";
import { useGalaxy } from "@/hooks/useGalaxy";

interface Props {
  historyId: string;
}

const FileUploadForm = ({ historyId }: Props) => {
  const { uploadFileToHistory } = useGalaxy();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    await uploadFileToHistory(historyId, file);
    setUploading(false);
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-4">
      <Input
        type="file"
        name="file"
        accept="*"
        required
        onChange={e => setFile(e.target.files?.[0] || null)}
        disabled={uploading}
      />
      <Button type="submit" disabled={uploading || !file} className="flex items-center gap-2">
        {uploading ? <RefreshCwIcon className="h-4 w-4 animate-spin" /> : <UploadIcon className="h-4 w-4" />}
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
};

export default FileUploadForm;