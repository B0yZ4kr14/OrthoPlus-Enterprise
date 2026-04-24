import { CheckCircle, XCircle } from "lucide-react";

interface ConsentCardProps {
  title: string;
  description: string;
  consented: boolean;
  date?: string;
}

export function ConsentCard({
  title,
  description,
  consented,
  date,
}: ConsentCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        {date && (
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(date).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>
      {consented ? (
        <CheckCircle className="h-6 w-6 text-success" />
      ) : (
        <XCircle className="h-6 w-6 text-destructive" />
      )}
    </div>
  );
}
