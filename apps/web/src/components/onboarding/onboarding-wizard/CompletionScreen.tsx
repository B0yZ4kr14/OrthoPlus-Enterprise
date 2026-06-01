// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { DialogContent } from "@orthoplus/core-ui/dialog";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";

interface CompletionScreenProps {
  onClose: () => void;
  onFinish: () => void;
}

export function CompletionScreen({ onClose, onFinish }: CompletionScreenProps) {
  return (
    <DialogContent className="max-w-2xl">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-50 rounded-full h-10 w-10 bg-destructive/10 hover:bg-destructive/20 border-2 border-destructive/30"
        onClick={onClose}
        aria-label="Fechar"
      >
        <X className="h-5 w-5 text-destructive" />
      </Button>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center space-y-4 pt-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Parabéns! 🎉</h2>
          <p className="text-muted-foreground text-lg">
            Você concluiu o onboarding do OrthoPlus Enterprise. Agora você está
            pronto para começar a usar o sistema completo.
          </p>
        </div>

        <div className="bg-muted/50 p-6 rounded-lg space-y-2 my-6">
          <h3 className="font-semibold">O que vem a seguir?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>
                Acesse o Dashboard para visualizar métricas da sua clínica
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Configure usuários e permissões em Configurações</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Ative/desative módulos conforme sua necessidade</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Explore os 22 módulos descentralizados disponíveis</span>
            </li>
          </ul>
        </div>

        <Button type="button" onClick={onFinish} size="lg" className="w-full gap-2">
          <Sparkles className="h-5 w-5" />
          Começar a usar o OrthoPlus Enterprise
        </Button>
      </motion.div>
    </DialogContent>
  );
}
