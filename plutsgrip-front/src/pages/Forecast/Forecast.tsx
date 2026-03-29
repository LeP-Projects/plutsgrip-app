import { useEffect, useMemo, useState } from "react"
import { addDays, endOfDay, endOfMonth, format, isAfter, parseISO, startOfDay, startOfMonth, subDays } from "date-fns"
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Loader2,
  ShieldAlert,
  TrendingUp,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { PageHeader } from "@/components/PageHeader"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { apiService, type RecurringTransaction, type Transaction } from "@/services/api"

interface ForecastSettings {
  startingBalance: number
  safetyFloor: number
}

interface ForecastPoint {
  date: Date
  balance: number
}

const FORECAST_SETTINGS_KEY = "forecast_settings_v1"
const FORECAST_HORIZONS = [30, 60, 90] as const

const defaultForecastSettings: ForecastSettings = {
  startingBalance: 0,
  safetyFloor: 0,
}

const translations = {
  en: {
    title: "Cash forecast",
    subtitle:
      "Project the next 30, 60 and 90 days using your recurring schedule plus the rhythm of recent cash flow.",
    assumptions: "Forecast assumptions",
    startingBalance: "Starting balance",
    safetyFloor: "Safety floor",
    loading: "Loading forecast...",
    horizons: "Projected horizons",
    lowestPoint: "Lowest point",
    firstRisk: "First risk date",
    noRisk: "No projected breach",
    inflowRhythm: "Daily income rhythm",
    outflowRhythm: "Daily expense rhythm",
    fixedIncome: "Recurring income",
    fixedExpenses: "Recurring expenses",
    methodology: "Methodology",
    methodologyText:
      "This version combines real recurring dates with an average daily rhythm calculated from the last 90 days, net of recurring commitments.",
    criticalZone: "Critical zone",
    watchZone: "Watch zone",
    resilientZone: "Resilient zone",
    caution: "Caution",
    stable: "Stable",
    critical: "Critical",
    recommendations: "Risk signals",
    positiveSignal: "Projected runway stays above your safety floor.",
    negativeSignal: "Projected balance falls below the configured floor.",
    dailyNet: "Daily net drift",
    runway: "Runway",
    days: "days",
    currentModel: "Current model",
    minBalance: "Minimum balance",
    onDate: "on",
  },
  pt: {
    title: "Projecao de caixa",
    subtitle:
      "Projete os proximos 30, 60 e 90 dias usando sua agenda recorrente mais o ritmo recente do fluxo de caixa.",
    assumptions: "Premissas da projecao",
    startingBalance: "Saldo inicial",
    safetyFloor: "Piso de seguranca",
    loading: "Carregando projecao...",
    horizons: "Horizontes projetados",
    lowestPoint: "Ponto mais baixo",
    firstRisk: "Primeira data de risco",
    noRisk: "Sem ruptura projetada",
    inflowRhythm: "Ritmo diario de entradas",
    outflowRhythm: "Ritmo diario de saidas",
    fixedIncome: "Entradas recorrentes",
    fixedExpenses: "Saidas recorrentes",
    methodology: "Metodologia",
    methodologyText:
      "Esta versao combina datas reais das recorrencias com um ritmo diario medio calculado a partir dos ultimos 90 dias, liquido dos compromissos recorrentes.",
    criticalZone: "Zona critica",
    watchZone: "Zona de atencao",
    resilientZone: "Zona resiliente",
    caution: "Atencao",
    stable: "Estavel",
    critical: "Critico",
    recommendations: "Sinais de risco",
    positiveSignal: "A projecao permanece acima do piso de seguranca configurado.",
    negativeSignal: "O saldo projetado cai abaixo do piso configurado.",
    dailyNet: "Deriva liquida diaria",
    runway: "Folego",
    days: "dias",
    currentModel: "Modelo atual",
    minBalance: "Saldo minimo",
    onDate: "em",
  },
}

function parseForecastStorage() {
  try {
    const raw = localStorage.getItem(FORECAST_SETTINGS_KEY)
    return raw ? { ...defaultForecastSettings, ...JSON.parse(raw) } : defaultForecastSettings
  } catch {
    return defaultForecastSettings
  }
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

function addFrequency(date: Date, frequency: RecurringTransaction["frequency"]) {
  switch (frequency) {
    case "daily":
      return addDays(date, 1)
    case "weekly":
      return addDays(date, 7)
    case "biweekly":
      return addDays(date, 14)
    case "quarterly":
      return addDays(date, 91)
    case "yearly":
      return addDays(date, 365)
    default:
      return addDays(date, 30)
  }
}

function buildRecurringEvents(items: RecurringTransaction[], horizonEnd: Date) {
  const events = new Map<string, number>()

  for (const item of items) {
    if (!item.is_active) continue

    const endDate = item.end_date ? endOfDay(parseISO(item.end_date)) : null
    let cursor = startOfDay(parseISO(item.next_execution_date || item.start_date))
    const floor = startOfDay(new Date())

    while (cursor < floor) {
      cursor = addFrequency(cursor, item.frequency)
    }

    while (!isAfter(cursor, horizonEnd)) {
      if (!endDate || !isAfter(cursor, endDate)) {
        const key = format(cursor, "yyyy-MM-dd")
        const signedAmount = item.type === "income" ? item.amount : -item.amount
        events.set(key, (events.get(key) || 0) + signedAmount)
      }
      cursor = addFrequency(cursor, item.frequency)
    }
  }

  return events
}

export function ForecastPage() {
  const { language } = useAppShellContext()
  const t = translations[language as keyof typeof translations]

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [settings, setSettings] = useState<ForecastSettings>(defaultForecastSettings)

  useEffect(() => {
    setSettings(parseForecastStorage())
  }, [])

  useEffect(() => {
    localStorage.setItem(FORECAST_SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const loadForecastData = async () => {
      try {
        setLoading(true)
        setError(null)

        const periodStart = format(subDays(new Date(), 89), "yyyy-MM-dd")
        const periodEnd = format(new Date(), "yyyy-MM-dd")
        const currentMonthStart = format(startOfMonth(new Date()), "yyyy-MM-dd")
        const currentMonthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd")

        const [transactionsResponse, recurringResponse, summaryResponse] = await Promise.all([
          apiService.listTransactions(1, 2000, undefined, undefined, periodStart, periodEnd),
          apiService.listRecurringTransactions(0, 200, true),
          apiService.getFinancialSummary(currentMonthStart, currentMonthEnd),
        ])

        setTransactions(transactionsResponse.transactions)
        setRecurringTransactions(recurringResponse)
        setSettings((current) => {
          if (current.startingBalance !== 0 || localStorage.getItem(FORECAST_SETTINGS_KEY)) {
            return current
          }
          return {
            ...current,
            startingBalance: summaryResponse.net_balance,
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load forecast data")
      } finally {
        setLoading(false)
      }
    }

    loadForecastData().catch(() => {
      // handled via state
    })
  }, [])

  const recurringIncomeMonthly = useMemo(
    () =>
      recurringTransactions
        .filter((item) => item.is_active && item.type === "income")
        .reduce((sum, item) => sum + normalizeRecurringToMonthly(item), 0),
    [recurringTransactions]
  )

  const recurringExpenseMonthly = useMemo(
    () =>
      recurringTransactions
        .filter((item) => item.is_active && item.type === "expense")
        .reduce((sum, item) => sum + normalizeRecurringToMonthly(item), 0),
    [recurringTransactions]
  )

  const trailingIncomeMonthly = useMemo(() => {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return totalIncome / 3
  }, [transactions])

  const trailingExpenseMonthly = useMemo(() => {
    const totalExpense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return totalExpense / 3
  }, [transactions])

  const variableIncomeDaily = Math.max(trailingIncomeMonthly - recurringIncomeMonthly, 0) / 30
  const variableExpenseDaily = Math.max(trailingExpenseMonthly - recurringExpenseMonthly, 0) / 30
  const dailyNetDrift = variableIncomeDaily - variableExpenseDaily

  const simulation = useMemo(() => {
    const today = startOfDay(new Date())
    const horizonEnd = addDays(today, 90)
    const recurringEvents = buildRecurringEvents(recurringTransactions, horizonEnd)
    const points: ForecastPoint[] = []
    let balance = settings.startingBalance
    let minimumPoint: ForecastPoint = { date: today, balance }
    let firstRiskPoint: ForecastPoint | null = balance < settings.safetyFloor ? { date: today, balance } : null

    for (let day = 1; day <= 90; day += 1) {
      const date = addDays(today, day)
      const key = format(date, "yyyy-MM-dd")
      balance += dailyNetDrift + (recurringEvents.get(key) || 0)
      const point = { date, balance }
      points.push(point)

      if (point.balance < minimumPoint.balance) {
        minimumPoint = point
      }
      if (!firstRiskPoint && point.balance < settings.safetyFloor) {
        firstRiskPoint = point
      }
    }

    const horizons = FORECAST_HORIZONS.map((days) => {
      const point = points[days - 1]
      return {
        days,
        balance: point?.balance ?? settings.startingBalance,
      }
    })

    return {
      points,
      horizons,
      minimumPoint,
      firstRiskPoint,
    }
  }, [dailyNetDrift, recurringTransactions, settings.safetyFloor, settings.startingBalance])

  const zoneMax = useMemo(() => {
    const balances = [settings.startingBalance, ...simulation.points.map((point) => point.balance), settings.safetyFloor]
    return Math.max(...balances, 1)
  }, [settings.startingBalance, settings.safetyFloor, simulation.points])

  const statusTone = simulation.firstRiskPoint
    ? simulation.minimumPoint.balance < 0
      ? "critical"
      : "warning"
    : "positive"

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Forecast" title={t.title} description={t.subtitle} />

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
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.startingBalance}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.startingBalance}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        startingBalance: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.safetyFloor}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.safetyFloor}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        safetyFloor: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <CalendarClock className="h-4 w-4" />
                  {t.horizons}
                </CardTitle>
                <CardDescription>{t.currentModel}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {simulation.horizons.map((item) => (
                  <div
                    key={item.days}
                    className={`rounded-[24px] border p-4 ${
                      item.balance < settings.safetyFloor
                        ? "border-destructive/30 bg-destructive/10"
                        : "border-primary/20 bg-primary/10"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.days} {t.days}</div>
                    <div className="mt-3 text-3xl font-serif font-bold">{item.balance.toFixed(2)}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {item.balance < settings.safetyFloor ? t.caution : t.stable}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="font-serif">{t.runway}</CardTitle>
                <CardDescription>{t.methodology}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-[24px] border border-border/70 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <ArrowUpRight className="h-4 w-4" />
                      {t.inflowRhythm}
                    </div>
                    <div className="mt-3 text-2xl font-serif font-bold">{variableIncomeDaily.toFixed(2)}</div>
                  </div>
                  <div className="rounded-[24px] border border-border/70 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <ArrowDownRight className="h-4 w-4" />
                      {t.outflowRhythm}
                    </div>
                    <div className="mt-3 text-2xl font-serif font-bold">{variableExpenseDaily.toFixed(2)}</div>
                  </div>
                  <div className="rounded-[24px] border border-border/70 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      {t.fixedIncome}
                    </div>
                    <div className="mt-3 text-2xl font-serif font-bold">{recurringIncomeMonthly.toFixed(2)}</div>
                  </div>
                  <div className="rounded-[24px] border border-border/70 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      {t.fixedExpenses}
                    </div>
                    <div className="mt-3 text-2xl font-serif font-bold">{recurringExpenseMonthly.toFixed(2)}</div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-border/70 bg-muted/30 p-5">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{t.resilientZone}</span>
                    <span>{t.criticalZone}</span>
                  </div>
                  <div className="mt-4 flex h-52 items-end gap-1 overflow-hidden rounded-[22px] bg-card/70 px-2 py-3">
                    {simulation.points.map((point) => {
                      const safeHeight = Math.max((Math.max(point.balance, 0) / zoneMax) * 100, 4)
                      const isCritical = point.balance < settings.safetyFloor
                      const isWarning = !isCritical && point.balance < settings.safetyFloor + Math.max(settings.safetyFloor * 0.2, 100)
                      return (
                        <div key={point.date.toISOString()} className="flex h-full flex-1 items-end">
                          <div
                            className={`w-full rounded-t-full ${
                              isCritical ? "bg-destructive" : isWarning ? "bg-secondary" : "bg-primary"
                            }`}
                            style={{ height: `${safeHeight}%` }}
                            title={`${format(point.date, "dd/MM")} - ${point.balance.toFixed(2)}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="font-serif">{t.recommendations}</CardTitle>
                <CardDescription>{t.dailyNet}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`rounded-[24px] border p-4 ${
                  statusTone === "critical"
                    ? "border-destructive/30 bg-destructive/10"
                    : statusTone === "warning"
                      ? "border-secondary/30 bg-secondary/10"
                      : "border-primary/20 bg-primary/10"
                }`}>
                  <div className="flex items-start gap-3">
                    {statusTone === "positive" ? (
                      <TrendingUp className="mt-0.5 h-5 w-5" />
                    ) : (
                      <ShieldAlert className="mt-0.5 h-5 w-5" />
                    )}
                    <div>
                      <div className="font-semibold">
                        {statusTone === "positive" ? t.stable : t.critical}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {statusTone === "positive" ? t.positiveSignal : t.negativeSignal}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-border/70 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.lowestPoint}</div>
                  <div className="mt-3 text-3xl font-serif font-bold">{simulation.minimumPoint.balance.toFixed(2)}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t.onDate} {format(simulation.minimumPoint.date, "dd/MM/yyyy")}
                  </div>
                </div>

                <div className="rounded-[24px] border border-border/70 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.firstRisk}</div>
                  <div className="mt-3 text-2xl font-serif font-bold">
                    {simulation.firstRiskPoint ? format(simulation.firstRiskPoint.date, "dd/MM/yyyy") : t.noRisk}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {simulation.firstRiskPoint ? `${t.minBalance}: ${simulation.firstRiskPoint.balance.toFixed(2)}` : t.positiveSignal}
                  </div>
                </div>

                <div className="rounded-[24px] border border-border/70 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.dailyNet}</div>
                  <div className="mt-3 text-3xl font-serif font-bold">{dailyNetDrift.toFixed(2)}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {simulation.points.findIndex((point) => point.balance < settings.safetyFloor) >= 0
                      ? `${simulation.points.findIndex((point) => point.balance < settings.safetyFloor) + 1} ${t.days}`
                      : t.positiveSignal}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
