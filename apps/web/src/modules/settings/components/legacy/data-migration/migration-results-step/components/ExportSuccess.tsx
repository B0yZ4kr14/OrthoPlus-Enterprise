import { CheckCircle2 } from "lucide-react";

interface ExportSuccessProps {
  title?: string;
  message?: string;
}

export function ExportSuccess({
  title = "Exportação Concluída!",
  message = "Os dados foram exportados com sucesso. O arquivo foi baixado para seu computador.",
}: ExportSuccessProps) {
  return (
    <div className="space-y-6 text-center">
      <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
