/**
 * Hook customizado para usar o serviço de API
 *
 * Fornece uma interface simplificada para fazer requisições HTTP
 * com tratamento de loading, erro e dados
 */

import { useState, useCallback, useEffect, useRef } from "react"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface UseApiResult<T> extends UseApiState<T> {
  execute: () => Promise<void>
  refetch: () => Promise<void>
  reset: () => void
  setData: (data: T | null) => void
}

/**
 * Hook para gerenciar requisições à API
 *
 * @param callback - Função que retorna uma Promise com os dados
 * @param immediate - Se deve executar a requisição imediatamente
 * @returns Objeto com estado da requisição e funções de controle
 *
 * @example
 * const { data, loading, error, execute } = useApi(
 *   () => apiService.getDashboard(),
 *   true
 * )
 */
export function useApi<T>(
  callback: () => Promise<T>,
  immediate: boolean = false
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })

  // Usar useRef para armazenar o callback sem causar re-renders
  // Isso evita loops infinitos quando o callback muda
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const execute = useCallback(async () => {
    console.log("[useApi] Executando requisição")
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }))

    try {
      const result = await callbackRef.current()
      setState({
        data: result ?? null,
        loading: false,
        error: null,
      })
      console.log("[useApi] Requisição concluída com sucesso")
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error("[useApi] Erro na requisição:", error.message)
      setState({
        data: null,
        loading: false,
        error: error,
      })
      throw error
    }
  }, []) // ← Agora vazio! Execute não depende de callback

  const refetch = useCallback(() => execute(), [execute])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    })
  }, [])

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
    }))
  }, [])

  // Executa a requisição imediatamente se solicitado
  // execute NÃO deve estar nas dependências! Ele é criado com useCallback([])
  // então é estável. Se colocar nas deps, causa loop infinito.
  useEffect(() => {
    if (immediate) {
      execute().catch(() => {
        // Erro já foi tratado no estado
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate])

  return {
    ...state,
    execute,
    refetch,
    reset,
    setData,
  }
}

/**
 * Hook para gerenciar mutações (POST, PUT, DELETE)
 *
 * @param callback - Função que retorna uma Promise
 * @returns Objeto com estado e função de execução
 *
 * @example
 * const { execute, loading, error } = useMutation(
 *   (data) => apiService.createTransaction(data)
 * )
 */
export function useMutation<TData, TResult>(
  callback: (data: TData) => Promise<TResult>
): {
  execute: (data: TData) => Promise<TResult>
  loading: boolean
  error: Error | null
  reset: () => void
} {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (data: TData): Promise<TResult> => {
      setLoading(true)
      setError(null)

      try {
        const result = await callback(data)
        setLoading(false)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setLoading(false)
        throw error
      }
    },
    [callback]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return {
    execute,
    loading,
    error,
    reset,
  }
}
