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
    const response = await fetch(`/api/files/${id}/download`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();
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
