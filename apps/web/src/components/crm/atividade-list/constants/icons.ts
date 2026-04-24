import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  MapPin,
} from "lucide-react";
import type { AtividadeTipo } from "../types";

export const tipoIcons: Record<AtividadeTipo, React.ElementType<{ className?: string }>> = {
  LIGACAO: Phone,
  EMAIL: Mail,
  REUNIAO: Calendar,
  WHATSAPP: MessageSquare,
  VISITA: MapPin,
  OUTRO: Calendar,
};
