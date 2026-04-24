// cspell:disable
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import type { ToothStatus } from "../../types/odontograma.types";
import {
  TOOTH_STATUS_COLORS,
  TOOTH_STATUS_LABELS,
} from "../../types/odontograma.types";

interface StatusSelectorProps {
  selectedStatus: ToothStatus;
  onStatusChange: (status: ToothStatus) => void;
  onReset: () => void;
}

const TOOTH_STATUS_KEYS = Object.keys(TOOTH_STATUS_COLORS) as ToothStatus[];

export function StatusSelector({
  selectedStatus,
  onStatusChange,
  onReset,
}: StatusSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione o Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {TOOTH_STATUS_KEYS.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              onClick={() => onStatusChange(status)}
              className="flex items-center gap-2"
            >
              <div
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: TOOTH_STATUS_COLORS[status] }}
              />
              {TOOTH_STATUS_LABELS[status]}
            </Button>
          ))}
          <Button variant="destructive" onClick={onReset}>
            Resetar Odontograma
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
