import { useEffect, useMemo, useState } from "react"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { AlertCircle, Calculator, Loader2, PiggyBank, Scale, Wallet } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { PageHeader } from "@/components/PageHeader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { apiService, type Budget, type Category, type Transaction } from "@/services/api"

type PlanningBucket = "needs" | "wants" | "savings"

interface PlanningSettings {
  needsPct: number
  wantsPct: number
  savingsPct: number
  zeroBasedSavingsAmount: number
}

const STORAGE_SETTINGS_KEY = "planning_settings_v1"
const STORAGE_ASSIGNMENTS_KEY = "planning_assignments_v1"

const defaultSettings: PlanningSettings = {
  needsPct: 50,
  wantsPct: 30,
  savingsPct: 20,
  zeroBasedSavingsAmount: 0,
}

const translations = {
  en: {
    title: "Planning",
    subtitle: "Turn monthly income into an intentional plan with 50-30-20 guidance and zero-based visibility.",
    assumptions: "Planning assumptions",
    allocations: "Bucket allocation",
    categoryAssignments: "Category mapping",
    suggestions: "Suggested monthly envelopes",
    needs: "Needs",
    wants: "Wants",
    savings: "Savings",
    incomeBase: "Income base",
    target: "Target",
    planned: "Planned",
    actual: "Actual",
    remaining: "Remaining",
    needsPct: "Needs %",
    wantsPct: "Wants %",
    savingsPct: "Savings %",
    savingsAmount: "Savings allocation",
    monthlyIncome: "Monthly income",
    zeroBased: "Zero-based budget",
    totalAllocated: "Allocated",
    unassigned: "Unassigned",
    category: "Category",
    bucket: "Bucket",
    recommendedBudget: "Suggested budget",
    noSuggestions: "Create categories and budgets to see suggestions.",
    loading: "Loading planning data...",
    filterMonth: "Reference month",
    monthlyPeriod: "Current month",
    budgetHealth: "Budget posture",
    overallocated: "Overallocated",
    inBalance: "Balanced",
    freeCash: "Free cash",
  },
  pt: {
    title: "Planejamento",
    subtitle: "Transforme a renda do mes em um plano intencional com guia 50-30-20 e visibilidade de orcamento base zero.",
    assumptions: "Premissas do planejamento",
    allocations: "Distribuicao por bloco",
    categoryAssignments: "Mapa de categorias",
    suggestions: "Sugestoes mensais por categoria",
    needs: "Essenciais",
    wants: "Estilo de vida",
    savings: "Poupanca",
    incomeBase: "Base de renda",
    target: "Meta",
    planned: "Planejado",
    actual: "Realizado",
    remaining: "Saldo",
    needsPct: "Essenciais %",
    wantsPct: "Estilo de vida %",
    savingsPct: "Poupanca %",
    savingsAmount: "Reserva planejada",
    monthlyIncome: "Renda mensal",
    zeroBased: "Orcamento base zero",
    totalAllocated: "Alocado",
    unassigned: "Nao alocado",
    category: "Categoria",
    bucket: "Bloco",
    recommendedBudget: "Orcamento sugerido",
    noSuggestions: "Crie categorias e orcamentos para ver sugestoes.",
    loading: "Carregando planejamento...",
    filterMonth: "Mes de referencia",
    monthlyPeriod: "Mes atual",
    budgetHealth: "Postura orcamentaria",
    overallocated: "Excedido",
    inBalance: "Em equilibrio",
    freeCash: "Folga",
  },
}

function normalizeBudgetToMonthly(budget: Budget) {
  switch (budget.period) {
    case "quarterly":
      return budget.amount / 3
    case "yearly":
      return budget.amount / 12
    default:
      return budget.amount
  }
}

function inferBucket(categoryName: string): PlanningBucket {
  const name = categoryName.toLowerCase()
  if (/(rent|housing|moradia|aluguel|mercado|grocery|supermarket|health|saude|transport|transporte|utilities|internet|energia|agua)/.test(name)) {
    return "needs"
  }
  if (/(save|reserva|invest|poup|wealth|future)/.test(name)) {
    return "savings"
  }
  return "wants"
}

export function PlanningPage() {
  const { language } = useAppShellContext()
  const t = translations[language as keyof typeof translations]

  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [incomeBase, setIncomeBase] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<PlanningSettings>(defaultSettings)
  const [assignments, setAssignments] = useState<Record<string, PlanningBucket>>({})

  useEffect(() => {
    const storedSettings = localStorage.getItem(STORAGE_SETTINGS_KEY)
    const storedAssignments = localStorage.getItem(STORAGE_ASSIGNMENTS_KEY)

    if (storedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) })
    }
    if (storedAssignments) {
      setAssignments(JSON.parse(storedAssignments))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem(STORAGE_ASSIGNMENTS_KEY, JSON.stringify(assignments))
  }, [assignments])

  useEffect(() => {
    const loadPlanningData = async () => {
      try {
        setLoading(true)
        setError(null)

        const periodStart = format(startOfMonth(new Date()), "yyyy-MM-dd")
        const periodEnd = format(endOfMonth(new Date()), "yyyy-MM-dd")

        const [categoriesResponse, budgetsResponse, summaryResponse, transactionsResponse] = await Promise.all([
          apiService.listCategories(),
          apiService.listBudgets(),
          apiService.getFinancialSummary(periodStart, periodEnd),
          apiService.listTransactions(1, 1000, undefined, undefined, periodStart, periodEnd),
        ])

        setCategories(categoriesResponse.categories)
        setBudgets(budgetsResponse)
        setTransactions(transactionsResponse.transactions)
        setIncomeBase(summaryResponse.total_income)

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
        setError(err instanceof Error ? err.message : "Failed to load planning")
      } finally {
        setLoading(false)
      }
    }

    loadPlanningData().catch(() => {
      // state already handled
    })
  }, [])

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories]
  )

  const expenseTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === "expense"),
    [transactions]
  )

  const bucketSummary = useMemo(() => {
    const targetByBucket: Record<PlanningBucket, number> = {
      needs: incomeBase * (settings.needsPct / 100),
      wants: incomeBase * (settings.wantsPct / 100),
      savings: incomeBase * (settings.savingsPct / 100),
    }

    const plannedByBucket: Record<PlanningBucket, number> = {
      needs: 0,
      wants: 0,
      savings: settings.zeroBasedSavingsAmount,
    }

    const actualByBucket: Record<PlanningBucket, number> = {
      needs: 0,
      wants: 0,
      savings: 0,
    }

    budgets.forEach((budget) => {
      const bucket = assignments[String(budget.category_id)] || "wants"
      plannedByBucket[bucket] += normalizeBudgetToMonthly(budget)
    })

    expenseTransactions.forEach((transaction) => {
      const bucket = assignments[String(transaction.category_id)] || "wants"
      actualByBucket[bucket] += transaction.amount
    })

    return (["needs", "wants", "savings"] as PlanningBucket[]).map((bucket) => ({
      bucket,
      target: targetByBucket[bucket],
      planned: plannedByBucket[bucket],
      actual: actualByBucket[bucket],
      remaining: targetByBucket[bucket] - plannedByBucket[bucket],
    }))
  }, [assignments, budgets, expenseTransactions, incomeBase, settings])

  const zeroBased = useMemo(() => {
    const totalBudgeted = budgets.reduce((sum, budget) => sum + normalizeBudgetToMonthly(budget), 0)
    const totalAllocated = totalBudgeted + settings.zeroBasedSavingsAmount
    const balance = incomeBase - totalAllocated
    return { totalAllocated, balance }
  }, [budgets, incomeBase, settings.zeroBasedSavingsAmount])

  const categorySuggestions = useMemo(() => {
    const spendByCategory = new Map<string, number>()
    expenseTransactions.forEach((transaction) => {
      spendByCategory.set(String(transaction.category_id), (spendByCategory.get(String(transaction.category_id)) || 0) + transaction.amount)
    })

    return expenseCategories.map((category) => {
      const bucket = assignments[String(category.id)] || "wants"
      const bucketData = bucketSummary.find((item) => item.bucket === bucket)
      const totalBucketSpend = expenseCategories
        .filter((item) => (assignments[String(item.id)] || "wants") === bucket)
        .reduce((sum, item) => sum + (spendByCategory.get(String(item.id)) || 0), 0)

      const categorySpend = spendByCategory.get(String(category.id)) || 0
      const share = totalBucketSpend > 0 ? categorySpend / totalBucketSpend : 1 / Math.max(1, expenseCategories.filter((item) => (assignments[String(item.id)] || "wants") === bucket).length)
      const suggestedBudget = (bucketData?.target || 0) * share

      return {
        id: category.id,
        name: category.name,
        bucket,
        suggestedBudget,
      }
    })
  }, [assignments, bucketSummary, expenseCategories, expenseTransactions])

  const handleSettingChange = (field: keyof PlanningSettings, value: number) => {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Planning" title={t.title} description={t.subtitle} />

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
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="font-serif">{t.assumptions}</CardTitle>
                <CardDescription>{t.filterMonth}: {t.monthlyPeriod}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.monthlyIncome}</Label>
                  <Input type="number" min="0" step="0.01" value={incomeBase} onChange={(event) => setIncomeBase(Number(event.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>{t.savingsAmount}</Label>
                  <Input type="number" min="0" step="0.01" value={settings.zeroBasedSavingsAmount} onChange={(event) => handleSettingChange("zeroBasedSavingsAmount", Number(event.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>{t.needsPct}</Label>
                  <Input type="number" min="0" max="100" value={settings.needsPct} onChange={(event) => handleSettingChange("needsPct", Number(event.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>{t.wantsPct}</Label>
                  <Input type="number" min="0" max="100" value={settings.wantsPct} onChange={(event) => handleSettingChange("wantsPct", Number(event.target.value) || 0)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t.savingsPct}</Label>
                  <Input type="number" min="0" max="100" value={settings.savingsPct} onChange={(event) => handleSettingChange("savingsPct", Number(event.target.value) || 0)} />
                </div>
              </CardContent>
            </Card>

            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Scale className="h-4 w-4" />
                  {t.zeroBased}
                </CardTitle>
                <CardDescription>{t.budgetHealth}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-primary/10 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-primary">{t.monthlyIncome}</div>
                  <div className="mt-3 text-3xl font-serif font-bold">{incomeBase.toFixed(2)}</div>
                </div>
                <div className="rounded-3xl bg-secondary/15 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-secondary">{t.totalAllocated}</div>
                  <div className="mt-3 text-3xl font-serif font-bold">{zeroBased.totalAllocated.toFixed(2)}</div>
                </div>
                <div className={`rounded-3xl p-5 ${zeroBased.balance < 0 ? "bg-destructive/10" : "bg-green-500/10"}`}>
                  <div className="text-xs uppercase tracking-[0.22em]">{zeroBased.balance < 0 ? t.overallocated : t.freeCash}</div>
                  <div className="mt-3 text-3xl font-serif font-bold">{zeroBased.balance.toFixed(2)}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{zeroBased.balance < 0 ? t.overallocated : t.inBalance}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {bucketSummary.map((item) => {
              const label = t[item.bucket]
              const Icon = item.bucket === "savings" ? PiggyBank : item.bucket === "needs" ? Wallet : Calculator
              return (
                <Card key={item.bucket} className="panel-surface">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Icon className="h-4 w-4" />
                      {label}
                    </CardTitle>
                    <CardDescription>{t.allocations}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between"><span>{t.target}</span><strong>{item.target.toFixed(2)}</strong></div>
                    <div className="flex items-center justify-between"><span>{t.planned}</span><strong>{item.planned.toFixed(2)}</strong></div>
                    <div className="flex items-center justify-between"><span>{t.actual}</span><strong>{item.actual.toFixed(2)}</strong></div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className={`h-2 rounded-full ${item.remaining < 0 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${Math.min((item.planned / Math.max(item.target, 1)) * 100, 100)}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground"><span>{t.remaining}</span><span>{item.remaining.toFixed(2)}</span></div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="font-serif">{t.categoryAssignments}</CardTitle>
                <CardDescription>{t.allocations}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {expenseCategories.map((category) => (
                  <div key={category.id} className="grid items-center gap-3 rounded-2xl border border-border/70 p-3 md:grid-cols-[1fr_170px]">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">{t.category}</div>
                    </div>
                    <Select value={assignments[String(category.id)] || "wants"} onValueChange={(value) => setAssignments((current) => ({ ...current, [String(category.id)]: value as PlanningBucket }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.bucket} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="needs">{t.needs}</SelectItem>
                        <SelectItem value="wants">{t.wants}</SelectItem>
                        <SelectItem value="savings">{t.savings}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="font-serif">{t.suggestions}</CardTitle>
                <CardDescription>{t.incomeBase}: {incomeBase.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent>
                {categorySuggestions.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">{t.noSuggestions}</div>
                ) : (
                  <div className="space-y-3">
                    {categorySuggestions.map((category) => (
                      <div key={category.id} className="grid gap-2 rounded-2xl border border-border/70 p-4 md:grid-cols-[1fr_140px_140px] md:items-center">
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t[category.bucket]}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{t.recommendedBudget}</div>
                        <div className="text-lg font-semibold">{category.suggestedBudget.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
