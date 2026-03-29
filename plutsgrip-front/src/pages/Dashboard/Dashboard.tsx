import { useEffect, useState } from "react"
import { DollarSign, PlusCircle, TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { useApi } from "@/hooks/useApi"
import { apiService } from "@/services/api"
import { calculatePercentageChange, formatPercentage } from "@/utils/calculations"
import { CategoryChart } from "@/components/CategoryChart"
import { RecentTransactions } from "@/components/RecentTransactions"
import { DashboardFilters } from "@/components/DashboardFilters"
import { ColumnChart } from "@/components/ColumnChart"
import { PageHeader } from "@/components/PageHeader"
import { useCurrency } from "@/contexts/CurrencyContext"
import { resolveDateRange } from "@/utils/report-filters"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { useNavigate } from "react-router-dom"

const translations = {
  en: {
    financialOverview: "Financial Overview",
    trackExpenses: "Track your expenses and manage your budget effectively",
    addTransaction: "Add Transaction",
    story: "Cashflow, pressure points and spending tempo, all in one editorial view.",
    totalBalance: "Total Balance",
    monthlyExpenses: "Monthly Expenses",
    monthlyIncome: "Monthly Income",
    budgetRemaining: "Budget Remaining",
    fromLastMonth: "from last month",
    ofMonthlyBudget: "of monthly budget",
    loading: "Loading data...",
    loadError: "Error loading data:",
    fallbackError: "Failed to connect to API",
  },
  pt: {
    financialOverview: "Visao Geral Financeira",
    trackExpenses: "Acompanhe suas despesas e gerencie seu orcamento efetivamente",
    addTransaction: "Adicionar Transacao",
    story: "Fluxo de caixa, pontos de pressao e ritmo dos gastos em uma visao unica.",
    totalBalance: "Saldo Total",
    monthlyExpenses: "Despesas",
    monthlyIncome: "Entradas",
    budgetRemaining: "Saldo Restante",
    fromLastMonth: "do mes passado",
    ofMonthlyBudget: "do orcamento mensal",
    loading: "Carregando dados...",
    loadError: "Erro ao carregar dados:",
    fallbackError: "Falha ao conectar a API",
  },
}

export function Dashboard() {
  const navigate = useNavigate()
  const { formatCurrency } = useCurrency()
  const { language } = useAppShellContext()

  const [dashboardFilters, setDashboardFilters] = useState({
    timeRange: "thisMonth",
    category: "all",
    type: "all",
  })

  const { startDate, endDate } = resolveDateRange(dashboardFilters)

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useApi(() => apiService.getFinancialSummary(startDate, endDate), true)

  const { data: categoriesData } = useApi(() => apiService.listCategories(), true)
  const { data: trendsData } = useApi(() => apiService.getMonthlyTrends(2), true)
  const { data: budgetsData } = useApi(() => apiService.listBudgets(0, 100), true)

  useEffect(() => {
    refetchDashboard().catch(() => {
      // Hook already stores the error state
    })
  }, [dashboardFilters, refetchDashboard])

  const t = translations[language as keyof typeof translations]
  const categoryNames = (categoriesData?.categories || []).map((category) => category.name)

  const balanceChangePercent =
    trendsData && trendsData.balance?.length >= 2
      ? calculatePercentageChange(
          trendsData.balance[trendsData.balance.length - 1]?.value || 0,
          trendsData.balance[trendsData.balance.length - 2]?.value || 0
        )
      : 0

  const expenseChangePercent =
    trendsData && trendsData.expense?.length >= 2
      ? calculatePercentageChange(
          trendsData.expense[trendsData.expense.length - 1]?.value || 0,
          trendsData.expense[trendsData.expense.length - 2]?.value || 0
        )
      : 0

  const incomeChangePercent =
    trendsData && trendsData.income?.length >= 2
      ? calculatePercentageChange(
          trendsData.income[trendsData.income.length - 1]?.value || 0,
          trendsData.income[trendsData.income.length - 2]?.value || 0
        )
      : 0

  const budgetUsagePercent =
    budgetsData && budgetsData.length > 0
      ? budgetsData.reduce((total, budget) => total + (budget.amount || 0), 0) > 0
        ? ((dashboardData?.total_expense || 0) /
            budgetsData.reduce((total, budget) => total + (budget.amount || 0), 0)) *
          100
        : 0
      : 0

  const filteredData = dashboardData
    ? {
        totalBalance: dashboardData.net_balance || 0,
        monthlyExpenses: dashboardData.total_expense || 0,
        monthlyIncome: dashboardData.total_income || 0,
        budgetRemaining: dashboardData.net_balance || 0,
        balanceChangePercent,
        expenseChangePercent,
        incomeChangePercent,
        budgetUsagePercent,
      }
    : {
        totalBalance: 0,
        monthlyExpenses: 0,
        monthlyIncome: 0,
        budgetRemaining: 0,
        balanceChangePercent: 0,
        expenseChangePercent: 0,
        incomeChangePercent: 0,
        budgetUsagePercent: 0,
      }

  const handleDashboardFiltersChange = (filters: { timeRange: string; category: string; type: string }) => {
    setDashboardFilters(filters)
  }

  return (
    <div className="space-y-6">
      {dashboardError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">{t.loadError}</p>
          <p>{dashboardError instanceof Error ? dashboardError.message : t.fallbackError}</p>
        </div>
      )}

      {dashboardLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">{t.loading}</span>
        </div>
      )}

      {!dashboardLoading && (
        <>
          <PageHeader
            eyebrow="Overview"
            title={t.financialOverview}
            description={t.story}
            action={
              <Button className="w-full rounded-2xl bg-primary px-5 py-6 hover:bg-primary/90 sm:w-auto" onClick={() => navigate("/transactions")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t.addTransaction}
              </Button>
            }
          />

          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="panel-surface p-4 md:p-5">
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Signal filters</div>
                <p className="mt-1 text-sm text-muted-foreground">{t.trackExpenses}</p>
              </div>
              <DashboardFilters onFiltersChange={handleDashboardFiltersChange} language={language} categories={categoryNames} />
            </div>

            <div className="panel-surface flex flex-col justify-between p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Balance note</div>
              <div className="mt-3 font-serif text-3xl leading-tight">
                {formatCurrency(filteredData.totalBalance)}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t.story}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <Card className="metric-card border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalBalance}</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(filteredData.totalBalance)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={filteredData.balanceChangePercent >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatPercentage(filteredData.balanceChangePercent)}
                  </span>{" "}
                  {t.fromLastMonth}
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card border-destructive/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.monthlyExpenses}</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(filteredData.monthlyExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={filteredData.expenseChangePercent >= 0 ? "text-red-600" : "text-green-600"}>
                    {formatPercentage(filteredData.expenseChangePercent)}
                  </span>{" "}
                  {t.fromLastMonth}
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card border-green-500/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.monthlyIncome}</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(filteredData.monthlyIncome)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={filteredData.incomeChangePercent >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatPercentage(filteredData.incomeChangePercent)}
                  </span>{" "}
                  {t.fromLastMonth}
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card border-secondary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.budgetRemaining}</CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{formatCurrency(filteredData.budgetRemaining)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={filteredData.budgetUsagePercent <= 100 ? "text-green-600" : "text-red-600"}>
                    {formatPercentage(filteredData.budgetUsagePercent, 0)}
                  </span>{" "}
                  {t.ofMonthlyBudget}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <CategoryChart language={language} filters={dashboardFilters} />
            <ColumnChart language={language} filters={dashboardFilters} />
          </div>

          <div className="panel-surface p-2 md:p-3">
            <RecentTransactions onViewAllClick={() => navigate("/transactions")} language={language} refreshKey={0} />
          </div>
        </>
      )}
    </div>
  )
}
