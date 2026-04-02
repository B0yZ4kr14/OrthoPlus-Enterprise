import { Suspense, lazy } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

// Lazy load do componente 3D pesado
const Odontograma3D = lazy(() => import("../Odontograma3D"));

interface Odontograma3DLazyProps {
  patientId: string;
  onToothClick?: (toothNumber: number) => void;
}

export function Odontograma3DLazy({
  patientId,
  onToothClick,
}: Odontograma3DLazyProps) {
  return (
    <Suspense
      fallback={
        <LoadingState
          message="Carregando visualizador 3D..."
          subMessage="Isso pode levar alguns segundos na primeira vez"
        />
      }
    >
      <Odontograma3D patientId={patientId} onToothClick={onToothClick} />
    </Suspense>
  );
}

export default Odontograma3DLazy;
