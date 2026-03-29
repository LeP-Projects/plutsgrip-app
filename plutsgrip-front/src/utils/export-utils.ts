import { format } from "date-fns"

import type { Transaction } from "@/services/api"
import type { ReportFilterState } from "@/utils/report-filters"

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

const translations = {
  en: {
    financialReport: "Financial Report",
    generatedOn: "Generated on",
    filters: "Filters",
    category: "Category",
    type: "Type",
    allCategories: "All Categories",
    allTypes: "All Types",
    expensesOnly: "Expenses Only",
    incomeOnly: "Income Only",
    summary: "Summary",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    netIncome: "Net Income",
    transactionDetails: "Transaction Details",
    date: "Date",
    description: "Description",
    amount: "Amount",
    notes: "Notes",
    income: "Income",
    expense: "Expense",
    thisWeek: "This Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    thisQuarter: "This Quarter",
    thisYear: "This Year",
    lastYear: "Last Year",
    custom: "Custom Range",
    uncategorized: "Uncategorized",
  },
  pt: {
    financialReport: "Relatório Financeiro",
    generatedOn: "Gerado em",
    filters: "Filtros",
    category: "Categoria",
    type: "Tipo",
    allCategories: "Todas as Categorias",
    allTypes: "Todos os Tipos",
    expensesOnly: "Apenas Saídas",
    incomeOnly: "Apenas Entradas",
    summary: "Resumo",
    totalIncome: "Total de Entradas",
    totalExpenses: "Total de Saídas",
    netIncome: "Receita Líquida",
    transactionDetails: "Detalhes das Transações",
    date: "Data",
    description: "Descrição",
    amount: "Valor",
    notes: "Observações",
    income: "Entrada",
    expense: "Saída",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mês",
    lastMonth: "Mês Passado",
    thisQuarter: "Este Trimestre",
    thisYear: "Este Ano",
    lastYear: "Ano Passado",
    custom: "Período Personalizado",
    uncategorized: "Sem categoria",
  },
}

function calculateSummary(transactions: Transaction[]) {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    netIncome: totalIncome - totalExpenses,
  }
}

function resolveTimeRangeLabel(filters: ReportFilterState, language: string) {
  const t = translations[language as keyof typeof translations]
  return t[filters.timeRange as keyof typeof t] || filters.timeRange
}

export function generatePDFReport(filters: ReportFilterState, language: string, transactions: Transaction[]) {
  const t = translations[language as keyof typeof translations]
  const summary = calculateSummary(transactions)

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.financialReport}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0891b2; padding-bottom: 20px; }
        .header h1 { color: #0891b2; margin: 0; }
        .info-section { margin-bottom: 20px; }
        .info-section h3 { color: #0891b2; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
        .summary-card h4 { margin: 0 0 10px 0; color: #64748b; }
        .summary-card .amount { font-size: 24px; font-weight: bold; }
        .income { color: #059669; }
        .expense { color: #dc2626; }
        .net { color: #0891b2; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f8fafc; font-weight: bold; color: #374151; }
        .amount-income { color: #059669; font-weight: bold; }
        .amount-expense { color: #dc2626; font-weight: bold; }
        .notes { font-style: italic; color: #6b7280; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${t.financialReport}</h1>
        <p>${t.generatedOn}: ${format(new Date(), "PPP")}</p>
      </div>

      <div class="info-section">
        <h3>${t.filters}</h3>
        <ul>
          <li><strong>${t.category}:</strong> ${filters.category === "all" ? t.allCategories : filters.category}</li>
          <li><strong>${t.type}:</strong> ${filters.type === "all" ? t.allTypes : filters.type === "expense" ? t.expensesOnly : t.incomeOnly}</li>
          <li><strong>Período:</strong> ${
            filters.timeRange === "custom" && filters.startDate && filters.endDate
              ? `${format(filters.startDate, "PP")} - ${format(filters.endDate, "PP")}`
              : resolveTimeRangeLabel(filters, language)
          }</li>
        </ul>
      </div>

      <div class="info-section">
        <h3>${t.summary}</h3>
        <div class="summary">
          <div class="summary-card">
            <h4>${t.totalIncome}</h4>
            <div class="amount income">$${summary.totalIncome.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <h4>${t.totalExpenses}</h4>
            <div class="amount expense">$${summary.totalExpenses.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <h4>${t.netIncome}</h4>
            <div class="amount net">$${summary.netIncome.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3>${t.transactionDetails}</h3>
        <table>
          <thead>
            <tr>
              <th>${t.date}</th>
              <th>${t.description}</th>
              <th>${t.category}</th>
              <th>${t.type}</th>
              <th>${t.amount}</th>
              <th>${t.notes}</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (transaction) => `
              <tr>
                <td>${format(new Date(transaction.date), "PP")}</td>
                <td>${escapeHtml(transaction.description)}</td>
                <td>${escapeHtml(transaction.category?.name || t.uncategorized)}</td>
                <td>${transaction.type === "income" ? t.income : t.expense}</td>
                <td class="amount-${transaction.type}">
                  ${transaction.type === "expense" ? "-" : "+"}$${transaction.amount.toFixed(2)}
                </td>
                <td class="notes">${transaction.notes ? escapeHtml(transaction.notes) : "-"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `

  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `financial-report-${format(new Date(), "yyyy-MM-dd")}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateExcelReport(filters: ReportFilterState, language: string, transactions: Transaction[]) {
  const t = translations[language as keyof typeof translations]
  const summary = calculateSummary(transactions)

  const csvContent = [
    `${t.financialReport}`,
    `${t.generatedOn}: ${format(new Date(), "PPP")}`,
    "",
    `${t.filters}:`,
    `${t.category}: ${filters.category === "all" ? t.allCategories : filters.category}`,
    `${t.type}: ${filters.type === "all" ? t.allTypes : filters.type === "expense" ? t.expensesOnly : t.incomeOnly}`,
    `Período: ${
      filters.timeRange === "custom" && filters.startDate && filters.endDate
        ? `${format(filters.startDate, "PP")} - ${format(filters.endDate, "PP")}`
        : resolveTimeRangeLabel(filters, language)
    }`,
    "",
    `${t.summary}:`,
    `${t.totalIncome}: $${summary.totalIncome.toFixed(2)}`,
    `${t.totalExpenses}: $${summary.totalExpenses.toFixed(2)}`,
    `${t.netIncome}: $${summary.netIncome.toFixed(2)}`,
    "",
    `${t.date},${t.description},${t.category},${t.type},${t.amount},${t.notes}`,
    ...transactions.map(
      (transaction) =>
        `${format(new Date(transaction.date), "PP")},"${transaction.description}","${transaction.category?.name || t.uncategorized}","${
          transaction.type === "income" ? t.income : t.expense
        }","${transaction.type === "expense" ? "-" : "+"}$${transaction.amount.toFixed(2)}","${transaction.notes || ""}"`
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `financial-report-${format(new Date(), "yyyy-MM-dd")}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
