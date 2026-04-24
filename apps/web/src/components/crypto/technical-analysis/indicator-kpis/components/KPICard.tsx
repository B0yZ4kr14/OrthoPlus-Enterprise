import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";

interface KPICardProps {
  title: string;
  value: string;
  badgeText: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success";
  icon: React.ReactNode;
}

export function KPICard({ title, value, badgeText, badgeVariant, icon }: KPICardProps) {
  return (
    <Card depth="normal">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <Badge variant={badgeVariant} className="mt-2">
              {badgeText}
            </Badge>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
