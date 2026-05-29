// cspell:disable
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useOdontograma } from "../../hooks/useOdontograma";
import type {
  ToothData,
  ToothStatus,
  ToothSurface,
} from "../../types/odontograma.types";
import { TOOTH_STATUS_LABELS } from "../../types/odontograma.types";

export function useOdontograma3D(prontuarioId: string) {
  const {
    teethData,
    isLoading,
    updateToothStatus,
    updateToothSurface,
    updateToothNotes,
    resetOdontograma,
    getStatusCount,
  } = useOdontograma(prontuarioId);

  const [selectedStatus, setSelectedStatus] = useState<ToothStatus>("higido");
  const [selectedTooth, setSelectedTooth] = useState<ToothData | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleToothClick = useCallback(
    (toothNumber: number) => {
      updateToothStatus(toothNumber, selectedStatus);
      toast.success(
        `Dente ${toothNumber} marcado como ${TOOTH_STATUS_LABELS[selectedStatus]}`,
      );
    },
    [updateToothStatus, selectedStatus],
  );

  const handleToothRightClick = useCallback(
    (toothNumber: number) => {
      const tooth = teethData[toothNumber];
      if (tooth) {
        setSelectedTooth(tooth);
        setIsDetailDialogOpen(true);
      }
    },
    [teethData],
  );

  const handleUpdateToothStatus = useCallback(
    (status: ToothStatus) => {
      if (selectedTooth) {
        updateToothStatus(selectedTooth.number, status);
        setSelectedTooth((prev) => (prev ? { ...prev, status } : null));
      }
    },
    [selectedTooth, updateToothStatus],
  );

  const handleUpdateToothSurface = useCallback(
    (surface: ToothSurface, status: ToothStatus) => {
      if (selectedTooth) {
        updateToothSurface(selectedTooth.number, surface, status);
        setSelectedTooth((prev) =>
          prev
            ? {
                ...prev,
                surfaces: { ...prev.surfaces, [surface]: status },
              }
            : null,
        );
      }
    },
    [selectedTooth, updateToothSurface],
  );

  const handleUpdateToothNotes = useCallback(
    (notes: string) => {
      if (selectedTooth) {
        updateToothNotes(selectedTooth.number, notes);
        setSelectedTooth((prev) => (prev ? { ...prev, notes } : null));
        toast.success("Observações salvas");
      }
    },
    [selectedTooth, updateToothNotes],
  );

  const closeDetailDialog = useCallback(() => {
    setIsDetailDialogOpen(false);
  }, []);

  return {
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
  };
}
