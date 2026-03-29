import { useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  Activity,
  BellRing,
  BarChart3,
  Calculator,
  CreditCard,
  FileText,
  HeartPulse,
  Lightbulb,
  LogOut,
  Menu,
  PieChart,
  Repeat2,
  Settings,
  Target,
  Wallet,
  X,
} from "lucide-react"

import { Button } from "@/components/Button"
import { useAuth } from "@/contexts/AuthContext"
import { useIsMobile } from "@/hooks/use-mobile"

const translations = {
  en: {
    financeTracker: "FinanceTracker",
    personalExpenseManagement: "Personal Expense Management",
    overview: "Overview",
    transactions: "Transactions",
    categories: "Categories",
    planning: "Planning",
    health: "Health",
    forecast: "Forecast",
    insights: "Insights",
    alerts: "Alerts",
    budgets: "Budgets",
    goals: "Goals",
    recurring: "Recurring",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
  },
  pt: {
    financeTracker: "ControleFinanceiro",
    personalExpenseManagement: "Gestao de Despesas Pessoais",
    overview: "Visao Geral",
    transactions: "Transacoes",
    categories: "Categorias",
    planning: "Planejamento",
    health: "Saude",
    forecast: "Projecao",
    insights: "Insights",
    alerts: "Alertas",
    budgets: "Orcamentos",
    goals: "Metas",
    recurring: "Recorrencias",
    reports: "Relatorios",
    settings: "Configuracoes",
    logout: "Sair",
  },
}

const routeToSection: Record<string, string> = {
  "/dashboard": "overview",
  "/transactions": "transactions",
  "/categories": "categories",
  "/planning": "planning",
  "/health": "health",
  "/forecast": "forecast",
  "/insights": "insights",
  "/alerts": "alerts",
  "/budgets": "budgets",
  "/goals": "goals",
  "/recurring": "recurring",
  "/reports": "reports",
  "/settings": "settings",
}

const sectionToRoute: Record<string, string> = {
  overview: "/dashboard",
  transactions: "/transactions",
  categories: "/categories",
  planning: "/planning",
  health: "/health",
  forecast: "/forecast",
  insights: "/insights",
  alerts: "/alerts",
  budgets: "/budgets",
  goals: "/goals",
  recurring: "/recurring",
  reports: "/reports",
  settings: "/settings",
}

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const isMobile = useIsMobile()

  const [language, setLanguage] = useState("en")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const deviceLanguage = navigator.language.toLowerCase()
    setLanguage(deviceLanguage.startsWith("pt") ? "pt" : "en")
  }, [])

  const t = translations[language as keyof typeof translations]
  const activeSection = routeToSection[location.pathname] || "overview"

  const handleSectionChange = (section: string) => {
    navigate(sectionToRoute[section] || "/dashboard")
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-background px-3 py-3 md:px-4 md:py-4">
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex min-h-[calc(100vh-1.5rem)] gap-3 md:gap-4">
      <aside
        className={`
          panel-surface
          ${isMobile ? "fixed inset-y-3 left-3 z-50 w-72 transform transition-transform duration-300 ease-in-out" : "w-72"}
          ${isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}
          flex flex-col
        `}
      >
        <div className="border-b border-sidebar-border/70 p-6">
          <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Finance cockpit
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))] shadow-lg">
                <img src="/plutus.png" alt="PlutusGrip" className="h-6 w-6 object-contain brightness-0 invert" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-sidebar-foreground">PlutusGrip</h1>
                <p className="mt-1 text-sm text-sidebar-foreground/70">{t.personalExpenseManagement}</p>
              </div>
            </div>
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)} className="ml-2">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-5">
          <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Workspace
          </div>
          <Button variant={activeSection === "overview" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "overview" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("overview")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            {t.overview}
          </Button>
          <Button variant={activeSection === "transactions" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "transactions" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("transactions")}>
            <CreditCard className="mr-2 h-4 w-4" />
            {t.transactions}
          </Button>
          <Button variant={activeSection === "categories" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "categories" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("categories")}>
            <PieChart className="mr-2 h-4 w-4" />
            {t.categories}
          </Button>
          <Button variant={activeSection === "planning" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "planning" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("planning")}>
            <Calculator className="mr-2 h-4 w-4" />
            {t.planning}
          </Button>
          <Button variant={activeSection === "health" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "health" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("health")}>
            <HeartPulse className="mr-2 h-4 w-4" />
            {t.health}
          </Button>
          <Button variant={activeSection === "forecast" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "forecast" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("forecast")}>
            <Activity className="mr-2 h-4 w-4" />
            {t.forecast}
          </Button>
          <Button variant={activeSection === "insights" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "insights" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("insights")}>
            <Lightbulb className="mr-2 h-4 w-4" />
            {t.insights}
          </Button>
          <Button variant={activeSection === "alerts" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "alerts" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("alerts")}>
            <BellRing className="mr-2 h-4 w-4" />
            {t.alerts}
          </Button>
          <Button variant={activeSection === "budgets" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "budgets" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("budgets")}>
            <Wallet className="mr-2 h-4 w-4" />
            {t.budgets}
          </Button>
          <Button variant={activeSection === "goals" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "goals" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("goals")}>
            <Target className="mr-2 h-4 w-4" />
            {t.goals}
          </Button>
          <Button variant={activeSection === "recurring" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "recurring" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("recurring")}>
            <Repeat2 className="mr-2 h-4 w-4" />
            {t.recurring}
          </Button>
          <Button variant={activeSection === "reports" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "reports" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("reports")}>
            <FileText className="mr-2 h-4 w-4" />
            {t.reports}
          </Button>
          <Button variant={activeSection === "settings" ? "default" : "ghost"} className={`w-full justify-start rounded-2xl py-5 ${activeSection === "settings" ? "bg-primary text-primary-foreground shadow-md" : ""}`} onClick={() => handleSectionChange("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            {t.settings}
          </Button>
        </nav>

        <div className="border-t border-sidebar-border/70 px-4 py-4">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t.logout}
          </Button>
        </div>
      </aside>

      <main className="panel-surface flex-1 overflow-hidden p-4 md:p-6">
        {isMobile && (
          <div className="mb-4 flex items-center">
            <Button variant="outline" size="sm" onClick={() => setIsMobileMenuOpen(true)} className="mr-2 rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-serif font-bold">{t.financeTracker}</h2>
          </div>
        )}

        <Outlet context={{ language, setLanguage }} />
      </main>
      </div>
    </div>
  )
}
