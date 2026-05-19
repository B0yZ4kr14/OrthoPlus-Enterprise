import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
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
    gradient: "from-teal-400 to-emerald-500",
  },
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description:
      "Agendamento otimizado com lembretes automáticos, integração multi-clínica e controle de confirmações.",
    gradient: "from-sky-400 to-blue-500",
  },
  {
    icon: DollarSign,
    title: "Financeiro Completo",
    description:
      "Controle de receitas, despesas, conciliação bancária, contas a receber e relatórios financeiros detalhados.",
    gradient: "from-warning to-orange-500",
  },
  {
    icon: FileText,
    title: "Prontuário Eletrônico",
    description:
      "PEP completo com odontograma digital, radiografias, planos de tratamento e assinatura ICP-Brasil.",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    icon: Receipt,
    title: "Faturamento TISS",
    description:
      "Geração de guias TISS, integração com operadoras e controle de glosas de forma automatizada.",
    gradient: "from-rose-400 to-pink-500",
  },
  {
    icon: Megaphone,
    title: "Marketing Automático",
    description:
      "Recall de pacientes, campanhas de fidelidade, avaliações automáticas e portal do paciente integrado.",
    gradient: "from-info to-teal-500",
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

  const handleCta = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDFA] to-[#ECFDF5] dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-lg dark:border-slate-800/50 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/OrthoPlus-Enterprise/orthoplus-logo-enterprise.svg"
              alt="OrthoPlus Enterprise"
              className="h-10 w-auto"
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
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp}>
              <Badge
                variant="outline"
                className="mb-6 rounded-full border-teal-300 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
              >
                Versão 5.6 — Multi-clínica & Multi-tenant
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white"
            >
              OrthoPlus{" "}
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                Enterprise
              </span>
              <br />
              <span className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
                Gestão Premium para Clínicas Odontológicas
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300"
            >
              Sistema completo de gestão clínica, financeira e comercial.
              Multi-clínica. Multi-tenant. Seguro.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                onClick={handleCta}
                size="lg"
                variant="elevated"
                className="rounded-full px-8 py-6 text-base shadow-xl shadow-teal-500/20"
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
        <div className="pointer-events-none absolute top-0 left-1/4 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Tudo que sua clínica precisa
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Módulos integrados que conversam entre si, eliminando retrabalho
              e aumentando a produtividade da sua equipe.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card
                  variant="interactive"
                  className="h-full border border-white/50 bg-white/60 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/60"
                >
                  <CardHeader className="pb-4">
                    <div
                      className={"mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br " + feature.gradient + " shadow-lg"}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Planos e Preços
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Escolha o plano ideal para o tamanho da sua operação. Sem taxa de
              setup. Cancele quando quiser.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid gap-8 lg:grid-cols-3"
          >
            {pricing.map((plan) => (
              <motion.div key={plan.name} variants={fadeInUp}>
                <div className="relative h-full">
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                        Recomendado
                      </Badge>
                    </div>
                  )}
                  <Card
                    className={"h-full border bg-white/70 backdrop-blur-md dark:bg-slate-900 " + (plan.highlighted ? "border-teal-400/50 shadow-2xl shadow-teal-500/10 dark:border-teal-500/30" : "border-white/50 dark:border-slate-800")}
                  >
                    <CardHeader className="pb-4 text-center">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        {plan.name}
                      </CardTitle>
                      <div className="mt-4 flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={handleCta}
                        variant={plan.highlighted ? "elevated" : "outline"}
                        className={"mt-4 w-full rounded-xl " + (plan.highlighted ? "shadow-lg shadow-teal-500/20" : "")}
                      >
                        {plan.cta}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/50 px-4 py-12 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-950/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <img
                src="/OrthoPlus-Enterprise/orthoplus-logo-enterprise.svg"
                alt="OrthoPlus Enterprise"
                className="h-8 w-auto opacity-80"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                OrthoPlus Enterprise
              </span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <button
                onClick={handleCta}
                className="transition-colors hover:text-teal-600 dark:hover:text-teal-400"
              >
                Entrar no Sistema
              </button>
              <span className="hidden text-slate-300 dark:text-slate-700 sm:inline">|</span>
              <span className="cursor-pointer transition-colors hover:text-teal-600 dark:hover:text-teal-400">
                Termos de Uso
              </span>
              <span className="hidden text-slate-300 dark:text-slate-700 sm:inline">|</span>
              <span className="cursor-pointer transition-colors hover:text-teal-600 dark:hover:text-teal-400">
                Privacidade
              </span>
            </nav>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:contato@tsiapp.io"
                className="transition-colors hover:text-teal-600 dark:hover:text-teal-400"
              >
                contato@tsiapp.io
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
            OrthoPlus Enterprise © 2026 — Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
