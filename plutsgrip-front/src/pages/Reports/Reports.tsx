import { ReportsSection } from "@/components/ReportsSection"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { PageHeader } from "@/components/PageHeader"

const translations = {
  en: {
    title: "Reports",
    subtitle: "Read your numbers like an editor: contrast, concentration and momentum.",
  },
  pt: {
    title: "Relatorios",
    subtitle: "Leia seus numeros como um editor: contraste, concentracao e movimento.",
  },
}

export function ReportsPage() {
  const { language } = useAppShellContext()
  const t = translations[language as keyof typeof translations]
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Analytics" title={t.title} description={t.subtitle} />
      <ReportsSection language={language} />
    </div>
  )
}
