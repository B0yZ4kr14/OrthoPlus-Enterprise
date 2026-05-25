import { useState } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

interface CommandHistory {
  command: string;
  output: string;
  exitCode: number;
  timestamp: Date;
}

export const useTerminalPage = () => {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCommand = async (command: string, clinicId?: string) => {
    if (!command.trim()) return;

    setIsExecuting(true);
    try {
      const data = await apiClient.post<{
        output: { stdout: string; stderr: string; exitCode: number };
      }>("/terminal/execute", {
        sessionId: crypto.randomUUID(),
        command,
      });

      const entry: CommandHistory = {
        command,
        output: data.output.stdout + (data.output.stderr ? "\n" + data.output.stderr : ""),
        exitCode: data.output.exitCode,
        timestamp: new Date(),
      };

      setHistory((prev) => [...prev, entry]);

      if (data.output.exitCode !== 0) {
        toast.error("Comando falhou");
      } else {
        toast.success("Comando executado");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setHistory((prev) => [
        ...prev,
        { command, output: `Error: ${errorMessage}`, exitCode: 1, timestamp: new Date() },
      ]);
      toast.error("Erro ao executar comando");
    } finally {
      setIsExecuting(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success("Histórico limpo");
  };

  return {
    history,
    isExecuting,
    executeCommand,
    clearHistory,
  };
};
