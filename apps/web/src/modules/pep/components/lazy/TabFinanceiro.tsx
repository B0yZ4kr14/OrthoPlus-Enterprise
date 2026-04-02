import { Suspense, lazy } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

const FinanceiroContent = lazy(() => import("../tabs/FinanceiroContent"));

export function TabFinanceiro({ patientId }: { patientId: string }) {
  return (
    <Suspense fallback={<LoadingState message="Carregando financeiro..." />}>
      <FinanceiroContent patientId={patientId} />
    </Suspense>
  );
}
