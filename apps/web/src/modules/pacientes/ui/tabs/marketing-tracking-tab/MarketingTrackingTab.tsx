import { Card, CardContent } from "@orthoplus/core-ui/card";
import type { MarketingTrackingTabProps } from "./types";
import type { MarketingField } from "./types";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingField as MarketingFieldComponent } from "./MarketingField";

const MARKETING_FIELDS: MarketingField[] = [
  {
    name: "marketing_campaign",
    label: "Campanha",
    placeholder: "Ex: Demanda Espontânea, Black Friday 2024",
    description: "Identificação da campanha de marketing que gerou o contato",
    icon: "target",
  },
  {
    name: "marketing_source",
    label: "Origem (Canal de Captação)",
    placeholder: "Ex: tlmkt ativo, Google Ads, Instagram, Indicação",
    description: "Canal de marketing que originou o contato",
    icon: "megaphone",
  },
  {
    name: "marketing_event",
    label: "Evento",
    placeholder: "Ex: Ação Migração, Feira Odontológica, Webinar",
    description: "Ação específica de captação que gerou o contato",
    icon: "calendar",
  },
  {
    name: "marketing_promoter",
    label: "Promotor",
    placeholder: "Nome do responsável pela promoção",
    description: "Profissional responsável pela ação de captação",
    icon: "user",
  },
  {
    name: "marketing_telemarketing_agent",
    label: "Operador de Telemarketing",
    placeholder: "Nome do operador de telemarketing",
    description: "Operador responsável pelo contato telefônico",
    icon: "phone",
  },
];

export function MarketingTrackingTab({ form }: MarketingTrackingTabProps) {
  return (
    <Card>
      <MarketingHeader />
      <CardContent className="space-y-4">
        {MARKETING_FIELDS.map((field) => (
          <MarketingFieldComponent key={field.name} form={form} field={field} />
        ))}
      </CardContent>
    </Card>
  );
}
