import { CategoryManager } from "@/components/CategoryManager"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { PageHeader } from "@/components/PageHeader"

const translations = {
  en: {
    categories: "Categories",
    subtitle: "Shape the taxonomy behind your financial story.",
  },
  pt: {
    categories: "Categorias",
    subtitle: "Modele a taxonomia por tras da sua historia financeira.",
  },
}

export function CategoriesPage() {
  const { language } = useAppShellContext()
  const t = translations[language as keyof typeof translations]

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Taxonomy" title={t.categories} description={t.subtitle} />
      <CategoryManager language={language} />
    </div>
  )
}
