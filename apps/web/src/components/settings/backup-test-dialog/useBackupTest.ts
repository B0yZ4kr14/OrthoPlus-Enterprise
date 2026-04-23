// cspell:disable
import { useState } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import type { TestResult } from "./types";

export function useBackupTest(backupId: string) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [progress, setProgress] = useState(0);

  const runTest = async () => {
    setTesting(true);
    setProgress(0);
    setTestResult(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 500);

      const data = await apiClient.post<TestResult>("/backups/manager", {
        backupId,
        testEnvironment: "sandbox",
      });

      clearInterval(progressInterval);
      setProgress(100);
      setTestResult(data);

      if (data.success) {
        toast.success("Teste de restauração concluído com sucesso!");
      } else {
        toast.error(`Teste falhou: ${data.testsFailed} erro(s) encontrado(s)`);
      }
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      logger.error("Error running backup test:", error);
      toast.error("Erro ao executar teste de restauração");
      setTestResult({
        success: false,
        backupId,
        testsRun: 1,
        testsPassed: 0,
        testsFailed: 1,
        errors: [_e.message || "Erro desconhecido"],
        duration: 0,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTesting(false);
    }
  };

  return { testing, testResult, progress, runTest };
}
