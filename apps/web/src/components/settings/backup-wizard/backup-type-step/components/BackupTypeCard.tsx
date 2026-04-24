import { Check } from "lucide-react";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import type { BackupType } from "../types";

interface BackupTypeCardProps {
  type: BackupType;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export function BackupTypeCard({
  title,
  description,
  isSelected,
  onClick,
}: BackupTypeCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? "border-primary bg-primary/5" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {isSelected && <Check className="h-5 w-5 text-primary" />}
          </div>
          <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
