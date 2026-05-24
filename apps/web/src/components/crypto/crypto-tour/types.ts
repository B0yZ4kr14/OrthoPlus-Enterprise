import type { Step, CallBackProps } from "react-joyride";

export type { Step, CallBackProps };

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "center" | "top" | "bottom" | "left" | "right";
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: "body",
    title: "Bem-vindo aos Pagamentos Cripto! 🚀",
    content:
      "Vamos guiá-lo pelo processo completo de configuração para começar a receber pagamentos em Bitcoin e outras criptomoedas.",
    placement: "center",
  },
  {
    target: '[data-tour="exchange-tab"]',
    title: "1. Configure uma Exchange",
    content:
      "Primeiro, configure uma exchange (Binance, Coinbase, etc.) onde você receberá as criptomoedas.",
  },
  {
    target: '[data-tour="wallets-tab"]',
    title: "2. Crie Carteiras",
    content:
      "Depois, crie carteiras para cada tipo de criptomoeda que deseja aceitar (Bitcoin, Ethereum, USDT, etc.)",
  },
  {
    target: '[data-tour="calculator"]',
    title: "Calculadora de Conversão",
    content:
      "Use a calculadora para converter entre criptomoedas e BRL em tempo real com as cotações atualizadas.",
  },
  {
    target: '[data-tour="transactions-tab"]',
    title: "3. Gere QR Codes",
    content:
      "Com as carteiras configuradas, você pode gerar QR Codes para seus pacientes pagarem diretamente em criptomoedas!",
  },
  {
    target: '[data-tour="alerts-tab"]',
    title: "4. Configure Alertas (Opcional)",
    content:
      "Configure alertas de preço para ser notificado quando for o melhor momento para converter suas criptomoedas em BRL.",
  },
];

export const JOYRIDE_STYLES = {
  options: {
    primaryColor: "hsl(var(--primary))",
    textColor: "hsl(var(--foreground))",
    backgroundColor: "hsl(var(--card))",
    arrowColor: "hsl(var(--card))",
    overlayColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: "var(--radius)",
    padding: "1.5rem",
  },
  buttonNext: {
    backgroundColor: "hsl(var(--primary))",
    borderRadius: "var(--radius)",
    padding: "0.5rem 1rem",
  },
  buttonBack: {
    color: "hsl(var(--muted-foreground))",
  },
  buttonSkip: {
    color: "hsl(var(--muted-foreground))",
  },
};

export const JOYRIDE_LOCALE = {
  back: "Voltar",
  close: "Fechar",
  last: "Finalizar",
  next: "Próximo",
  skip: "Pular",
};
