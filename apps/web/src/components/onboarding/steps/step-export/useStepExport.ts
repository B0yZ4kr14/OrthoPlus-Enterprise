import { useCallback } from "react";
import { Users, Shield, Settings } from "lucide-react";
import { toast } from "sonner";
import type { NextStep } from "./types";

export const NEXT_STEPS: NextStep[] = [
  {
    icon: Users,
    title: "Configure Usuários",
    description:
      "Adicione membros da equipe e defina suas permissões granulares",
    action: "Ir para Funcionários",
    badge: "Recomendado",
  },
  {
    icon: Shield,
    title: "Configure Permissões",
    description: "Defina quais módulos cada usuário MEMBER pode acessar",
    action: "Gerenciar Permissões",
    badge: "Importante",
  },
  {
    icon: Settings,
    title: "Personalize Módulos",
    description:
      "Ative ou desative módulos conforme as necessidades da clínica",
    action: "Meus Módulos",
    badge: "Essencial",
  },
];

export const RESOURCES: ResourceItem[] = [
  {
    title: "Tour Guiado",
    description:
      "Você pode iniciar o tour novamente a qualquer momento clicando no botão de ajuda no canto superior direito",
  },
  {
    title: "Documentação",
    description:
      "Acesse a documentação completa do sistema para guias detalhados de cada módulo",
  },
  {
    title: "Suporte",
    description:
      "Em caso de dúvidas, entre em contato com o suporte técnico da TSI Telecom",
  },
];

export function useStepExport() {
  const handleExport = useCallback(() => {
    toast.success("Configuração exportada com sucesso!", {
      description: "Suas preferências foram salvas e aplicadas ao sistema.",
    });
  }, []);

  const handleViewConfig = useCallback(() => {
    toast.info("Abrindo Configurações de Módulos...");
  }, []);

  return { handleExport, handleViewConfig };
}

type ResourceItem = {
  title: string;
  description: string;
};
