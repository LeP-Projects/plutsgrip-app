import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs"
import { useApi } from "@/hooks/useApi"
import { apiService } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import { calculatePercentageChange, formatPercentage } from "@/utils/calculations"
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PieChart,
  BarChart3,
  Settings,
  FileText,
  Menu,
  X,
  LogOut,
} from "lucide-react"

import { CategoryChart } from "@/components/CategoryChart"
import { RecentTransactions } from "@/components/RecentTransactions"
import { ExpenseForm } from "@/components/ExpenseForm"
import { CategoryManager } from "@/components/CategoryManager"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageToggle } from "@/components/LanguageToggle"
import { DashboardFilters } from "@/components/DashboardFilters"
import { ColumnChart } from "@/components/ColumnChart"
import { CurrencySelector } from "@/components/CurrencySelector"
import { ReportsSection } from "@/components/ReportsSection"
import { useCurrency } from "@/contexts/CurrencyContext"
import { useIsMobile } from "@/hooks/use-mobile"

const translations = {
  en: {
    financeTracker: "FinanceTracker",
    personalExpenseManagement: "Personal Expense Management",
    overview: "Overview",
    transactions: "Transactions",
    categories: "Categories",
    reports: "Reports",
    settings: "Settings",
    financialOverview: "Financial Overview",
    trackExpenses: "Track your expenses and manage your budget effectively",
    addTransaction: "Add Transaction",
    totalBalance: "Total Balance",
    monthlyExpenses: "Monthly Expenses",
    monthlyIncome: "Monthly Income",
    budgetRemaining: "Budget Remaining",
    thisMonth: "This month",
    fromLastMonth: "from last month",
    ofMonthlyBudget: "of monthly budget",
    filter: "Filter",
    search: "Search",
    dateRange: "Date Range",
    appearance: "Appearance",
    theme: "Theme",
    chooseTheme: "Choose your preferred theme",
    language: "Language",
    displayLanguage: "Display Language",
    chooseLanguage: "Choose your preferred language",
    viewAllTransactions: "View All Transactions",
    income: "Income",
    expense: "Expense",
    entrada: "Income",
    saida: "Expense",
    entradas: "Income",
    saidas: "Expenses",
    currency: "Currency",
    currencySettings: "Currency Settings",
    chooseCurrency: "Choose your preferred currency for displaying amounts",
  },
  pt: {
    financeTracker: "ControleFinanceiro",
    personalExpenseManagement: "Gestão de Despesas Pessoais",
    overview: "Visão Geral",
    transactions: "Transações",
    categories: "Categorias",
    reports: "Relatórios",
    settings: "Configurações",
    financialOverview: "Visão Geral Financeira",
    trackExpenses: "Acompanhe suas despesas e gerencie seu orçamento efetivamente",
    addTransaction: "Adicionar Transação",
    totalBalance: "Saldo Total",
    monthlyExpenses: "Despesas Mensais",
    monthlyIncome: "Entradas Mensais",
    budgetRemaining: "Orçamento Restante",
    thisMonth: "Este mês",
    fromLastMonth: "do mês passado",
    ofMonthlyBudget: "do orçamento mensal",
    filter: "Filtrar",
    search: "Pesquisar",
    dateRange: "Período",
    appearance: "Aparência",
    theme: "Tema",
    chooseTheme: "Escolha seu tema preferido",
    language: "Idioma",
    displayLanguage: "Idioma de Exibição",
    chooseLanguage: "Escolha seu idioma preferido",
    viewAllTransactions: "Ver Todas as Transações",
    income: "Entrada",
    expense: "Saída",
    entrada: "Entrada",
    saida: "Saída",
    entradas: "Entradas",
    saidas: "Saídas",
    currency: "Moeda",
    currencySettings: "Configurações de Moeda",
    chooseCurrency: "Escolha sua moeda preferida para exibir valores",
  },
}

export function Dashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [language, setLanguage] = useState("en")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()
  const { formatCurrency } = useCurrency()
  const [transactionRefreshKey, setTransactionRefreshKey] = useState(0)
  const [dashboardFilters, setDashboardFilters] = useState({
    timeRange: "thisMonth",
    category: "all",
    type: "all",
  })

  const handleTransactionCreated = () => {
    setTransactionRefreshKey((prev) => prev + 1)
  }

  // Busca dados do dashboard da API
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useApi(
    () => apiService.getDashboard(),
    true // fetch immediately
  )

  // Busca dados de tendências para calcular percentual de mudança
  const { data: trendsData } = useApi(
    () => apiService.getMonthlyTrends(2), // Últimos 2 meses para comparação
    true // fetch immediately
  )

  // Busca dados de orçamentos para calcular percentual de uso
  const { data: budgetsData } = useApi(
    () => apiService.listBudgets(0, 100),
    true // fetch immediately
  )

  // Calcula percentuais de mudança comparando mês atual com anterior
  const balanceChangePercent = trendsData && trendsData.balance?.length >= 2
    ? calculatePercentageChange(
      trendsData.balance[trendsData.balance.length - 1]?.value || 0,
      trendsData.balance[trendsData.balance.length - 2]?.value || 0
    )
    : 0

  const expenseChangePercent = trendsData && trendsData.expense?.length >= 2
    ? calculatePercentageChange(
      trendsData.expense[trendsData.expense.length - 1]?.value || 0,
      trendsData.expense[trendsData.expense.length - 2]?.value || 0
    )
    : 0

  const incomeChangePercent = trendsData && trendsData.income?.length >= 2
    ? calculatePercentageChange(
      trendsData.income[trendsData.income.length - 1]?.value || 0,
      trendsData.income[trendsData.income.length - 2]?.value || 0
    )
    : 0

  // Calcula percentual de uso de orçamento
  const budgetUsagePercent = budgetsData && budgetsData.length > 0
    ? (budgetsData.reduce((total, budget) => total + (budget.amount || 0), 0) > 0
      ? (dashboardData?.total_expense || 0) /
      (budgetsData.reduce((total, budget) => total + (budget.amount || 0), 0)) * 100
      : 0)
    : 0

  // Usa dados da API ou valores padrão
  // Mapeia os dados da API (snake_case) para o formato esperado
  const filteredData = dashboardData ? {
    totalBalance: dashboardData.balance || 0,
    monthlyExpenses: dashboardData.total_expense || 0,
    monthlyIncome: dashboardData.total_income || 0,
    budgetRemaining: dashboardData.balance || 0, // Usa balance como orçamento restante
    balanceChangePercent,
    expenseChangePercent,
    incomeChangePercent,
    budgetUsagePercent,
  } : {
    totalBalance: 0,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    budgetRemaining: 0,
    balanceChangePercent: 0,
    expenseChangePercent: 0,
    incomeChangePercent: 0,
    budgetUsagePercent: 0,
  }

  useEffect(() => {
    const deviceLanguage = navigator.language.toLowerCase()
    if (deviceLanguage.startsWith("pt")) {
      setLanguage("pt")
    } else {
      setLanguage("en")
    }
  }, [])

  const t = translations[language as keyof typeof translations]

  const handleViewAllTransactions = () => {
    setActiveTab("transactions")
  }

  const handleDashboardFiltersChange = (filters: { timeRange: string; category: string; type: string }) => {
    console.log("[Dashboard] filters changed:", filters)
    setDashboardFilters(filters)
    // Dados virão da API via useApi hook baseado nos filtros
    // Em uma implementação futura, você pode passar os filtros ao apiService.getDashboard()
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Backdrop for mobile menu */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: fixed, Mobile: overlay drawer */}
      <aside
        className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out" : "w-64"}
          ${isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}
          bg-sidebar border-r border-sidebar-border
        `}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/plutus.png" alt="PlutusGrip" className="h-8 w-8 object-contain" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-sidebar-foreground">PlutusGrip</h1>
              <p className="text-sm text-sidebar-foreground/70 mt-1">{t.personalExpenseManagement}</p>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="ml-2"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className="px-4 space-y-2 flex-1">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleTabChange("overview")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {t.overview}
          </Button>
          <Button
            variant={activeTab === "transactions" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleTabChange("transactions")}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {t.transactions}
          </Button>
          <Button
            variant={activeTab === "categories" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleTabChange("categories")}
          >
            <PieChart className="mr-2 h-4 w-4" />
            {t.categories}
          </Button>
          <Button
            variant={activeTab === "reports" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleTabChange("reports")}
          >
            <FileText className="mr-2 h-4 w-4" />
            {t.reports}
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleTabChange("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            {t.settings}
          </Button>
        </nav>

        {/* Logout Section */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {language === "pt" ? "Sair" : "Logout"}
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6">
        {/* Mobile menu button */}
        {isMobile && (
          <div className="mb-4 flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-serif font-bold">{t.financeTracker}</h2>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="overview" className="space-y-6">
            {dashboardError && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-200">
                <p className="font-semibold">Erro ao carregar dados:</p>
                <p>{dashboardError instanceof Error ? dashboardError.message : "Falha ao conectar à API"}</p>
              </div>
            )}

            {dashboardLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Carregando dados...</span>
              </div>
            )}

            {!dashboardLoading && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">{t.financialOverview}</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">{t.trackExpenses}</p>
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    onClick={() => handleTabChange("transactions")}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t.addTransaction}
                  </Button>
                </div>

                <DashboardFilters onFiltersChange={handleDashboardFiltersChange} language={language} />
              </>
            )}

            {!dashboardLoading && (
              <>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t.totalBalance}</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(filteredData.totalBalance)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className={filteredData.balanceChangePercent >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatPercentage(filteredData.balanceChangePercent)}
                        </span> {t.fromLastMonth}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t.monthlyExpenses}</CardTitle>
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">
                        {formatCurrency(filteredData.monthlyExpenses)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className={filteredData.expenseChangePercent >= 0 ? "text-red-600" : "text-green-600"}>
                          {formatPercentage(filteredData.expenseChangePercent)}
                        </span> {t.fromLastMonth}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t.monthlyIncome}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(filteredData.monthlyIncome)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className={filteredData.incomeChangePercent >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatPercentage(filteredData.incomeChangePercent)}
                        </span> {t.fromLastMonth}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t.budgetRemaining}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-secondary">
                        {formatCurrency(filteredData.budgetRemaining)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className={filteredData.budgetUsagePercent <= 100 ? "text-green-600" : "text-red-600"}>
                          {formatPercentage(filteredData.budgetUsagePercent, 0)}
                        </span> {t.ofMonthlyBudget}
                      </p>
                    </CardContent>
                  </Card>
                </div>



                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                  <CategoryChart language={language} filters={dashboardFilters} />
                  <ColumnChart language={language} filters={dashboardFilters} />
                </div>

                <RecentTransactions
                  onViewAllClick={handleViewAllTransactions}
                  language={language}
                  refreshKey={transactionRefreshKey}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold">{t.transactions}</h2>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">{language === "pt" ? "Todas" : "All"}</TabsTrigger>
                <TabsTrigger value="income">{t.entradas}</TabsTrigger>
                <TabsTrigger value="expense">{t.saidas}</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                <ExpenseForm language={language} onTransactionCreated={handleTransactionCreated} />
                <RecentTransactions
                  showAll
                  typeFilter="all"
                  language={language}
                  refreshKey={transactionRefreshKey}
                />
              </TabsContent>

              <TabsContent value="income" className="space-y-6">
                <ExpenseForm language={language} defaultType="income" onTransactionCreated={handleTransactionCreated} />
                <RecentTransactions
                  showAll
                  typeFilter="income"
                  language={language}
                  refreshKey={transactionRefreshKey}
                />
              </TabsContent>

              <TabsContent value="expense" className="space-y-6">
                <ExpenseForm language={language} defaultType="expense" onTransactionCreated={handleTransactionCreated} />
                <RecentTransactions
                  showAll
                  typeFilter="expense"
                  language={language}
                  refreshKey={transactionRefreshKey}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold">{t.categories}</h2>
            </div>
            <CategoryManager language={language} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsSection language={language} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold">{t.settings}</h2>
            </div>
            <div className="grid gap-6 max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>{t.appearance}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{t.theme}</h4>
                      <p className="text-sm text-muted-foreground">{t.chooseTheme}</p>
                    </div>
                    <ThemeToggle language={language} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.language}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{t.displayLanguage}</h4>
                      <p className="text-sm text-muted-foreground">{t.chooseLanguage}</p>
                    </div>
                    <LanguageToggle currentLanguage={language} onLanguageChange={setLanguage} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.currencySettings}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">{t.chooseCurrency}</p>
                    <CurrencySelector language={language} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
