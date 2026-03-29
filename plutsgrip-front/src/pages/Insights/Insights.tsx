import { useEffect, useMemo, useState } from "react"
import {
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns"
import {
  AlertCircle,
  CalendarRange,
  Lightbulb,
  Loader2,
  PieChart,
  Sparkles,
  TrendingUp,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { PageHeader } from "@/components/PageHeader"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { apiService, type Category, type MonthlyTrends, type SpendingPatterns, type Transaction } from "@/services/api"

interface CategorySeasonality {
  categoryId: string
  categoryName: string
  peakMonth: string
  peakValue: number
  averageValue: number
  amplitude: number
}

interface InsightCard {
  title: string
  body: string
  tone: "positive" | "warning" | "neutral"
}

const translations = {
  en: {
    title: "Insights & seasonality",
    subtitle:
      "Spot concentration, seasonal spikes and recent momentum before they become monthly surprises.",
    loading: "Loading insights...",
    seasonality: "Seasonality radar",
    concentration: "Expense concentration",
    momentum: "Recent momentum",
    insightFeed: "Insight feed",
    methodology: "Methodology",
    methodologyText:
      "This version uses the last 12 months of expenses, monthly trends and spending patterns already available in the product.",
    noSeasonality: "Not enough historical variance yet to flag seasonality.",
    topShare: "Top 3 categories",
    averageSpend: "Average spend",
    peakMonth: "Peak month",
    amplitude: "Amplitude",
    currentMonth: "Current month",
    quarterAverage: "3-month average",
    growth: "Growth vs average",
    strongestCategory: "Strongest pressure category",
    dailyAverage: "Average daily spend",
    recommendations: "Key insights",
    stable: "Stable",
    warning: "Attention",
    positive: "Positive",
  },
  pt: {
    title: "Insights e sazonalidade",
    subtitle:
      "Identifique concentracao, picos sazonais e mudancas recentes antes que virem surpresa no fechamento do mes.",
    loading: "Carregando insights...",
    seasonality: "Radar de sazonalidade",
    concentration: "Concentracao das despesas",
    momentum: "Movimento recente",
    insightFeed: "Feed de insights",
    methodology: "Metodologia",
    methodologyText:
      "Esta versao usa os ultimos 12 meses de despesas, tendencias mensais e padroes de gasto ja disponiveis no produto.",
    noSeasonality: "Ainda nao ha variacao historica suficiente para sinalizar sazonalidade.",
    topShare: "Top 3 categorias",
    averageSpend: "Gasto medio",
    peakMonth: "Mes de pico",
    amplitude: "Amplitude",
    currentMonth: "Mes atual",
    quarterAverage: "Media de 3 meses",
    growth: "Crescimento vs media",
    strongestCategory: "Categoria de maior pressao",
    dailyAverage: "Gasto medio diario",
    recommendations: "Insights centrais",
    stable: "Estavel",
    warning: "Atencao",
    positive: "Positivo",
  },
}

function monthKey(date: string) {
  return format(new Date(date), "yyyy-MM")
}

export function InsightsPage() {
  const { language } = useAppShellContext()
  const t = translations[language as keyof typeof translations]

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrends | null>(null)
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPatterns | null>(null)

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true)
        setError(null)

        const startDate = format(startOfMonth(subMonths(new Date(), 11)), "yyyy-MM-dd")
        const endDate = format(endOfMonth(new Date()), "yyyy-MM-dd")

        const [categoriesResponse, transactionsResponse, trendsResponse, patternsResponse] = await Promise.all([
          apiService.listCategories(),
          apiService.listTransactions(1, 4000, "expense", undefined, startDate, endDate),
          apiService.getMonthlyTrends(12),
          apiService.getSpendingPatterns(),
        ])

        setCategories(categoriesResponse.categories)
        setTransactions(transactionsResponse.transactions)
        setMonthlyTrends(trendsResponse)
        setSpendingPatterns(patternsResponse)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load insights")
      } finally {
        setLoading(false)
      }
    }

    loadInsights().catch(() => {
      // handled in state
    })
  }, [])

  const expenseCategoriesById = useMemo(
    () =>
      categories
        .filter((category) => category.type === "expense")
        .reduce<Record<string, string>>((accumulator, category) => {
          accumulator[String(category.id)] = category.name
          return accumulator
        }, {}),
    [categories]
  )

  const monthlyCategoryTotals = useMemo(() => {
    const totals = new Map<string, Map<string, number>>()
    for (const transaction of transactions) {
      const key = monthKey(transaction.date)
      const monthMap = totals.get(key) ?? new Map<string, number>()
      monthMap.set(String(transaction.category_id), (monthMap.get(String(transaction.category_id)) || 0) + transaction.amount)
      totals.set(key, monthMap)
    }
    return totals
  }, [transactions])

  const currentMonthKey = format(new Date(), "yyyy-MM")
  const currentMonthTotals = monthlyCategoryTotals.get(currentMonthKey) ?? new Map<string, number>()

  const concentration = useMemo(() => {
    const entries = Array.from(currentMonthTotals.entries())
      .map(([categoryId, total]) => ({
        categoryId,
        categoryName: expenseCategoriesById[categoryId] ?? categoryId,
        total,
      }))
      .sort((left, right) => right.total - left.total)

    const totalSpent = entries.reduce((sum, item) => sum + item.total, 0)
    const topThree = entries.slice(0, 3)
    const share = totalSpent > 0 ? (topThree.reduce((sum, item) => sum + item.total, 0) / totalSpent) * 100 : 0

    return {
      totalSpent,
      topThree,
      share,
    }
  }, [currentMonthTotals, expenseCategoriesById])

  const seasonality = useMemo<CategorySeasonality[]>(() => {
    const categorySeries = new Map<string, number[]>()

    for (const [, totals] of monthlyCategoryTotals) {
      for (const [categoryId, total] of totals.entries()) {
        const series = categorySeries.get(categoryId) ?? []
        series.push(total)
        categorySeries.set(categoryId, series)
      }
    }

    return Array.from(categorySeries.entries())
      .map(([categoryId, values]) => {
        const averageValue = values.reduce((sum, value) => sum + value, 0) / values.length
        const peakValue = Math.max(...values)
        const amplitude = averageValue > 0 ? peakValue / averageValue : 0

        let peakMonth = currentMonthKey
        for (const [month, totals] of monthlyCategoryTotals.entries()) {
          if ((totals.get(categoryId) || 0) === peakValue) {
            peakMonth = month
            break
          }
        }

        return {
          categoryId,
          categoryName: expenseCategoriesById[categoryId] ?? categoryId,
          peakMonth,
          peakValue,
          averageValue,
          amplitude,
        }
      })
      .filter((item) => item.averageValue > 0 && item.amplitude >= 1.25)
      .sort((left, right) => right.amplitude - left.amplitude)
      .slice(0, 4)
  }, [currentMonthKey, expenseCategoriesById, monthlyCategoryTotals])

  const momentum = useMemo(() => {
    const expenseSeries = monthlyTrends?.expense ?? []
    const current = expenseSeries[expenseSeries.length - 1]?.value ?? 0
    const previousQuarter = expenseSeries.slice(-4, -1)
    const quarterAverage =
      previousQuarter.length > 0
        ? previousQuarter.reduce((sum, item) => sum + item.value, 0) / previousQuarter.length
        : 0
    const growth = quarterAverage > 0 ? ((current - quarterAverage) / quarterAverage) * 100 : 0

    return {
      current,
      quarterAverage,
      growth,
    }
  }, [monthlyTrends?.expense])

  const insightFeed = useMemo<InsightCard[]>(() => {
    const feed: InsightCard[] = []

    if (concentration.share >= 65 && concentration.topThree.length > 0) {
      feed.push({
        title: language === "pt" ? "Gasto concentrado demais" : "Expenses are highly concentrated",
        body:
          language === "pt"
            ? `${concentration.topThree.map((item) => item.categoryName).join(", ")} ja respondem por ${concentration.share.toFixed(0)}% das saidas do mes. Vale revisar esses blocos antes de buscar microcortes.`
            : `${concentration.topThree.map((item) => item.categoryName).join(", ")} already represent ${concentration.share.toFixed(0)}% of this month's expenses. Review those blocks before chasing micro-savings.`,
        tone: "warning",
      })
    }

    if (momentum.growth >= 15) {
      feed.push({
        title: language === "pt" ? "Ritmo de gasto acelerando" : "Spending momentum is accelerating",
        body:
          language === "pt"
            ? `O gasto do mes esta ${momentum.growth.toFixed(0)}% acima da media recente de tres meses. Pode ser sinal de inflacao de estilo de vida ou antecipacao de despesas.`
            : `This month's spending is ${momentum.growth.toFixed(0)}% above the recent 3-month average. That can signal lifestyle inflation or front-loaded expenses.`,
        tone: "warning",
      })
    }

    if (seasonality.length > 0) {
      const leading = seasonality[0]
      feed.push({
        title: language === "pt" ? "Sazonalidade clara detectada" : "Clear seasonality detected",
        body:
          language === "pt"
            ? `${leading.categoryName} costuma ter pico em ${leading.peakMonth} e chega a ${leading.amplitude.toFixed(1)}x a propria media. Vale antecipar provisao para esse bloco.`
            : `${leading.categoryName} tends to peak around ${leading.peakMonth} and reaches ${leading.amplitude.toFixed(1)}x its own average. Consider pre-funding that category.`,
        tone: "positive",
      })
    }

    if (feed.length === 0) {
      feed.push({
        title: language === "pt" ? "Padrao relativamente estavel" : "Pattern is relatively stable",
        body:
          language === "pt"
            ? "Os dados recentes nao mostram desvio forte nem concentracao excessiva. O proximo passo e aprofundar sazonalidade por categoria com mais historico."
            : "Recent data does not show strong deviation or excessive concentration. The next step is deeper category seasonality with more history.",
        tone: "neutral",
      })
    }

    return feed
  }, [concentration.share, concentration.topThree, language, momentum.growth, seasonality])

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Insights" title={t.title} description={t.subtitle} />

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
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <PieChart className="h-4 w-4" />
                  {t.concentration}
                </CardTitle>
                <CardDescription>{t.methodologyText}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="rounded-[28px] border border-primary/20 bg-primary/10 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{t.topShare}</div>
                  <div className="mt-3 text-5xl font-serif font-bold">{concentration.share.toFixed(0)}%</div>
                  <div className="mt-3 text-sm text-muted-foreground">{t.currentMonth}</div>
                </div>
                <div className="space-y-3">
                  {concentration.topThree.map((item, index) => (
                    <div key={item.categoryId} className="rounded-[24px] border border-border/70 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">#{index + 1}</div>
                          <div className="mt-1 font-semibold">{item.categoryName}</div>
                        </div>
                        <div className="text-2xl font-serif font-bold">{item.total.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <TrendingUp className="h-4 w-4" />
                  {t.momentum}
                </CardTitle>
                <CardDescription>{t.strongestCategory}: {spendingPatterns?.top_expense_categories?.[0]?.category ?? "-"}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[24px] border border-border/70 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.currentMonth}</div>
                  <div className="mt-3 text-3xl font-serif font-bold">{momentum.current.toFixed(2)}</div>
                </div>
                <div className="rounded-[24px] border border-border/70 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.quarterAverage}</div>
                  <div className="mt-3 text-3xl font-serif font-bold">{momentum.quarterAverage.toFixed(2)}</div>
                </div>
                <div className={`rounded-[24px] border p-4 ${momentum.growth >= 15 ? "border-destructive/30 bg-destructive/10" : "border-primary/20 bg-primary/10"}`}>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.growth}</div>
                  <div className="mt-3 text-3xl font-serif font-bold">{momentum.growth.toFixed(1)}%</div>
                </div>
                <div className="rounded-[24px] border border-border/70 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.dailyAverage}</div>
                  <div className="mt-3 text-3xl font-serif font-bold">{(spendingPatterns?.average_daily_spending ?? 0).toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <CalendarRange className="h-4 w-4" />
                  {t.seasonality}
                </CardTitle>
                <CardDescription>{t.methodology}</CardDescription>
              </CardHeader>
              <CardContent>
                {seasonality.length === 0 ? (
                  <div className="rounded-[24px] border border-border/70 p-6 text-sm text-muted-foreground">
                    {t.noSeasonality}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {seasonality.map((item) => (
                      <div key={item.categoryId} className="rounded-[24px] border border-border/70 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="font-semibold">{item.categoryName}</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {t.peakMonth}: {item.peakMonth}
                            </div>
                          </div>
                          <div className="grid gap-2 text-sm md:grid-cols-3 md:text-right">
                            <div>
                              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.averageSpend}</div>
                              <div className="mt-1 font-semibold">{item.averageValue.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.peakMonth}</div>
                              <div className="mt-1 font-semibold">{item.peakValue.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.amplitude}</div>
                              <div className="mt-1 font-semibold">{item.amplitude.toFixed(1)}x</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="panel-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Sparkles className="h-4 w-4" />
                  {t.insightFeed}
                </CardTitle>
                <CardDescription>{t.recommendations}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insightFeed.map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-[24px] border p-4 ${
                      item.tone === "warning"
                        ? "border-destructive/30 bg-destructive/10"
                        : item.tone === "positive"
                          ? "border-primary/20 bg-primary/10"
                          : "border-border/70 bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="mt-0.5 h-5 w-5" />
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
