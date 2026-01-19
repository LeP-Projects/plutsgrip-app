import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/Chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useMemo, useCallback } from "react"
import { useApi } from "@/hooks/useApi"
import { apiService } from "@/services/api"
import { AlertCircle } from "lucide-react"

// Mock data removed - now fetching from API

const categoryColors = {
  "Food & Dining": "#0ea5e9", // Sky blue
  Transportation: "#f59e0b", // Amber
  Shopping: "#10b981", // Emerald
  Bills: "#8b5cf6", // Violet
  Entertainment: "#f97316", // Orange
  Healthcare: "#ef4444", // Red
  Income: "#10b981", // Green
}

const chartConfig = {
  value: {
    label: "Amount",
  },
}

const translations = {
  en: {
    expenseCategories: "Expense Categories",
    categoryBreakdown: "Breakdown of your spending by category this month",
  },
  pt: {
    expenseCategories: "Categorias de Saídas",
    categoryBreakdown: "Divisão dos seus gastos por categoria este mês",
  },
}

interface CategoryChartProps {
  language: string
  filters?: {
    timeRange: string
    category: string
    type: string
    startDate?: Date
    endDate?: Date
  }
}

export function CategoryChart({ language, filters }: CategoryChartProps) {
  const t = translations[language as keyof typeof translations]

  // Busca todas as transações da API
  const fetchTransactions = useCallback(
    () => apiService.listTransactions(1, 100),
    []
  )

  const { data: transactionsData, loading: transactionsLoading, error: transactionsError } = useApi(
    fetchTransactions,
    true // fetch immediately
  )

  const filteredData = useMemo(() => {
    const transactions = transactionsData?.transactions || []
    let filtered = transactions

    // Apply type filter
    if (filters?.type && filters.type !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === filters.type)
    }

    // Apply category filter
    if (filters?.category && filters.category !== "all") {
      filtered = filtered.filter((transaction) => transaction.category?.name === filters.category)
    }

    // Group by category and sum amounts
    const categoryData: { [key: string]: any } = {}
    filtered.forEach((transaction) => {
      const category = transaction.category?.name || "Uncategorized"
      if (!categoryData[category]) {
        categoryData[category] = {
          name: category,
          value: 0,
          color: transaction.category?.color || categoryColors[category as keyof typeof categoryColors] || "#6b7280",
        }
      }
      categoryData[category].value += transaction.amount
    })

    return Object.values(categoryData)
  }, [filters, transactionsData])

  console.log("[CategoryChart] filtered data:", filteredData)

  if (transactionsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.expenseCategories}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive py-8">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Erro ao carregar categorias</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.expenseCategories}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">{t.expenseCategories}</CardTitle>
        <CardDescription>{t.categoryBreakdown}</CardDescription>
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
                {filteredData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {filteredData.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="ml-auto font-medium">${item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
