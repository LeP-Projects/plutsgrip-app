import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { CurrencySelector } from "@/components/CurrencySelector"
import { LanguageToggle } from "@/components/LanguageToggle"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { PageHeader } from "@/components/PageHeader"
import { useCurrency } from "@/contexts/CurrencyContext"

type ConsentKey = "openFinance" | "invoiceImport" | "productAnalytics" | "biometricReady"

const CONSENT_STORAGE_KEY = "security-consents-v1"

const translations = {
  en: {
    settings: "Settings",
    subtitle: "Tune the interface, privacy posture and integration readiness in one place.",
    appearance: "Appearance",
    theme: "Theme",
    chooseTheme: "Choose your preferred theme",
    language: "Language",
    displayLanguage: "Display Language",
    chooseLanguage: "Choose your preferred language",
    currencySettings: "Currency Settings",
    chooseCurrency: "Choose your preferred currency for displaying amounts",
    security: "Security & privacy",
    privacyMode: "Privacy mode",
    privacyModeText: "Hide monetary amounts across major dashboard views.",
    sessionMode: "Current session storage",
    sessionWarning: "Auth still uses localStorage in this environment. Production target remains httpOnly cookies with rotation.",
    sessionStatus: "Development fallback",
    consent: "Consent & governance",
    openFinance: "Open Finance consent",
    invoiceImport: "NFC-e import consent",
    productAnalytics: "Product analytics consent",
    biometricReady: "Biometric-ready local policy",
    integrations: "Integrations readiness",
    integrationSubtitle: "Execution phases for automations and ingestion pipelines.",
    phaseOne: "Phase 1",
    phaseTwo: "Phase 2",
    phaseThree: "Phase 3",
    phaseOneText: "Consent layer, secure callbacks and provider abstraction.",
    phaseTwoText: "NFC-e ingestion, normalization and transaction suggestions.",
    phaseThreeText: "Open Finance aggregation, reconciliation and anomaly feedback loop.",
    savePolicy: "Save local policy",
    saved: "Preferences saved locally",
  },
  pt: {
    settings: "Configuracoes",
    subtitle: "Ajuste interface, postura de privacidade e prontidao de integracoes em um unico lugar.",
    appearance: "Aparencia",
    theme: "Tema",
    chooseTheme: "Escolha seu tema preferido",
    language: "Idioma",
    displayLanguage: "Idioma de Exibicao",
    chooseLanguage: "Escolha seu idioma preferido",
    currencySettings: "Configuracoes de Moeda",
    chooseCurrency: "Escolha sua moeda preferida para exibir valores",
    security: "Seguranca e privacidade",
    privacyMode: "Modo de privacidade",
    privacyModeText: "Oculta valores monetarios nas principais visoes do produto.",
    sessionMode: "Armazenamento atual de sessao",
    sessionWarning: "A autenticacao ainda usa localStorage neste ambiente. O alvo de producao continua sendo cookies httpOnly com rotacao.",
    sessionStatus: "Fallback de desenvolvimento",
    consent: "Consentimento e governanca",
    openFinance: "Consentimento Open Finance",
    invoiceImport: "Consentimento para importacao NFC-e",
    productAnalytics: "Consentimento para analiticos do produto",
    biometricReady: "Politica local pronta para biometria",
    integrations: "Prontidao de integracoes",
    integrationSubtitle: "Fases de execucao para automacoes e pipelines de ingestao.",
    phaseOne: "Fase 1",
    phaseTwo: "Fase 2",
    phaseThree: "Fase 3",
    phaseOneText: "Camada de consentimento, callbacks seguros e abstracao de provedores.",
    phaseTwoText: "Ingestao de NFC-e, normalizacao e sugestoes de transacao.",
    phaseThreeText: "Agregacao Open Finance, conciliacao e ciclo de feedback para anomalias.",
    savePolicy: "Salvar politica local",
    saved: "Preferencias salvas localmente",
  },
}

interface ConsentState {
  openFinance: boolean
  invoiceImport: boolean
  productAnalytics: boolean
  biometricReady: boolean
}

const defaultConsentState: ConsentState = {
  openFinance: false,
  invoiceImport: false,
  productAnalytics: true,
  biometricReady: false,
}

export function SettingsPage() {
  const { language, setLanguage } = useAppShellContext()
  const { privacyMode, setPrivacyMode } = useCurrency()
  const t = translations[language as keyof typeof translations]

  const [consents, setConsents] = useState<ConsentState>(defaultConsentState)
  const [savedState, setSavedState] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (stored) {
        setConsents({ ...defaultConsentState, ...JSON.parse(stored) })
      }
    } catch (error) {
      console.error("Error loading consent preferences:", error)
    }
  }, [])

  const consentItems = useMemo(
    () => [
      { key: "openFinance" as ConsentKey, label: t.openFinance },
      { key: "invoiceImport" as ConsentKey, label: t.invoiceImport },
      { key: "productAnalytics" as ConsentKey, label: t.productAnalytics },
      { key: "biometricReady" as ConsentKey, label: t.biometricReady },
    ],
    [t.biometricReady, t.invoiceImport, t.openFinance, t.productAnalytics]
  )

  const saveLocalPolicy = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consents))
    setSavedState(true)
    window.setTimeout(() => setSavedState(false), 2500)
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Preferences" title={t.settings} description={t.subtitle} />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-6">
          <Card className="panel-surface">
            <CardHeader>
              <CardTitle>{t.appearance}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium">{t.theme}</h4>
                  <p className="text-sm text-muted-foreground">{t.chooseTheme}</p>
                </div>
                <ThemeToggle language={language} />
              </div>
            </CardContent>
          </Card>

          <Card className="panel-surface">
            <CardHeader>
              <CardTitle>{t.language}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium">{t.displayLanguage}</h4>
                  <p className="text-sm text-muted-foreground">{t.chooseLanguage}</p>
                </div>
                <LanguageToggle currentLanguage={language} onLanguageChange={setLanguage} />
              </div>
            </CardContent>
          </Card>

          <Card className="panel-surface">
            <CardHeader>
              <CardTitle>{t.currencySettings}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="mb-4 text-sm text-muted-foreground">{t.chooseCurrency}</p>
                <CurrencySelector language={language} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card className="panel-surface">
            <CardHeader>
              <CardTitle>{t.security}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-[24px] border border-border/70 p-4">
                <div>
                  <div className="font-medium">{t.privacyMode}</div>
                  <p className="text-sm text-muted-foreground">{t.privacyModeText}</p>
                </div>
                <Button variant={privacyMode ? "default" : "outline"} onClick={() => setPrivacyMode(!privacyMode)}>
                  {privacyMode ? "On" : "Off"}
                </Button>
              </div>

              <div className="rounded-[24px] border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{t.sessionMode}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.sessionWarning}</p>
                  </div>
                  <Badge variant="outline">{t.sessionStatus}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="panel-surface">
            <CardHeader>
              <CardTitle>{t.consent}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {consentItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 rounded-[20px] border border-border/70 p-4">
                  <div className="font-medium">{item.label}</div>
                  <Button
                    variant={consents[item.key] ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setConsents((current) => ({
                        ...current,
                        [item.key]: !current[item.key],
                      }))
                    }
                  >
                    {consents[item.key] ? "On" : "Off"}
                  </Button>
                </div>
              ))}

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={saveLocalPolicy}>{t.savePolicy}</Button>
                {savedState && <span className="text-sm text-muted-foreground">{t.saved}</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="panel-surface">
            <CardHeader>
              <CardTitle>{t.integrations}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{t.integrationSubtitle}</p>
              <div className="rounded-[20px] border border-border/70 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-primary">{t.phaseOne}</div>
                <div className="mt-2 font-medium">{t.phaseOneText}</div>
              </div>
              <div className="rounded-[20px] border border-border/70 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-primary">{t.phaseTwo}</div>
                <div className="mt-2 font-medium">{t.phaseTwoText}</div>
              </div>
              <div className="rounded-[20px] border border-border/70 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-primary">{t.phaseThree}</div>
                <div className="mt-2 font-medium">{t.phaseThreeText}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
