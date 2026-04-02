import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import {
  Users,
  Shield,
  Settings,
  CheckCircle2,
  Download,
  Eye,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export function StepExport() {
  const handleExport = () => {
    toast.success("Configuração exportada com sucesso!", {
      description: "Suas preferências foram salvas e aplicadas ao sistema.",
    });
  };

  const handleViewConfig = () => {
    toast.info("Abrindo Configurações de Módulos...");
  };

  const nextSteps = [
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

  return (
    <div className="space-y-6">
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Parabéns! Você concluiu o tour de onboarding. Agora está pronto para
          começar a usar o Ortho+ com confiança.
        </AlertDescription>
      </Alert>

      <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Configuração Completa!</h3>
            <p className="text-muted-foreground">
              Você aprendeu sobre módulos, dependências e como gerenciar o
              sistema
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold">Próximos Passos Recomendados</h3>

        {nextSteps.map((step) => {
          const Icon = step.icon;
          return (
            <Card
              key={step.title}
              className="p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{step.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {step.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  <Button variant="outline" size="sm">
                    {step.action}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="gap-2" onClick={handleViewConfig}>
          <Eye className="h-4 w-4" />
          Ver Configurações
        </Button>
        <Button variant="default" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exportar Config
        </Button>
      </div>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">📚 Recursos Úteis</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>
              <strong>Tour Guiado:</strong> Você pode iniciar o tour novamente a
              qualquer momento clicando no botão de ajuda no canto superior
              direito
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>
              <strong>Documentação:</strong> Acesse a documentação completa do
              sistema para guias detalhados de cada módulo
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>
              <strong>Suporte:</strong> Em caso de dúvidas, entre em contato com
              o suporte técnico da TSI Telecom
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
