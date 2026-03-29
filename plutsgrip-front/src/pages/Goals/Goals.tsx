import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, PlusCircle, Target, Trash2 } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/AlertDialog"
import { Button } from "@/components/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/Dialog"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { PageHeader } from "@/components/PageHeader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { Textarea } from "@/components/Textarea"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { apiService, type Goal, type GoalProgressSummary } from "@/services/api"

const translations = {
  en: {
    title: "Goals",
    subtitle: "Track financial targets and keep progress visible.",
    newGoal: "New goal",
    name: "Name",
    description: "Description",
    targetAmount: "Target amount",
    deadline: "Deadline",
    category: "Category",
    priority: "Priority",
    create: "Create goal",
    progress: "Add progress",
    complete: "Complete",
    delete: "Delete",
    noGoals: "No goals registered yet.",
    low: "Low",
    medium: "Medium",
    high: "High",
    summary: "Goals summary",
    total: "Total",
    completed: "Completed",
    pending: "Pending",
    completion: "Completion",
    progressAmount: "Progress amount",
    saveProgress: "Save progress",
    cancel: "Cancel",
  },
  pt: {
    title: "Metas",
    subtitle: "Acompanhe objetivos financeiros e mantenha o progresso visivel.",
    newGoal: "Nova meta",
    name: "Nome",
    description: "Descricao",
    targetAmount: "Valor alvo",
    deadline: "Prazo",
    category: "Categoria",
    priority: "Prioridade",
    create: "Criar meta",
    progress: "Adicionar progresso",
    complete: "Concluir",
    delete: "Excluir",
    noGoals: "Nenhuma meta cadastrada.",
    low: "Baixa",
    medium: "Media",
    high: "Alta",
    summary: "Resumo das metas",
    total: "Total",
    completed: "Concluidas",
    pending: "Pendentes",
    completion: "Conclusao",
    progressAmount: "Valor do progresso",
    saveProgress: "Salvar progresso",
    cancel: "Cancelar",
  },
}

export function GoalsPage() {
  const { language } = useAppShellContext()
  const t = translations[language as keyof typeof translations]

  const [goals, setGoals] = useState<Goal[]>([])
  const [summary, setSummary] = useState<GoalProgressSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressGoalId, setProgressGoalId] = useState<string | null>(null)
  const [progressAmount, setProgressAmount] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_amount: "",
    deadline: "",
    category: "",
    priority: "medium" as "low" | "medium" | "high",
  })

  const loadGoalsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [goalsResponse, summaryResponse] = await Promise.all([
        apiService.listGoals(),
        apiService.getGoalsSummary(),
      ])
      setGoals(goalsResponse)
      setSummary(summaryResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoalsData().catch(() => {
      // state already handled
    })
  }, [])

  const handleCreateGoal = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setSubmitting(true)
      setError(null)
      await apiService.createGoal({
        name: formData.name,
        description: formData.description || undefined,
        target_amount: Number(formData.target_amount),
        deadline: formData.deadline || undefined,
        category: formData.category || undefined,
        priority: formData.priority,
      })
      setFormData({
        name: "",
        description: "",
        target_amount: "",
        deadline: "",
        category: "",
        priority: "medium",
      })
      await loadGoalsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddProgress = async () => {
    if (!progressGoalId || !progressAmount) return
    try {
      setError(null)
      await apiService.addGoalProgress(progressGoalId, Number(progressAmount))
      setProgressGoalId(null)
      setProgressAmount("")
      await loadGoalsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update progress")
    }
  }

  const handleCompleteGoal = async (goalId: string) => {
    try {
      setError(null)
      await apiService.completeGoal(goalId)
      await loadGoalsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete goal")
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setError(null)
      await apiService.deleteGoal(goalId)
      await loadGoalsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete goal")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Targets" title={t.title} description={t.subtitle} />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="panel-surface lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-serif">{t.newGoal}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGoal} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t.name}</Label>
                <Input value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t.targetAmount}</Label>
                <Input type="number" min="0" step="0.01" value={formData.target_amount} onChange={(event) => setFormData((prev) => ({ ...prev, target_amount: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t.deadline}</Label>
                <Input type="date" value={formData.deadline} onChange={(event) => setFormData((prev) => ({ ...prev, deadline: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t.category}</Label>
                <Input value={formData.category} onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t.description}</Label>
                <Textarea value={formData.description} onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t.priority}</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as "low" | "medium" | "high" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.priority} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t.low}</SelectItem>
                    <SelectItem value="medium">{t.medium}</SelectItem>
                    <SelectItem value="high">{t.high}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={submitting || !formData.name || !formData.target_amount}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  {t.create}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle className="font-serif">{t.summary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>{t.total}: <span className="font-semibold">{summary?.total_goals ?? 0}</span></div>
            <div>{t.completed}: <span className="font-semibold">{summary?.completed_goals ?? 0}</span></div>
            <div>{t.pending}: <span className="font-semibold">{summary?.pending_goals ?? 0}</span></div>
            <div>{t.completion}: <span className="font-semibold">{(summary?.completion_percentage ?? 0).toFixed(0)}%</span></div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : goals.length === 0 ? (
        <Card className="panel-surface">
          <CardContent className="py-12 text-center text-muted-foreground">{t.noGoals}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((goal) => {
            const progress = goal.progress_percentage ?? (goal.target_amount ? (goal.current_amount / goal.target_amount) * 100 : 0)
            return (
              <Card key={goal.id} className="panel-surface">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Target className="h-4 w-4" />
                    {goal.name}
                  </CardTitle>
                  <CardDescription>{goal.category || goal.priority}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                  <div className="text-sm">
                    {goal.current_amount.toFixed(2)} / {goal.target_amount.toFixed(2)}
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div className="text-sm font-medium">{progress.toFixed(0)}%</div>
                  <div className="flex flex-wrap gap-2">
                    <Dialog open={progressGoalId === goal.id} onOpenChange={(open) => setProgressGoalId(open ? goal.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">{t.progress}</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.progress}</DialogTitle>
                          <DialogDescription>{goal.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Label>{t.progressAmount}</Label>
                          <Input type="number" min="0" step="0.01" value={progressAmount} onChange={(event) => setProgressAmount(event.target.value)} />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setProgressGoalId(null)}>{t.cancel}</Button>
                          <Button onClick={handleAddProgress} disabled={!progressAmount}>{t.saveProgress}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {!goal.is_completed && (
                      <Button variant="secondary" size="sm" onClick={() => handleCompleteGoal(goal.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t.complete}
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.delete}</AlertDialogTitle>
                          <AlertDialogDescription>{goal.name}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteGoal(goal.id)}>
                            {t.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
