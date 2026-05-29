// cspell:disable
import { Canvas } from "@react-three/fiber";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Info } from "lucide-react";
import { ToothArcade } from "./ToothArcade";
import type { ToothData, ToothStatus } from "../../types/odontograma.types";

interface OdontogramaCanvasProps {
  teethData: Record<number, ToothData>;
  selectedStatus: ToothStatus;
  onToothClick: (toothNumber: number) => void;
  onToothRightClick: (toothNumber: number) => void;
}

export function OdontogramaCanvas({
  teethData,
  selectedStatus,
  onToothClick,
  onToothRightClick,
}: OdontogramaCanvasProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Odontograma 3D Interativo</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Clique direito para detalhes</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] bg-muted rounded-lg border border-border">
          <Canvas shadows>
            <ToothArcade
              teethData={teethData}
              selectedStatus={selectedStatus}
              onToothClick={onToothClick}
              onToothRightClick={onToothRightClick}
            />
          </Canvas>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Controles:</strong> Clique esquerdo para marcar o status
            selecionado.
            <strong>
              {" "}
              Clique direito para editar faces específicas e adicionar
              observações.
            </strong>{" "}
            Use o mouse para rotacionar (arrastar), aproximar/afastar (scroll) e
            mover (botão direito + arrastar) a visualização.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
