import { useFileOCR, useRequestOCR, type FileRecord } from "@/hooks/api/useFiles";
import { Button } from "@orthoplus/core-ui";
import { Badge } from "@orthoplus/core-ui";
import { Loader2, FileText, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FileOCRPanelProps {
  file: FileRecord;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDENTE: { label: "Pendente", variant: "secondary" },
  PROCESSANDO: { label: "Processando", variant: "default" },
  CONCLUIDO: { label: "Concluído", variant: "outline" },
  ERRO: { label: "Erro", variant: "destructive" },
};

export function FileOCRPanel({ file }: FileOCRPanelProps) {
  const { data: ocr, isLoading } = useFileOCR(file.id);
  const requestOCR = useRequestOCR();

  const handleRequestOCR = async () => {
    try {
      await requestOCR.mutateAsync(file.id);
      toast.success("OCR iniciado com sucesso");
    } catch (err) {
      toast.error("Erro ao iniciar OCR");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando OCR...</span>
      </div>
    );
  }

  const status = ocr?.status ?? file.ocrStatus ?? "PENDENTE";
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDENTE;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Extração de Texto (OCR)</h3>
        </div>
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
      </div>

      {status === "CONCLUIDO" && ocr?.textoExtraido ? (
        <div className="rounded-md border bg-gray-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-xs text-success font-medium">Texto extraído com sucesso</span>
            {ocr.confidence && (
              <span className="text-xs text-muted-foreground">
                (confiança: {(ocr.confidence * 100).toFixed(1)}%)
              </span>
            )}
          </div>
          <pre className="text-xs text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto font-mono leading-relaxed">
            {ocr.textoExtraido}
          </pre>
        </div>
      ) : status === "PROCESSANDO" ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processando OCR... Isso pode levar alguns minutos.
        </div>
      ) : status === "ERRO" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Falha ao extrair texto do documento.
          </div>
          <Button variant="outline" size="sm" onClick={handleRequestOCR} disabled={requestOCR.isPending}>
            {requestOCR.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Tentar Novamente
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            O texto deste documento ainda não foi extraído. Inicie o OCR para permitir busca por conteúdo.
          </p>
          <Button variant="outline" size="sm" onClick={handleRequestOCR} disabled={requestOCR.isPending}>
            {requestOCR.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Iniciar OCR
          </Button>
        </div>
      )}
    </div>
  );
}
