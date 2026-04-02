import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Keyboard, Command } from "lucide-react";
import { Badge } from "@orthoplus/core-ui/badge";

const hotkeys = [
  {
    category: "Navegação Geral",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Abrir busca global" },
      { keys: ["?"], description: "Abrir ajuda de atalhos" },
      { keys: ["⌘", "D"], description: "Ir para Dashboard" },
      { keys: ["⌘", "S"], description: "Ir para Configurações" },
    ],
  },
  {
    category: "Cadastros",
    shortcuts: [
      { keys: ["⌘", "P"], description: "Ir para Pacientes" },
      { keys: ["⌘", "F"], description: "Ir para Financeiro" },
    ],
  },
  {
    category: "Clínica",
    shortcuts: [
      { keys: ["⌘", "A"], description: "Ir para Agenda" },
      { keys: ["⌘", "E"], description: "Ir para Prontuário (PEP)" },
      { keys: ["⌘", "O"], description: "Ir para Orçamentos" },
    ],
  },
  {
    category: "Gestão",
    shortcuts: [
      { keys: ["⌘", "R"], description: "Ir para Relatórios" },
      { keys: ["⌘", "C"], description: "Ir para CRM" },
    ],
  },
];

export function HotkeysHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        // Só abre se não estiver em um input
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setOpen((open) => !open);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="h-6 w-6 text-primary" />
            Atalhos de Teclado
          </DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar rapidamente pelo sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {hotkeys.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, sidx) => (
                  <div
                    key={sidx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, kidx) => (
                        <Badge
                          key={kidx}
                          variant="outline"
                          className="px-2 py-1 font-mono text-xs"
                        >
                          {key === "⌘" ? <Command className="h-3 w-3" /> : key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Dica:</strong> No Windows/Linux use{" "}
            <Badge variant="outline" className="mx-1 font-mono text-xs">
              Ctrl
            </Badge>
            ao invés de{" "}
            <Badge variant="outline" className="mx-1 font-mono text-xs">
              <Command className="h-3 w-3 inline" />
            </Badge>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
