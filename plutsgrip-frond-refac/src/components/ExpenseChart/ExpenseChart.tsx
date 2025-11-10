import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/Chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useMemo, useCallback } from "react"
import { useApi } from "@/hooks/useApi"
import { apiService } from "@/services/api"
import { AlertCircle } from "lucide-react"

// Mock data removed - now fetching from API

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "#0ea5e9", // Sky blue
  },
}

const translations = {
  en: {
    monthlyExpensesTrend: "Monthly Expenses Trend",
    expensePatterns: "Your expense patterns over the last 6 months",
  },
  pt: {
    monthlyExpensesTrend: "Tendência de Saídas Mensais",
    expensePatterns: "Seus padrões de saídas nos últimos 6 meses",
  },
}

interface ExpenseChartProps {
  language: string
  filters?: {
    timeRange: string
    category: string
    type: string
    startDate?: Date
    endDate?: Date
  }
}

export function ExpenseChart({ language, filters }: ExpenseChartProps) {
  const t = translations[language as keyof typeof translations]

  // Busca dados de transações da API
  const fetchTransactions = useCallback(
    () => apiService.listTransactions(1, 100, "expense"),
    []
  )

  const { data: transactionsData, loading: transactionsLoading, error: transactionsError } = useApi(
    fetchTransactions,
    true // fetch immediately
  )

  const filteredData = useMemo(() => {
    const transactions = transactionsData?.transactions || []
    let filtered = transactions.filter((transaction) => transaction.type === "expense")

    // Apply category filter
    if (filters?.category && filters.category !== "all") {
      filtered = filtered.filter((transaction) => transaction.category?.name === filters.category)
    }

    // Group by month and sum expenses
    const monthlyData: { [key: string]: any } = {}
    filtered.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = date.toLocaleString("en-US", { month: "short" })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, expenses: 0 }
      }
      monthlyData[monthKey].expenses += transaction.amount
    })

    return Object.values(monthlyData).sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return months.indexOf(a.month) - months.indexOf(b.month)
    })
  }, [filters, transactionsData])

  console.log("[ExpenseChart] filtered data:", filteredData)

  if (transactionsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.monthlyExpensesTrend}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive py-8">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Erro ao carregar dados de despesas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.monthlyExpensesTrend}</CardTitle>
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
        <CardTitle className="font-serif">{t.monthlyExpensesTrend}</CardTitle>
        <CardDescription>{t.expensePatterns}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="expenses" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: "#0ea5e9" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
