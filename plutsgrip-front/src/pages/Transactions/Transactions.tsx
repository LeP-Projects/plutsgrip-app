import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs"
import { ExpenseForm } from "@/components/ExpenseForm"
import { RecentTransactions } from "@/components/RecentTransactions"
import { PageHeader } from "@/components/PageHeader"
import { useAppShellContext } from "@/components/AppShell/app-shell-context"
import { useState } from "react"

const translations = {
  en: {
    transactions: "Transactions",
    subtitle: "Capture every movement, then review income and expenses with less friction.",
    all: "All",
    income: "Income",
    expense: "Expenses",
  },
  pt: {
    transactions: "Transacoes",
    subtitle: "Registre cada movimento e revise entradas e saidas com menos atrito.",
    all: "Todas",
    income: "Entradas",
    expense: "Saidas",
  },
}

export function TransactionsPage() {
  const { language } = useAppShellContext()
  const [transactionRefreshKey, setTransactionRefreshKey] = useState(0)
  const t = translations[language as keyof typeof translations]

  const handleTransactionCreated = () => {
    setTransactionRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Ledger" title={t.transactions} description={t.subtitle} />

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="panel-surface grid w-full grid-cols-3 rounded-2xl p-1">
          <TabsTrigger value="all">{t.all}</TabsTrigger>
          <TabsTrigger value="income">{t.income}</TabsTrigger>
          <TabsTrigger value="expense">{t.expense}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <ExpenseForm language={language} onTransactionCreated={handleTransactionCreated} />
          <RecentTransactions showAll typeFilter="all" language={language} refreshKey={transactionRefreshKey} />
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <ExpenseForm language={language} defaultType="income" onTransactionCreated={handleTransactionCreated} />
          <RecentTransactions showAll typeFilter="income" language={language} refreshKey={transactionRefreshKey} />
        </TabsContent>

        <TabsContent value="expense" className="space-y-6">
          <ExpenseForm language={language} defaultType="expense" onTransactionCreated={handleTransactionCreated} />
          <RecentTransactions showAll typeFilter="expense" language={language} refreshKey={transactionRefreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
