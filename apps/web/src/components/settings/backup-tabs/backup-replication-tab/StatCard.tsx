import { Card } from "@orthoplus/core-ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  iconColorClass: string;
  bgColorClass: string;
  label: string;
  value: number;
}

export function StatCard({ icon: Icon, iconColorClass, bgColorClass, label, value }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgColorClass}`}>
          <Icon className={`h-6 w-6 ${iconColorClass}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
