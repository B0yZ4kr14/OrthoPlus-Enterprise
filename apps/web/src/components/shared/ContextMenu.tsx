import { ReactNode } from "react";
import {
  ContextMenu as RadixContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@orthoplus/core-ui/context-menu";

export interface ContextMenuAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  shortcut?: string;
}

export interface ContextMenuSection {
  title?: string;
  actions: ContextMenuAction[];
}

interface ContextMenuProps {
  children: ReactNode;
  sections: ContextMenuSection[];
}

export function ContextMenu({ children, sections }: ContextMenuProps) {
  return (
    <RadixContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {section.title}
              </div>
            )}
            {section.actions.map((action, actionIndex) => (
              <ContextMenuItem
                key={actionIndex}
                onClick={action.onClick}
                disabled={action.disabled}
                className={
                  action.destructive
                    ? "text-destructive focus:text-destructive"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {action.icon}
                    <span>{action.label}</span>
                  </div>
                  {action.shortcut && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {action.shortcut}
                    </span>
                  )}
                </div>
              </ContextMenuItem>
            ))}
            {sectionIndex < sections.length - 1 && <ContextMenuSeparator />}
          </div>
        ))}
      </ContextMenuContent>
    </RadixContextMenu>
  );
}

// Hook para criar menus contextuais comuns
export function useCommonContextMenus() {
  const patientContextMenu = (
    patientId: string,
    actions: {
      onOpenChart?: () => void;
      onSchedule?: () => void;
      onBudget?: () => void;
      onExport?: () => void;
      onDelete?: () => void;
    },
  ): ContextMenuSection[] => [
    {
      actions: [
        {
          label: "Abrir Prontuário",
          icon: <span>📋</span>,
          onClick: actions.onOpenChart || (() => {}),
          shortcut: "Ctrl+O",
        },
        {
          label: "Agendar Consulta",
          icon: <span>📅</span>,
          onClick: actions.onSchedule || (() => {}),
          shortcut: "Ctrl+A",
        },
        {
          label: "Novo Orçamento",
          icon: <span>💰</span>,
          onClick: actions.onBudget || (() => {}),
        },
      ],
    },
    {
      actions: [
        {
          label: "Exportar PDF",
          icon: <span>📄</span>,
          onClick: actions.onExport || (() => {}),
        },
      ],
    },
    {
      actions: [
        {
          label: "Excluir Paciente",
          icon: <span>🗑️</span>,
          onClick: actions.onDelete || (() => {}),
          destructive: true,
        },
      ],
    },
  ];

  const appointmentContextMenu = (
    appointmentId: string,
    actions: {
      onEdit?: () => void;
      onCancel?: () => void;
      onConfirm?: () => void;
      onReschedule?: () => void;
    },
  ): ContextMenuSection[] => [
    {
      actions: [
        {
          label: "Editar Consulta",
          icon: <span>✏️</span>,
          onClick: actions.onEdit || (() => {}),
        },
        {
          label: "Reagendar",
          icon: <span>📅</span>,
          onClick: actions.onReschedule || (() => {}),
        },
      ],
    },
    {
      actions: [
        {
          label: "Confirmar Presença",
          icon: <span>✅</span>,
          onClick: actions.onConfirm || (() => {}),
        },
      ],
    },
    {
      actions: [
        {
          label: "Cancelar Consulta",
          icon: <span>❌</span>,
          onClick: actions.onCancel || (() => {}),
          destructive: true,
        },
      ],
    },
  ];

  return {
    patientContextMenu,
    appointmentContextMenu,
  };
}
