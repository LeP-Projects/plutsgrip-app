import { useCallback, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { MoreHorizontal, Edit, Trash2, Search } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/DropdownMenu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/AlertDialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/Dialog"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { useApi, useMutation } from "@/hooks/useApi"
import { apiService, type Transaction, type TransactionCreateRequest } from "@/services/api"
import { useCurrency } from "@/contexts/CurrencyContext"

const translations = {
  en: {
    recentTransactions: "Recent Transactions",
    allTransactions: "All Transactions",
    latestActivities: "Your latest financial activities",
    allYourTransactions: "All your transactions",
    searchTransactions: "Search transactions...",
    allCategories: "All Categories",
    allTypes: "All Types",
    entrada: "Income",
    saida: "Expense",
    edit: "Edit",
    delete: "Delete",
    noTransactions: "No transactions found matching your filters.",
    viewAllTransactions: "View All Transactions",
    notes: "Notes",
    editTransaction: "Edit Transaction",
    editTransactionDesc: "Update transaction details",
    deleteTransaction: "Delete Transaction",
    deleteTransactionDesc: "Are you sure you want to delete this transaction? This action cannot be undone.",
    description: "Description",
    amount: "Amount",
    category: "Category",
    type: "Type",
    date: "Date",
    cancel: "Cancel",
    update: "Update",
    saving: "Saving...",
    deleting: "Deleting...",
    uncategorized: "Uncategorized",
    required: "*",
  },
  pt: {
    recentTransactions: "Transações Recentes",
    allTransactions: "Todas as Transações",
    latestActivities: "Suas atividades financeiras mais recentes",
    allYourTransactions: "Todas as suas transações",
    searchTransactions: "Pesquisar transações...",
    allCategories: "Todas as Categorias",
    allTypes: "Todos os Tipos",
    entrada: "Entrada",
    saida: "Saída",
    edit: "Editar",
    delete: "Excluir",
    noTransactions: "Nenhuma transação encontrada com os filtros aplicados.",
    viewAllTransactions: "Ver Todas as Transações",
    notes: "Observações",
    editTransaction: "Editar Transação",
    editTransactionDesc: "Atualizar detalhes da transação",
    deleteTransaction: "Excluir Transação",
    deleteTransactionDesc: "Tem certeza de que deseja excluir esta transação? Esta ação não pode ser desfeita.",
    description: "Descrição",
    amount: "Valor",
    category: "Categoria",
    type: "Tipo",
    date: "Data",
    cancel: "Cancelar",
    update: "Atualizar",
    saving: "Salvando...",
    deleting: "Excluindo...",
    uncategorized: "Sem categoria",
    required: "*",
  },
}

interface RecentTransactionsProps {
  showAll?: boolean
  onViewAllClick?: () => void
  typeFilter?: "income" | "expense" | "all"
  language: string
  refreshKey?: number
}

interface EditFormState {
  description: string
  amount: string
  categoryId: string
  type: "income" | "expense"
  date: string
  notes: string
}

function normalizeTransactionType(type: string | undefined): "income" | "expense" {
  return type?.toLowerCase() === "income" ? "income" : "expense"
}

export function RecentTransactions({
  showAll = false,
  onViewAllClick,
  typeFilter = "all",
  language,
  refreshKey = 0,
}: RecentTransactionsProps) {
  const t = translations[language as keyof typeof translations]
  const { formatCurrency } = useCurrency()

  const fetchTransactions = useCallback(
    () => apiService.listTransactions(1, showAll ? 100 : 5, typeFilter !== "all" ? typeFilter : undefined),
    [showAll, typeFilter, refreshKey]
  )
  const fetchCategories = useCallback(() => apiService.listCategories(), [])

  const { data: transactionsData, refetch } = useApi(fetchTransactions, true)
  const { data: categoriesData } = useApi(fetchCategories, true)

  const { execute: updateTransaction, loading: updatingTransaction } = useMutation(
    ({ id, data }: { id: string; data: Partial<TransactionCreateRequest> }) =>
      apiService.updateTransaction(id, data)
  )
  const { execute: deleteTransaction, loading: deletingTransaction } = useMutation(
    (id: string) => apiService.deleteTransaction(id)
  )

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [internalTypeFilter, setInternalTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date>()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editForm, setEditForm] = useState<EditFormState | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    refetch().catch(() => {
      // Error state already handled in useApi
    })
  }, [fetchTransactions, refetch])

  useEffect(() => {
    if (transactionsData?.transactions) {
      setTransactions(transactionsData.transactions)
    }
  }, [transactionsData])

  const categories = categoriesData?.categories || []

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: String(category.id),
        name: category.name,
      })),
    [categories]
  )

  const filterCategories = useMemo(
    () =>
      Array.from(
        new Set(
          transactions
            .map((transaction) => transaction.category?.name)
            .filter((value): value is string => Boolean(value))
        )
      ),
    [transactions]
  )

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditForm({
      description: transaction.description,
      amount: String(transaction.amount),
      categoryId: String(transaction.category_id),
      type: normalizeTransactionType(transaction.type),
      date: transaction.date,
      notes: transaction.notes || "",
    })
    setIsEditDialogOpen(true)
  }, [])

  const closeEditDialog = useCallback(() => {
    setEditingTransaction(null)
    setEditForm(null)
    setIsEditDialogOpen(false)
  }, [])

  const handleUpdateTransaction = useCallback(async () => {
    if (!editingTransaction || !editForm) {
      return
    }

    const payload: Partial<TransactionCreateRequest> = {
      description: editForm.description,
      amount: Number.parseFloat(editForm.amount),
      category_id: Number.parseInt(editForm.categoryId, 10),
      type: editForm.type,
      date: editForm.date,
      notes: editForm.notes || undefined,
    }

    const updatedTransaction = await updateTransaction({
      id: editingTransaction.id,
      data: payload,
    })

    setTransactions((prev) =>
      prev.map((transaction) => (transaction.id === updatedTransaction.id ? updatedTransaction : transaction))
    )
    closeEditDialog()
  }, [closeEditDialog, editForm, editingTransaction, updateTransaction])

  const handleDeleteTransaction = useCallback(
    async (transactionId: string) => {
      await deleteTransaction(transactionId)
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== transactionId))
    },
    [deleteTransaction]
  )

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || transaction.category?.name === categoryFilter

    const effectiveTypeFilter = typeFilter !== "all" ? typeFilter : internalTypeFilter
    const matchesType =
      effectiveTypeFilter === "all" ||
      normalizeTransactionType(transaction.type) === effectiveTypeFilter.toLowerCase()

    const matchesDate = !dateFilter || transaction.date === format(dateFilter, "yyyy-MM-dd")

    return matchesSearch && matchesCategory && matchesType && matchesDate
  })

  const displayTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">{showAll ? t.allTransactions : t.recentTransactions}</CardTitle>
        <CardDescription>{showAll ? t.allYourTransactions : t.latestActivities}</CardDescription>

        {showAll && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="relative min-w-full flex-1 sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder={t.searchTransactions}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Input
                type="date"
                value={dateFilter ? format(dateFilter, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (!value) {
                    setDateFilter(undefined)
                    return
                  }

                  const [year, month, day] = value.split("-").map(Number)
                  setDateFilter(new Date(year, month - 1, day))
                }}
                className="w-full bg-transparent sm:min-w-[140px]"
              />

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allCategories}</SelectItem>
                  {filterCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {typeFilter === "all" && (
                <Select value={internalTypeFilter} onValueChange={setInternalTypeFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder={t.type} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allTypes}</SelectItem>
                    <SelectItem value="expense">{t.saida}</SelectItem>
                    <SelectItem value="income">{t.entrada}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {displayTransactions.map((transaction) => {
            const isExpense = normalizeTransactionType(transaction.type) === "expense"

            return (
              <div
                key={transaction.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()} •{" "}
                    {transaction.category?.name || t.uncategorized}
                  </p>
                  {transaction.notes && (
                    <p className="mt-1 line-clamp-2 text-xs italic text-muted-foreground">
                      {t.notes}: {transaction.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className={`text-base font-semibold sm:text-lg ${isExpense ? "text-destructive" : "text-green-600"}`}>
                      {isExpense ? "-" : "+"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant={isExpense ? "destructive" : "default"} className="mt-1 text-xs">
                      {isExpense ? t.saida : t.entrada}
                    </Badge>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t.edit}
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t.delete}
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t.deleteTransaction}</AlertDialogTitle>
                            <AlertDialogDescription>{t.deleteTransactionDesc}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingTransaction ? t.deleting : t.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}

          {displayTransactions.length === 0 && showAll && (
            <div className="py-8 text-center text-muted-foreground">{t.noTransactions}</div>
          )}
        </div>

        {!showAll && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={onViewAllClick}>
              {t.viewAllTransactions}
            </Button>
          </div>
        )}
      </CardContent>

      {editingTransaction && editForm && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => (!open ? closeEditDialog() : setIsEditDialogOpen(true))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.editTransaction}</DialogTitle>
              <DialogDescription>{t.editTransactionDesc}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-description">
                    {t.description} {t.required}
                  </Label>
                  <Input
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">
                    {t.amount} {t.required}
                  </Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => setEditForm((prev) => (prev ? { ...prev, amount: e.target.value } : prev))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t.category} {t.required}
                  </Label>
                  <Select
                    value={editForm.categoryId}
                    onValueChange={(value) => setEditForm((prev) => (prev ? { ...prev, categoryId: value } : prev))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.category} />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {t.type} {t.required}
                  </Label>
                  <Select
                    value={editForm.type}
                    onValueChange={(value) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, type: value as "income" | "expense" } : prev
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.type} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">{t.entrada}</SelectItem>
                      <SelectItem value="expense">{t.saida}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-date">
                  {t.date} {t.required}
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, date: e.target.value } : prev))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">{t.notes}</Label>
                <Textarea
                  id="edit-notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, notes: e.target.value } : prev))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeEditDialog}>
                  {t.cancel}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleUpdateTransaction()}
                  disabled={
                    updatingTransaction ||
                    !editForm.description.trim() ||
                    !editForm.amount.trim() ||
                    !editForm.categoryId ||
                    !editForm.date
                  }
                >
                  {updatingTransaction ? t.saving : t.update}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
