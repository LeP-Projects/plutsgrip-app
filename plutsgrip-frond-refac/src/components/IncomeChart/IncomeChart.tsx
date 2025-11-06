import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/Chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useMemo, useCallback } from "react"
import { useApi } from "@/hooks/useApi"
import { apiService } from "@/services/api"
import { AlertCircle } from "lucide-react"

// Mock data removed - now fetching from API

const chartConfig = {
  income: {
    label: "Income",
    color: "#10b981", // Green
  },
}

const translations = {
  en: {
    monthlyIncomeTrend: "Monthly Income Trend",
    incomePatterns: "Your income patterns over the last 6 months",
  },
  pt: {
    monthlyIncomeTrend: "Tendência de Entradas Mensais",
    incomePatterns: "Seus padrões de entrada nos últimos 6 meses",
  },
}

interface IncomeChartProps {
  language: string
  filters?: {
    timeRange: string
    category: string
    type: string
    startDate?: Date
    endDate?: Date
  }
}

export function IncomeChart({ language, filters }: IncomeChartProps) {
  const t = translations[language as keyof typeof translations]

  // Busca dados de transações da API
  const fetchTransactions = useCallback(
    () => apiService.listTransactions(1, 100, "income"),
    []
  )

  const { data: transactionsData, loading: transactionsLoading, error: transactionsError } = useApi(
    fetchTransactions,
    true // fetch immediately
  )

  const filteredData = useMemo(() => {
    const transactions = transactionsData?.transactions || []
    let filtered = transactions.filter((transaction) => transaction.type === "income")

    // Apply category filter
    if (filters?.category && filters.category !== "all") {
      filtered = filtered.filter((transaction) => transaction.category === filters.category)
    }

    // Group by month and sum income
    const monthlyData: { [key: string]: any } = {}
    filtered.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = date.toLocaleString("en-US", { month: "short" })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0 }
      }
      monthlyData[monthKey].income += transaction.amount
    })

    return Object.values(monthlyData).sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return months.indexOf(a.month) - months.indexOf(b.month)
    })
  }, [filters, transactionsData])

  console.log("[IncomeChart] filtered data:", filteredData)

  if (transactionsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.monthlyIncomeTrend}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive py-8">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Erro ao carregar dados de entradas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t.monthlyIncomeTrend}</CardTitle>
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
        <CardTitle className="font-serif">{t.monthlyIncomeTrend}</CardTitle>
        <CardDescription>{t.incomePatterns}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
