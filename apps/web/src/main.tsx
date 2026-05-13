import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/infrastructure/di/bootstrap";
import { registerServiceWorker } from "./lib/sync/register-sync";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Service Worker disabled due to SSL certificate issues in production
// registerServiceWorker();
