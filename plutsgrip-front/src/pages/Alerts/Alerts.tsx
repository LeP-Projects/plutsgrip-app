import { useEffect, useMemo, useState } from "react"
import { endOfMonth, format, startOfMonth, subDays } from "date-fns"
import {
  AlertCircle,
  BellRing,
  CalendarClock,
  CreditCard,
  Loader2,
  TriangleAlert,
  Wallet,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { PageHeader } from "@/components/PageHeader"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { apiService, type Budget, type BudgetStatus, type Category, type RecurringTransaction, type Transaction } from "@/services/api"

type AlertLevel = "critical" | "warning" | "info"
type AlertType = "budget" | "anomaly" | "subscription" | "forecast"

interface AlertItem {
  id: string
  title: string
  body: string
  level: AlertLevel
  type: AlertType
}

const translations = {
  en: {
    title: "Alerts center",
    subtitle:
      "Detect budget ruptures, unusual spikes and recurring charges that deserve review before they become costly habits.",
    loading: "Loading alerts...",
    summary: "Alert posture",
    openAlerts: "Open alerts",
    critical: "Critical",
    warning: "Warning",
    info: "Info",
    noAlerts: "No active alerts right now.",
    budgetRupture: "Budget rupture",
    anomaly: "Out-of-pattern spike",
    subscription: "Recurring review",
    forecast: "Projected cash risk",
    methodology: "Methodology",
    methodologyText:
      "This version combines budget status, recent transactions, recurring charges and forecast signals to surface auditable alerts.",
    criticalCount: "Critical signals",
    warningCount: "Warnings",
    infoCount: "Informational",
  },
  pt: {
    title: "Central de alertas",
    subtitle:
      "Detecte ruptura de orcamento, picos fora do padrao e cobrancas recorrentes que merecem revisao antes de virarem habito caro.",
    loading: "Carregando alertas...",
    summary: "Postura de alertas",
    openAlerts: "Alertas abertos",
    critical: "Critico",
    warning: "Atencao",
    info: "Info",
    noAlerts: "Nenhum alerta ativo no momento.",
    budgetRupture: "Ruptura de orcamento",
    anomaly: "Pico fora do padrao",
    subscription: "Revisao de recorrencias",
    forecast: "Risco de caixa projetado",
    methodology: "Metodologia",
    methodologyText:
      "Esta versao combina status de orcamentos, transacoes recentes, cobrancas recorrentes e sinais de projecao para exibir alertas auditaveis.",
    criticalCount: "Sinais criticos",
    warningCount: "Atencoes",
    infoCount: "Informativos",
  },
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

export function AlertsPage() {
  const { language } = useAppShellContext()
  const t = translations[language as keyof typeof translations]

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetStatuses, setBudgetStatuses] = useState<Record<string, BudgetStatus>>({})
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])

  useEffect(() => {
    const loadAlertsData = async () => {
      try {
        setLoading(true)
        setError(null)

        const periodStart = format(subDays(new Date(), 59), "yyyy-MM-dd")
        const periodEnd = format(new Date(), "yyyy-MM-dd")
        const currentMonthStart = format(startOfMonth(new Date()), "yyyy-MM-dd")
        const currentMonthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd")

        const [categoriesResponse, budgetsResponse, recurringResponse, transactionsResponse] = await Promise.all([
          apiService.listCategories(),
          apiService.listBudgets(),
          apiService.listRecurringTransactions(0, 200, true),
          apiService.listTransactions(1, 2000, "expense", undefined, periodStart, periodEnd),
        ])

        const statusEntries = await Promise.all(
          budgetsResponse.map(async (budget) => {
            const status = await apiService.getBudgetStatus(budget.id)
            return [budget.id, status] as const
          })
        )

        await apiService.getFinancialSummary(currentMonthStart, currentMonthEnd)

        setCategories(categoriesResponse.categories)
        setBudgets(budgetsResponse)
        setBudgetStatuses(Object.fromEntries(statusEntries))
        setRecurringTransactions(recurringResponse)
        setTransactions(transactionsResponse.transactions)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load alerts")
      } finally {
        setLoading(false)
      }
    }

    loadAlertsData().catch(() => {
      // handled in state
    })
  }, [])

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [String(category.id), category.name])),
    [categories]
  )

  const alerts = useMemo<AlertItem[]>(() => {
    const items: AlertItem[] = []

    for (const budget of budgets) {
      const status = budgetStatuses[budget.id]
      if (!status) continue

      if (status.is_exceeded) {
        items.push({
          id: `budget-${budget.id}`,
          type: "budget",
          level: "critical",
          title: `${t.budgetRupture}: ${categoryMap.get(String(budget.category_id)) ?? budget.category_id}`,
          body:
            language === "pt"
              ? `O gasto ja excedeu o limite em ${Math.abs(status.remaining_amount).toFixed(2)} e atingiu ${status.percentage_used.toFixed(0)}% do orcamento.`
              : `Spending already exceeded the limit by ${Math.abs(status.remaining_amount).toFixed(2)} and reached ${status.percentage_used.toFixed(0)}% of budget.`,
        })
      } else if (status.percentage_used >= 85) {
        items.push({
          id: `budget-watch-${budget.id}`,
          type: "budget",
          level: "warning",
          title: `${t.budgetRupture}: ${categoryMap.get(String(budget.category_id)) ?? budget.category_id}`,
          body:
            language === "pt"
              ? `O orcamento consumiu ${status.percentage_used.toFixed(0)}% e pode romper antes do fechamento do periodo.`
              : `This budget consumed ${status.percentage_used.toFixed(0)}% and may break before the period closes.`,
        })
      }
    }

    const byCategory = new Map<string, number[]>()
    for (const transaction of transactions) {
      const key = String(transaction.category_id)
      const series = byCategory.get(key) ?? []
      series.push(transaction.amount)
      byCategory.set(key, series)
    }

    for (const transaction of transactions.slice(-30)) {
      const categoryKey = String(transaction.category_id)
      const series = byCategory.get(categoryKey) ?? []
      const average = series.reduce((sum, value) => sum + value, 0) / Math.max(series.length, 1)

      if (average > 0 && transaction.amount >= average * 2.5 && transaction.amount >= 100) {
        items.push({
          id: `anomaly-${transaction.id}`,
          type: "anomaly",
          level: "warning",
          title: `${t.anomaly}: ${transaction.description}`,
          body:
            language === "pt"
              ? `${transaction.description} ficou em ${transaction.amount.toFixed(2)}, cerca de ${(transaction.amount / average).toFixed(1)}x a media da categoria ${categoryMap.get(categoryKey) ?? "-"}.`
              : `${transaction.description} posted at ${transaction.amount.toFixed(2)}, about ${(transaction.amount / average).toFixed(1)}x the category average for ${categoryMap.get(categoryKey) ?? "-"}.`,
        })
      }
    }

    const recurringExpenseItems = recurringTransactions.filter((item) => item.type === "expense" && item.is_active)
    for (const item of recurringExpenseItems) {
      const monthlyCost = normalizeRecurringToMonthly(item)
      if (monthlyCost >= 250) {
        items.push({
          id: `recurring-${item.id}`,
          type: "subscription",
          level: "info",
          title: `${t.subscription}: ${item.description}`,
          body:
            language === "pt"
              ? `A recorrencia equivale a ${monthlyCost.toFixed(2)} por mes. Vale confirmar se ainda faz sentido manter esse compromisso ativo.`
              : `This recurring charge represents ${monthlyCost.toFixed(2)} per month. It may be worth checking if it still deserves to stay active.`,
        })
      }
    }

    const recentThirtyDays = transactions.filter((transaction) => new Date(transaction.date) >= subDays(new Date(), 30))
    const previousThirtyDays = transactions.filter((transaction) => {
      const date = new Date(transaction.date)
      return date < subDays(new Date(), 30) && date >= subDays(new Date(), 60)
    })
    const recentTotal = recentThirtyDays.reduce((sum, transaction) => sum + transaction.amount, 0)
    const previousTotal = previousThirtyDays.reduce((sum, transaction) => sum + transaction.amount, 0)

    if (previousTotal > 0 && recentTotal >= previousTotal * 1.3) {
      items.push({
        id: "forecast-cash-risk",
        type: "forecast",
        level: "warning",
        title: t.forecast,
        body:
          language === "pt"
            ? `As saidas dos ultimos 30 dias cresceram ${(recentTotal / previousTotal - 1) * 100 > 0 ? ((recentTotal / previousTotal - 1) * 100).toFixed(0) : "0"}% sobre a janela anterior. Se o ritmo continuar, a projecao tende a piorar.`
            : `Expense outflow over the last 30 days grew ${((recentTotal / previousTotal - 1) * 100).toFixed(0)}% versus the prior window. If that pace holds, the cash forecast is likely to worsen.`,
      })
    }

    return items
      .sort((left, right) => {
        const weight = { critical: 0, warning: 1, info: 2 }
        return weight[left.level] - weight[right.level]
      })
      .slice(0, 12)
  }, [budgetStatuses, budgets, categoryMap, language, recurringTransactions, t.anomaly, t.budgetRupture, t.forecast, t.subscription, transactions])

  const counts = useMemo(
    () => ({
      critical: alerts.filter((item) => item.level === "critical").length,
      warning: alerts.filter((item) => item.level === "warning").length,
      info: alerts.filter((item) => item.level === "info").length,
    }),
    [alerts]
  )

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Alerts" title={t.title} description={t.subtitle} />

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
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="panel-surface md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <BellRing className="h-4 w-4" />
                  {t.summary}
                </CardTitle>
                <CardDescription>{t.methodologyText}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-serif font-bold">{alerts.length}</div>
                <div className="mt-3 text-sm text-muted-foreground">{t.openAlerts}</div>
              </CardContent>
            </Card>

            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="font-serif">{t.criticalCount}</CardTitle>
              </CardHeader>
              <CardContent className="text-4xl font-serif font-bold text-destructive">{counts.critical}</CardContent>
            </Card>

            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="font-serif">{t.warningCount}</CardTitle>
              </CardHeader>
              <CardContent className="text-4xl font-serif font-bold text-secondary">{counts.warning}</CardContent>
            </Card>
          </div>

          <Card className="panel-surface">
            <CardHeader>
              <CardTitle className="font-serif">{t.openAlerts}</CardTitle>
              <CardDescription>{t.methodology}</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="rounded-[24px] border border-border/70 p-6 text-sm text-muted-foreground">
                  {t.noAlerts}
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((item) => {
                    const Icon =
                      item.type === "budget"
                        ? Wallet
                        : item.type === "anomaly"
                          ? TriangleAlert
                          : item.type === "subscription"
                            ? CreditCard
                            : CalendarClock

                    return (
                      <div
                        key={item.id}
                        className={`rounded-[24px] border p-4 ${
                          item.level === "critical"
                            ? "border-destructive/30 bg-destructive/10"
                            : item.level === "warning"
                              ? "border-secondary/30 bg-secondary/10"
                              : "border-primary/20 bg-primary/10"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="mt-0.5 h-5 w-5" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div className="font-semibold">{item.title}</div>
                              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                {item.level === "critical" ? t.critical : item.level === "warning" ? t.warning : t.info}
                              </div>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
