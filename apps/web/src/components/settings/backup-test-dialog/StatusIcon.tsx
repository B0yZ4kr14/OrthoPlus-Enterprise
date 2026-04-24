// cspell:disable
import { Loader2, Info, CheckCircle2, XCircle } from "lucide-react";
import type { TestResult } from "./types";

interface StatusIconProps {
  testing: boolean;
  testResult: TestResult | null;
}

export function StatusIcon({ testing, testResult }: StatusIconProps) {
  if (testing) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
  if (!testResult) return <Info className="h-5 w-5 text-muted-foreground" />;
  if (testResult.success) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
}

export function getStatusColor(testResult: TestResult | null): string {
  if (!testResult) return "border-border";
  return testResult.success ? "border-green-500/50" : "border-red-500/50";
}
