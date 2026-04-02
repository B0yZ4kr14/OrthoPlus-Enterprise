import { Card, CardContent } from "@orthoplus/core-ui/card";
import { LucideIcon } from "lucide-react";

interface QuickStatProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  color: string;
}

export function DashboardQuickStats({
  label,
  value,
  icon: Icon,
  trend,
  trendPositive,
  color,
}: QuickStatProps) {
  return (
    <Card
      className="border-l-4 transition-all hover:shadow-md"
      style={{ borderLeftColor: color }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p
                className={`text-xs ${trendPositive ? "text-green-600" : "text-red-600"}`}
              >
                {trend}
              </p>
            )}
          </div>
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: color + "20" }}
          >
            <Icon className="h-8 w-8" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
