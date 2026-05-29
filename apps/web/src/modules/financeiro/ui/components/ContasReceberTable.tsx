import React from "react";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@orthoplus/core-ui/table";
import { Calendar, CreditCard, Mail, Send } from "lucide-react";
import { formatDate } from "@/lib/utils/date.utils";
import type { ContaReceber } from "@/modules/financeiro/types/financeiro-completo.types";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

function getStatusBadge(status: string) {
  const variants: Record<
    string,
    { label: string; variant: "success" | "warning" | "error" | "secondary" }
  > = {
    pago: { label: "Pago", variant: "success" },
    pendente: { label: "Pendente", variant: "warning" },
    atrasado: { label: "Atrasado", variant: "error" },
    parcial: { label: "Pagamento Parcial", variant: "secondary" },
    cancelado: { label: "Cancelado", variant: "secondary" },
  };
  const config = variants[status] || variants.pendente;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

interface ContasReceberTableProps {
  contas: ContaReceber[];
  sendingCobranca: string | null;
  onEnviarCobranca: (contaId: string, tipo: "EMAIL" | "WHATSAPP") => void;
  onOpenPayment: (conta: ContaReceber) => void;
}

export function ContasReceberTable({
  contas,
  sendingCobranca,
  onEnviarCobranca,
  onOpenPayment,
}: ContasReceberTableProps) {
  return (
    <Table aria-label="Tabela de contas a receber">
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contas.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center text-muted-foreground"
            >
              Nenhuma conta encontrada
            </TableCell>
          </TableRow>
        ) : (
          contas.map((conta) => (
            <TableRow key={conta.id}>
              <TableCell className="font-medium">
                {conta.patient_name}
              </TableCell>
              <TableCell>{conta.descricao}</TableCell>
              <TableCell>
                {formatBRL(conta.valor)}
                {conta.valor_pago &&
                  conta.valor_pago > 0 &&
                  conta.valor_pago < conta.valor && (
                    <div className="text-xs text-muted-foreground">
                      Pago: {formatBRL(conta.valor_pago)}
                    </div>
                  )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {formatDate(conta.data_vencimento)}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(conta.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  {conta.status === "atrasado" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        title="Enviar cobrança por Email"
                        aria-label={`Enviar cobrança por email para ${conta.patient_name}`}
                        onClick={() =>
                          conta.id && onEnviarCobranca(conta.id, "EMAIL")
                        }
                        disabled={sendingCobranca === conta.id}
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        title="Enviar cobrança por WhatsApp"
                        aria-label={`Enviar cobrança por WhatsApp para ${conta.patient_name}`}
                        onClick={() =>
                          conta.id && onEnviarCobranca(conta.id, "WHATSAPP")
                        }
                        disabled={sendingCobranca === conta.id}
                      >
                        <Send className="h-4 w-4" aria-hidden="true" />
                        WhatsApp
                      </Button>
                    </>
                  )}
                  {conta.status !== "pago" && conta.status !== "cancelado" && (
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2"
                      title="Registrar recebimento"
                      aria-label={`Receber pagamento de ${conta.patient_name}`}
                      onClick={() => onOpenPayment(conta)}
                    >
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                      Receber
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
