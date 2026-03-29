import { useCallback, useEffect, useMemo } from "react"
import { AlertCircle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/Chart"
import { useApi } from "@/hooks/useApi"
import { apiService } from "@/services/api"
import { resolveDateRange, type ReportFilterState } from "@/utils/report-filters"

const chartConfig = {
  income: {
    label: "Income",
    color: "#10b981",
  },
  expenses: {
    label: "Expenses",
    color: "#f59e0b",
  },
}

const translations = {
  en: {
    incomeVsExpenses: "Income vs Expenses",
    selectedPeriodComparison: "Comparison for the selected period",
    selectedPeriod: "Selected period",
    loadError: "Error loading comparison",
  },
  pt: {
    incomeVsExpenses: "Entradas vs Saídas",
    selectedPeriodComparison: "Comparação para o período selecionado",
    selectedPeriod: "Período selecionado",
    loadError: "Erro ao carregar comparação",
  },
}

interface ColumnChartProps {
  language: string
  filters?: ReportFilterState
}

export function ColumnChart({ language, filters = { timeRange: "thisMonth", category: "all", type: "all" } }: ColumnChartProps) {
  const t = translations[language as keyof typeof translations]
  const { startDate, endDate } = resolveDateRange(filters)

  const fetchSummary = useCallback(
    () => apiService.getFinancialSummary(startDate, endDate),
    [startDate, endDate]
  )

  const { data, loading, error, refetch } = useApi(fetchSummary, true)

  useEffect(() => {
    refetch().catch(() => {
      // Hook already stores the error state
    })
  }, [fetchSummary, refetch])

  const chartData = useMemo(
    () => [
      {
        month: t.selectedPeriod,
        income: data?.total_income || 0,
        expenses: data?.total_expense || 0,
      },
    ],
    [data, t.selectedPeriod]
  )

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.incomeVsExpenses}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 py-8 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{t.loadError}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.incomeVsExpenses}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">{t.incomeVsExpenses}</CardTitle>
        <CardDescription>{t.selectedPeriodComparison}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
