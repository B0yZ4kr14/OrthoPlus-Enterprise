import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";

export interface FileRecord {
  id: string;
  nomeOriginal: string;
  mimeType: string;
  tamanhoBytes: number;
  categoria: string;
  visibilidade: string;
  pacienteId: string | null;
  createdAt: string;
  ocrStatus?: "PENDENTE" | "PROCESSANDO" | "CONCLUIDO" | "ERRO" | null;
}

export interface FileOCR {
  id: string;
  arquivoId: string;
  textoExtraido: string | null;
  status: "PENDENTE" | "PROCESSANDO" | "CONCLUIDO" | "ERRO";
  idioma: string | null;
  confidence: number | null;
  createdAt: string;
}

export interface FileVersion {
  id: string;
  arquivoId: string;
  numeroVersao: number;
  nomeStorage: string;
  tamanhoBytes: number;
  createdBy: string;
  createdAt: string;
}

export interface UploadFileInput {
  file: File;
  pacienteId?: string;
  consultaId?: string;
  orcamentoId?: string;
  categoria?: string;
  visibilidade?: string;
}

export interface FileListFilters {
  pacienteId?: string;
  consultaId?: string;
  orcamentoId?: string;
  categoria?: string;
  visibilidade?: string;
}

const FILES_QUERY_KEY = "files";

interface FilesResponse {
  data: FileRecord[];
  count: number;
}

export function useFiles(filters?: FileListFilters) {
  return useQuery<FilesResponse>({
    queryKey: [FILES_QUERY_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.pacienteId) params.append("pacienteId", filters.pacienteId);
      if (filters?.consultaId) params.append("consultaId", filters.consultaId);
      if (filters?.orcamentoId) params.append("orcamentoId", filters.orcamentoId);
      if (filters?.categoria) params.append("categoria", filters.categoria);
      if (filters?.visibilidade) params.append("visibilidade", filters.visibilidade);

      const query = params.toString();
      const url = `/files${query ? `?${query}` : ""}`;

      return await apiClient.get<FilesResponse>(url);
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadFileInput) => {
      const formData = new FormData();
      formData.append("file", input.file);
      if (input.pacienteId) formData.append("pacienteId", input.pacienteId);
      if (input.consultaId) formData.append("consultaId", input.consultaId);
      if (input.orcamentoId) formData.append("orcamentoId", input.orcamentoId);
      if (input.categoria) formData.append("categoria", input.categoria);
      if (input.visibilidade) formData.append("visibilidade", input.visibilidade);

      const response = await apiClient.post<{ data: FileRecord }>("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FILES_QUERY_KEY] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FILES_QUERY_KEY] });
    },
  });
}

export function useDownloadFile() {
  return async (id: string, nomeOriginal: string) => {
    const blob = await apiClient.get<Blob>(`/files/${id}/download`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", nomeOriginal);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };
}

// ── OCR Hooks ──

export function useFileOCR(fileId: string) {
  return useQuery<FileOCR>({
    queryKey: ["files", fileId, "ocr"],
    queryFn: async () => {
      return await apiClient.get<FileOCR>(`/files/${fileId}/ocr`);
    },
    enabled: !!fileId,
  });
}

export function useRequestOCR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      return await apiClient.post<FileOCR>(`/files/${fileId}/ocr`);
    },
    onSuccess: (_data, fileId) => {
      queryClient.invalidateQueries({ queryKey: ["files", fileId, "ocr"] });
      queryClient.invalidateQueries({ queryKey: [FILES_QUERY_KEY] });
    },
  });
}

export interface SearchFilesByTextResult {
  id: string;
  nomeOriginal: string;
  mimeType: string;
  categoria: string;
  visibilidade: string;
  snippet: string;
  ocrStatus: string | null;
}

export function useSearchFilesByText(query: string) {
  return useQuery<SearchFilesByTextResult[]>({
    queryKey: ["files", "search", query],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("query", query);
      return await apiClient.get<SearchFilesByTextResult[]>(`/files/search?${params.toString()}`);
    },
    enabled: query.length >= 2,
  });
}

// ── Versioning Hooks ──

export function useFileVersions(fileId: string) {
  return useQuery<FileVersion[]>({
    queryKey: ["files", fileId, "versions"],
    queryFn: async () => {
      return await apiClient.get<FileVersion[]>(`/files/${fileId}/versions`);
    },
    enabled: !!fileId,
  });
}

export interface CreateVersionInput {
  fileId: string;
  file: File;
}

export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVersionInput) => {
      const formData = new FormData();
      formData.append("file", input.file);

      return await apiClient.post<FileVersion>(`/files/${input.fileId}/versions`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["files", input.fileId, "versions"] });
      queryClient.invalidateQueries({ queryKey: [FILES_QUERY_KEY] });
    },
  });
}

export interface RestoreVersionInput {
  fileId: string;
  versionId: string;
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RestoreVersionInput) => {
      return await apiClient.post<FileVersion>(
        `/files/${input.fileId}/versions/${input.versionId}/restore`,
      );
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["files", input.fileId, "versions"] });
      queryClient.invalidateQueries({ queryKey: [FILES_QUERY_KEY] });
    },
  });
}
