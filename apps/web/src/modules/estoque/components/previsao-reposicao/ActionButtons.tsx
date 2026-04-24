// cspell:disable
import { CalendarDays, Mail, Loader2 } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";

interface ActionButtonsProps {
  eventosCount: number;
  hasPrevisoes: boolean;
  sendingEmail: boolean;
  onOpenEventos: () => void;
  onEnviarEmail: () => void;
}

export function ActionButtons({
  eventosCount,
  hasPrevisoes,
  sendingEmail,
  onOpenEventos,
  onEnviarEmail,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onOpenEventos}>
        <CalendarDays className="w-4 h-4 mr-2" />
        Eventos Futuros ({eventosCount})
      </Button>
      {hasPrevisoes && (
        <Button
          onClick={onEnviarEmail}
          disabled={sendingEmail}
          variant="outline"
          size="sm"
        >
          {sendingEmail ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Enviar Alertas
            </>
          )}
        </Button>
      )}
    </div>
  );
}
