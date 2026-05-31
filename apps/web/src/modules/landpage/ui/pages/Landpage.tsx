import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
  Receipt,
  Megaphone,
  Check,
  ArrowRight,
  Mail,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@orthoplus/core-ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInUpReduced = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: Users,
    title: "Gestão de Pacientes",
    description:
      "Cadastro completo, histórico clínico, anamnese digital e acompanhamento de tratamentos em um só lugar.",
    gradient: "from-[hsl(var(--interactive))] to-[hsl(var(--success))]",
  },
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description:
      "Agendamento otimizado com lembretes automáticos, integração multi-clínica e controle de confirmações.",
    gradient: "from-[hsl(var(--info))] to-[hsl(var(--module-blue))]",
  },
  {
    icon: DollarSign,
    title: "Financeiro Completo",
    description:
      "Controle de receitas, despesas, conciliação bancária, contas a receber e relatórios financeiros detalhados.",
    gradient: "from-[hsl(var(--warning))] to-[hsl(var(--module-orange))]",
  },
  {
    icon: FileText,
    title: "Prontuário Eletrônico",
    description:
      "PEP completo com odontograma digital, radiografias, planos de tratamento e assinatura ICP-Brasil.",
    gradient: "from-[hsl(var(--module-purple))] to-[hsl(var(--module-pink))]",
  },
  {
    icon: Receipt,
    title: "Faturamento TISS",
    description:
      "Geração de guias TISS, integração com operadoras e controle de glosas de forma automatizada.",
    gradient: "from-[hsl(var(--module-red))] to-[hsl(var(--module-pink))]",
  },
  {
    icon: Megaphone,
    title: "Marketing Automático",
    description:
      "Recall de pacientes, campanhas de fidelidade, avaliações automáticas e portal do paciente integrado.",
    gradient: "from-[hsl(var(--interactive))] to-[hsl(var(--interactive))]",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "R$ 197",
    period: "/mês",
    description: "Ideal para clínicas iniciantes",
    features: [
      "1 clínica",
      "Até 3 usuários",
      "Gestão de pacientes",
      "Agenda inteligente",
      "Financeiro básico",
      "Suporte por email",
    ],
    highlighted: false,
    cta: "Começar Agora",
  },
  {
    name: "Professional",
    price: "R$ 497",
    period: "/mês",
    description: "Para clínicas em crescimento",
    features: [
      "Até 3 clínicas",
      "Usuários ilimitados",
      "API de integração",
      "Prontuário eletrônico",
      "Faturamento TISS",
      "Marketing automático",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
    highlighted: true,
    cta: "Escolher Professional",
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Para grandes grupos odontológicos",
    features: [
      "Multi-tenant ilimitado",
      "White-label completo",
      "Suporte dedicado 24/7",
      "On-premise disponível",
      "Customizações sob demanda",
      "Treinamento presencial",
      "SLA garantido",
    ],
    highlighted: false,
    cta: "Falar com Consultor",
  },
];

export default function Landpage() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const motionVariants = shouldReduceMotion ? fadeInUpReduced : fadeInUp;

  const handleCta = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--interactive)/0.05)] to-[hsl(var(--success)/0.05)] dark:from-background dark:to-card text-foreground dark:text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-lg dark:border-border/50 dark:bg-background/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/OrthoPlus-Enterprise/orthoplus-logo-enterprise.svg"
              alt="OrthoPlus Enterprise"
              className="h-10 w-auto dark:brightness-200 dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
            />
            <span className="hidden text-lg font-bold tracking-tight sm:inline-block">
              OrthoPlus Enterprise
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={handleCta}
              variant="elevated"
              className="rounded-full px-5 py-2 text-sm"
            >
              Entrar no Sistema
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div
              variants={motionVariants}
              initial="hidden"
              animate="visible"
            >
              <Badge
                variant="outline"
                className="mb-6 rounded-full border-[hsl(var(--interactive)/0.3)] bg-[hsl(var(--interactive)/0.1)] px-4 py-1.5 text-sm font-medium text-[hsl(var(--interactive))] dark:border-[hsl(var(--interactive)/0.2)] dark:bg-[hsl(var(--interactive)/0.05)] dark:text-[hsl(var(--interactive))]"
              >
                Versão 5.6 — Multi-clínica & Multi-tenant
              </Badge>
            </motion.div>

            <motion.h1
              variants={motionVariants}
              initial="hidden"
              animate="visible"
              className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl dark:text-white"
            >
              OrthoPlus{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--interactive))] to-[hsl(var(--success))] bg-clip-text text-transparent">
                Enterprise
              </span>
              <br />
              <span className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
                Gestão Premium para Clínicas Odontológicas
              </span>
            </motion.h1>

            <motion.p
              variants={motionVariants}
              initial="hidden"
              animate="visible"
              className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl dark:text-muted-foreground"
            >
              Sistema completo de gestão clínica, financeira e comercial.
              Multi-clínica. Multi-tenant. Seguro.
            </motion.p>

            <motion.div
              variants={motionVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                onClick={handleCta}
                size="lg"
                variant="elevated"
                className="rounded-full px-8 py-6 text-base shadow-[hsl(var(--interactive)/0.2)]"
              >
                Entrar no Sistema
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => {
                  const el = document.getElementById("precos");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-base"
              >
                Ver Planos
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative blur orbs */}
        <div className="pointer-events-none absolute top-0 left-1/4 h-72 w-72 rounded-full bg-[hsl(var(--interactive)/0.2)] blur-3xl dark:bg-[hsl(var(--interactive)/0.1)]" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-[hsl(var(--success)/0.2)] blur-3xl dark:bg-[hsl(var(--success)/0.1)]" />
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl dark:text-white">
              Tudo que sua clínica precisa
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground dark:text-muted-foreground">
              Módulos integrados que conversam entre si, eliminando retrabalho e
              aumentando a produtividade da sua equipe.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title}>
                <Card
                  variant="interactive"
                  className="h-full border border-white/50 bg-white/60 backdrop-blur-md dark:border-border/50 dark:bg-card/60"
                >
                  <CardHeader className="pb-4">
                    <div
                      className={
                        "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br " +
                        feature.gradient +
                        " shadow-[hsl(var(--interactive)/0.2)]"
                      }
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl dark:text-white">
              Planos e Preços
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground dark:text-muted-foreground">
              Escolha o plano ideal para o tamanho da sua operação. Sem taxa de
              setup. Cancele quando quiser.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div key={plan.name}>
                <div className="relative h-full">
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="rounded-full bg-gradient-to-r from-[hsl(var(--interactive))] to-[hsl(var(--success))] px-4 py-1 text-xs font-semibold text-white shadow-lg">
                        Recomendado
                      </Badge>
                    </div>
                  )}
                  <Card
                    className={
                      "h-full border bg-white/70 backdrop-blur-md dark:bg-card " +
                      (plan.highlighted
                        ? "border-[hsl(var(--interactive)/0.5)] shadow-[hsl(var(--interactive)/0.1)] dark:border-[hsl(var(--interactive)/0.3)]"
                        : "border-white/50 dark:border-border")
                    }
                  >
                    <CardHeader className="pb-4 text-center">
                      <CardTitle className="text-lg font-semibold text-foreground dark:text-white">
                        {plan.name}
                      </CardTitle>
                      <div className="mt-4 flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-extrabold text-foreground dark:text-white">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-3 text-sm text-muted-foreground dark:text-muted-foreground"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--interactive))]" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={handleCta}
                        variant={plan.highlighted ? "elevated" : "outline"}
                        className={
                          "mt-4 w-full rounded-xl " +
                          (plan.highlighted
                            ? "shadow-[hsl(var(--interactive)/0.2)]"
                            : "")
                        }
                      >
                        {plan.cta}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white/50 px-4 py-12 backdrop-blur-sm dark:border-border/50 dark:bg-background/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <img
                src="/OrthoPlus-Enterprise/orthoplus-logo-enterprise.svg"
                alt="OrthoPlus Enterprise"
                className="h-8 w-auto opacity-80 dark:brightness-200 dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
              />
              <span className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground">
                OrthoPlus Enterprise
              </span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground dark:text-muted-foreground">
              <button
                onClick={handleCta}
                className="transition-colors hover:text-[hsl(var(--interactive))] dark:hover:text-[hsl(var(--interactive))]"
              >
                Entrar no Sistema
              </button>
              <span className="hidden text-muted-foreground/50 dark:text-foreground sm:inline">
                |
              </span>
              <span className="cursor-pointer transition-colors hover:text-[hsl(var(--interactive))] dark:hover:text-[hsl(var(--interactive))]">
                Termos de Uso
              </span>
              <span className="hidden text-muted-foreground/50 dark:text-foreground sm:inline">
                |
              </span>
              <span className="cursor-pointer transition-colors hover:text-[hsl(var(--interactive))] dark:hover:text-[hsl(var(--interactive))]">
                Privacidade
              </span>
            </nav>

            <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:contato@tsiapp.io"
                className="transition-colors hover:text-[hsl(var(--interactive))] dark:hover:text-[hsl(var(--interactive))]"
              >
                contato@tsiapp.io
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground/50 dark:text-muted-foreground">
            OrthoPlus Enterprise © 2026 — Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
