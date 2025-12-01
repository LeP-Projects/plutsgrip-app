import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { CalendarIcon, PlusCircle, AlertCircle } from "lucide-react"
import { Calendar } from "@/components/Calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover"
import { format } from "date-fns"
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
    type: "Type",
    selectType: "Select transaction type",
    income: "Income",
    expense: "Expense",
    entrada: "Income",
    saida: "Expense",
    notes: "Notes (Optional)",
    notesPlaceholder: "Additional details about this transaction...",
    addTransaction: "Add Transaction",
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
    type: "Tipo",
    selectType: "Selecionar tipo de transação",
    income: "Entrada",
    expense: "Saída",
    entrada: "Entrada",
    saida: "Saída",
    notes: "Observações (Opcional)",
    notesPlaceholder: "Detalhes adicionais sobre esta transação...",
    addTransaction: "Adicionar Transação",
    required: "*",
  },
}

interface ExpenseFormProps {
  language: string
  defaultType?: "income" | "expense"
}

export function ExpenseForm({ language, defaultType }: ExpenseFormProps) {
  const [date, setDate] = useState<Date>()
  const { currency } = useCurrency()

  // Busca categorias da API
  const { data: categoriesData, loading: categoriesLoading } = useApi(
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

  const t = translations[language as keyof typeof translations]

  const validateForm = () => {
    const newErrors = {
      description: !formData.description.trim(),
      amount: !formData.amount.trim(),
      date: !date,
      category: !formData.category,
      type: !defaultType && !formData.type,
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
        category_id: parseInt(formData.category, 10),
        type: (formData.type || defaultType) as "income" | "expense",
        date: format(date!, "yyyy-MM-dd"),
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
      setDate(undefined)
      setErrors({
        description: false,
        amount: false,
        date: false,
        category: false,
        type: false,
      })

      // Show success message (você pode adicionar um toast aqui)
      console.log("Transação criada com sucesso!")
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent",
                      errors.date && "border-red-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : t.pickDate}
                    {errors.date && <AlertCircle className="ml-auto h-4 w-4 text-red-500" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate)
                      if (errors.date) {
                        setErrors((prev) => ({ ...prev, date: false }))
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm text-red-500">Este campo é obrigatório</p>}
            </div>

            <div className="space-y-2">
              <Label>
                {t.category} {t.required}
              </Label>
              <div className="relative">
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, category: value }))
                    if (errors.category) {
                      setErrors((prev) => ({ ...prev, category: false }))
                    }
                  }}
                  required
                >
                  <SelectTrigger className={cn(errors.category && "border-red-500")}>
                    <SelectValue placeholder={t.selectCategory} />
                    {errors.category && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.category && <p className="text-sm text-red-500">Este campo é obrigatório</p>}
            </div>
          </div>

          {!defaultType && (
            <div className="space-y-2">
              <Label>
                {t.type} {t.required}
              </Label>
              <div className="relative">
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, type: value }))
                    if (errors.type) {
                      setErrors((prev) => ({ ...prev, type: false }))
                    }
                  }}
                  required
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

          <Button type="submit" className="w-full" disabled={creatingTransaction || categoriesLoading}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {creatingTransaction ? "Criando..." : t.addTransaction}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
