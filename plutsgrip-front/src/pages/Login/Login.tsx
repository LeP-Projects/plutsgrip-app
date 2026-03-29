import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { useAuth } from "@/contexts/AuthContext"
import { PublicExperience } from "@/components/PublicExperience"

interface LoginFormData {
  email: string
  password: string
}

interface LoginPageTranslations {
  signIn: string
  eyebrow: string
  title: string
  description: string
  email: string
  password: string
  showPassword: string
  hidePassword: string
  signInButton: string
  loading: string
  noAccount: string
  signUp: string
  backToHome: string
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
  trusted: string
  privacy: string
  privacyLabel: string
  trustedDetail: string
}

const translations: Record<string, LoginPageTranslations> = {
  en: {
    signIn: "Sign in",
    eyebrow: "Secure access",
    title: "Pick up your financial flow exactly where you left it.",
    description:
      "Your dashboard, planning, health metrics, alerts, and reports are waiting in the same visual workspace designed across the new application.",
    email: "Email",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    signInButton: "Access workspace",
    loading: "Signing in...",
    noAccount: "Don't have an account yet?",
    signUp: "Create one",
    backToHome: "Back to home",
    badge: "Trusted access",
    statOneLabel: "Visual language",
    statOneValue: "Refined",
    statTwoLabel: "Privacy mode",
    statTwoValue: "Ready",
    statThreeLabel: "Forecast hub",
    statThreeValue: "Active",
    highlightOne: "A lighter, calmer public experience aligned with the private workspace.",
    highlightTwo: "Authentication feels like part of the product, not a disconnected utility screen.",
    panelEyebrow: "Member access",
    panelTitle: "Welcome back",
    panelDescription: "Enter your credentials and go straight into your financial command center.",
    trusted: "Protected session",
    trustedDetail: "TLS + protected API flow",
    privacy: "Sensitive amounts can follow privacy mode inside the app.",
    privacyLabel: "Privacy aware",
  },
  pt: {
    signIn: "Entrar",
    eyebrow: "Acesso seguro",
    title: "Retome sua rotina financeira exatamente do ponto em que parou.",
    description:
      "Dashboard, planejamento, saude financeira, alertas e relatorios esperam voce no mesmo ambiente visual que agora organiza toda a aplicacao.",
    email: "Email",
    password: "Senha",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    signInButton: "Acessar ambiente",
    loading: "Entrando...",
    noAccount: "Ainda nao tem conta?",
    signUp: "Criar agora",
    backToHome: "Voltar ao inicio",
    badge: "Acesso confiavel",
    statOneLabel: "Linguagem visual",
    statOneValue: "Refinada",
    statTwoLabel: "Modo privacidade",
    statTwoValue: "Pronto",
    statThreeLabel: "Centro de previsao",
    statThreeValue: "Ativo",
    highlightOne: "Uma experiencia publica mais leve e coerente com o restante do produto.",
    highlightTwo: "A autenticacao agora parece parte da jornada, nao uma tela solta.",
    panelEyebrow: "Acesso do membro",
    panelTitle: "Bem-vindo de volta",
    panelDescription: "Digite suas credenciais para voltar ao seu centro de comando financeiro.",
    trusted: "Sessao protegida",
    trustedDetail: "TLS + fluxo protegido na API",
    privacy: "Valores sensiveis podem seguir o modo de privacidade dentro do app.",
    privacyLabel: "Privacidade ativa",
  },
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar")
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
        <div className="flex h-full flex-col justify-between gap-6">
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
                <ShieldCheck className="h-5 w-5" />
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
              </div>

              {error ? (
                <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="h-12 w-full rounded-2xl text-sm" disabled={isLoading}>
                {isLoading ? t.loading : t.signInButton}
              </Button>
            </form>

            <div className="mt-5 border-t border-border/70 pt-5 text-center text-sm text-muted-foreground">
              {t.noAccount}{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                {t.signUp}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-border/60 bg-background/38 px-4 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">{t.trusted}</p>
                  <p className="text-sm text-muted-foreground">{t.trustedDetail}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-background/38 px-4 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/15">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">{t.privacyLabel}</p>
                  <p className="text-sm text-muted-foreground">{t.privacy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}
