import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useHotkeys() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if Ctrl (Windows/Linux) or Cmd (Mac) is pressed
      if (!(e.ctrlKey || e.metaKey)) return;

      // Prevent default browser shortcuts
      const hotkeys: Record<string, { path: string; label: string }> = {
        d: { path: "/dashboard", label: "Dashboard" },
        p: { path: "/pacientes", label: "Pacientes" },
        a: { path: "/agenda", label: "Agenda" },
        e: { path: "/pep", label: "Prontuário (PEP)" },
        f: { path: "/financeiro", label: "Financeiro" },
        o: { path: "/orcamentos", label: "Orçamentos" },
        c: { path: "/crm", label: "CRM" },
        r: { path: "/relatorios", label: "Relatórios" },
        s: { path: "/configuracoes", label: "Configurações" },
      };

      const hotkey = hotkeys[e.key.toLowerCase()];
      if (hotkey) {
        e.preventDefault();
        navigate(hotkey.path);
        toast.success(`Navegando para ${hotkey.label}`, {
          description: `Atalho: ${e.ctrlKey ? "Ctrl" : "Cmd"} + ${e.key.toUpperCase()}`,
          duration: 2000,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
