import { Suspense, lazy } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

const OdontogramaContent = lazy(() => import("../tabs/OdontogramaContent"));

export function TabOdontograma({ patientId }: { patientId: string }) {
  return (
    <Suspense fallback={<LoadingState message="Carregando odontograma..." />}>
      <OdontogramaContent patientId={patientId} />
    </Suspense>
  );
}
