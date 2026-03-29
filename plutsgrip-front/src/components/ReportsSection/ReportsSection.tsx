import { useCallback, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Download, FileSpreadsheet, FileText, Filter, RotateCcw } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover"
import { Calendar } from "@/components/Calendar"
import { CategoryChart } from "@/components/CategoryChart"
import { ColumnChart } from "@/components/ColumnChart"
import { useApi } from "@/hooks/useApi"
import { apiService } from "@/services/api"
import { generateExcelReport, generatePDFReport } from "@/utils/export-utils"
import { resolveDateRange, type ReportFilterState } from "@/utils/report-filters"

const translations = {
  en: {
    financialReports: "Financial Reports & Analytics",
    viewAnalytics: "View detailed analytics and generate reports",
    reportFilters: "Report Filters",
    timeRange: "Time Range",
    thisWeek: "This Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    thisQuarter: "This Quarter",
    thisYear: "This Year",
    lastYear: "Last Year",
    custom: "Custom Range",
    category: "Category",
    allCategories: "All Categories",
    type: "Type",
    allTypes: "All Types",
    expensesOnly: "Expenses Only",
    incomeOnly: "Income Only",
    reset: "Reset Filters",
    exportOptions: "Export Options",
    generatePDF: "Generate PDF Report",
    generateExcel: "Generate Excel Report",
    selectStartDate: "Select start date",
    startDate: "Start Date",
    endDate: "End Date",
    applyDateRange: "Apply Date Range",
    clearDateRange: "Clear Date Range",
    generating: "Generating...",
  },
  pt: {
    financialReports: "Relatórios Financeiros e Análises",
    viewAnalytics: "Visualize análises detalhadas e gere relatórios",
    reportFilters: "Filtros de Relatório",
    timeRange: "Período",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mês",
    lastMonth: "Mês Passado",
    thisQuarter: "Este Trimestre",
    thisYear: "Este Ano",
    lastYear: "Ano Passado",
    custom: "Período Personalizado",
    category: "Categoria",
    allCategories: "Todas as Categorias",
    type: "Tipo",
    allTypes: "Todos os Tipos",
    expensesOnly: "Apenas Saídas",
    incomeOnly: "Apenas Entradas",
    reset: "Limpar Filtros",
    exportOptions: "Opções de Exportação",
    generatePDF: "Gerar Relatório PDF",
    generateExcel: "Gerar Relatório Excel",
    selectStartDate: "Selecionar data inicial",
    startDate: "Data Inicial",
    endDate: "Data Final",
    applyDateRange: "Aplicar Período",
    clearDateRange: "Limpar Período",
    generating: "Gerando...",
  },
}

interface ReportsSectionProps {
  language: string
}

export function ReportsSection({ language }: ReportsSectionProps) {
  const [filters, setFilters] = useState<ReportFilterState>({
    timeRange: "thisMonth",
    category: "all",
    type: "all",
  })
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const t = translations[language as keyof typeof translations]
  const { startDate: resolvedStartDate, endDate: resolvedEndDate } = resolveDateRange(filters)

  const { data: categoriesData } = useApi(() => apiService.listCategories(), true)

  const fetchTransactions = useCallback(
    () =>
      apiService.listTransactions(
        1,
        500,
        filters.type !== "all" ? (filters.type as "income" | "expense") : undefined,
        filters.category !== "all"
          ? categoriesData?.categories.find((category) => category.name === filters.category)?.id
          : undefined,
        resolvedStartDate,
        resolvedEndDate
      ),
    [categoriesData?.categories, filters.category, filters.type, resolvedEndDate, resolvedStartDate]
  )

  const { data: transactionsData, refetch: refetchTransactions } = useApi(fetchTransactions, true)

  useEffect(() => {
    refetchTransactions().catch(() => {
      // Hook already stores the error state
    })
  }, [fetchTransactions, refetchTransactions])

  const categoryNames = useMemo(
    () => (categoriesData?.categories || []).map((category) => category.name),
    [categoriesData?.categories]
  )

  const handleFilterChange = (filterType: keyof ReportFilterState, value: string) => {
    const newFilters = { ...filters, [filterType]: value }

    if (filterType === "timeRange" && value !== "custom") {
      setStartDate(undefined)
      setEndDate(undefined)
      newFilters.startDate = undefined
      newFilters.endDate = undefined
    }

    setFilters(newFilters)
  }

  const handleDateRangeApply = () => {
    setFilters({
      ...filters,
      timeRange: "custom",
      startDate,
      endDate,
    })
    setIsDateRangeOpen(false)
  }

  const resetFilters = () => {
    setFilters({
      timeRange: "thisMonth",
      category: "all",
      type: "all",
    })
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      generatePDFReport(filters, language, transactionsData?.transactions || [])
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      generateExcelReport(filters, language, transactionsData?.transactions || [])
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground sm:text-3xl">{t.financialReports}</h2>
          <p className="text-sm text-muted-foreground sm:text-base">{t.viewAnalytics}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-serif sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.reportFilters}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange("timeRange", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.timeRange} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisWeek">{t.thisWeek}</SelectItem>
                  <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                  <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
                  <SelectItem value="thisQuarter">{t.thisQuarter}</SelectItem>
                  <SelectItem value="thisYear">{t.thisYear}</SelectItem>
                  <SelectItem value="lastYear">{t.lastYear}</SelectItem>
                  <SelectItem value="custom">{t.custom}</SelectItem>
                </SelectContent>
              </Select>

              {filters.timeRange === "custom" && (
                <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="max-w-3xs justify-center justify-self-end bg-transparent">
                      {startDate && endDate
                        ? `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`
                        : t.selectStartDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t.startDate}</label>
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          className="[--cell-size:2.75rem] p-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t.endDate}</label>
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          className="[--cell-size:2.75rem] p-3"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleDateRangeApply} disabled={!startDate || !endDate}>
                          {t.applyDateRange}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setStartDate(undefined)
                            setEndDate(undefined)
                            setIsDateRangeOpen(false)
                          }}
                        >
                          {t.clearDateRange}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger className="h-10 sm:h-9">
                  <SelectValue placeholder={t.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allCategories}</SelectItem>
                  {categoryNames.map((categoryName) => (
                    <SelectItem key={categoryName} value={categoryName}>
                      {categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger className="h-10 sm:h-9">
                  <SelectValue placeholder={t.type} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allTypes}</SelectItem>
                  <SelectItem value="expense">{t.expensesOnly}</SelectItem>
                  <SelectItem value="income">{t.incomeOnly}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={resetFilters}
                className="h-10 bg-transparent sm:col-span-2 sm:h-9 lg:col-span-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t.reset}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-serif sm:text-lg">
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.exportOptions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button onClick={handleExportPDF} disabled={isExporting} className="w-full bg-red-600 text-white hover:bg-red-700 sm:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              {isExporting ? t.generating : t.generatePDF}
            </Button>
            <Button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {isExporting ? t.generating : t.generateExcel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <CategoryChart language={language} filters={filters} />
        <ColumnChart language={language} filters={filters} />
      </div>
    </div>
  )
}
