import { Suspense, lazy } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

const DocumentosContent = lazy(() => import("../tabs/DocumentosContent"));

export function TabDocumentos({ patientId }: { patientId: string }) {
  return (
    <Suspense fallback={<LoadingState message="Carregando documentos..." />}>
      <DocumentosContent patientId={patientId} />
    </Suspense>
  );
}
