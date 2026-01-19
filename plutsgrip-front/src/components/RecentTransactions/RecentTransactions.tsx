import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { MoreHorizontal, Edit, Trash2, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/DropdownMenu"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover" // Unused
// import { Calendar } from "@/components/Calendar" // Unused
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
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { useApi } from "@/hooks/useApi"
import { apiService, type Transaction } from "@/services/api"



// Mock transactions removed - now fetching from API

const translations = {
  en: {
    recentTransactions: "Recent Transactions",
    allTransactions: "All Transactions",
    latestActivities: "Your latest financial activities",
    allYourTransactions: "All your transactions",
    searchTransactions: "Search transactions...",
    allCategories: "All Categories",
    allTypes: "All Types",
    expense: "Expense",
    income: "Income",
    entrada: "Income",
    saida: "Expense",
    edit: "Edit",
    delete: "Delete",
    noTransactions: "No transactions found matching your filters.",
    viewAllTransactions: "View All Transactions",
    notes: "Notes",
    selectDate: "Select date",
    dateFilter: "Date Filter",
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
    expense: "Saída",
    income: "Entrada",
    entrada: "Entrada",
    saida: "Saída",
    edit: "Editar",
    delete: "Excluir",
    noTransactions: "Nenhuma transação encontrada com os filtros aplicados.",
    viewAllTransactions: "Ver Todas as Transações",
    notes: "Observações",
    selectDate: "Selecionar data",
    dateFilter: "Filtro de Data",
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

export function RecentTransactions({
  showAll = false,
  onViewAllClick,
  typeFilter = "all",
  language,
  refreshKey = 0,
}: RecentTransactionsProps) {
  // Busca transações da API
  const fetchTransactions = useCallback(
    () => apiService.listTransactions(1, showAll ? 100 : 5, typeFilter !== "all" ? typeFilter : undefined),
    [showAll, typeFilter, refreshKey]
  )

  const fetchCategories = useCallback(() => apiService.listCategories(), [])

  const { data: transactionsData, refetch } = useApi(
    fetchTransactions,
    true // fetch immediately
  )

  useEffect(() => {
    refetch()
  }, [fetchTransactions, refetch])

  const { data: categoriesData } = useApi(fetchCategories, true)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [internalTypeFilter, setInternalTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date>()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Atualiza transactions quando dados da API chegam
  useEffect(() => {
    if (transactionsData?.transactions) {
      setTransactions(transactionsData.transactions)
    }
  }, [transactionsData])

  // Atualiza categorias quando dados da API chegam
  useEffect(() => {
    if (categoriesData?.categories) {
      setAllCategories(categoriesData.categories.map((c: any) => c.name))
    }
  }, [categoriesData])

  const t = translations[language as keyof typeof translations]

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsEditDialogOpen(true)
  }, [])

  const handleUpdateTransaction = useCallback((updatedTransaction: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)))
    setEditingTransaction(null)
    setIsEditDialogOpen(false)
  }, [])

  const handleDeleteTransaction = useCallback((transactionId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId))
  }, [])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || transaction.category?.name === categoryFilter

    const effectiveTypeFilter = typeFilter !== "all" ? typeFilter : internalTypeFilter
    // Case insensitive check for type
    const matchesType = effectiveTypeFilter === "all" || transaction.type?.toLowerCase() === effectiveTypeFilter.toLowerCase()

    const matchesDate = !dateFilter || transaction.date === format(dateFilter, "yyyy-MM-dd")

    return matchesSearch && matchesCategory && matchesType && matchesDate
  })

  const displayTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5)
  // Use all categories for filter if available, otherwise fallback to existing logic or keep separate
  // The original code used categories from visible transactions for the filter dropdown.
  // We can keep that or use allCategories for the filter too. Let's stick to unique categories from transactions for the FILTER (common pattern),
  // but use ALL categories for the EDIT modal.
  const filterCategories = Array.from(new Set(transactions.map((t) => t.category?.name).filter(Boolean))) as string[]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">{showAll ? t.allTransactions : t.recentTransactions}</CardTitle>
        <CardDescription>{showAll ? t.allYourTransactions : t.latestActivities}</CardDescription>

        {showAll && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
            <div className="relative flex-1 min-w-full sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchTransactions}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Input
                type="date"
                value={dateFilter ? format(dateFilter, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    const [year, month, day] = value.split("-").map(Number)
                    setDateFilter(new Date(year, month - 1, day))
                  } else {
                    setDateFilter(undefined)
                  }
                }}
                className="w-full sm:w-auto sm:min-w-[140px] bg-transparent"
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
            const isExpense = transaction.type?.toLowerCase() === "expense"
            return (
              <div
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.category?.name || "Uncategorized"}
                      </p>
                      {transaction.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                          {t.notes}: {transaction.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-left sm:text-right">
                    <p
                      className={`font-semibold text-base sm:text-lg ${isExpense ? "text-destructive" : "text-green-600"
                        }`}
                    >
                      {isExpense ? "-" : "+"}${transaction.amount.toFixed(2)}
                    </p>
                    <Badge variant={isExpense ? "destructive" : "default"} className="text-xs mt-1">
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
                              {t.delete}
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
            <div className="text-center py-8 text-muted-foreground">{t.noTransactions}</div>
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

      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.editTransaction}</DialogTitle>
              <DialogDescription>{t.editTransactionDesc}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const updatedTransaction: Transaction = {
                  ...editingTransaction,
                  description: formData.get("description") as string,
                  amount: Number.parseFloat(formData.get("amount") as string),
                  category: {
                    ...editingTransaction.category!,
                    name: formData.get("category") as string
                  },
                  type: formData.get("type") as "income" | "expense",
                  notes: formData.get("notes") as string,
                }
                handleUpdateTransaction(updatedTransaction)
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {t.description} {t.required}
                  </Label>
                  <Input id="description" name="description" defaultValue={editingTransaction.description} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {t.amount} {t.required}
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={editingTransaction.amount}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    {t.category} {t.required}
                  </Label>
                  {/* Using allCategories for the edit modal options */}
                  <Select name="category" defaultValue={editingTransaction.category?.name} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(allCategories.length > 0 ? allCategories : filterCategories).map((categoryName) => (
                        <SelectItem key={categoryName} value={categoryName}>
                          {categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">
                    {t.type} {t.required}
                  </Label>
                  {/* Normalized type for default value */}
                  <Select name="type" defaultValue={editingTransaction.type?.toLowerCase()} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">{t.entrada}</SelectItem>
                      <SelectItem value="expense">{t.saida}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea id="notes" name="notes" defaultValue={editingTransaction.notes || ""} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button type="submit">{t.update}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
