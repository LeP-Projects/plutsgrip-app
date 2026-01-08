import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/ThemeToggle"

/**
 * Tipos para a página de Login
 */
interface LoginFormData {
  email: string
  password: string
}

interface LoginPageTranslations {
  signIn: string
  welcomeBack: string
  enterCredentials: string
  email: string
  password: string
  showPassword: string
  hidePassword: string
  signInButton: string
  noAccount: string
  signUp: string
  backToHome: string
  forgotPassword: string
  resetPassword: string
}

const translations: Record<string, LoginPageTranslations> = {
  en: {
    signIn: "Sign In",
    welcomeBack: "Welcome back to FinanceTracker",
    enterCredentials: "Enter your credentials to access your account",
    email: "Email",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    signInButton: "Sign In",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    backToHome: "Back to Home",
    forgotPassword: "Forgot your password?",
    resetPassword: "Reset password",
  },
  pt: {
    signIn: "Entrar",
    welcomeBack: "Bem-vindo ao PlutusGrip",
    enterCredentials: "Digite suas credenciais para acessar sua conta",
    email: "Email",
    password: "Senha",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    signInButton: "Entrar",
    noAccount: "Não tem uma conta?",
    signUp: "Cadastre-se",
    backToHome: "Voltar ao Início",
    forgotPassword: "Esqueceu sua senha?",
    resetPassword: "Redefinir senha",
  },
}

/**
 * Página de Login
 * Permite que usuários façam login na aplicação
 * Componente Smart que gerencia estado e lógica de autenticação
 */
export function LoginPage() {
  const [language, setLanguage] = useState("en")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  // Detecta idioma do navegador
  useEffect(() => {
    const deviceLanguage = navigator.language.toLowerCase()
    if (deviceLanguage.startsWith("pt")) {
      setLanguage("pt")
    } else {
      setLanguage("en")
    }
  }, [])

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  const t = translations[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      navigate("/dashboard")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao autenticar"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.backToHome}
          </Button>
        </Link>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle language={language} />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-serif font-bold">{t.signIn}</CardTitle>
          <p className="text-sm text-muted-foreground">{t.welcomeBack}</p>
          <p className="text-xs text-muted-foreground">{t.enterCredentials}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Carregando..." : t.signInButton}
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t.noAccount}{" "}
              <Link to="/register" className="text-primary hover:underline">
                {t.signUp}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
