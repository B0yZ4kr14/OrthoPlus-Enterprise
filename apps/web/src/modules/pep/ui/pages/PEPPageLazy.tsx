import { Suspense, lazy } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

// Lazy load do PEPPage original
const PEPPageOriginal = lazy(() => import("./PEPPage"));

export default function PEPPage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          message="Carregando Prontuário Eletrônico..."
          // @ts-expect-error — TS17001
          message="Preparando módulos de odontograma e histórico"
          className="min-h-[60vh]"
        />
      }
    >
      <PEPPageOriginal />
    </Suspense>
  );
}
