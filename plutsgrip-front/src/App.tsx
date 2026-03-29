import { lazy, Suspense, useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/contexts/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { CurrencyProvider } from "@/contexts/CurrencyContext"
import { AppShell } from "@/components/AppShell"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { FloatingContactForm } from "@/components/FloatingContactForm"

const LandingPage = lazy(() =>
  import("@/pages/Landing").then((module) => ({ default: module.LandingPage }))
)
const LoginPage = lazy(() =>
  import("@/pages/Login").then((module) => ({ default: module.LoginPage }))
)
const RegisterPage = lazy(() =>
  import("@/pages/Register").then((module) => ({ default: module.RegisterPage }))
)
const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((module) => ({ default: module.Dashboard }))
)
const TransactionsPage = lazy(() =>
  import("@/pages/Transactions").then((module) => ({ default: module.TransactionsPage }))
)
const CategoriesPage = lazy(() =>
  import("@/pages/Categories").then((module) => ({ default: module.CategoriesPage }))
)
const PlanningPage = lazy(() =>
  import("@/pages/Planning").then((module) => ({ default: module.PlanningPage }))
)
const HealthPage = lazy(() =>
  import("@/pages/Health").then((module) => ({ default: module.HealthPage }))
)
const ForecastPage = lazy(() =>
  import("@/pages/Forecast").then((module) => ({ default: module.ForecastPage }))
)
const InsightsPage = lazy(() =>
  import("@/pages/Insights").then((module) => ({ default: module.InsightsPage }))
)
const AlertsPage = lazy(() =>
  import("@/pages/Alerts").then((module) => ({ default: module.AlertsPage }))
)
const BudgetsPage = lazy(() =>
  import("@/pages/Budgets").then((module) => ({ default: module.BudgetsPage }))
)
const GoalsPage = lazy(() =>
  import("@/pages/Goals").then((module) => ({ default: module.GoalsPage }))
)
const RecurringTransactionsPage = lazy(() =>
  import("@/pages/Recurring").then((module) => ({ default: module.RecurringTransactionsPage }))
)
const ReportsPage = lazy(() =>
  import("@/pages/Reports").then((module) => ({ default: module.ReportsPage }))
)
const SettingsPage = lazy(() =>
  import("@/pages/Settings").then((module) => ({ default: module.SettingsPage }))
)

/**
 * Componente principal da aplicação
 * Configura providers globais e sistema de rotas
 *
 * Providers:
 * - ThemeProvider: Gerencia tema dark/light
 * - AuthProvider: Gerencia autenticação do usuário
 * - CurrencyProvider: Gerencia conversão de moedas
 *
 * Rotas:
 * - / : Página inicial (pública)
 * - /login : Página de login (pública)
 * - /register : Página de registro (pública)
 * - /dashboard : Dashboard principal (protegida)
 */
function App() {
  const [language, setLanguage] = useState("en")

  const loadingScreen = (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  )

  useEffect(() => {
    const deviceLanguage = navigator.language.toLowerCase()
    if (deviceLanguage.startsWith("pt")) {
      setLanguage("pt")
    } else {
      setLanguage("en")
    }
  }, [])

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <CurrencyProvider>
            <Suspense fallback={loadingScreen}>
              <Routes>
                {/* Rota raiz - Landing page pública */}
                <Route path="/" element={<LandingPage />} />

                {/* Rotas públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Rotas protegidas - requerem autenticação */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppShell />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/planning" element={<PlanningPage />} />
                    <Route path="/health" element={<HealthPage />} />
                    <Route path="/forecast" element={<ForecastPage />} />
                    <Route path="/insights" element={<InsightsPage />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                    <Route path="/budgets" element={<BudgetsPage />} />
                    <Route path="/goals" element={<GoalsPage />} />
                    <Route path="/recurring" element={<RecurringTransactionsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* Rota 404 */}
                <Route
                  path="*"
                  element={
                    <div className="flex min-h-screen items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold">404</h1>
                        <p className="text-muted-foreground">Página não encontrada</p>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
            <FloatingContactForm language={language} />
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
