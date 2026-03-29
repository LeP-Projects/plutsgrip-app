import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Shield,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/Button"
import { ThemeToggle } from "@/components/ThemeToggle"

interface LandingPageTranslations {
  appName: string
  eyebrow: string
  title: string
  description: string
  start: string
  signIn: string
  proofOne: string
  proofTwo: string
  proofThree: string
  proofThreeValue: string
  highlightOne: string
  highlightTwo: string
  highlightThree: string
  sectionLabel: string
  sectionTitle: string
  sectionDescription: string
  edition: string
  previewLabel: string
  previewTitle: string
  previewStatus: string
  balanceLabel: string
  riskLabel: string
  riskValue: string
  riskDescription: string
  alertLabel: string
  alertValue: string
  alertDescription: string
  cockpitLabel: string
  footer: string
}

const translations: Record<string, LandingPageTranslations> = {
  en: {
    appName: "PlutusGrip",
    eyebrow: "Financial command center",
    title: "The calmest way to read your money, plan ahead, and act sooner.",
    description:
      "PlutusGrip turns expenses, goals, recurring entries, projections, and alerts into one connected finance cockpit. The experience is built to feel premium, readable, and proactive from the very first screen.",
    start: "Create free account",
    signIn: "Sign in",
    proofOne: "Planning models",
    proofTwo: "Forecast windows",
    proofThree: "Privacy controls",
    proofThreeValue: "Local mode",
    highlightOne: "Budgets, goals, recurring items, and reports live in one fluid system.",
    highlightTwo: "Health, forecast, insights, and alerts help you move before the month gets tighter.",
    highlightThree: "A visual layer designed for focus, not clutter, across desktop and mobile.",
    sectionLabel: "What changes here",
    sectionTitle: "A more strategic finance product, not just a ledger.",
    sectionDescription:
      "Every module now points to action: understand your present, organize your routine, and see risk earlier with a cleaner interface and better visual hierarchy.",
    edition: "2026 edition",
    previewLabel: "Weekly posture",
    previewTitle: "Dashboard preview",
    previewStatus: "Stable pace",
    balanceLabel: "Monthly balance",
    riskLabel: "Forecast risk",
    riskValue: "Low",
    riskDescription: "Cash flow remains above your safety floor in the next 60 days.",
    alertLabel: "Alert layer",
    alertValue: "3 active",
    alertDescription: "Budget pressure, seasonal acceleration, and one recurring review.",
    cockpitLabel: "Finance cockpit",
    footer: "© 2026 PlutusGrip. All rights reserved.",
  },
  pt: {
    appName: "PlutusGrip",
    eyebrow: "Centro de comando financeiro",
    title: "Uma forma mais clara de entender seu dinheiro, planejar o futuro e agir antes.",
    description:
      "O PlutusGrip conecta despesas, metas, recorrências, projeções e alertas em um único cockpit financeiro. A experiência foi desenhada para transmitir clareza, valor e controle desde a primeira tela.",
    start: "Criar conta grátis",
    signIn: "Entrar",
    proofOne: "Modelos de planejamento",
    proofTwo: "Janelas de projeção",
    proofThree: "Controles de privacidade",
    proofThreeValue: "Modo local",
    highlightOne: "Orçamentos, metas, recorrências e relatórios convivem em um fluxo único.",
    highlightTwo: "Saúde financeira, previsão, insights e alertas antecipam decisões do mês.",
    highlightThree: "Uma camada visual pensada para foco e leitura, no desktop e no mobile.",
    sectionLabel: "O que muda aqui",
    sectionTitle: "Um produto financeiro mais estratégico, não apenas um registro.",
    sectionDescription:
      "Cada módulo agora empurra uma ação: entender o presente, organizar a rotina e enxergar risco mais cedo com uma interface mais madura e uma hierarquia visual mais forte.",
    edition: "Edição 2026",
    previewLabel: "Postura semanal",
    previewTitle: "Preview do dashboard",
    previewStatus: "Ritmo estável",
    balanceLabel: "Saldo mensal",
    riskLabel: "Risco de previsão",
    riskValue: "Baixo",
    riskDescription: "O fluxo de caixa fica acima do seu piso de segurança nos próximos 60 dias.",
    alertLabel: "Camada de alerta",
    alertValue: "3 ativos",
    alertDescription: "Pressão de orçamento, aceleração sazonal e uma recorrência para revisar.",
    cockpitLabel: "Cockpit financeiro",
    footer: "© 2026 PlutusGrip. Todos os direitos reservados.",
  },
}

const featureConfig = {
  en: [
    {
      icon: Wallet,
      title: "Daily control with context",
      description:
        "Track income, expenses, categories, and recurring movements without losing the big picture.",
    },
    {
      icon: Target,
      title: "Goals and budget strategy",
      description:
        "Connect goals, budget envelopes, and monthly allocation with a clearer operational flow.",
    },
    {
      icon: BarChart3,
      title: "Reports that point to action",
      description:
        "Use trends, category concentration, and behavior patterns to decide what to adjust next.",
    },
    {
      icon: BellRing,
      title: "Proactive attention layer",
      description:
        "See forecast risk, budget pressure, and unusual spending before they become surprises.",
    },
    {
      icon: Shield,
      title: "Privacy by design",
      description:
        "Stay in control with local privacy mode, consent settings, and safer visual handling of amounts.",
    },
    {
      icon: Sparkles,
      title: "A calmer visual system",
      description:
        "Glassmorphism surfaces, stronger spacing, and better hierarchy make the product feel coherent end to end.",
    },
  ],
  pt: [
    {
      icon: Wallet,
      title: "Controle diário com contexto",
      description:
        "Acompanhe receitas, despesas, categorias e recorrências sem perder a visão do todo.",
    },
    {
      icon: Target,
      title: "Metas e estratégia de orçamento",
      description:
        "Conecte metas, envelopes de orçamento e distribuição mensal com um fluxo bem mais claro.",
    },
    {
      icon: BarChart3,
      title: "Relatórios que puxam ação",
      description:
        "Use tendências, concentração por categoria e padrões de comportamento para decidir o próximo ajuste.",
    },
    {
      icon: BellRing,
      title: "Camada proativa de atenção",
      description:
        "Enxergue risco de caixa, pressão de orçamento e gastos fora do normal antes da surpresa.",
    },
    {
      icon: Shield,
      title: "Privacidade no centro",
      description:
        "Tenha modo de privacidade, consentimentos locais e tratamento visual mais seguro dos valores.",
    },
    {
      icon: Sparkles,
      title: "Sistema visual mais calmo",
      description:
        "Superfícies com glassmorphism, espaçamento melhor e hierarquia forte deixam o produto mais coeso.",
    },
  ],
} as const

export function LandingPage() {
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    const deviceLanguage = navigator.language.toLowerCase()
    setLanguage(deviceLanguage.startsWith("pt") ? "pt" : "en")
  }, [])

  const t = translations[language]
  const features = featureConfig[language as keyof typeof featureConfig]

  return (
    <div className="public-stage min-h-screen overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="glass-panel relative z-10 mb-6 flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 shadow-inner shadow-primary/20 ring-1 ring-primary/20">
              <img src="/plutus.png" alt={t.appName} className="h-7 w-7 object-contain" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                {t.appName}
              </p>
              <p className="font-serif text-lg font-semibold text-foreground">
                {t.cockpitLabel}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle language={language} />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-border/70 bg-background/45 backdrop-blur-sm"
            >
              <Link to="/login">{t.signIn}</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full px-5 shadow-lg shadow-primary/20">
              <Link to="/register">{t.start}</Link>
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6">
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-panel public-grid relative overflow-hidden bg-white/72 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 dark:bg-slate-950/48">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

              <div className="relative space-y-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
                    {t.eyebrow}
                  </span>
                  <span className="rounded-full border border-border/70 bg-background/45 px-3 py-1 text-xs text-muted-foreground">
                    {t.edition}
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {t.title}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    {t.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="rounded-full px-7 shadow-lg shadow-primary/20">
                    <Link to="/register">
                      {t.start}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full border-border/70 bg-background/45 px-7 backdrop-blur-sm"
                  >
                    <Link to="/login">{t.signIn}</Link>
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-border/65 bg-background/45 px-4 py-4 backdrop-blur-md">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                      {t.proofOne}
                    </p>
                    <p className="mt-2 font-serif text-2xl font-semibold text-foreground">
                      50-30-20
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border/65 bg-background/45 px-4 py-4 backdrop-blur-md">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                      {t.proofTwo}
                    </p>
                    <p className="mt-2 font-serif text-2xl font-semibold text-foreground">
                      30/60/90
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border/65 bg-background/45 px-4 py-4 backdrop-blur-md">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                      {t.proofThree}
                    </p>
                    <p className="mt-2 font-serif text-2xl font-semibold text-foreground">
                      {t.proofThreeValue}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

              <div className="relative flex h-full flex-col gap-5">
                <div className="rounded-[2rem] border border-border/70 bg-background/55 p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.55)] backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-border/70 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        {t.previewLabel}
                      </p>
                      <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
                        {t.previewTitle}
                      </h2>
                    </div>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {t.previewStatus}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/12 via-background/20 to-background/55 p-4">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            {t.balanceLabel}
                          </p>
                          <p className="mt-2 font-serif text-4xl font-semibold text-foreground">
                            +R$ 2.480
                          </p>
                        </div>
                        <div className="flex items-end gap-2">
                          {[34, 52, 44, 68, 72, 58, 80].map((height, index) => (
                            <span
                              key={index}
                              className="w-3 rounded-full bg-primary/70"
                              style={{ height: `${height}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl border border-border/60 bg-background/40 p-4">
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                          {t.riskLabel}
                        </p>
                        <p className="mt-2 font-serif text-2xl font-semibold text-foreground">
                          {t.riskValue}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t.riskDescription}
                        </p>
                      </div>
                      <div className="rounded-3xl border border-border/60 bg-background/40 p-4">
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                          {t.alertLabel}
                        </p>
                        <p className="mt-2 font-serif text-2xl font-semibold text-foreground">
                          {t.alertValue}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t.alertDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[t.highlightOne, t.highlightTwo, t.highlightThree].map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-3xl border border-border/60 bg-background/38 px-4 py-4 text-sm leading-6 text-muted-foreground backdrop-blur-md"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

            <div className="relative">
              <div className="mb-8 max-w-3xl space-y-3">
                <p className="text-xs uppercase tracking-[0.24em] text-primary">
                  {t.sectionLabel}
                </p>
                <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                  {t.sectionTitle}
                </h2>
                <p className="text-base leading-7 text-muted-foreground">
                  {t.sectionDescription}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {features.map((feature) => {
                  const Icon = feature.icon

                  return (
                    <div
                      key={feature.title}
                      className="rounded-[1.75rem] border border-border/60 bg-background/42 p-5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/15">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-serif text-2xl font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </main>

        <footer className="px-2 py-6 text-center text-sm text-muted-foreground">
          {t.footer}
        </footer>
      </div>
    </div>
  )
}
