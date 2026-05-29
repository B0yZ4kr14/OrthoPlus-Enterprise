import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ConversionHistoryItem } from "./types";
import { formatBRL } from "./types";

interface ConversionsHistoryProps {
  conversions: ConversionHistoryItem[];
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export function ConversionsHistory({
  conversions,
  onExportCSV,
  onExportPDF,
}: ConversionsHistoryProps) {
  return (
    <Card depth="normal">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Histórico de Conversões</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Relatório PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {conversions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma conversão realizada ainda
            </p>
          ) : (
            conversions.map((conv) => (
              <div
                key={conv.id}
                className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{conv.fromCoin}</Badge>
                    <span className="text-xs text-muted-foreground">→</span>
                    <Badge variant="outline">{conv.toCoin}</Badge>
                  </div>
                  <Badge
                    variant={conv.type === "gain" ? "success" : "destructive"}
                  >
                    {conv.type === "gain" ? "Ganho" : "Perda"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantidade</p>
                    <p className="font-semibold">{conv.amount.toFixed(8)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor BRL</p>
                    <p className="font-semibold">{formatBRL(conv.valueBRL)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(conv.date, "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
