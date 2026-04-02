import { ContaReceber } from "@/domain/entities/ContaReceber";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContasReceberListProps {
  contas: ContaReceber[];
  loading: boolean;
  onReceber: (
    contaId: string,
    valorPago?: number,
    formaPagamento?: string,
  ) => Promise<void>;
}

export function ContasReceberList({
  contas,
  loading,
  onReceber,
}: ContasReceberListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">Carregando contas a receber...</div>
    );
  }

  if (contas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhuma conta a receber encontrada
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (conta: ContaReceber) => {
    if (conta.isRecebida()) {
      return (
        <Badge variant="default" className="bg-success">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Recebida
        </Badge>
      );
    }
    if (conta.isVencida()) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Vencida
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        Pendente
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {contas.map((conta) => (
        <Card key={conta.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">{conta.descricao}</CardTitle>
                {conta.patientId && (
                  <p className="text-sm text-muted-foreground">
                    Paciente: {conta.patientId}
                  </p>
                )}
              </div>
              {getStatusBadge(conta)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(conta.valor)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vencimento:{" "}
                  {format(conta.dataVencimento, "dd/MM/yyyy", { locale: ptBR })}
                </p>
                {conta.dataPagamento && (
                  <p className="text-sm text-success">
                    Recebido em:{" "}
                    {format(conta.dataPagamento, "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                )}
              </div>
              {conta.isPendente() && (
                <Button
                  onClick={() => onReceber(conta.id, conta.valor, "DINHEIRO")}
                  size="sm"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Receber
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
