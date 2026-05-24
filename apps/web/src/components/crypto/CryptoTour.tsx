import { useEffect, useState } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

export function CryptoTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Verifica se é a primeira vez visitando a página
    const hasSeenTour = localStorage.getItem("crypto-tour-completed");
    if (!hasSeenTour) {
      // Aguarda 1 segundo antes de iniciar o tour
      setTimeout(() => setRun(true), 1000);
    }
  }, []);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">
            Bem-vindo aos Pagamentos Cripto! 🚀
          </h3>
          <p className="text-sm text-muted-foreground">
            Vamos guiá-lo pelo processo completo de configuração para começar a
            receber pagamentos em Bitcoin e outras criptomoedas.
          </p>
        </div>
      ),
      placement: "center",
    },
    {
      target: '[data-tour="exchange-tab"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold">1. Configure uma Exchange</h4>
          <p className="text-sm text-muted-foreground">
            Primeiro, configure uma exchange (Binance, Coinbase, etc.) onde você
            receberá as criptomoedas.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tour="wallets-tab"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold">2. Crie Carteiras</h4>
          <p className="text-sm text-muted-foreground">
            Depois, crie carteiras para cada tipo de criptomoeda que deseja
            aceitar (Bitcoin, Ethereum, USDT, etc.)
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tour="calculator"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold">Calculadora de Conversão</h4>
          <p className="text-sm text-muted-foreground">
            Use a calculadora para converter entre criptomoedas e BRL em tempo
            real com as cotações atualizadas.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tour="transactions-tab"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold">3. Gere QR Codes</h4>
          <p className="text-sm text-muted-foreground">
            Com as carteiras configuradas, você pode gerar QR Codes para seus
            pacientes pagarem diretamente em criptomoedas!
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tour="alerts-tab"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold">4. Configure Alertas (Opcional)</h4>
          <p className="text-sm text-muted-foreground">
            Configure alertas de preço para ser notificado quando for o melhor
            momento para converter suas criptomoedas em BRL.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ["finished", "skipped"];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("crypto-tour-completed", "true");
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
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
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular",
      }}
    />
  );
}
