import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import { Badge } from "@/components/Badge"
import { Loader2 } from "lucide-react"
import { useCurrency, type Currency } from "@/contexts/CurrencyContext"

const translations = {
  en: {
    currency: "Currency",
    selectCurrency: "Select currency",
    usd: "US Dollar",
    brl: "Brazilian Real",
    exchangeRate: "Exchange Rate",
    updating: "Updating...",
  },
  pt: {
    currency: "Moeda",
    selectCurrency: "Selecionar moeda",
    usd: "Dólar Americano",
    brl: "Real Brasileiro",
    exchangeRate: "Taxa de Câmbio",
    updating: "Atualizando...",
  },
}

interface CurrencySelectorProps {
  language: string
}

export function CurrencySelector({ language }: CurrencySelectorProps) {
  const { currency, setCurrency, exchangeRates, isLoading } = useCurrency()
  const t = translations[language as keyof typeof translations]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{t.currency}</h4>
          <p className="text-sm text-muted-foreground">{t.selectCurrency}</p>
        </div>
        <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">
              <div className="flex items-center gap-2">
                <span>🇺🇸</span>
                <span>{t.usd} (USD)</span>
              </div>
            </SelectItem>
            <SelectItem value="BRL">
              <div className="flex items-center gap-2">
                <span>🇧🇷</span>
                <span>{t.brl} (BRL)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{t.exchangeRate}:</span>
        {isLoading ? (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{t.updating}</span>
          </div>
        ) : (
          <Badge variant="outline">1 USD = {exchangeRates.USD_BRL.toFixed(4)} BRL</Badge>
        )}
      </div>
    </div>
  )
}
