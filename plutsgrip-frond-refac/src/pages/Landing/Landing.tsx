import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/Button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { TrendingUp, Target, Repeat2, BarChart3, Zap, Shield } from "lucide-react"

interface LandingPageTranslations {
  appName: string
  tagline: string
  heroDescription: string
  getStarted: string
  signIn: string
  features: string
  budgetTitle: string
  budgetDesc: string
  goalsTitle: string
  goalsDesc: string
  recurringTitle: string
  recurringDesc: string
  reportsTitle: string
  reportsDesc: string
  secureTitle: string
  secureDesc: string
  fastTitle: string
  fastDesc: string
  ctaTitle: string
  ctaDescription: string
  footer: string
}

const translations: Record<string, LandingPageTranslations> = {
  en: {
    appName: "PlutusGrip",
    tagline: "Take Control of Your Finances",
    heroDescription:
      "Manage your budget, track expenses, set financial goals, and build wealth with confidence. Your personal finance companion.",
    getStarted: "Get Started",
    signIn: "Sign In",
    features: "Features",
    budgetTitle: "Smart Budget Management",
    budgetDesc:
      "Create and monitor budgets by category. Get alerts when you're approaching limits and stay within your financial goals.",
    goalsTitle: "Financial Goals",
    goalsDesc:
      "Set short-term and long-term financial goals. Track your progress and celebrate milestones on your journey to financial freedom.",
    recurringTitle: "Recurring Transactions",
    recurringDesc:
      "Automatically track regular expenses and income. Set and forget, while we handle the rest for accurate financial tracking.",
    reportsTitle: "Detailed Reports",
    reportsDesc:
      "Gain insights into your spending patterns with beautiful charts and reports. Make informed financial decisions.",
    secureTitle: "Secure & Private",
    secureDesc:
      "Your financial data is encrypted and protected. We take your privacy seriously with enterprise-grade security.",
    fastTitle: "Fast & Responsive",
    fastDesc:
      "Lightning-fast interface with seamless synchronization. Access your finances anytime, anywhere on any device.",
    ctaTitle: "Ready to Transform Your Finances?",
    ctaDescription: "Start for free today and take the first step towards financial freedom.",
    footer: "© 2026 PlutusGrip. All rights reserved.",
  },
  pt: {
    appName: "PlutusGrip",
    tagline: "Controle Suas Finanças",
    heroDescription:
      "Gerencie seu orçamento, acompanhe despesas, estabeleça metas financeiras e construa riqueza com confiança. Seu companheiro de finanças pessoais.",
    getStarted: "Começar",
    signIn: "Entrar",
    features: "Recursos",
    budgetTitle: "Gerenciamento Inteligente de Orçamento",
    budgetDesc:
      "Crie e monitore orçamentos por categoria. Receba alertas quando estiver se aproximando dos limites e mantenha-se dentro de suas metas financeiras.",
    goalsTitle: "Metas Financeiras",
    goalsDesc:
      "Defina metas financeiras de curto e longo prazo. Acompanhe seu progresso e comemore os marcos em sua jornada para liberdade financeira.",
    recurringTitle: "Transações Recorrentes",
    recurringDesc:
      "Rastreie automaticamente despesas e receitas regulares. Defina e esqueça, enquanto cuidamos do resto para rastreamento financeiro preciso.",
    reportsTitle: "Relatórios Detalhados",
    reportsDesc:
      "Ganhe insights sobre seus padrões de gastos com gráficos e relatórios bonitos. Tome decisões financeiras informadas.",
    secureTitle: "Seguro e Privado",
    secureDesc:
      "Seus dados financeiros são criptografados e protegidos. Levamos sua privacidade a sério com segurança de nível empresarial.",
    fastTitle: "Rápido e Responsivo",
    fastDesc:
      "Interface ultrarrápida com sincronização contínua. Acesse suas finanças a qualquer hora, em qualquer lugar em qualquer dispositivo.",
    ctaTitle: "Pronto para Transformar Suas Finanças?",
    ctaDescription: "Comece gratuitamente hoje e dê o primeiro passo em direção à liberdade financeira.",
    footer: "© 2026 PlutusGrip. Todos os direitos reservados.",
  },
}

/**
 * Página de Destino (Landing Page)
 * Apresenta o aplicativo PlutusGrip e seus recursos principais
 */
export function LandingPage() {
  const [language, setLanguage] = useState("en")

  // Detecta idioma do navegador
  useEffect(() => {
    const deviceLanguage = navigator.language.toLowerCase()
    if (deviceLanguage.startsWith("pt")) {
      setLanguage("pt")
    } else {
      setLanguage("en")
    }
  }, [])

  const t = translations[language]

  const features = [
    {
      icon: TrendingUp,
      title: t.budgetTitle,
      description: t.budgetDesc,
    },
    {
      icon: Target,
      title: t.goalsTitle,
      description: t.goalsDesc,
    },
    {
      icon: Repeat2,
      title: t.recurringTitle,
      description: t.recurringDesc,
    },
    {
      icon: BarChart3,
      title: t.reportsTitle,
      description: t.reportsDesc,
    },
    {
      icon: Shield,
      title: t.secureTitle,
      description: t.secureDesc,
    },
    {
      icon: Zap,
      title: t.fastTitle,
      description: t.fastDesc,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img src="/plutus.png" alt="PlutusGrip" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold font-serif">{t.appName}</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle language={language} />
            <Link to="/login">
              <Button variant="outline" size="sm">
                {t.signIn}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">{t.getStarted}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-foreground">
              {t.tagline}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.heroDescription}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                {t.getStarted}
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t.signIn}
              </Button>
            </Link>
          </div>

          {/* Hero Image/Visual */}
          <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-border/50 backdrop-blur-sm">
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm">
                  Dashboard preview coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4">
              {t.features}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to take control of your personal finances
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <Icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2 font-serif">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 p-12 rounded-xl border border-border">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">
              {t.ctaTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.ctaDescription}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                {t.getStarted}
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t.signIn}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          {t.footer}
        </div>
      </footer>
    </div>
  )
}
