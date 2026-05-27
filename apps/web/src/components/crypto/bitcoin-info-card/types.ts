export interface Advantage {
  icon: "shield" | "zap" | "globe" | "lock";
  title: string;
  description: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  desc: string;
}

export interface Exchange {
  name: string;
  color: string;
}

export const ADVANTAGES: Advantage[] = [
  {
    icon: "shield",
    title: "Segurança Máxima",
    description: "Transações protegidas por blockchain com criptografia de ponta",
  },
  {
    icon: "zap",
    title: "Taxas Reduzidas",
    description: "Até 90% mais barato que cartões de crédito (2-5% vs 0.1-0.5%)",
  },
  {
    icon: "globe",
    title: "Global 24/7",
    description: "Receba de qualquer lugar do mundo, sem fronteiras ou horários",
  },
  {
    icon: "lock",
    title: "Sem Chargebacks",
    description: "Transações irreversíveis protegem contra fraudes e estornos",
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  { step: "1", title: "Configure Exchange", desc: "Binance, Coinbase, etc." },
  { step: "2", title: "Crie Carteira", desc: "BTC, ETH ou USDT" },
  { step: "3", title: "Gere QR Code", desc: "Paciente escaneia" },
  { step: "4", title: "Confirmação", desc: "10-30 minutos" },
  { step: "5", title: "Conversão", desc: "Auto-conversão BRL" },
];

export const EXCHANGES: Exchange[] = [
  { name: "Binance", color: "bg-warning/10 border-yellow-500/20" },
  { name: "Coinbase", color: "bg-info/10 border-info/20" },
  { name: "Kraken", color: "bg-purple-500/10 border-purple-500/20" },
  { name: "Bybit", color: "bg-warning/10 border-warning/20" },
  { name: "Mercado Bitcoin", color: "bg-info/10 border-info/20" },
];
