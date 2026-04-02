import { Suspense, lazy } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

const AnamneseContent = lazy(() => import("../tabs/AnamneseContent"));

export function TabAnamnese() {
  return (
    <Suspense fallback={<LoadingState message="Carregando anamnese..." />}>
      <AnamneseContent />
    </Suspense>
  );
}
