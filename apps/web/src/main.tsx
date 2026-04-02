import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/sync/register-sync";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the Service Worker for offline-first capabilities.
// This is a fire-and-forget operation — errors are handled inside registerServiceWorker().
if (import.meta.env.PROD) {
  registerServiceWorker();
}
