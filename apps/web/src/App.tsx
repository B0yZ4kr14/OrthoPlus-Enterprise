import { Toaster as Sonner } from "@orthoplus/core-ui/sonner";
import { TooltipProvider } from "@orthoplus/core-ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useHotkeys } from "@/hooks/useHotkeys";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { initPerformanceMonitoring } from "@/lib/performance";
import AppRoutes from "./routes/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

if (typeof window !== "undefined") {
  initPerformanceMonitoring();
}

function HotkeysManager() {
  useHotkeys();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <HotkeysManager />
          <PerformanceMonitor />
          <AuthProvider>
            <ModulesProvider>
              <Sonner />
              <AppRoutes />
            </ModulesProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
