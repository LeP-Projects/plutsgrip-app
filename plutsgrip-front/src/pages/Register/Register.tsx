import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, Eye, EyeOff, ShieldCheck, UserRoundPlus, X } from "lucide-react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { useAuth } from "@/contexts/AuthContext"
import { PublicExperience } from "@/components/PublicExperience"

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
  eyebrow: string
  title: string
  description: string
  createAccount: string
  enterDetails: string
  name: string
  email: string
  password: string
  confirmPassword: string
  showPassword: string
  hidePassword: string
  signUpButton: string
  loading: string
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
  invalidPassword: string
  badge: string
  statOneLabel: string
  statOneValue: string
  statTwoLabel: string
  statTwoValue: string
  statThreeLabel: string
  statThreeValue: string
  highlightOne: string
  highlightTwo: string
  panelEyebrow: string
  panelTitle: string
  panelDescription: string
}

const translations: Record<string, RegisterPageTranslations> = {
  en: {
    signUp: "Create account",
    eyebrow: "New workspace",
    title: "Start with the same refined visual language the product now carries inside.",
    description:
      "Registration should feel premium, reassuring, and organized. The new flow introduces the product with clarity before the first authenticated session even begins.",
    createAccount: "Create your account",
    enterDetails: "Set your identity and start building your financial operating system.",
    name: "Full name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    signUpButton: "Open my workspace",
    loading: "Creating account...",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    backToHome: "Back to home",
    passwordRequirements: "Password checklist",
    passwordLength: "At least 8 characters",
    hasUppercase: "At least one uppercase letter",
    hasLowercase: "At least one lowercase letter",
    hasNumber: "At least one number",
    hasSpecialChar: "At least one special character",
    passwordMismatch: "Passwords do not match",
    requiredField: "Please fill in all required fields",
    invalidPassword: "Password does not meet all requirements",
    badge: "Premium onboarding",
    statOneLabel: "First setup",
    statOneValue: "Fast",
    statTwoLabel: "Security baseline",
    statTwoValue: "Strong",
    statThreeLabel: "Design system",
    statThreeValue: "Unified",
    highlightOne: "Create an account through a cleaner, calmer, more trustworthy onboarding flow.",
    highlightTwo: "The visual shell already introduces privacy, planning, and control as core ideas.",
    panelEyebrow: "Account setup",
    panelTitle: "Join PlutusGrip",
    panelDescription: "A sharper entry point into budgets, goals, health metrics, projections, and alerts.",
  },
  pt: {
    signUp: "Criar conta",
    eyebrow: "Novo ambiente",
    title: "Comece com a mesma linguagem visual refinada que agora organiza o produto por dentro.",
    description:
      "O cadastro agora transmite clareza, confianca e valor desde o primeiro contato, preparando a entrada no ecossistema financeiro da aplicacao.",
    createAccount: "Crie sua conta",
    enterDetails: "Defina sua identidade e inicie seu sistema operacional financeiro pessoal.",
    name: "Nome completo",
    email: "Email",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    signUpButton: "Abrir meu ambiente",
    loading: "Criando conta...",
    haveAccount: "Ja tem uma conta?",
    signIn: "Entrar",
    backToHome: "Voltar ao inicio",
    passwordRequirements: "Checklist da senha",
    passwordLength: "Minimo de 8 caracteres",
    hasUppercase: "Pelo menos uma letra maiuscula",
    hasLowercase: "Pelo menos uma letra minuscula",
    hasNumber: "Pelo menos um numero",
    hasSpecialChar: "Pelo menos um caractere especial",
    passwordMismatch: "As senhas nao correspondem",
    requiredField: "Preencha todos os campos obrigatorios",
    invalidPassword: "A senha nao atende a todos os requisitos",
    badge: "Onboarding premium",
    statOneLabel: "Primeira configuracao",
    statOneValue: "Rapida",
    statTwoLabel: "Base de seguranca",
    statTwoValue: "Forte",
    statThreeLabel: "Design system",
    statThreeValue: "Unificado",
    highlightOne: "Crie sua conta por um fluxo mais limpo, calmo e confiavel.",
    highlightTwo: "A casca visual ja apresenta privacidade, planejamento e controle como ideias centrais.",
    panelEyebrow: "Configuracao da conta",
    panelTitle: "Entre no PlutusGrip",
    panelDescription: "Uma porta de entrada mais forte para orcamentos, metas, saude financeira, projecoes e alertas.",
  },
}

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
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([])

  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  useEffect(() => {
    const deviceLanguage = navigator.language.toLowerCase()
    setLanguage(deviceLanguage.startsWith("pt") ? "pt" : "en")
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  const t = translations[language]

  useEffect(() => {
    const password = formData.password
    setPasswordRequirements([
      { label: t.passwordLength, met: password.length >= 8 },
      { label: t.hasUppercase, met: /[A-Z]/.test(password) },
      { label: t.hasLowercase, met: /[a-z]/.test(password) },
      { label: t.hasNumber, met: /\d/.test(password) },
      {
        label: t.hasSpecialChar,
        met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password),
      },
    ])
  }, [
    formData.password,
    t.hasLowercase,
    t.hasNumber,
    t.hasSpecialChar,
    t.hasUppercase,
    t.passwordLength,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError(t.requiredField)
      return
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError(t.invalidPassword)
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
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PublicExperience
      language={language}
      backLabel={t.backToHome}
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
      badge={t.badge}
      ctaLabel={t.signUp}
      ctaTo="/register"
      secondaryLabel={t.signIn}
      secondaryTo="/login"
      stats={[
        { label: t.statOneLabel, value: t.statOneValue },
        { label: t.statTwoLabel, value: t.statTwoValue },
        { label: t.statThreeLabel, value: t.statThreeValue },
      ]}
      highlights={[t.highlightOne, t.highlightTwo]}
      rightContent={
        <div className="flex h-full flex-col gap-5">
          <div className="rounded-[1.9rem] border border-border/70 bg-background/58 p-6 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-primary">
                  {t.panelEyebrow}
                </p>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-foreground">
                  {t.panelTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {t.panelDescription}
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/15">
                <UserRoundPlus className="h-5 w-5" />
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-2xl border-border/70 bg-background/70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-2xl border-border/70 bg-background/70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="........"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-2xl border-border/70 bg-background/70 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 rounded-xl hover:bg-background/70"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {formData.password ? (
                  <div className="rounded-3xl border border-border/60 bg-background/45 p-4 backdrop-blur-md">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {t.passwordRequirements}
                    </p>
                    <div className="mt-3 space-y-2">
                      {passwordRequirements.map((req) => (
                        <div key={req.label} className="flex items-center gap-2 text-sm">
                          {req.met ? (
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                          <span
                            className={
                              req.met
                                ? "text-emerald-700 dark:text-emerald-300"
                                : "text-muted-foreground"
                            }
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="........"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    disabled={isLoading}
                    className="h-12 rounded-2xl border-border/70 bg-background/70 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 rounded-xl hover:bg-background/70"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
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

              {error ? (
                <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="h-12 w-full rounded-2xl text-sm" disabled={isLoading}>
                {isLoading ? t.loading : t.signUpButton}
              </Button>
            </form>

            <div className="mt-5 border-t border-border/70 pt-5 text-center text-sm text-muted-foreground">
              {t.haveAccount}{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                {t.signIn}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-background/38 px-4 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-foreground">{t.createAccount}</p>
                <p className="text-sm text-muted-foreground">{t.enterDetails}</p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}
