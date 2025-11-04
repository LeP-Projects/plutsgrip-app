import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/contexts/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { CurrencyProvider } from "@/contexts/CurrencyContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { LoginPage } from "@/pages/Login"
import { RegisterPage } from "@/pages/Register"
import { LandingPage } from "@/pages/Landing"
import { Dashboard } from "@/pages/Dashboard"
import { FloatingContactForm } from "@/components/FloatingContactForm"

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
            <Routes>
              {/* Rota raiz - Landing page pública */}
              <Route path="/" element={<LandingPage />} />

              {/* Rotas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Rotas protegidas - requerem autenticação */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
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
            <FloatingContactForm language={language} />
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
