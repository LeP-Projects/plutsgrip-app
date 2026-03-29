import { useCallback, useEffect, useMemo } from "react"
import { AlertCircle } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/Chart"
import { useApi } from "@/hooks/useApi"
import { apiService } from "@/services/api"
import { resolveDateRange, type ReportFilterState } from "@/utils/report-filters"

const categoryColors = {
  income: "#10b981",
  expense: "#f59e0b",
}

const chartConfig = {
  value: {
    label: "Amount",
  },
}

const translations = {
  en: {
    incomeCategories: "Income Categories",
    expenseCategories: "Expense Categories",
    incomeBreakdown: "Breakdown of your income by category in the selected period",
    expenseBreakdown: "Breakdown of your spending by category in the selected period",
    uncategorized: "Uncategorized",
    loadError: "Error loading categories",
  },
  pt: {
    incomeCategories: "Categorias de Entradas",
    expenseCategories: "Categorias de Saídas",
    incomeBreakdown: "Divisão das suas entradas por categoria no período selecionado",
    expenseBreakdown: "Divisão dos seus gastos por categoria no período selecionado",
    uncategorized: "Sem categoria",
    loadError: "Erro ao carregar categorias",
  },
}

interface CategoryChartProps {
  language: string
  filters?: ReportFilterState
}

export function CategoryChart({ language, filters = { timeRange: "thisMonth", category: "all", type: "all" } }: CategoryChartProps) {
  const t = translations[language as keyof typeof translations]
  const effectiveType = filters.type === "income" ? "income" : "expense"
  const { startDate, endDate } = resolveDateRange(filters)

  const fetchBreakdown = useCallback(
    () => apiService.getCategoryBreakdown(effectiveType, startDate, endDate),
    [effectiveType, startDate, endDate]
  )

  const { data, loading, error, refetch } = useApi(fetchBreakdown, true)

  useEffect(() => {
    refetch().catch(() => {
      // Hook already stores the error state
    })
  }, [fetchBreakdown, refetch])

  const filteredData = useMemo(() => {
    const breakdown = data || []
    const filteredBreakdown =
      filters.category !== "all"
        ? breakdown.filter((item) => item.category_name === filters.category)
        : breakdown

    return filteredBreakdown.map((item, index) => ({
      name: item.category_name || t.uncategorized,
      value: item.total,
      color: effectiveType === "income" ? categoryColors.income : `hsl(${(index * 57) % 360} 70% 55%)`,
      percentage: item.percentage,
    }))
  }, [data, effectiveType, filters.category, t.uncategorized])

  const title = effectiveType === "income" ? t.incomeCategories : t.expenseCategories
  const description = effectiveType === "income" ? t.incomeBreakdown : t.expenseBreakdown

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{title}</CardTitle>
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
          <CardTitle className="font-serif">{title}</CardTitle>
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
        <CardTitle className="font-serif">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {filteredData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="ml-auto font-medium">
                {item.value.toFixed(2)} ({item.percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
