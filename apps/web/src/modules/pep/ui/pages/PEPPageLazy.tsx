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
          subMessage="Preparando módulos de odontograma e histórico"
          className="min-h-[60vh]"
        />
      }
    >
      <PEPPageOriginal />
    </Suspense>
  );
}
