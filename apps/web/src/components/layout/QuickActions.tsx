import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@orthoplus/core-ui/dropdown-menu";
import { Button } from "@orthoplus/core-ui/button";
import {
  Plus,
  UserPlus,
  CalendarPlus,
  ShoppingCart,
  FileSpreadsheet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild data-tour="action-cards">
        <Button
          variant="default"
          size="icon"
          data-testid="quick-actions-btn"
          className="shadow-[0_0_12px_hsl(var(--interactive)/0.25)] hover:shadow-[0_0_16px_hsl(var(--interactive)/0.35)] transition-shadow duration-300"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 glass-card border-border/50 p-2"
      >
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
          Ações Rápidas
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-border/50" />
        <DropdownMenuItem
          onClick={() => navigate("/pacientes/novo")}
          className="gap-3 px-2 py-2.5 cursor-pointer rounded-md"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-interactive/10">
            <UserPlus className="h-4 w-4 text-interactive" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Novo Paciente</span>
            <span className="text-xs text-muted-foreground">
              Cadastrar paciente
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/agenda?action=new")}
          className="gap-3 px-2 py-2.5 cursor-pointer rounded-md"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-interactive/10">
            <CalendarPlus className="h-4 w-4 text-interactive" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Agendar Consulta</span>
            <span className="text-xs text-muted-foreground">
              Nova consulta odontológica
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/pdv")}
          className="gap-3 px-2 py-2.5 cursor-pointer rounded-md"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-interactive/10">
            <ShoppingCart className="h-4 w-4 text-interactive" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Nova Venda (PDV)</span>
            <span className="text-xs text-muted-foreground">
              Realizar venda rápida
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/orcamentos/novo")}
          className="gap-3 px-2 py-2.5 cursor-pointer rounded-md"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-interactive/10">
            <FileSpreadsheet className="h-4 w-4 text-interactive" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Novo Orçamento</span>
            <span className="text-xs text-muted-foreground">
              Criar proposta de tratamento
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
