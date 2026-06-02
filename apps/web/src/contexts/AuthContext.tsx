import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";

import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

/** Safe localStorage wrapper to avoid direct storage access in business logic */
const safeStorage = {
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("[AuthContext.safeStorage.removeItem] failed:", error);
    }
  },
  key(index: number): string | null {
    try {
      return localStorage.key(index);
    } catch (error) {
      console.error("[AuthContext.safeStorage.key] failed:", error);
      return null;
    }
  },
  get length(): number {
    try {
      return localStorage.length;
    } catch (error) {
      console.error("[AuthContext.safeStorage.length] failed:", error);
      return 0;
    }
  },
};

interface Clinic {
  id: string;
  name: string;
}

/** Minimal shape of an error object caught in async handlers. */
interface ApiError {
  message?: string;
  response?: { data?: { error?: string } };
}

// Local user type that mirrors what the API returns
export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  role?: string;
  created_at?: string;
}

// Local session type that mirrors what the API returns
export interface Session {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: number;
  refresh_token?: string;
  user?: User;
}

type UserProfile = "ADMIN" | "MEMBER" | "PATIENT";

export interface PatientUser {
  id: string;
  email: string;
  role: "PATIENT";
}

export interface AuthContextType {
  user: User | PatientUser | null;
  session: Session | null;
  loading: boolean;
  userRole: "ADMIN" | "MEMBER" | null;
  userProfile: UserProfile | null;
  clinicId: string | null;
  isAdmin: boolean;
  isMember: boolean;
  isPatient: boolean;
  availableClinics: Clinic[];
  selectedClinic: Clinic | null;
  userPermissions: string[];
  activeModules: string[]; // List of active module keys for the clinic
  switchClinic: (clinicId: string) => void;
  hasRole: (role: "ADMIN" | "MEMBER") => boolean;
  hasModuleAccess: (moduleKey: string) => boolean;
  fetchUserMetadata: (userId: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: unknown }>;
  registerStaffUser: (payload: {
    email: string;
    password: string;
    full_name: string;
  }) => Promise<{ user?: User; error: unknown }>;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signInPatient: (
    email: string,
    password: string,
  ) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | PatientUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"ADMIN" | "MEMBER" | null>(null);
  const userRoleRef = useRef<"ADMIN" | "MEMBER" | null>(null);
  useEffect(() => {
    userRoleRef.current = userRole;
  }, [userRole]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [availableClinics, setAvailableClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [activeModules, setActiveModules] = useState<string[]>([]); // Lista de module_keys ativos
  // NOTE: Dual source of truth — AuthContext holds module keys (string[]) for fast access control.
  // ModulesContext (below in provider tree) holds full Module objects for configuration UI.
  // Future refactor: delegate hasModuleAccess() to useModulesContext() when safe to do so.

  // Derived state moved to bottom to avoid redeclaration

  // Fetch user role and clinics
  const fetchUserMetadata = useCallback(async (userId: string) => {
    try {
      // Get user metadata including profile, role and clinics
      const response = await apiClient.get<{
        roleData?: { role?: string };
        profileData?: {
          clinic_id?: string;
          avatar_url?: string;
          full_name?: string;
        };
        clinicData?: Clinic;
        permissionsData?: string[];
      }>(`/auth/user/${userId}/metadata`);
      const { roleData, profileData, clinicData, permissionsData } = response;

      if (profileData?.clinic_id) {
        setClinicId(profileData.clinic_id);

        if (clinicData) {
          setSelectedClinic(clinicData);
          setAvailableClinics([clinicData]);
        }
      }

      // Definir role (ADMIN ou MEMBER) — mapear ROOT → ADMIN
      // Preservar userRole existente (setado pelo /auth/me ou login) quando roleData nao esta presente
      const rawRole = roleData?.role || userRoleRef.current || "MEMBER";
      const role = rawRole === "ROOT" ? "ADMIN" : rawRole;
      setUserRole(role as "ADMIN" | "MEMBER");
      setUserProfile(role as UserProfile);

      // Update user object with avatar and full_name (only for User type)
      setUser((currentUser) => {
        if (!currentUser || "role" in currentUser) return currentUser;
        return {
          ...currentUser,
          full_name:
            profileData?.full_name ||
            ((currentUser as User).user_metadata?.full_name as
              | string
              | undefined),
          avatar_url: profileData?.avatar_url,
          user_metadata: {
            ...(currentUser as User).user_metadata,
            avatar_url: profileData?.avatar_url,
            full_name:
              profileData?.full_name ||
              (currentUser as User).user_metadata?.full_name,
          },
        };
      });

      // If ADMIN, grant access to all modules
      if (role === "ADMIN") {
        setUserPermissions(["ALL"]);

        // Fetch active modules for admin
        if (profileData?.clinic_id) {
          await fetchActiveModules(profileData.clinic_id);
        }
      } else {
        if (permissionsData) {
          setUserPermissions(permissionsData);
        }

        // Fetch active modules for member
        if (profileData?.clinic_id) {
          await fetchActiveModules(profileData.clinic_id);
        }
      }
    } catch (error) {
      // Log error for debugging but don't show to user
      console.error("[AuthContext] fetchUserMetadata failed:", error);
    }
  }, []);

  // Fetch active modules for the clinic
  const fetchActiveModules = async (clinicId: string) => {
    try {
      const moduleKeys = await apiClient.get<string[]>(
        `/clinics/${clinicId}/active-modules`,
      );
      setActiveModules(moduleKeys || []);
    } catch (error) {
      // Log error for debugging but don't show to user
      console.error("[AuthContext] fetchActiveModules failed:", error);
    }
  };

  const switchClinic = (newClinicId: string) => {
    const clinic = availableClinics.find((c) => c.id === newClinicId);
    if (clinic) {
      setSelectedClinic(clinic);
      setClinicId(clinic.id);
      // Fetch active modules for the new clinic
      fetchActiveModules(clinic.id);
      toast.success(`Clínica alterada para: ${clinic.name}`);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await apiClient.get<{ user?: User; session?: string }>(
          "/auth/me",
        );
        if (data && data.user) {
          setSession(
            data.session
              ? { access_token: data.session }
              : null,
          );
          setUser(data.user);

          // Set role immediately from /auth/me response (fallback if fetchUserMetadata fails)
          const meRole = data.user.role;
          if (meRole) {
            const normalizedRole = meRole === "ROOT" ? "ADMIN" : meRole;
            setUserRole(normalizedRole as "ADMIN" | "MEMBER");
            setUserProfile(normalizedRole as UserProfile);
          }

          fetchUserMetadata(data.user.id);
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setClinicId(null);
        }
      } catch {
        // 401 expected when not logged in — cookies are HttpOnly, handled by backend
        setSession(null);
        setUser(null);
        setUserRole(null);
        setClinicId(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [fetchUserMetadata]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await apiClient.post("/auth/register", { email, password, fullName });
      toast.success("Conta criada com sucesso!", {
        description: "Você já pode fazer login.",
      });
      return { error: null };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Tente novamente.";
      toast.error("Erro ao criar conta", { description: msg });
      return { error };
    }
  };

  const registerStaffUser = async (payload: {
    email: string;
    password: string;
    full_name: string;
  }) => {
    try {
      const data = await apiClient.post<{ user?: User }>(
        "/auth/register",
        payload,
      );
      return { user: data.user, error: null };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Tente novamente.";
      toast.error("Erro ao criar usuário", { description: msg });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{
        access_token?: string;
        accessToken?: string;
        user?: User;
      }>("/auth/token", { email, password });

      const token = response.access_token || response.accessToken;
      // Cookie-only session: when user exists but no token in response,
      // the backend is using HttpOnly cookies
      setSession(
        token
          ? { access_token: token }
          : response.user
            ? { access_token: "cookie" }
            : null,
      );
      setUser(response.user ?? null);

      // Set role immediately from login response (fallback if fetchUserMetadata fails)
      const loginRole = response.user?.role;
      if (loginRole) {
        const normalizedRole = loginRole === "ROOT" ? "ADMIN" : loginRole;
        setUserRole(normalizedRole as "ADMIN" | "MEMBER");
        setUserProfile(normalizedRole as UserProfile);
      }

      toast.success("Login realizado com sucesso!");

      if (response.user?.id) {
        fetchUserMetadata(response.user.id);
      }

      return { error: null };
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage =
        err.response?.data?.error || err.message || "Erro desconhecido";
      toast.error("Erro ao fazer login", { description: errorMessage });
      return { error };
    }
  };

  const signInPatient = async (email: string, password: string) => {
    try {
      const data = await apiClient.post<{
        access_token?: string;
        token?: string;
        sessionId?: string;
        user?: User;
        patient?: User;
      }>("/auth/patient-auth", {
        action: "login",
        email,
        password,
      });

      setUser(data.user || data.patient || null);
      setSession(
        data.access_token
          ? { access_token: data.access_token }
          : data.token
            ? { access_token: data.token }
            : null,
      );
      setUserProfile("PATIENT");

      toast.success("Bem-vindo ao Portal do Paciente!");
      return { error: null };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao fazer login: " + msg);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.post("/auth/logout", {});
      // The backend clears the HttpOnly cookie on logout.
      setSession(null);
      setUser(null);
      setUserRole(null);
      setClinicId(null);
      // Clear legacy tokens from localStorage (migration to HttpOnly cookies)
      safeStorage.removeItem("accessToken");
      safeStorage.removeItem("refreshToken");
      safeStorage.removeItem("auth_token");
      safeStorage.removeItem("token");
      // Clear sidebar state from localStorage to prevent cross-user leakage
      const keysToRemove: string[] = [];
      for (let i = 0; i < safeStorage.length; i++) {
        const key = safeStorage.key(i);
        if (key && key.startsWith("orthoplus:sidebar:groups")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => safeStorage.removeItem(key));
      toast.success("Logout realizado com sucesso");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao sair", { description: msg });
    }
  };

  const hasRole = (role: "ADMIN" | "MEMBER") => {
    return userRole === role;
  };

  const hasModuleAccess = (moduleKey: string) => {
    // If user role hasn't loaded yet, allow access to prevent UI flicker
    // during initial load. Role-based restrictions apply once role is known.
    if (!userRole) return true;

    // Admin-only items are always visible to ADMINs (not real modules in backend catalog)
    if (moduleKey === "ADMIN_ONLY" && userRole === "ADMIN") return true;

    // Check if module is active for the clinic (case-insensitive comparison)
    const normalizedKey = moduleKey.toLowerCase();
    const isModuleActive = activeModules.some(
      (m) => m.toLowerCase() === normalizedKey,
    );

    // ADMIN can see all active modules; if no modules configured yet, allow access (fallback)
    if (userRole === "ADMIN") {
      return activeModules.length === 0 ? true : isModuleActive;
    }

    // MEMBER needs both module active AND user permission
    if (userRole === "MEMBER") {
      const hasPermission =
        userPermissions.includes("ALL") ||
        userPermissions.includes(moduleKey.toLowerCase());
      return isModuleActive && hasPermission;
    }

    return false;
  };

  // Derived state
  const isAdmin = userProfile === "ADMIN";
  const isMember = userProfile === "MEMBER";
  const isPatient = userProfile === "PATIENT";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userRole,
        userProfile,
        clinicId,
        isAdmin,
        isMember,
        isPatient,
        availableClinics,
        selectedClinic,
        userPermissions,
        activeModules,
        switchClinic,
        hasRole,
        hasModuleAccess,
        fetchUserMetadata,
        signUp,
        registerStaffUser,
        signIn,
        signInPatient,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
