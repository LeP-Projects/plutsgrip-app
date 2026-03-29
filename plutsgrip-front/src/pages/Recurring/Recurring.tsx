import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Loader2, PlusCircle, Repeat2, Trash2 } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/AlertDialog"
import { Button } from "@/components/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { PageHeader } from "@/components/PageHeader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { Textarea } from "@/components/Textarea"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { apiService, type Category, type RecurringTransaction } from "@/services/api"

const translations = {
  en: {
    title: "Recurring transactions",
    subtitle: "Manage repeating income and expenses with visibility over next execution dates.",
    newRecurring: "New recurring transaction",
    description: "Description",
    amount: "Amount",
    type: "Type",
    category: "Category",
    frequency: "Frequency",
    startDate: "Start date",
    endDate: "End date",
    notes: "Notes",
    create: "Create recurring transaction",
    income: "Income",
    expense: "Expense",
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Biweekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
    active: "Active",
    inactive: "Inactive",
    nextExecution: "Next execution",
    delete: "Delete",
    toggleStatus: "Toggle status",
    noRecurring: "No recurring transactions registered yet.",
    cancel: "Cancel",
  },
  pt: {
    title: "Transacoes recorrentes",
    subtitle: "Gerencie entradas e saidas recorrentes com visibilidade da proxima execucao.",
    newRecurring: "Nova transacao recorrente",
    description: "Descricao",
    amount: "Valor",
    type: "Tipo",
    category: "Categoria",
    frequency: "Frequencia",
    startDate: "Data inicial",
    endDate: "Data final",
    notes: "Observacoes",
    create: "Criar transacao recorrente",
    income: "Entrada",
    expense: "Saida",
    daily: "Diaria",
    weekly: "Semanal",
    biweekly: "Quinzenal",
    monthly: "Mensal",
    quarterly: "Trimestral",
    yearly: "Anual",
    active: "Ativa",
    inactive: "Inativa",
    nextExecution: "Proxima execucao",
    delete: "Excluir",
    toggleStatus: "Alternar status",
    noRecurring: "Nenhuma transacao recorrente cadastrada.",
    cancel: "Cancelar",
  },
}

export function RecurringTransactionsPage() {
  const { language } = useAppShellContext()
  const t = translations[language as keyof typeof translations]

  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category_id: "",
    frequency: "monthly" as "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    notes: "",
  })

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === formData.type),
    [categories, formData.type]
  )

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [String(category.id), category.name])),
    [categories]
  )

  const loadRecurringData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [categoriesResponse, recurringResponse] = await Promise.all([
        apiService.listCategories(),
        apiService.listRecurringTransactions(),
      ])
      setCategories(categoriesResponse.categories)
      setItems(recurringResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recurring transactions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecurringData().catch(() => {
      // state already handled
    })
  }, [])

  const handleCreateRecurring = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setSubmitting(true)
      setError(null)
      await apiService.createRecurringTransaction({
        description: formData.description,
        amount: Number(formData.amount),
        type: formData.type,
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
        frequency: formData.frequency,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        notes: formData.notes || undefined,
      })

      setFormData({
        description: "",
        amount: "",
        type: "expense",
        category_id: "",
        frequency: "monthly",
        start_date: new Date().toISOString().slice(0, 10),
        end_date: "",
        notes: "",
      })

      await loadRecurringData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create recurring transaction")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleRecurring = async (item: RecurringTransaction) => {
    try {
      setError(null)
      await apiService.updateRecurringTransaction(item.id, {
        is_active: !item.is_active,
      })
      await loadRecurringData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update recurring transaction")
    }
  }

  const handleDeleteRecurring = async (itemId: string) => {
    try {
      setError(null)
      await apiService.deleteRecurringTransaction(itemId)
      await loadRecurringData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete recurring transaction")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Rhythm" title={t.title} description={t.subtitle} />

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
          <CardTitle className="font-serif">{t.newRecurring}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRecurring} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label>{t.description}</Label>
              <Input value={formData.description} onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t.amount}</Label>
              <Input type="number" min="0" step="0.01" value={formData.amount} onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t.type}</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as "income" | "expense", category_id: "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t.type} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t.income}</SelectItem>
                  <SelectItem value="expense">{t.expense}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.category}</Label>
              <Select value={formData.category_id || "none"} onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value === "none" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-</SelectItem>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.frequency}</Label>
              <Select value={formData.frequency} onValueChange={(value) => setFormData((prev) => ({ ...prev, frequency: value as "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly" }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t.frequency} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t.daily}</SelectItem>
                  <SelectItem value="weekly">{t.weekly}</SelectItem>
                  <SelectItem value="biweekly">{t.biweekly}</SelectItem>
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
            <div className="space-y-2">
              <Label>{t.endDate}</Label>
              <Input type="date" value={formData.end_date} onChange={(event) => setFormData((prev) => ({ ...prev, end_date: event.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2 xl:col-span-3">
              <Label>{t.notes}</Label>
              <Textarea value={formData.notes} onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))} />
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <Button type="submit" disabled={submitting || !formData.description || !formData.amount}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {t.create}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="panel-surface">
          <CardContent className="py-12 text-center text-muted-foreground">{t.noRecurring}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="panel-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Repeat2 className="h-4 w-4" />
                  {item.description}
                </CardTitle>
                <CardDescription>
                  {item.frequency} • {item.type}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold">{item.amount.toFixed(2)}</div>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>{t.category}: {item.category_id ? categoryMap.get(String(item.category_id)) : "-"}</div>
                  <div>{t.nextExecution}: {item.next_execution_date || "-"}</div>
                  <div>{item.is_active ? t.active : t.inactive}</div>
                </div>
                {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleToggleRecurring(item)}>
                    {t.toggleStatus}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.delete}</AlertDialogTitle>
                        <AlertDialogDescription>{item.description}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteRecurring(item.id)}>
                          {t.delete}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
