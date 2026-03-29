import { useEffect, useMemo, useState } from "react"
import { endOfMonth, format, startOfMonth } from "date-fns"
import {
  AlertCircle,
  ArrowRight,
  HeartPulse,
  Loader2,
  PiggyBank,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Wallet,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { PageHeader } from "@/components/PageHeader"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import {
  apiService,
  type Category,
  type Goal,
  type RecurringTransaction,
  type Transaction,
} from "@/services/api"

type PlanningBucket = "needs" | "wants" | "savings"

interface PlanningSettings {
  needsPct: number
  wantsPct: number
  savingsPct: number
  zeroBasedSavingsAmount: number
}

interface HealthSettings {
  reserveTargetMonths: number
  healthyFixedCommitmentPct: number
  healthySavingsRatePct: number
}

interface HealthRecommendation {
  title: string
  body: string
  tone: "critical" | "warning" | "positive"
}

const PLANNING_SETTINGS_KEY = "planning_settings_v1"
const PLANNING_ASSIGNMENTS_KEY = "planning_assignments_v1"
const HEALTH_SETTINGS_KEY = "health_settings_v1"

const defaultPlanningSettings: PlanningSettings = {
  needsPct: 50,
  wantsPct: 30,
  savingsPct: 20,
  zeroBasedSavingsAmount: 0,
}

const defaultHealthSettings: HealthSettings = {
  reserveTargetMonths: 6,
  healthyFixedCommitmentPct: 35,
  healthySavingsRatePct: 20,
}

const translations = {
  en: {
    title: "Financial health",
    subtitle:
      "Read your reserve, pressure on income and resilience level in one place, with practical guidance for the next move.",
    assumptions: "Health assumptions",
    reserveMonths: "Reserve target (months)",
    fixedCommitment: "Healthy fixed pressure %",
    savingsRate: "Healthy savings rate %",
    reserveStatus: "Emergency reserve",
    reserveCoverage: "Coverage",
    reserveTarget: "Target reserve",
    currentReserve: "Current reserve",
    essentialBase: "Essential monthly base",
    debtStatus: "Estimated debt pressure",
    recurringLoad: "Fixed commitments",
    debtLoad: "Debt load",
    savingsStatus: "Savings cadence",
    monthlySavings: "Monthly net savings",
    savingsPerformance: "Savings rate",
    score: "Financial health score",
    benchmark: "Benchmark",
    actionPlan: "Recommended actions",
    diagnostics: "Key diagnostics",
    reserveFallback: "No reserve goal was identified, so the reserve estimate is conservative.",
    loading: "Loading financial health...",
    reserveGoalHint: "Reserve balance uses goals tagged as reserve, emergency or savings.",
    benchmarkStrong: "Resilient",
    benchmarkStable: "Stable",
    benchmarkAttention: "Attention",
    benchmarkCritical: "Critical",
    ratioIncome: "of income",
    months: "months",
    recommendations: "Recommendations",
    methodology: "Methodology",
    methodologyText:
      "This first version combines monthly actuals, recurring transactions and planning buckets already configured in the product.",
    diagnosticsHint:
      "The debt index is estimated from recurring expenses and transactions that look like credit, financing or debt service.",
    healthGood: "You have room to operate.",
    healthWatch: "A few adjustments would improve resilience.",
    healthRisk: "Priority adjustments are recommended.",
    reserveLabel: "Reserve posture",
    fixedLabel: "Fixed pressure",
    debtLabel: "Debt pressure",
    savingsLabel: "Savings rhythm",
    none: "No recommendations right now.",
  },
  pt: {
    title: "Saude financeira",
    subtitle:
      "Leia sua reserva, a pressao sobre a renda e o nivel de resiliencia em um unico lugar, com orientacao pratica para o proximo passo.",
    assumptions: "Premissas da saude",
    reserveMonths: "Meta de reserva (meses)",
    fixedCommitment: "Pressao fixa saudavel %",
    savingsRate: "Taxa de poupanca saudavel %",
    reserveStatus: "Reserva de emergencia",
    reserveCoverage: "Cobertura",
    reserveTarget: "Reserva ideal",
    currentReserve: "Reserva atual",
    essentialBase: "Base mensal essencial",
    debtStatus: "Pressao estimada de dividas",
    recurringLoad: "Compromissos fixos",
    debtLoad: "Carga de dividas",
    savingsStatus: "Ritmo de poupanca",
    monthlySavings: "Poupanca liquida do mes",
    savingsPerformance: "Taxa de poupanca",
    score: "Score de saude financeira",
    benchmark: "Benchmark",
    actionPlan: "Plano de acao recomendado",
    diagnostics: "Diagnosticos centrais",
    reserveFallback: "Nenhuma meta de reserva foi identificada, entao a estimativa atual de reserva e conservadora.",
    loading: "Carregando saude financeira...",
    reserveGoalHint: "O saldo de reserva usa metas marcadas como reserva, emergencia ou poupanca.",
    benchmarkStrong: "Resiliente",
    benchmarkStable: "Estavel",
    benchmarkAttention: "Atencao",
    benchmarkCritical: "Critico",
    ratioIncome: "da renda",
    months: "meses",
    recommendations: "Recomendacoes",
    methodology: "Metodologia",
    methodologyText:
      "Esta primeira versao combina realizado do mes, transacoes recorrentes e buckets de planejamento ja configurados no produto.",
    diagnosticsHint:
      "O indice de dividas e estimado a partir de despesas recorrentes e transacoes com sinais de cartao, financiamento ou servico de divida.",
    healthGood: "Voce tem folga para operar.",
    healthWatch: "Alguns ajustes melhorariam a resiliencia.",
    healthRisk: "Ajustes prioritarios sao recomendados.",
    reserveLabel: "Postura da reserva",
    fixedLabel: "Pressao fixa",
    debtLabel: "Pressao de dividas",
    savingsLabel: "Ritmo de poupanca",
    none: "Sem recomendacoes urgentes no momento.",
  },
}

function parseStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function inferBucket(categoryName: string): PlanningBucket {
  const name = categoryName.toLowerCase()
  if (/(rent|housing|moradia|aluguel|mercado|grocery|supermarket|health|saude|transport|transporte|utilities|internet|energia|agua)/.test(name)) {
    return "needs"
  }
  if (/(save|reserva|invest|poup|wealth|future|emerg)/.test(name)) {
    return "savings"
  }
  return "wants"
}

function normalizeRecurringToMonthly(item: RecurringTransaction) {
  switch (item.frequency) {
    case "daily":
      return item.amount * 30
    case "weekly":
      return item.amount * 4.33
    case "biweekly":
      return item.amount * 2.17
    case "quarterly":
      return item.amount / 3
    case "yearly":
      return item.amount / 12
    default:
      return item.amount
  }
}

function isReserveGoal(goal: Goal) {
  const text = `${goal.name} ${goal.category ?? ""} ${goal.description ?? ""}`.toLowerCase()
  return /(reserva|emergency|emergencia|poup|save|savings|invest|cushion)/.test(text)
}

function isDebtLikeText(text: string) {
  return /(loan|emprest|debt|divid|financ|credit|cartao|parcel|consignado|fatura)/.test(text.toLowerCase())
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function HealthPage() {
  const { language } = useAppShellContext()
  const t = translations[language as keyof typeof translations]

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [incomeBase, setIncomeBase] = useState(0)
  const [expenseBase, setExpenseBase] = useState(0)
  const [netBalance, setNetBalance] = useState(0)
  const [healthSettings, setHealthSettings] = useState<HealthSettings>(defaultHealthSettings)
  const [planningSettings, setPlanningSettings] = useState<PlanningSettings>(defaultPlanningSettings)
  const [assignments, setAssignments] = useState<Record<string, PlanningBucket>>({})

  useEffect(() => {
    setPlanningSettings(parseStorage(PLANNING_SETTINGS_KEY, defaultPlanningSettings))
    setHealthSettings(parseStorage(HEALTH_SETTINGS_KEY, defaultHealthSettings))
    setAssignments(parseStorage<Record<string, PlanningBucket>>(PLANNING_ASSIGNMENTS_KEY, {}))
  }, [])

  useEffect(() => {
    localStorage.setItem(HEALTH_SETTINGS_KEY, JSON.stringify(healthSettings))
  }, [healthSettings])

  useEffect(() => {
    const loadHealthData = async () => {
      try {
        setLoading(true)
        setError(null)

        const periodStart = format(startOfMonth(new Date()), "yyyy-MM-dd")
        const periodEnd = format(endOfMonth(new Date()), "yyyy-MM-dd")

        const [summaryResponse, categoriesResponse, transactionsResponse, goalsResponse, recurringResponse] = await Promise.all([
          apiService.getFinancialSummary(periodStart, periodEnd),
          apiService.listCategories(),
          apiService.listTransactions(1, 1000, undefined, undefined, periodStart, periodEnd),
          apiService.listGoals(),
          apiService.listRecurringTransactions(0, 200, true),
        ])

        setIncomeBase(summaryResponse.total_income)
        setExpenseBase(summaryResponse.total_expense)
        setNetBalance(summaryResponse.net_balance)
        setCategories(categoriesResponse.categories)
        setTransactions(transactionsResponse.transactions)
        setGoals(goalsResponse)
        setRecurringTransactions(recurringResponse)

        setAssignments((current) => {
          const nextAssignments = { ...current }
          for (const category of categoriesResponse.categories.filter((item) => item.type === "expense")) {
            if (!nextAssignments[String(category.id)]) {
              nextAssignments[String(category.id)] = inferBucket(category.name)
            }
          }
          return nextAssignments
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load health data")
      } finally {
        setLoading(false)
      }
    }

    loadHealthData().catch(() => {
      // handled via state
    })
  }, [])

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories]
  )

  const categoryById = useMemo(
    () =>
      expenseCategories.reduce<Record<string, Category>>((accumulator, category) => {
        accumulator[String(category.id)] = category
        return accumulator
      }, {}),
    [expenseCategories]
  )

  const reserveGoals = useMemo(
    () => goals.filter(isReserveGoal),
    [goals]
  )

  const reserveBalance = useMemo(
    () =>
      reserveGoals.reduce((sum, goal) => {
        const effectiveBalance = goal.is_completed ? Math.max(goal.current_amount, goal.target_amount) : goal.current_amount
        return sum + effectiveBalance
      }, 0),
    [reserveGoals]
  )

  const recurringExpenseMonthly = useMemo(
    () =>
      recurringTransactions
        .filter((item) => item.is_active && item.type === "expense")
        .reduce((sum, item) => sum + normalizeRecurringToMonthly(item), 0),
    [recurringTransactions]
  )

  const recurringDebtMonthly = useMemo(
    () =>
      recurringTransactions
        .filter((item) => {
          if (!item.is_active || item.type !== "expense") return false
          const categoryName = item.category_id ? categoryById[String(item.category_id)]?.name ?? "" : ""
          return isDebtLikeText(`${item.description} ${categoryName}`)
        })
        .reduce((sum, item) => sum + normalizeRecurringToMonthly(item), 0),
    [categoryById, recurringTransactions]
  )

  const essentialMonthlyCost = useMemo(() => {
    const currentMonthNeeds = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => {
        const bucket = assignments[String(transaction.category_id)] || "wants"
        return bucket === "needs" ? sum + transaction.amount : sum
      }, 0)

    const recurringNeeds = recurringTransactions
      .filter((item) => item.is_active && item.type === "expense")
      .reduce((sum, item) => {
        const bucket = assignments[String(item.category_id ?? "")] || inferBucket(categoryById[String(item.category_id ?? "")]?.name ?? item.description)
        return bucket === "needs" ? sum + normalizeRecurringToMonthly(item) : sum
      }, 0)

    return Math.max(currentMonthNeeds, recurringNeeds, incomeBase * (planningSettings.needsPct / 100))
  }, [assignments, categoryById, incomeBase, planningSettings.needsPct, recurringTransactions, transactions])

  const monthlyDebtEstimate = useMemo(() => {
    const currentDebtTransactions = transactions
      .filter((transaction) => {
        if (transaction.type !== "expense") return false
        const categoryName = categoryById[String(transaction.category_id)]?.name ?? ""
        return isDebtLikeText(`${transaction.description} ${categoryName} ${transaction.notes ?? ""}`)
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return Math.max(currentDebtTransactions, recurringDebtMonthly)
  }, [categoryById, recurringDebtMonthly, transactions])

  const reserveTarget = essentialMonthlyCost * healthSettings.reserveTargetMonths
  const reserveCoverageMonths = essentialMonthlyCost > 0 ? reserveBalance / essentialMonthlyCost : 0
  const reserveCoverageRatio = reserveTarget > 0 ? reserveBalance / reserveTarget : 0
  const fixedCommitmentRatio = incomeBase > 0 ? recurringExpenseMonthly / incomeBase : 0
  const debtRatio = incomeBase > 0 ? monthlyDebtEstimate / incomeBase : 0
  const savingsRate = incomeBase > 0 ? Math.max(netBalance, 0) / incomeBase : 0
  const expensePressureRatio = incomeBase > 0 ? expenseBase / incomeBase : 0

  const healthScore = useMemo(() => {
    const reserveScore = 35 * clamp(reserveCoverageRatio, 0, 1)
    const savingsScore = 25 * clamp(savingsRate / Math.max(healthSettings.healthySavingsRatePct / 100, 0.01), 0, 1)
    const fixedScore = 20 * clamp(1 - fixedCommitmentRatio / Math.max(healthSettings.healthyFixedCommitmentPct / 100, 0.01), 0, 1)
    const balanceScore = 20 * clamp(1 - Math.max(expensePressureRatio - 1, 0), 0, 1)
    return Math.round(reserveScore + savingsScore + fixedScore + balanceScore)
  }, [
    expensePressureRatio,
    fixedCommitmentRatio,
    healthSettings.healthyFixedCommitmentPct,
    healthSettings.healthySavingsRatePct,
    reserveCoverageRatio,
    savingsRate,
  ])

  const benchmark = useMemo(() => {
    if (healthScore >= 80) return { label: t.benchmarkStrong, tone: "positive" as const, helper: t.healthGood }
    if (healthScore >= 60) return { label: t.benchmarkStable, tone: "positive" as const, helper: t.healthWatch }
    if (healthScore >= 40) return { label: t.benchmarkAttention, tone: "warning" as const, helper: t.healthWatch }
    return { label: t.benchmarkCritical, tone: "critical" as const, helper: t.healthRisk }
  }, [healthScore, t.benchmarkAttention, t.benchmarkCritical, t.benchmarkStable, t.benchmarkStrong, t.healthGood, t.healthRisk, t.healthWatch])

  const recommendations = useMemo<HealthRecommendation[]>(() => {
    const items: HealthRecommendation[] = []

    if (reserveCoverageMonths < healthSettings.reserveTargetMonths * 0.5) {
      items.push({
        title: language === "pt" ? "Acelerar a reserva" : "Accelerate reserve building",
        body:
          language === "pt"
            ? `Sua reserva cobre ${reserveCoverageMonths.toFixed(1)} meses. Direcione parte da folga mensal ou da poupanca planejada para chegar a ${healthSettings.reserveTargetMonths} meses.`
            : `Your reserve covers ${reserveCoverageMonths.toFixed(1)} months. Redirect part of monthly free cash or planned savings until you reach ${healthSettings.reserveTargetMonths} months.`,
        tone: "critical",
      })
    }

    if (fixedCommitmentRatio * 100 > healthSettings.healthyFixedCommitmentPct) {
      items.push({
        title: language === "pt" ? "Reduzir pressao fixa" : "Reduce fixed pressure",
        body:
          language === "pt"
            ? `Compromissos fixos ja consomem ${(fixedCommitmentRatio * 100).toFixed(1)}% da renda. Vale revisar contratos recorrentes, assinaturas e despesas obrigatorias para recuperar folga.`
            : `Fixed commitments already consume ${(fixedCommitmentRatio * 100).toFixed(1)}% of income. Review recurring contracts, subscriptions and mandatory bills to recover breathing room.`,
        tone: "warning",
      })
    }

    if (debtRatio > 0.2) {
      items.push({
        title: language === "pt" ? "Mapear servico de divida" : "Map debt service",
        body:
          language === "pt"
            ? `A carga estimada de dividas esta em ${(debtRatio * 100).toFixed(1)}% da renda. Consolide parcelas, renegocie juros e acompanhe categorias ligadas a cartao ou financiamento.`
            : `Estimated debt load is ${(debtRatio * 100).toFixed(1)}% of income. Consolidate installments, renegotiate rates and track categories tied to credit or financing.`,
        tone: "warning",
      })
    }

    if (savingsRate * 100 < healthSettings.healthySavingsRatePct) {
      items.push({
        title: language === "pt" ? "Aumentar taxa de poupanca" : "Lift savings rate",
        body:
          language === "pt"
            ? `A poupanca liquida do mes esta em ${(savingsRate * 100).toFixed(1)}% da renda, abaixo da referencia de ${healthSettings.healthySavingsRatePct}%. Use o modulo de planejamento para redistribuir excessos.`
            : `Net monthly savings is ${(savingsRate * 100).toFixed(1)}% of income, below the ${healthSettings.healthySavingsRatePct}% reference. Use the planning module to rebalance overages.`,
        tone: "warning",
      })
    }

    if (items.length === 0) {
      items.push({
        title: language === "pt" ? "Saude sob controle" : "Health in control",
        body: t.none,
        tone: "positive",
      })
    }

    return items
  }, [
    debtRatio,
    fixedCommitmentRatio,
    healthSettings.healthyFixedCommitmentPct,
    healthSettings.healthySavingsRatePct,
    healthSettings.reserveTargetMonths,
    language,
    reserveCoverageMonths,
    savingsRate,
    t.none,
  ])

  const diagnostics = [
    {
      label: t.reserveLabel,
      value: `${reserveCoverageMonths.toFixed(1)} ${t.months}`,
      helper: `${reserveBalance.toFixed(2)} / ${reserveTarget.toFixed(2)}`,
      tone: benchmark.tone,
      icon: PiggyBank,
    },
    {
      label: t.fixedLabel,
      value: `${(fixedCommitmentRatio * 100).toFixed(1)}%`,
      helper: `${recurringExpenseMonthly.toFixed(2)} ${t.ratioIncome}`,
      tone: fixedCommitmentRatio * 100 > healthSettings.healthyFixedCommitmentPct ? "warning" : "positive",
      icon: Wallet,
    },
    {
      label: t.debtLabel,
      value: `${(debtRatio * 100).toFixed(1)}%`,
      helper: `${monthlyDebtEstimate.toFixed(2)} ${t.ratioIncome}`,
      tone: debtRatio > 0.2 ? "warning" : "positive",
      icon: ShieldAlert,
    },
    {
      label: t.savingsLabel,
      value: `${(savingsRate * 100).toFixed(1)}%`,
      helper: `${netBalance.toFixed(2)} ${t.ratioIncome}`,
      tone: savingsRate * 100 >= healthSettings.healthySavingsRatePct ? "positive" : "warning",
      icon: TrendingDown,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Health" title={t.title} description={t.subtitle} />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">{t.loading}</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="font-serif">{t.assumptions}</CardTitle>
                <CardDescription>{t.methodologyText}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t.reserveMonths}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={healthSettings.reserveTargetMonths}
                    onChange={(event) =>
                      setHealthSettings((current) => ({
                        ...current,
                        reserveTargetMonths: Number(event.target.value) || defaultHealthSettings.reserveTargetMonths,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.fixedCommitment}</Label>
                  <Input
                    type="number"
                    min="5"
                    max="80"
                    value={healthSettings.healthyFixedCommitmentPct}
                    onChange={(event) =>
                      setHealthSettings((current) => ({
                        ...current,
                        healthyFixedCommitmentPct: Number(event.target.value) || defaultHealthSettings.healthyFixedCommitmentPct,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.savingsRate}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="80"
                    value={healthSettings.healthySavingsRatePct}
                    onChange={(event) =>
                      setHealthSettings((current) => ({
                        ...current,
                        healthySavingsRatePct: Number(event.target.value) || defaultHealthSettings.healthySavingsRatePct,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <HeartPulse className="h-4 w-4" />
                  {t.score}
                </CardTitle>
                <CardDescription>{t.benchmark}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className={`rounded-[28px] border p-5 ${benchmark.tone === "critical" ? "border-destructive/30 bg-destructive/10" : benchmark.tone === "warning" ? "border-secondary/30 bg-secondary/10" : "border-primary/20 bg-primary/10"}`}>
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{t.score}</div>
                  <div className="mt-3 text-5xl font-serif font-bold">{healthScore}</div>
                  <div className="mt-3 inline-flex rounded-full border border-border/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                    {benchmark.label}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[24px] bg-muted/60 p-4 text-sm text-muted-foreground">
                    {benchmark.helper}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {diagnostics.map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.label} className="rounded-[24px] border border-border/70 p-4">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </div>
                          <div className="mt-3 text-2xl font-serif font-bold">{item.value}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{item.helper}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="font-serif">{t.diagnostics}</CardTitle>
                <CardDescription>{t.diagnosticsHint}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="metric-card p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
                    <PiggyBank className="h-4 w-4" />
                    {t.reserveStatus}
                  </div>
                  <div className="mt-4 text-3xl font-serif font-bold">{reserveCoverageMonths.toFixed(1)} {t.months}</div>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between"><span>{t.currentReserve}</span><strong>{reserveBalance.toFixed(2)}</strong></div>
                    <div className="flex items-center justify-between"><span>{t.reserveTarget}</span><strong>{reserveTarget.toFixed(2)}</strong></div>
                    <div className="flex items-center justify-between"><span>{t.essentialBase}</span><strong>{essentialMonthlyCost.toFixed(2)}</strong></div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(reserveCoverageRatio * 100, 100)}%` }} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {reserveGoals.length > 0 ? t.reserveGoalHint : t.reserveFallback}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-border/70 p-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      {t.debtStatus}
                    </div>
                    <div className="mt-3 text-3xl font-serif font-bold">{(debtRatio * 100).toFixed(1)}%</div>
                    <div className="mt-2 text-sm text-muted-foreground">{t.debtLoad}</div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span>{t.recurringLoad}</span>
                      <strong>{(fixedCommitmentRatio * 100).toFixed(1)}%</strong>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>{t.debtLoad}</span>
                      <strong>{monthlyDebtEstimate.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border/70 p-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      <TrendingDown className="h-4 w-4" />
                      {t.savingsStatus}
                    </div>
                    <div className="mt-3 text-3xl font-serif font-bold">{(savingsRate * 100).toFixed(1)}%</div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span>{t.monthlySavings}</span>
                      <strong>{netBalance.toFixed(2)}</strong>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>{t.savingsPerformance}</span>
                      <strong>{(savingsRate * 100).toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="font-serif">{t.actionPlan}</CardTitle>
                <CardDescription>{t.methodology}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-[24px] border p-4 ${
                      item.tone === "critical"
                        ? "border-destructive/30 bg-destructive/10"
                        : item.tone === "warning"
                          ? "border-secondary/30 bg-secondary/10"
                          : "border-primary/20 bg-primary/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {item.tone === "positive" ? (
                        <ShieldCheck className="mt-0.5 h-5 w-5" />
                      ) : (
                        <ArrowRight className="mt-0.5 h-5 w-5" />
                      )}
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
