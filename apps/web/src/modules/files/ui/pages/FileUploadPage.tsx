import { useState, useCallback } from "react";
import { useUploadFile } from "@/hooks/api/useFiles";
import { Button } from "@orthoplus/core-ui";
import { Upload, File, X, Check } from "lucide-react";
import { toast } from "sonner";

const CATEGORIAS = [
  { value: "RADIOGRAFIA", label: "Radiografia" },
  { value: "FOTO", label: "Foto" },
  { value: "RECEITA", label: "Receita" },
  { value: "CONTRATO", label: "Contrato" },
  { value: "OUTRO", label: "Outro" },
];

const VISIBILIDADES = [
  {
    value: "PUBLICO",
    label: "Público",
    description: "Visível para todos os usuários",
  },
  {
    value: "RESTRITO",
    label: "Restrito",
    description: "Visível apenas para staff da clínica",
  },
  {
    value: "CONFIDENCIAL",
    label: "Confidencial",
    description: "Visível apenas para administradores",
  },
];

export default function FileUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [categoria, setCategoria] = useState("OUTRO");
  const [visibilidade, setVisibilidade] = useState("RESTRITO");
  const [pacienteId, setPacienteId] = useState("");
  const uploadMutation = useUploadFile();

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Selecione pelo menos um arquivo");
      return;
    }

    for (const file of files) {
      try {
        await uploadMutation.mutateAsync({
          file,
          categoria,
          visibilidade,
          pacienteId: pacienteId || undefined,
        });
        toast.success(`"${file.name}" enviado com sucesso`);
      } catch (error) {
        toast.error(`Erro ao enviar "${file.name}"`);
        console.error(error);
      }
    }

    setFiles([]);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Upload de Documentos</h1>

      <div className="bg-background rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Visibilidade
            </label>
            <select
              value={visibilidade}
              onChange={(e) => setVisibilidade(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              title={
                VISIBILIDADES.find((v) => v.value === visibilidade)?.description
              }
            >
              {VISIBILIDADES.map((vis) => (
                <option key={vis.value} value={vis.value}>
                  {vis.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              ID do Paciente (opcional)
            </label>
            <input
              type="text"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              placeholder="uuid do paciente"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            Arraste arquivos aqui ou{" "}
            <label className="text-info cursor-pointer hover:underline">
              clique para selecionar
              <input
                type="file"
                multiple
                onChange={onFileSelect}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-sm text-muted-foreground/70">
            PDF, JPG, PNG, DOCX, XLSX (max 50MB)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-background rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Arquivos selecionados ({files.length})
          </h2>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-muted/50 rounded"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Enviar {files.length} arquivo{files.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
