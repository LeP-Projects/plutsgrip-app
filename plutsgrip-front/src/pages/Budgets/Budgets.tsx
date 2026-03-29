import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { AlertCircle, Loader2, PlusCircle, Trash2, Wallet } from "lucide-react"

import { Button } from "@/components/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { PageHeader } from "@/components/PageHeader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/AlertDialog"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { apiService, type Budget, type BudgetStatus, type Category } from "@/services/api"

const translations = {
  en: {
    title: "Budgets",
    subtitle: "Create category budgets and track monthly usage in one place.",
    createTitle: "New budget",
    createDescription: "Define a spending limit for one of your categories.",
    category: "Category",
    amount: "Budget amount",
    period: "Period",
    startDate: "Start date",
    create: "Create budget",
    creating: "Creating...",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
    noBudgets: "No budgets yet.",
    spent: "Spent",
    remaining: "Remaining",
    delete: "Delete",
    deleteTitle: "Delete budget",
    deleteDescription: "This will permanently remove the selected budget.",
    exceeded: "Exceeded",
    activeBudgets: "Active budgets",
    uncategorized: "Uncategorized",
    cancel: "Cancel",
  },
  pt: {
    title: "Orcamentos",
    subtitle: "Crie limites por categoria e acompanhe o uso em um unico lugar.",
    createTitle: "Novo orcamento",
    createDescription: "Defina um limite de gastos para uma das suas categorias.",
    category: "Categoria",
    amount: "Valor do orcamento",
    period: "Periodo",
    startDate: "Data inicial",
    create: "Criar orcamento",
    creating: "Criando...",
    monthly: "Mensal",
    quarterly: "Trimestral",
    yearly: "Anual",
    noBudgets: "Nenhum orcamento cadastrado.",
    spent: "Gasto",
    remaining: "Restante",
    delete: "Excluir",
    deleteTitle: "Excluir orcamento",
    deleteDescription: "Isso vai remover permanentemente o orcamento selecionado.",
    exceeded: "Excedido",
    activeBudgets: "Orcamentos ativos",
    uncategorized: "Sem categoria",
    cancel: "Cancelar",
  },
}

export function BudgetsPage() {
  const { language } = useAppShellContext()
  const t = translations[language as keyof typeof translations]

  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [statuses, setStatuses] = useState<Record<string, BudgetStatus>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    period: "monthly" as "monthly" | "quarterly" | "yearly",
    start_date: format(new Date(), "yyyy-MM-dd"),
  })

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories]
  )

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [String(category.id), category.name])),
    [categories]
  )

  const loadBudgetsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [categoriesResponse, budgetsResponse] = await Promise.all([
        apiService.listCategories(),
        apiService.listBudgets(),
      ])

      setCategories(categoriesResponse.categories)
      setBudgets(budgetsResponse)

      const statusEntries = await Promise.all(
        budgetsResponse.map(async (budget) => {
          const status = await apiService.getBudgetStatus(budget.id)
          return [budget.id, status] as const
        })
      )

      setStatuses(Object.fromEntries(statusEntries))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budgets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBudgetsData().catch(() => {
      // state already handled
    })
  }, [])

  const handleCreateBudget = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError(null)
      await apiService.createBudget({
        category_id: Number(formData.category_id),
        amount: Number(formData.amount),
        period: formData.period,
        start_date: formData.start_date,
      })

      setFormData({
        category_id: "",
        amount: "",
        period: "monthly",
        start_date: format(new Date(), "yyyy-MM-dd"),
      })

      await loadBudgetsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create budget")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      setError(null)
      await apiService.deleteBudget(budgetId)
      await loadBudgetsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete budget")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Control" title={t.title} description={t.subtitle} />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <Card className="panel-surface">
        <CardHeader>
          <CardTitle className="font-serif">{t.createTitle}</CardTitle>
          <CardDescription>{t.createDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBudget} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label>{t.category}</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t.category} />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.amount}</Label>
              <Input type="number" min="0" step="0.01" value={formData.amount} onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>{t.period}</Label>
              <Select value={formData.period} onValueChange={(value) => setFormData((prev) => ({ ...prev, period: value as "monthly" | "quarterly" | "yearly" }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t.period} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t.monthly}</SelectItem>
                  <SelectItem value="quarterly">{t.quarterly}</SelectItem>
                  <SelectItem value="yearly">{t.yearly}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.startDate}</Label>
              <Input type="date" value={formData.start_date} onChange={(event) => setFormData((prev) => ({ ...prev, start_date: event.target.value }))} />
            </div>

            <div className="md:col-span-2 xl:col-span-4">
              <Button type="submit" disabled={submitting || !formData.category_id || !formData.amount} className="w-full sm:w-auto">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {submitting ? t.creating : t.create}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-serif font-semibold">{t.activeBudgets}</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : budgets.length === 0 ? (
          <Card className="panel-surface">
            <CardContent className="py-12 text-center text-muted-foreground">{t.noBudgets}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {budgets.map((budget) => {
              const status = statuses[budget.id]
              const percentage = Math.min(status?.percentage_used ?? 0, 100)
              const categoryName = categoryMap.get(String(budget.category_id)) || t.uncategorized

              return (
                <Card key={budget.id} className="panel-surface">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 font-serif">
                        <Wallet className="h-4 w-4" />
                        {categoryName}
                      </CardTitle>
                      <CardDescription>
                        {budget.period} • {budget.start_date}
                      </CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
                          <AlertDialogDescription>{t.deleteDescription}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteBudget(budget.id)}>
                            {t.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-2xl font-bold">{budget.amount.toFixed(2)}</div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className={`h-2 rounded-full ${status?.is_exceeded ? "bg-destructive" : "bg-primary"}`} style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <div>{t.spent}: {(status?.spent_amount ?? 0).toFixed(2)}</div>
                      <div>{t.remaining}: {(status?.remaining_amount ?? budget.amount).toFixed(2)}</div>
                    </div>
                    {status?.is_exceeded && <div className="text-sm font-medium text-destructive">{t.exceeded}</div>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
