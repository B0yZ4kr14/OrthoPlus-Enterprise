import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/infrastructure/di/bootstrap";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { registerServiceWorker } from "./lib/sync/register-sync";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

// Service Worker disabled due to SSL certificate issues in production
// registerServiceWorker();
