// cspell:disable
type Step = any;

export const tourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">
          Bem-vindo ao OrthoPlus Enterprise 🦷
        </h2>
        <p className="text-sm text-muted-foreground">
          Tour rápido pelas principais funcionalidades!
        </p>
        <p className="text-xs text-muted-foreground">
          Desenvolvido por <strong>TSI Telecom</strong>
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar"]',
    content: (
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">
          Menu de Navegação
        </h3>
        <p className="text-xs text-muted-foreground">
          Acesse todos os módulos organizados por categoria.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="dashboard-stats"]',
    content: (
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">
          KPIs em Tempo Real
        </h3>
        <p className="text-xs text-muted-foreground">
          Principais indicadores: pacientes, consultas e receita.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="action-cards"]',
    content: (
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">Ações Rápidas</h3>
        <p className="text-xs text-muted-foreground">
          Acesse funcionalidades mais usadas rapidamente.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="search-bar"]',
    content: (
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">Busca Global</h3>
        <p className="text-xs text-muted-foreground">
          Encontre pacientes e procedimentos instantaneamente.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="theme-toggle"]',
    content: (
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">
          Temas e Acessibilidade
        </h3>
        <p className="text-xs text-muted-foreground">
          Personalize aparência, fonte e contraste.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="user-menu"]',
    content: (
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">
          Menu do Usuário
        </h3>
        <p className="text-xs text-muted-foreground">
          Configurações de perfil e logout.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">Tour Completo! ✨</h2>
        <p className="text-sm text-muted-foreground">
          Você está pronto para usar o OrthoPlus Enterprise! Explore todas as
          funcionalidades.
        </p>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            💙 <strong>TSI Telecom</strong>
          </p>
        </div>
      </div>
    ),
    placement: "center",
  },
];
