// cspell:disable
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Key, FileSignature, Clock, CheckCircle } from "lucide-react";
import type { KpiData } from "./types";

interface KpiCardsProps {
  data: KpiData;
}

export function KpiCards({ data }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Certificados Ativos
          </CardTitle>
          <Key className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.certificadosAtivos}</div>
          <p className="text-xs text-muted-foreground">
            {data.certificadosExpirando} expiram em 30 dias
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Docs Assinados (Mês)
          </CardTitle>
          <FileSignature className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.docsAssinadosMes}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-success">+{data.docsAssinadosVariacao}%</span>{" "}
            vs. mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Aguardando Assinatura
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.aguardandoAssinatura}</div>
          <p className="text-xs text-muted-foreground">
            {data.aguardandoPrazoProximo} com prazo próximo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taxa de Conformidade
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.taxaConformidade}%</div>
          <p className="text-xs text-muted-foreground">
            Todas assinaturas válidas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
