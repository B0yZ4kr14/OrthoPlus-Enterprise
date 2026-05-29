import type { DentalCampaign } from "@/types/patient-crm";

interface CampaignDetailsProps {
  campaign: DentalCampaign | null;
}

export function CampaignDetails({ campaign }: CampaignDetailsProps) {
  if (!campaign) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
      <p className="font-medium">Detalhes da Campanha</p>
      <p className="text-muted-foreground">
        Investimento: R$ {campaign.investimento_total.toLocaleString("pt-BR")}
      </p>
      <p className="text-muted-foreground">
        Leads Gerados: {campaign.leads_gerados}
      </p>
      <p className="text-muted-foreground">
        Pacientes Convertidos: {campaign.pacientes_convertidos}
      </p>
      <p className="text-muted-foreground">ROI: {campaign.roi.toFixed(1)}%</p>
    </div>
  );
}
