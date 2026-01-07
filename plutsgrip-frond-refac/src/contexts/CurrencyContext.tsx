import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type Currency = "BRL" | "USD"

interface ExchangeRates {
  USD_BRL: number
  BRL_USD: number
}

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  exchangeRates: ExchangeRates
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number
  formatCurrency: (amount: number, currency?: Currency) => string
  isLoading: boolean
  error: string | null
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

/**
 * Hook para acessar funcionalidades de moeda
 */
export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}

interface CurrencyProviderProps {
  children: ReactNode
}

/**
 * Provider de contexto de moeda
 * Gerencia conversão entre BRL e USD usando taxas de câmbio em tempo real
 */
export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrency] = useState<Currency>("BRL")
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    USD_BRL: 5.2,
    BRL_USD: 0.19,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Busca taxas de câmbio da API com timeout
  const fetchExchangeRates = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.rates && data.rates.BRL) {
        const usdToBrl = data.rates.BRL
        const brlToUsd = 1 / usdToBrl

        setExchangeRates({
          USD_BRL: usdToBrl,
          BRL_USD: brlToUsd,
        })
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      clearTimeout(timeoutId)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("Falha ao buscar taxas de câmbio:", errorMessage)
      setError("Não foi possível atualizar as taxas de câmbio. Usando taxas padrão.")
      // Mantém taxas padrão se a API falhar
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carrega preferência de moeda salva
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem("preferred-currency") as Currency
      if (savedCurrency && (savedCurrency === "BRL" || savedCurrency === "USD")) {
        setCurrency(savedCurrency)
      }
    } catch (error) {
      console.error("Error loading currency preference:", error)
      // Usa BRL como padrão se localStorage falhar
    }

    // Busca taxas no mount e depois a cada 30 minutos
    fetchExchangeRates()
    const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchExchangeRates])

  // Salva preferência de moeda
  useEffect(() => {
    try {
      localStorage.setItem("preferred-currency", currency)
    } catch (error) {
      console.error("Error saving currency preference:", error)
    }
  }, [currency])

  /**
   * Converte valor entre moedas
   */
  const convertAmount = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return amount

    if (fromCurrency === "USD" && toCurrency === "BRL") {
      return amount * exchangeRates.USD_BRL
    } else if (fromCurrency === "BRL" && toCurrency === "USD") {
      return amount * exchangeRates.BRL_USD
    }

    return amount
  }

  /**
   * Formata valor como moeda
   */
  const formatCurrency = (amount: number, targetCurrency?: Currency): string => {
    const curr = targetCurrency || currency

    if (curr === "BRL") {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount)
    } else {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    }
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRates,
        convertAmount,
        formatCurrency,
        isLoading,
        error,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}
