/**
 * useAuth Hook
 * Hook para autenticação com backend Node.js
 * Uses HttpOnly cookies set by the backend — no localStorage token management.
 */

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: "ADMIN" | "MEMBER";
  clinicId: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    clinicId: string;
  };
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    apiClient
      .get("/auth/user")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsCheckingAuth(false));
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await apiClient.post<AuthResponse>("/auth/login", credentials);
    },
    onSuccess: () => {
      // Backend sets HttpOnly cookie on success — no token handling needed here
      setIsAuthenticated(true);
      toast.success("Login realizado com sucesso!");
    },
    onError: () => {
      toast.error("Falha no login. Verifique suas credenciais.");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await apiClient.post<AuthResponse>("/auth/register", data);
    },
    onSuccess: () => {
      // Backend sets HttpOnly cookie on success — no token handling needed here
      setIsAuthenticated(true);
      toast.success("Cadastro realizado com sucesso!");
    },
    onError: () => {
      toast.error("Falha no cadastro. Tente novamente.");
    },
  });

  const logout = async () => {
    try {
      // Clear the HttpOnly cookie server-side
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore errors during logout
    }
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  return {
    isAuthenticated,
    isCheckingAuth,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
