import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/Chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useMemo, useCallback } from "react"
import { useApi } from "@/hooks/useApi"
import { apiService } from "@/services/api"

// Mock data removed - now fetching from API

const chartConfig = {
  income: {
    label: "Income",
    color: "#10b981", // Emerald green
  },
  expenses: {
    label: "Expenses",
    color: "#f59e0b", // Amber
  },
}

const translations = {
  en: {
    incomeVsExpenses: "Income vs Expenses",
    monthlyComparison: "Monthly comparison of your income and expenses",
  },
  pt: {
    incomeVsExpenses: "Entradas vs Saídas",
    monthlyComparison: "Comparação mensal das suas entradas e saídas",
  },
}

interface ColumnChartProps {
  language: string
  filters?: {
    timeRange: string
    category: string
    type: string
    startDate?: Date
    endDate?: Date
  }
}

export function ColumnChart({ language, filters }: ColumnChartProps) {
  const t = translations[language as keyof typeof translations]

  // Busca todas as transações da API
  const fetchTransactions = useCallback(
    () => apiService.listTransactions(1, 100),
    []
  )

  const { data: transactionsData } = useApi(
    fetchTransactions,
    true // fetch immediately
  )

  const filteredData = useMemo(() => {
    const transactions = transactionsData?.data || []
    let filtered = transactions

    // Apply category filter
    if (filters?.category && filters.category !== "all") {
      filtered = filtered.filter((transaction) => transaction.category === filters.category)
    }

    // Apply type filter
    if (filters?.type && filters.type !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === filters.type)
    }

    // Group by month and separate income/expenses
    const monthlyData: { [key: string]: any } = {}
    filtered.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = date.toLocaleString("en-US", { month: "short" })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0 }
      }
      if (transaction.type === "income") {
        monthlyData[monthKey].income += transaction.amount
      } else {
        monthlyData[monthKey].expenses += transaction.amount
      }
    })

    return Object.values(monthlyData).sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return months.indexOf(a.month) - months.indexOf(b.month)
    })
  }, [filters, transactionsData])

  console.log("[ColumnChart] filtered data:", filteredData)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">{t.incomeVsExpenses}</CardTitle>
        <CardDescription>{t.monthlyComparison}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
