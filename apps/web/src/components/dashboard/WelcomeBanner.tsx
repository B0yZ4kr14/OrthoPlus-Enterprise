import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Lightbulb } from "lucide-react";

interface WelcomeBannerProps {
  userName: string;
}

const tips = [
  "Use o filtro de data para comparar periodos e identificar tendencias.",
  "Exporte seus relatórios em PDF para compartilhar com a equipe.",
  "Configure alertas de inadimplência para acompanhar pagamentos atrasados.",
  "Acompanhe o NPS mensal para medir a satisfacao dos pacientes.",
  "Utilize o dashboard comercial para otimizar suas campanhas de marketing.",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const stored = localStorage.getItem("orthoplus-welcome-dismissed");
    if (stored === "true") {
      setDismissed(true);
    }
    setTipIndex(Math.floor(Math.random() * tips.length));
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem("orthoplus-welcome-dismissed", "true");
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -12 }}
          transition={reduced ? { duration: 0 } : { duration: 0.35, ease: [0, 0, 0.2, 1] }}
          className="relative overflow-hidden glass-card rounded-2xl p-5 border border-[hsl(var(--interactive))]/20"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--interactive))] to-transparent opacity-40" />
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[hsl(var(--interactive))]/5 rounded-full blur-3xl" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-[hsl(var(--interactive))]/3 rounded-full blur-2xl" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground font-display">
                {getGreeting()}, {userName}
              </h2>
              <div className="mt-2 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Lightbulb className="h-4 w-4 mt-0.5 text-[hsl(var(--interactive))] shrink-0 drop-shadow-[0_0_4px_hsl(var(--interactive)/0.3)]" aria-hidden="true" />
                <p className="text-muted-foreground">{tips[tipIndex]}</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label="Fechar banner de boas-vindas"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
