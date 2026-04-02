import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

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

interface PatientUser {
  id: string;
  email: string;
  role: "PATIENT";
}

interface AuthContextType {
  user: User | PatientUser | null;
  session: Session | string | null;
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
  const [session, setSession] = useState<Session | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"ADMIN" | "MEMBER" | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [availableClinics, setAvailableClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [activeModules, setActiveModules] = useState<string[]>([]); // Lista de module_keys ativos

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

      // Definir role (ADMIN ou MEMBER)
      const role = roleData?.role || "MEMBER";
      setUserRole(role as "ADMIN" | "MEMBER");
      setUserProfile(role as UserProfile);

      // Update user object with avatar and full_name (only for User type)
      setUser((currentUser) => {
        if (!currentUser || "role" in currentUser) return currentUser;
        return {
          ...currentUser,
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
      console.error("Error fetching user metadata:", error);
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
      console.error("Error fetching active modules:", error);
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
          setSession(data.session || "active");
          setUser(data.user);
          fetchUserMetadata(data.user.id);
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setClinicId(null);
        }
      } catch (error) {
        setSession(null);
        setUser(null);
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
      toast.error("Erro ao criar conta", { description: (error as ApiError).message });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{
        access_token?: string;
        user?: User;
      }>("/auth/token", { email, password });

      // The backend sets an HttpOnly cookie on successful login.
      // We only need to update the in-memory state here.
      setSession(response.access_token ?? "active");
      setUser(response.user ?? null);
      toast.success("Login realizado com sucesso!");

      if (response.user?.id) {
        fetchUserMetadata(response.user.id);
      }

      return { error: null };
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage = err.response?.data?.error || err.message;
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
      setSession(data.access_token || data.token || null);
      setUserProfile("PATIENT");

      toast.success("Bem-vindo ao Portal do Paciente!");
      return { error: null };
    } catch (error: unknown) {
      toast.error("Erro ao fazer login: " + (error as ApiError).message);
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
      toast.success("Logout realizado com sucesso");
    } catch (error: unknown) {
      toast.error("Erro ao sair", { description: (error as ApiError).message });
    }
  };

  const hasRole = (role: "ADMIN" | "MEMBER") => {
    return userRole === role;
  };

  const hasModuleAccess = (moduleKey: string) => {
    // Check if module is active for the clinic
    const isModuleActive = activeModules.includes(moduleKey);

    // ADMIN can see all active modules
    if (userRole === "ADMIN") {
      return isModuleActive;
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
        signIn,
        signInPatient,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthAPI() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
