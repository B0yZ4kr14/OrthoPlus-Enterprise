import { useState } from "react";
import {
  useFiles,
  useDeleteFile,
  useDownloadFile,
  type FileRecord,
} from "@/hooks/api/useFiles";
import { FileOCRPanel } from "../components/FileOCRPanel";
import { FileVersionPanel } from "../components/FileVersionPanel";
import { FileSearchOCR } from "../components/FileSearchOCR";
import { Button } from "@orthoplus/core-ui";
import { Badge } from "@orthoplus/core-ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import {
  File,
  Trash2,
  Download,
  Upload,
  FileText,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatDateTime } from "@/lib/utils/date.utils";

const CATEGORIAS: Record<string, string> = {
  RADIOGRAFIA: "Radiografia",
  FOTO: "Foto",
  RECEITA: "Receita",
  CONTRATO: "Contrato",
  OUTRO: "Outro",
};

const VISIBILIDADE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  PUBLICO: { label: "Público", className: "bg-success/10 text-success" },
  RESTRITO: { label: "Restrito", className: "bg-warning/10 text-warning" },
  CONFIDENCIAL: {
    label: "Confidencial",
    className: "bg-destructive/10 text-destructive",
  },
};

const OCR_STATUS_CONFIG: Record<string, { label: string; className: string }> =
  {
    PENDENTE: {
      label: "Pendente",
      className: "bg-muted text-muted-foreground",
    },
    PROCESSANDO: {
      label: "Processando",
      className: "bg-warning/10 text-warning",
    },
    CONCLUIDO: { label: "Concluído", className: "bg-success/10 text-success" },
    ERRO: { label: "Erro", className: "bg-destructive/10 text-destructive" },
  };

export default function FileListPage() {
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const filesQuery = useFiles(
    categoriaFilter ? { categoria: categoriaFilter } : undefined,
  );
  const deleteMutation = useDeleteFile();
  const downloadFile = useDownloadFile();

  const [selectedFileForOCR, setSelectedFileForOCR] =
    useState<FileRecord | null>(null);
  const [selectedFileForVersions, setSelectedFileForVersions] =
    useState<FileRecord | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Arquivo excluído com sucesso");
    } catch (err) {
      toast.error("Erro ao excluir arquivo");
      toast.error("Erro ao processar arquivo");
    }
  };

  const handleDownload = async (id: string, nomeOriginal: string) => {
    try {
      await downloadFile(id, nomeOriginal);
      toast.success("Download iniciado");
    } catch (err) {
      toast.error("Erro ao baixar arquivo");
      toast.error("Erro ao processar arquivo");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return formatDateTime(dateString);
  };

  if (filesQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Carregando arquivos...</div>
      </div>
    );
  }

  if (filesQuery.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-destructive">
          Erro ao carregar arquivos
        </div>
      </div>
    );
  }

  const files = filesQuery.data?.data ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Documentos</h1>
        <Link to="/files/upload">
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Novo Upload
          </Button>
        </Link>
      </div>

      <div className="bg-background rounded-lg shadow p-4 mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filtrar por categoria:</label>
          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {Object.entries(CATEGORIAS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <FileSearchOCR />
      </div>

      {files.length === 0 ? (
        <div className="bg-background rounded-lg shadow p-12 text-center">
          <File className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Nenhum documento encontrado</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Faça o upload do primeiro documento
          </p>
        </div>
      ) : (
        <div className="bg-background rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                  Visibilidade
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                  OCR
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                  Tamanho
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                  Data
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {files.map((file: FileRecord) => (
                <tr key={file.id} className="hover:bg-muted">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {file.nomeOriginal}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.mimeType}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-info/10 text-info">
                      {CATEGORIAS[file.categoria] ?? file.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const vis = VISIBILIDADE_CONFIG[file.visibilidade];
                      return vis ? (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${vis.className}`}
                        >
                          {vis.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                          {file.visibilidade}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const ocr =
                        OCR_STATUS_CONFIG[file.ocrStatus ?? "PENDENTE"];
                      return (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ocr.className}`}
                        >
                          {ocr.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatSize(file.tamanhoBytes)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(file.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedFileForOCR(file)}
                        className="p-2 hover:bg-muted rounded-md"
                        title="OCR"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setSelectedFileForVersions(file)}
                        className="p-2 hover:bg-muted rounded-md"
                        title="Versões"
                      >
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(file.id, file.nomeOriginal)
                        }
                        className="p-2 hover:bg-muted rounded-md"
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 hover:bg-destructive/5 rounded-md"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={!!selectedFileForOCR}
        onOpenChange={(open) => !open && setSelectedFileForOCR(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>OCR — {selectedFileForOCR?.nomeOriginal}</DialogTitle>
          </DialogHeader>
          {selectedFileForOCR && <FileOCRPanel file={selectedFileForOCR} />}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedFileForVersions}
        onOpenChange={(open) => !open && setSelectedFileForVersions(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Versões — {selectedFileForVersions?.nomeOriginal}
            </DialogTitle>
          </DialogHeader>
          {selectedFileForVersions && (
            <FileVersionPanel file={selectedFileForVersions} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
