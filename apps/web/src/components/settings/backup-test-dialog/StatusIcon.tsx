// cspell:disable
import { Loader2, Info, CheckCircle2, XCircle } from "lucide-react";
import type { TestResult } from "./types";

interface StatusIconProps {
  testing: boolean;
  testResult: TestResult | null;
}

export function StatusIcon({ testing, testResult }: StatusIconProps) {
  if (testing) return <Loader2 className="h-5 w-5 animate-spin text-info" />;
  if (!testResult) return <Info className="h-5 w-5 text-muted-foreground" />;
  if (testResult.success) return <CheckCircle2 className="h-5 w-5 text-success" />;
  return <XCircle className="h-5 w-5 text-destructive" />;
}

export function getStatusColor(testResult: TestResult | null): string {
  if (!testResult) return "border-border";
  return testResult.success ? "border-success/50" : "border-destructive/50";
}
