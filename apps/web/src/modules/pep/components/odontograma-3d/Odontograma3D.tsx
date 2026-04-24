// cspell:disable
import { memo } from "react";
import { ToothDetailDialog } from "../ToothDetailDialog";
import { useOdontograma3D } from "./useOdontograma3D";
import { StatusSelector } from "./StatusSelector";
import { OdontogramaCanvas } from "./OdontogramaCanvas";
import { StatsCard } from "./StatsCard";
import { LoadingState } from "./LoadingState";

interface Odontograma3DProps {
  prontuarioId: string;
}

export const Odontograma3D = memo(({ prontuarioId }: Odontograma3DProps) => {
  const {
    teethData,
    isLoading,
    selectedStatus,
    setSelectedStatus,
    selectedTooth,
    isDetailDialogOpen,
    handleToothClick,
    handleToothRightClick,
    handleUpdateToothStatus,
    handleUpdateToothSurface,
    handleUpdateToothNotes,
    closeDetailDialog,
    resetOdontograma,
    getStatusCount,
  } = useOdontograma3D(prontuarioId);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <ToothDetailDialog
        tooth={selectedTooth}
        open={isDetailDialogOpen}
        onClose={closeDetailDialog}
        onUpdateStatus={handleUpdateToothStatus}
        onUpdateSurface={handleUpdateToothSurface}
        onUpdateNotes={handleUpdateToothNotes}
      />

      <div className="space-y-4">
        <StatusSelector
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onReset={resetOdontograma}
        />

        <OdontogramaCanvas
          teethData={teethData}
          selectedStatus={selectedStatus}
          onToothClick={handleToothClick}
          onToothRightClick={handleToothRightClick}
        />

        <StatsCard getStatusCount={getStatusCount} />
      </div>
    </>
  );
});
