import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/Badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { PlusCircle, AlertCircle, ArrowDownRight, ArrowUpRight } from "lucide-react"
// import { Calendar } from "@/components/Calendar" // Unused now
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover" // Unused now
import { parseISO } from "date-fns"
import { useCurrency } from "@/contexts/CurrencyContext"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { useMutation } from "@/hooks/useApi"
import { apiService, type TransactionCreateRequest } from "@/services/api"

const translations = {
  en: {
    addNewTransaction: "Add New Transaction",
    recordTransaction: "Record a new financial transaction",
    description: "Description",
    descriptionPlaceholder: "e.g., Grocery shopping",
    amount: "Amount",
    date: "Date",
    pickDate: "Pick a date",
    category: "Category",
    selectCategory: "Select a category",
    noCategory: "No category",
    categoryOptional: "Optional. If you choose one, the type follows the category.",
    type: "Type",
    selectType: "Select transaction type",
    income: "Income",
    expense: "Expense",
    entrada: "Income",
    saida: "Expense",
    notes: "Notes (Optional)",
    notesPlaceholder: "Additional details about this transaction...",
    addTransaction: "Add Transaction",
    categoryTypeApplied: "Type defined by category",
    chooseTypeWithoutCategory: "Without a category, choose the type manually.",
    required: "*",
  },
  pt: {
    addNewTransaction: "Adicionar Nova Transação",
    recordTransaction: "Registrar uma nova transação financeira",
    description: "Descrição",
    descriptionPlaceholder: "ex: Compras no supermercado",
    amount: "Valor",
    date: "Data",
    pickDate: "Escolher data",
    category: "Categoria",
    selectCategory: "Selecionar categoria",
    noCategory: "Sem categoria",
    categoryOptional: "Opcional. Se escolher uma, o tipo segue a categoria.",
    type: "Tipo",
    selectType: "Selecionar tipo de transação",
    income: "Entrada",
    expense: "Saída",
    entrada: "Entrada",
    saida: "Saída",
    notes: "Observações (Opcional)",
    notesPlaceholder: "Detalhes adicionais sobre esta transação...",
    addTransaction: "Adicionar Transação",
    categoryTypeApplied: "Tipo definido pela categoria",
    chooseTypeWithoutCategory: "Sem categoria, escolha o tipo manualmente.",
    required: "*",
  },
}

interface ExpenseFormProps {
  language: string
  defaultType?: "income" | "expense"
  onTransactionCreated?: () => void
}

export function ExpenseForm({ language, defaultType, onTransactionCreated }: ExpenseFormProps) {
  const [date, setDate] = useState("")
  const { currency } = useCurrency()

  // Busca categorias da API
  const { data: categoriesData } = useApi(
    () => apiService.listCategories(),
    true // fetch immediately
  )

  // Mutation para criar transação
  const { execute: createTransaction, loading: creatingTransaction } = useMutation(
    (data: TransactionCreateRequest) => apiService.createTransaction(data)
  )

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    type: defaultType || "",
    notes: "",
  })

  const [errors, setErrors] = useState({
    description: false,
    amount: false,
    date: false,
    category: false,
    type: false,
  })

  // Usa categorias da API ou lista vazia
  const categories = categoriesData?.categories || []
  const selectedCategory = categories.find((category) => String(category.id) === formData.category)
  const effectiveType = selectedCategory?.type || formData.type || defaultType || ""

  const t = translations[language as keyof typeof translations]

  const validateForm = () => {
    const newErrors = {
      description: !formData.description.trim(),
      amount: !formData.amount.trim(),
      date: !date,
      category: false,
      type: !selectedCategory && !defaultType && !formData.type,
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const transactionData: TransactionCreateRequest = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category_id: formData.category ? parseInt(formData.category, 10) : undefined,
        type: (effectiveType || defaultType) as "income" | "expense",
        date,
        notes: formData.notes || undefined,
      }

      await createTransaction(transactionData)

      // Reset form after successful creation
      setFormData({
        description: "",
        amount: "",
        category: "",
        type: defaultType || "",
        notes: "",
      })
      setDate("")
      setErrors({
        description: false,
        amount: false,
        date: false,
        category: false,
        type: false,
      })

      // Show success message (você pode adicionar um toast aqui)
      console.log("Transação criada com sucesso!")

      // Notify parent component to refresh transactions list
      onTransactionCreated?.()
    } catch (error) {
      console.error("Erro ao criar transação:", error)
      // Show error message (você pode adicionar um toast aqui)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">{t.addNewTransaction}</CardTitle>
        <CardDescription>{t.recordTransaction}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                {t.description} {t.required}
              </Label>
              <div className="relative">
                <Input
                  id="description"
                  placeholder={t.descriptionPlaceholder}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: false }))
                    }
                  }}
                  className={cn(errors.description && "border-red-500 focus-visible:ring-red-500")}
                  required
                />
                {errors.description && <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />}
              </div>
              {errors.description && <p className="text-sm text-red-500">Este campo é obrigatório</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                {t.amount} ({currency}) {t.required}
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                    if (errors.amount) {
                      setErrors((prev) => ({ ...prev, amount: false }))
                    }
                  }}
                  className={cn(errors.amount && "border-red-500 focus-visible:ring-red-500")}
                  required
                />
                {errors.amount && <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />}
              </div>
              {errors.amount && <p className="text-sm text-red-500">Este campo é obrigatório</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t.date} {t.required}
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      setDate("");
                      return;
                    }
                    setDate(parseISO(value).toISOString().slice(0, 10));

                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: false }));
                    }
                  }}
                  className={cn(errors.date && "border-red-500 focus-visible:ring-red-500")}
                />
              </div>
              {errors.date && <p className="text-sm text-red-500">Este campo é obrigatório</p>}
            </div>

            <div className="space-y-2">
              <Label>
                {t.category}
              </Label>
              <div className="relative">
                <Select
                  value={formData.category || "none"}
                  onValueChange={(value) => {
                    const nextCategoryId = value === "none" ? "" : value
                    const nextCategory = categories.find((category) => String(category.id) === nextCategoryId)

                    setFormData((prev) => ({
                      ...prev,
                      category: nextCategoryId,
                      type: nextCategory?.type || prev.type,
                    }))
                    if (errors.category) {
                      setErrors((prev) => ({ ...prev, category: false }))
                    }
                    if (errors.type && nextCategory) {
                      setErrors((prev) => ({ ...prev, type: false }))
                    }
                  }}
                >
                  <SelectTrigger className={cn(errors.category && "border-red-500")}>
                    <SelectValue placeholder={t.selectCategory} />
                    {errors.category && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.noCategory}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        <div className="flex items-center gap-2">
                          {category.type === "income" ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />
                          )}
                          <span>{category.name}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-1 border-current/20 text-[10px]",
                              category.type === "income" ? "text-emerald-700" : "text-rose-700"
                            )}
                          >
                            {category.type === "income" ? t.entrada : t.saida}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">{t.categoryOptional}</p>
            </div>
          </div>

          {defaultType && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {effectiveType === "income" ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              ) : effectiveType === "expense" ? (
                <ArrowDownRight className="h-4 w-4 text-rose-600" />
              ) : null}
              <span>{selectedCategory ? t.categoryTypeApplied : t.chooseTypeWithoutCategory}</span>
              {effectiveType && (
                <Badge
                  variant="outline"
                  className={cn(
                    effectiveType === "income" ? "text-emerald-700" : "text-rose-700"
                  )}
                >
                  {effectiveType === "income" ? t.entrada : t.saida}
                </Badge>
              )}
            </div>
          )}

          {!defaultType && (
            <div className="space-y-2">
              <Label>
                {t.type} {t.required}
              </Label>
              <div className="relative">
                <Select
                  value={effectiveType}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, type: value }))
                    if (errors.type) {
                      setErrors((prev) => ({ ...prev, type: false }))
                    }
                  }}
                  disabled={Boolean(selectedCategory)}
                >
                  <SelectTrigger className={cn(errors.type && "border-red-500")}>
                    <SelectValue placeholder={t.selectType} />
                    {errors.type && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t.entrada}</SelectItem>
                    <SelectItem value="expense">{t.saida}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {effectiveType === "income" ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                ) : effectiveType === "expense" ? (
                  <ArrowDownRight className="h-4 w-4 text-rose-600" />
                ) : null}
                <span>{selectedCategory ? t.categoryTypeApplied : t.chooseTypeWithoutCategory}</span>
                {effectiveType && (
                  <Badge
                    variant="outline"
                    className={cn(
                      effectiveType === "income" ? "text-emerald-700" : "text-rose-700"
                    )}
                  >
                    {effectiveType === "income" ? t.entrada : t.saida}
                  </Badge>
                )}
              </div>
              {errors.type && <p className="text-sm text-red-500">Este campo é obrigatório</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">{t.notes}</Label>
            <Textarea
              id="notes"
              placeholder={t.notesPlaceholder}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={creatingTransaction}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {creatingTransaction ? "Criando..." : t.addTransaction}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
