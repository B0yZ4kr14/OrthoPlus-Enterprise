/**
 * API Client - Cliente HTTP para comunicação com backend Node.js
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      withCredentials: true, // Send HttpOnly cookies with every request
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Response interceptor — log errors but do NOT show toast here.
    // Callers (AuthContext, hooks) handle their own user-facing toasts.
    // Showing toast here causes double-toast on every error.
    // 401s are expected when user is not logged in — silenced in dev.
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (import.meta.env.DEV) {
          const status = error.response?.status;
          // Silently ignore 401s (expected when not logged in)
          if (status === 401) {
            return Promise.reject(error);
          }
          // API errors are handled by callers
        }
        return Promise.reject(error);
      },
    );
  }

  /** Extract a user-friendly error message from an AxiosError. */
  getErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
      return error instanceof Error ? error.message : "Erro desconhecido";
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { error?: string } | undefined;

      switch (status) {
        case 400:
          return data?.error || "Dados inválidos";
        case 401:
          return "Sessão expirada. Faça login novamente.";
        case 403:
          return "Acesso negado";
        case 404:
          return "Recurso não encontrado";
        case 412:
          return data?.error || "Pré-condições não atendidas";
        case 429:
          return "Muitas requisições. Aguarde alguns instantes.";
        case 500:
          return "Erro interno do servidor";
        default:
          return data?.error || "Erro desconhecido";
      }
    } else if (error.request) {
      return "Erro de conexão. Verifique sua internet.";
    }
    return error.message || "Erro desconhecido";
  }

  // — HTTP methods with proper typing (no ts-expect-error) —

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
