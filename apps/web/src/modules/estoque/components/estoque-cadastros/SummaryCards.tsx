// cspell:disable
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Package, Users, Building2 } from "lucide-react";
import type { SummaryData } from "./types";

interface SummaryCardsProps {
  data: SummaryData;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card variant="elevated" className="hover-scale">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Produtos Cadastrados
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.produtosCount}</div>
          <p className="text-xs text-muted-foreground">
            {data.produtosAtivos} ativos
          </p>
        </CardContent>
      </Card>

      <Card variant="elevated" className="hover-scale">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.fornecedoresCount}</div>
          <p className="text-xs text-muted-foreground">
            {data.fornecedoresAtivos} ativos no sistema
          </p>
        </CardContent>
      </Card>

      <Card variant="elevated" className="hover-scale">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categorias</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.categoriasCount}</div>
          <p className="text-xs text-muted-foreground">Grupos de produtos</p>
        </CardContent>
      </Card>
    </div>
  );
}
