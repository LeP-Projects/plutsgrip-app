import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { Filter, RotateCcw, Download, FileText, FileSpreadsheet } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover"
import { Calendar } from "@/components/Calendar"
import { ExpenseChart } from "@/components/ExpenseChart"
import { IncomeChart } from "@/components/IncomeChart"
import { CategoryChart } from "@/components/CategoryChart"
import { ColumnChart } from "@/components/ColumnChart"
import { generatePDFReport, generateExcelReport } from "@/utils/export-utils"
import { useState } from "react"
import { format } from "date-fns"

const translations = {
  en: {
    reports: "Reports",
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
    selectEndDate: "Select end date",
    startDate: "Start Date",
    endDate: "End Date",
    applyDateRange: "Apply Date Range",
    clearDateRange: "Clear Date Range",
    exportSuccess: "Report exported successfully!",
  },
  pt: {
    reports: "Relatórios",
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
    selectEndDate: "Selecionar data final",
    startDate: "Data Inicial",
    endDate: "Data Final",
    applyDateRange: "Aplicar Período",
    clearDateRange: "Limpar Período",
    exportSuccess: "Relatório exportado com sucesso!",
  },
}

interface ReportsSectionProps {
  language: string
}

interface ReportFilters {
  timeRange: string
  category: string
  type: string
  startDate?: Date
  endDate?: Date
}

export function ReportsSection({ language }: ReportsSectionProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    timeRange: "thisMonth",
    category: "all",
    type: "all",
  })
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const t = translations[language as keyof typeof translations]

  const handleFilterChange = (filterType: keyof ReportFilters, value: string) => {
    const newFilters = { ...filters, [filterType]: value }

    // Clear custom date range if switching away from custom
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
      generatePDFReport(filters, language)
      console.log("PDF export completed")
    } catch (error) {
      console.error("PDF export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      generateExcelReport(filters, language)
      console.log("Excel export completed")
    } catch (error) {
      console.error("Excel export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">{t.financialReports}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t.viewAnalytics}</p>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-serif flex items-center gap-2">
            <Filter className="h-4 sm:h-5 w-4 sm:w-5" />
            {t.reportFilters}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {/* First row - Time Range and Custom Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Time Range Filter */}
              <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange("timeRange", value)}>
                <SelectTrigger>
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
                  <SelectItem value="custom">{t.custom}</SelectItem>
                </SelectContent>
              </Select>

              {/* Custom Date Range */}
              {filters.timeRange === "custom" && (
                <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start bg-transparent">
                      <Calendar className="h-4 w-4 mr-2" />
                      {startDate && endDate
                        ? `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`
                        : t.selectStartDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t.startDate}</label>
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t.endDate}</label>
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
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

            {/* Second row - Category, Type, and Reset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Category Filter */}
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
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

              {/* Type Filter */}
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

              {/* Reset Button */}
              <Button variant="outline" onClick={resetFilters} className="bg-transparent h-10 sm:h-9 sm:col-span-2 lg:col-span-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t.reset}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-serif flex items-center gap-2">
            <Download className="h-4 sm:h-5 w-4 sm:w-5" />
            {t.exportOptions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button onClick={handleExportPDF} disabled={isExporting} className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
              <FileText className="h-4 w-4 mr-2" />
              {isExporting ? "Generating..." : t.generatePDF}
            </Button>
            <Button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {isExporting ? "Generating..." : t.generateExcel}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-4 sm:gap-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          <ExpenseChart language={language} filters={filters} />
          <IncomeChart language={language} filters={filters} />
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          <CategoryChart language={language} filters={filters} />
          <ColumnChart language={language} filters={filters} />
        </div>
      </div>
    </div>
  )
}
