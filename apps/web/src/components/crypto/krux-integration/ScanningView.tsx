import { QrCode } from "lucide-react";

export function ScanningView() {
  return (
    <div className="flex items-center justify-center p-8 bg-muted rounded-lg animate-pulse">
      <QrCode className="h-16 w-16 text-muted-foreground" />
    </div>
  );
}
