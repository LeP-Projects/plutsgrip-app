import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Eye, EyeOff, ArrowLeft, Check, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/ThemeToggle"

/**
 * Tipos para a página de Registro
 */
interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface PasswordRequirement {
  label: string
  met: boolean
}

interface RegisterPageTranslations {
  signUp: string
  createAccount: string
  enterDetails: string
  name: string
  email: string
  password: string
  confirmPassword: string
  showPassword: string
  hidePassword: string
  signUpButton: string
  haveAccount: string
  signIn: string
  backToHome: string
  passwordRequirements: string
  passwordLength: string
  hasUppercase: string
  hasLowercase: string
  hasNumber: string
  hasSpecialChar: string
  passwordMismatch: string
  requiredField: string
}

const translations: Record<string, RegisterPageTranslations> = {
  en: {
    signUp: "Sign Up",
    createAccount: "Create your account",
    enterDetails: "Enter your details to create a new account",
    name: "Full Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    signUpButton: "Create Account",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    backToHome: "Back to Home",
    passwordRequirements: "Password Requirements:",
    passwordLength: "At least 8 characters",
    hasUppercase: "At least one uppercase letter",
    hasLowercase: "At least one lowercase letter",
    hasNumber: "At least one number",
    hasSpecialChar: "At least one special character (@, #, $, %, etc)",
    passwordMismatch: "Passwords do not match",
    requiredField: "This field is required",
  },
  pt: {
    signUp: "Cadastro",
    createAccount: "Crie sua conta",
    enterDetails: "Digite seus dados para criar uma nova conta",
    name: "Nome Completo",
    email: "Email",
    password: "Senha",
    confirmPassword: "Confirmar Senha",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    signUpButton: "Criar Conta",
    haveAccount: "Já tem uma conta?",
    signIn: "Entre",
    backToHome: "Voltar ao Início",
    passwordRequirements: "Requisitos de Senha:",
    passwordLength: "Mínimo 8 caracteres",
    hasUppercase: "Pelo menos uma letra maiúscula",
    hasLowercase: "Pelo menos uma letra minúscula",
    hasNumber: "Pelo menos um número",
    hasSpecialChar: "Pelo menos um caractere especial (@, #, $, %, etc)",
    passwordMismatch: "As senhas não correspondem",
    requiredField: "Este campo é obrigatório",
  },
}

/**
 * Página de Registro
 * Permite que novos usuários criem uma conta
 * Componente Smart que gerencia estado e lógica de registro
 */
export function RegisterPage() {
  const [language, setLanguage] = useState("en")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState<
    PasswordRequirement[]
  >([])

  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

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

  // Atualiza os requisitos de senha
  useEffect(() => {
    const password = formData.password
    const requirements = [
      { label: t.passwordLength, met: password.length >= 8 },
      {
        label: t.hasUppercase,
        met: /[A-Z]/.test(password),
      },
      {
        label: t.hasLowercase,
        met: /[a-z]/.test(password),
      },
      {
        label: t.hasNumber,
        met: /\d/.test(password),
      },
      {
        label: t.hasSpecialChar,
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password),
      },
    ]
    setPasswordRequirements(requirements)
  }, [formData.password])

  const t = translations[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validações
    if (!formData.name.trim()) {
      setError(t.requiredField)
      return
    }

    if (!formData.email.trim()) {
      setError(t.requiredField)
      return
    }

    if (!formData.password.trim()) {
      setError(t.requiredField)
      return
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError("Password does not meet all requirements")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    setIsLoading(true)

    try {
      await register(formData.name, formData.email, formData.password)
      navigate("/dashboard")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar conta"
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
          <CardTitle className="text-2xl font-serif font-bold">
            {t.signUp}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t.createAccount}</p>
          <p className="text-xs text-muted-foreground">{t.enterDetails}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                type="text"
                placeholder="João da Silva"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

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

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 p-3 bg-muted rounded-md space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t.passwordRequirements}
                  </p>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs"
                      >
                        {req.met ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={
                            req.met
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword ? t.hidePassword : t.showPassword
                  }
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
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
              {isLoading ? "Criando conta..." : t.signUpButton}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t.haveAccount}{" "}
              <Link to="/login" className="text-primary hover:underline">
                {t.signIn}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
