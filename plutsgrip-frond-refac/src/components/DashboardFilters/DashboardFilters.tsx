import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { Button } from "@/components/Button"
import { Calendar, Filter, RotateCcw } from "lucide-react"
import { useState } from "react"

const translations = {
  en: {
    dashboardFilters: "Dashboard Filters",
    timeRange: "Time Range",
    thisWeek: "This Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    thisQuarter: "This Quarter",
    thisYear: "This Year",
    lastYear: "Last Year",
    category: "Category",
    allCategories: "All Categories",
    type: "Type",
    allTypes: "All Types",
    expensesOnly: "Expenses Only",
    incomeOnly: "Income Only",
    reset: "Reset",
  },
  pt: {
    dashboardFilters: "Filtros do Dashboard",
    timeRange: "Período",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mês",
    lastMonth: "Mês Passado",
    thisQuarter: "Este Trimestre",
    thisYear: "Este Ano",
    lastYear: "Ano Passado",
    category: "Categoria",
    allCategories: "Todas as Categorias",
    type: "Tipo",
    allTypes: "Todos os Tipos",
    expensesOnly: "Apenas Saídas",
    incomeOnly: "Apenas Entradas",
    reset: "Limpar",
  },
}

interface DashboardFiltersProps {
  onFiltersChange?: (filters: {
    timeRange: string
    category: string
    type: string
  }) => void
  language: string
}

export function DashboardFilters({ onFiltersChange, language }: DashboardFiltersProps) {
  const [timeRange, setTimeRange] = useState("thisMonth")
  const [category, setCategory] = useState("all")
  const [type, setType] = useState("all")

  const t = translations[language as keyof typeof translations]

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { timeRange, category, type }

    switch (filterType) {
      case "timeRange":
        setTimeRange(value)
        newFilters.timeRange = value
        break
      case "category":
        setCategory(value)
        newFilters.category = value
        break
      case "type":
        setType(value)
        newFilters.type = value
        break
    }

    onFiltersChange?.(newFilters)
  }

  const resetFilters = () => {
    setTimeRange("thisMonth")
    setCategory("all")
    setType("all")
    onFiltersChange?.({ timeRange: "thisMonth", category: "all", type: "all" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t.dashboardFilters}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Select value={timeRange} onValueChange={(value) => handleFilterChange("timeRange", value)}>
            <SelectTrigger className="h-10 sm:h-9">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t.timeRange} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">{t.thisWeek}</SelectItem>
              <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
              <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
              <SelectItem value="thisQuarter">{t.thisQuarter}</SelectItem>
              <SelectItem value="thisYear">{t.thisYear}</SelectItem>
              <SelectItem value="lastYear">{t.lastYear}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={(value) => handleFilterChange("category", value)}>
            <SelectTrigger className="h-10 sm:h-9">
              <SelectValue placeholder={t.category} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allCategories}</SelectItem>
              <SelectItem value="Food & Dining">Food & Dining</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Bills">Bills</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={(value) => handleFilterChange("type", value)}>
            <SelectTrigger className="h-10 sm:h-9">
              <SelectValue placeholder={t.type} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allTypes}</SelectItem>
              <SelectItem value="expense">{t.expensesOnly}</SelectItem>
              <SelectItem value="income">{t.incomeOnly}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={resetFilters} className="w-full bg-transparent h-10 sm:h-9">
            <RotateCcw className="h-4 w-4 mr-2" />
            {t.reset}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
