import { useRef, useState } from "react";
import {
  useFileVersions,
  useCreateVersion,
  useRestoreVersion,
  type FileRecord,
  type FileVersion,
} from "@/hooks/api/useFiles";
import { Button } from "@orthoplus/core-ui";
import { Badge } from "@orthoplus/core-ui";
import { ScrollArea } from "@orthoplus/core-ui/scroll-area";
import { Loader2, Upload, RotateCcw, Clock, User, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils/date.utils";

interface FileVersionPanelProps {
  file: FileRecord;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function VersionItem({
  version,
  isCurrent,
  onRestore,
  isRestoring,
}: {
  version: FileVersion;
  isCurrent: boolean;
  onRestore: () => void;
  isRestoring: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md border ${
        isCurrent ? "bg-info/5 border-info/20" : "bg-background border-gray-100"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5">
          {isCurrent ? (
            <Badge variant="info" className="text-xs">Atual</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">v{version.numeroVersao}</Badge>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Versão {version.numeroVersao}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDateTime(version.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {version.createdBy}
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatSize(version.tamanhoBytes)}
            </span>
          </div>
        </div>
      </div>

      {!isCurrent && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRestore}
          disabled={isRestoring}
        >
          {isRestoring ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <RotateCcw className="mr-1 h-3 w-3" />
              Restaurar
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function FileVersionPanel({ file }: FileVersionPanelProps) {
  const { data: versions, isLoading } = useFileVersions(file.id);
  const createVersion = useCreateVersion();
  const restoreVersion = useRestoreVersion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploadingFile(selectedFile);

    try {
      await createVersion.mutateAsync({ fileId: file.id, file: selectedFile });
      toast.success("Nova versão enviada com sucesso");
    } catch (err) {
      toast.error("Erro ao enviar nova versão");
      console.error(err);
    } finally {
      setUploadingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRestore = async (versionId: string) => {
    try {
      await restoreVersion.mutateAsync({ fileId: file.id, versionId });
      toast.success("Versão restaurada com sucesso");
    } catch (err) {
      toast.error("Erro ao restaurar versão");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando versões...</span>
      </div>
    );
  }

  const sortedVersions = versions
    ? [...versions].sort((a, b) => b.numeroVersao - a.numeroVersao)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Histórico de Versões</h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={createVersion.isPending}
          >
            {createVersion.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Nova Versão
          </Button>
        </div>
      </div>

      {uploadingFile && (
        <div className="text-xs text-muted-foreground">
          Enviando: {uploadingFile.name} ({formatSize(uploadingFile.size)})
        </div>
      )}

      {sortedVersions.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          Nenhuma versão anterior encontrada.
        </div>
      ) : (
        <ScrollArea className="h-72">
          <div className="space-y-2 pr-3">
            {sortedVersions.map((version, index) => (
              <VersionItem
                key={version.id}
                version={version}
                isCurrent={index === 0}
                onRestore={() => handleRestore(version.id)}
                isRestoring={restoreVersion.isPending}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
