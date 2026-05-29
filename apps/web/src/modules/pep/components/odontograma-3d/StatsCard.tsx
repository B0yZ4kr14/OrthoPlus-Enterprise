// cspell:disable
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  TOOTH_STATUS_COLORS,
  TOOTH_STATUS_LABELS,
  ToothStatus,
} from "../../types/odontograma.types";

interface StatsCardProps {
  getStatusCount: (status: ToothStatus) => number;
}

const TOOTH_STATUS_KEYS = Object.keys(TOOTH_STATUS_COLORS) as ToothStatus[];

export function StatsCard({ getStatusCount }: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {TOOTH_STATUS_KEYS.map((status) => (
            <div key={status} className="text-center">
              <Badge variant="outline" className="w-full justify-center mb-2">
                {TOOTH_STATUS_LABELS[status]}
              </Badge>
              <p className="text-2xl font-bold">{getStatusCount(status)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
