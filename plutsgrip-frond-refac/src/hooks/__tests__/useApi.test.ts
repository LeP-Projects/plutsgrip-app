/**
 * Testes unitários para os hooks customizados
 *
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useApi, useMutation } from '../useApi'

describe('useApi Hook', () => {
  describe('useApi', () => {
    it('deve inicializar com estado padrão', () => {
      const mockCallback = vi.fn(async () => ({ data: 'test' }))

      const { result } = renderHook(() => useApi(mockCallback, false))

      expect(result.current.data).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('deve executar callback imediatamente se immediate=true', async () => {
      const mockCallback = vi.fn(async () => ({ data: 'test' }))

      renderHook(() => useApi(mockCallback, true))

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled()
      })
    })

    it('deve não executar callback se immediate=false', () => {
      const mockCallback = vi.fn(async () => ({ data: 'test' }))

      renderHook(() => useApi(mockCallback, false))

      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('deve executar callback quando execute() é chamado', async () => {
      const mockCallback = vi.fn(async () => ({ data: 'test' }))

      const { result } = renderHook(() => useApi(mockCallback, false))

      await act(async () => {
        await result.current.execute()
      })

      expect(mockCallback).toHaveBeenCalled()
      expect(result.current.data).toEqual({ data: 'test' })
    })

    it('deve definir loading=true enquanto executa', async () => {
      const mockCallback = vi.fn(
        async () =>
          new Promise(resolve => setTimeout(() => resolve({ data: 'test' }), 100))
      )

      const { result } = renderHook(() => useApi(mockCallback, false))

      let executePromise: Promise<any>
      act(() => {
        executePromise = result.current.execute()
      })

      expect(result.current.loading).toBe(true)

      await waitFor(async () => {
        await executePromise
        expect(result.current.loading).toBe(false)
      })
    })

    it('deve capturar erros', async () => {
      const mockError = new Error('Test error')
      const mockCallback = vi.fn(async () => {
        throw mockError
      })

      const { result } = renderHook(() => useApi(mockCallback, false))

      await act(async () => {
        try {
          await result.current.execute()
        } catch (error) {
          // Esperado
        }
      })

      expect(result.current.error).toEqual(mockError)
      expect(result.current.data).toBeNull()
    })

    it('deve permitir refetch manual', async () => {
      const mockCallback = vi.fn(async () => ({ data: 'test' }))

      const { result } = renderHook(() => useApi(mockCallback, true))

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled()
      })

      const firstCallCount = mockCallback.mock.calls.length

      await act(async () => {
        await result.current.refetch()
      })

      expect(mockCallback.mock.calls.length).toBeGreaterThan(firstCallCount)
    })

    it('deve permitir reset dos dados', async () => {
      const mockCallback = vi.fn(async () => ({ data: 'test' }))

      const { result } = renderHook(() => useApi(mockCallback, true))

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled()
      })

      expect(result.current.data).not.toBeNull()

      act(() => {
        result.current.reset()
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('deve permitir setData manual', async () => {
      const mockCallback = vi.fn(async () => ({ data: 'initial' }))
      const customData = { data: 'custom' }

      const { result } = renderHook(() => useApi(mockCallback, false))

      act(() => {
        result.current.setData(customData as any)
      })

      expect(result.current.data).toEqual(customData)
    })

    it('deve suportar múltiplas execuções', async () => {
      const mockCallback = vi.fn(async () => ({ count: 1 }))

      const { result } = renderHook(() => useApi(mockCallback, false))

      await act(async () => {
        await result.current.execute()
      })

      expect(result.current.data).toEqual({ count: 1 })
      mockCallback.mockResolvedValueOnce({ count: 2 })

      await act(async () => {
        await result.current.execute()
      })

      expect(result.current.data).toEqual({ count: 2 })
    })

    it('deve lidar com callback que retorna null', async () => {
      const mockCallback = vi.fn(async () => null)

      const { result } = renderHook(() => useApi(mockCallback, true))

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled()
      })

      expect(result.current.data).toBeNull()
    })

    it('deve lidar com callback que retorna undefined', async () => {
      const mockCallback = vi.fn(async () => undefined)

      const { result } = renderHook(() => useApi(mockCallback, true))

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled()
      })

      expect(result.current.data).toBeNull()
    })
  })

  describe('useMutation', () => {
    it('deve inicializar com estado padrão', () => {
      const mockCallback = vi.fn(async () => ({ success: true }))

      const { result } = renderHook(() => useMutation(mockCallback))

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('deve executar mutation quando execute() é chamado', async () => {
      const mockCallback = vi.fn(async (data: { value: string }) => ({
        success: true,
        ...data
      }))

      const { result } = renderHook(() => useMutation(mockCallback))

      let executeResult

      await act(async () => {
        executeResult = await result.current.execute({ value: 'test' })
      })

      expect(mockCallback).toHaveBeenCalledWith({ value: 'test' })
      expect(executeResult).toEqual({ success: true, value: 'test' })
    })

    it('deve definir loading durante execução', async () => {
      const mockCallback = vi.fn(
        async () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      )

      const { result } = renderHook(() => useMutation(mockCallback))

      let executePromise: Promise<any>
      act(() => {
        executePromise = result.current.execute({})
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        await executePromise
      })

      expect(result.current.loading).toBe(false)
    })

    it('deve capturar erros', async () => {
      const mockError = new Error('Mutation error')
      const mockCallback = vi.fn(async () => {
        throw mockError
      })

      const { result } = renderHook(() => useMutation(mockCallback))

      await act(async () => {
        try {
          await result.current.execute({})
        } catch (error) {
          // Esperado
        }
      })

      expect(result.current.error).toEqual(mockError)
    })

    it('deve permitir reset de erro', async () => {
      const mockCallback = vi.fn(async () => {
        throw new Error('Test error')
      })

      const { result } = renderHook(() => useMutation(mockCallback))

      await act(async () => {
        try {
          await result.current.execute({})
        } catch (error) {
          // Esperado
        }
      })

      expect(result.current.error).not.toBeNull()

      act(() => {
        result.current.reset()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('deve retornar resultado da execução', async () => {
      const expectedResult = { id: '123', name: 'Test' }
      const mockCallback = vi.fn(async () => expectedResult)

      const { result } = renderHook(() => useMutation(mockCallback))

      let actualResult

      await act(async () => {
        actualResult = await result.current.execute({})
      })

      expect(actualResult).toEqual(expectedResult)
    })

    it('deve suportar múltiplas execuções sequenciais', async () => {
      const mockCallback = vi.fn(async (data: { count: number }) => ({
        success: true,
        count: data.count * 2
      }))

      const { result } = renderHook(() => useMutation(mockCallback))

      let result1, result2

      await act(async () => {
        result1 = await result.current.execute({ count: 5 })
      })

      expect(result1).toEqual({ success: true, count: 10 })

      await act(async () => {
        result2 = await result.current.execute({ count: 3 })
      })

      expect(result2).toEqual({ success: true, count: 6 })
    })

    it('deve lançar erro se callback falhar', async () => {
      const mockCallback = vi.fn(async () => {
        throw new Error('Mutation failed')
      })

      const { result } = renderHook(() => useMutation(mockCallback))

      await expect(
        act(async () => {
          await result.current.execute({})
        })
      ).rejects.toThrow()
    })

    it('deve lidar com dados complexos', async () => {
      const complexData = {
        user: { id: '123', name: 'Test' },
        items: [{ id: '1', value: 100 }],
        metadata: { timestamp: Date.now() }
      }

      const mockCallback = vi.fn(async (data) => ({
        success: true,
        data
      }))

      const { result } = renderHook(() => useMutation(mockCallback))

      let actualResult

      await act(async () => {
        actualResult = await result.current.execute(complexData)
      })

      expect(actualResult).toEqual({ success: true, data: complexData })
    })
  })

  describe('Integração useApi + useMutation', () => {
    it('deve permitir refetch após mutation', async () => {
      const mockGetData = vi.fn(async () => ({ count: 1 }))
      const mockMutate = vi.fn(async (data: { increment: number }) => ({
        success: true
      }))

      const { result: queryResult } = renderHook(() => useApi(mockGetData, true))
      const { result: mutationResult } = renderHook(() =>
        useMutation(mockMutate)
      )

      await waitFor(() => {
        expect(queryResult.current.loading).toBe(false)
      })

      expect(mockGetData).toHaveBeenCalledTimes(1)

      // Executar mutation
      await act(async () => {
        await mutationResult.current.execute({ increment: 5 })
      })

      expect(mockMutate).toHaveBeenCalledWith({ increment: 5 })

      // Refetch após mutation
      await act(async () => {
        await queryResult.current.refetch()
      })

      expect(mockGetData).toHaveBeenCalledTimes(2)
    })
  })
})
