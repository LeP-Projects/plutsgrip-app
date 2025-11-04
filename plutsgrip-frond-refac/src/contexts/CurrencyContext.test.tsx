import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { CurrencyProvider, useCurrency, type Currency } from './CurrencyContext'

// Mock fetch
global.fetch = vi.fn()

describe('CurrencyContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Default mock for fetch (can be overridden in specific tests)
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        rates: {
          BRL: 5.2,
        },
      }),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useCurrency hook', () => {
    it('should throw error when used outside CurrencyProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useCurrency())
      }).toThrow('useCurrency must be used within a CurrencyProvider')

      consoleSpy.mockRestore()
    })

    it('should provide currency context when used within CurrencyProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      expect(result.current).toHaveProperty('currency')
      expect(result.current).toHaveProperty('setCurrency')
      expect(result.current).toHaveProperty('exchangeRates')
      expect(result.current).toHaveProperty('convertAmount')
      expect(result.current).toHaveProperty('formatCurrency')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
    })
  })

  describe('Initial state', () => {
    it('should start with USD currency and default rates', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      expect(result.current.currency).toBe('USD')
      expect(result.current.exchangeRates).toEqual({
        USD_BRL: 5.2,
        BRL_USD: 0.19,
      })
      expect(result.current.error).toBeNull()
    })

    it('should load saved currency from localStorage', () => {
      localStorage.setItem('preferred-currency', 'BRL')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      expect(result.current.currency).toBe('BRL')
    })

    it('should handle invalid currency in localStorage', () => {
      localStorage.setItem('preferred-currency', 'INVALID' as any)

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      // Should fallback to default USD
      expect(result.current.currency).toBe('USD')
    })
  })

  describe('setCurrency', () => {
    it('should update currency and save to localStorage', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      act(() => {
        result.current.setCurrency('BRL')
      })

      expect(result.current.currency).toBe('BRL')
      expect(localStorage.getItem('preferred-currency')).toBe('BRL')
    })

    it('should handle localStorage errors gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      act(() => {
        result.current.setCurrency('BRL')
      })

      // Should still update currency even if localStorage fails
      expect(result.current.currency).toBe('BRL')

      setItemSpy.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('fetchExchangeRates', () => {
    it('should fetch and update exchange rates successfully', async () => {
      const mockResponse = {
        rates: {
          BRL: 5.5,
        },
      }

      // Mock fetch before rendering
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      // Use real timers for this test to allow fetch to complete naturally
      vi.useRealTimers()

      await waitFor(
        () => {
          expect(result.current.exchangeRates.USD_BRL).toBe(5.5)
          expect(result.current.exchangeRates.BRL_USD).toBeCloseTo(1 / 5.5)
        },
        { timeout: 3000 }
      )

      expect(result.current.error).toBeNull()
      vi.useFakeTimers()
    })

    it('should handle fetch timeout', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock fetch that simulates AbortController abort by rejecting
      ;(global.fetch as any).mockImplementationOnce(() =>
        Promise.reject(new Error('The operation was aborted'))
      )

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      // Switch to real timers temporarily
      vi.useRealTimers()

      await waitFor(
        () => {
          expect(result.current.error).toBeTruthy()
        },
        { timeout: 3000 }
      )

      // Should keep default rates
      expect(result.current.exchangeRates).toEqual({
        USD_BRL: 5.2,
        BRL_USD: 0.19,
      })

      consoleSpy.mockRestore()
      vi.useFakeTimers()
    })

    it('should handle HTTP errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock fetch before rendering
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      vi.useRealTimers()

      await waitFor(
        () => {
          expect(result.current.error).toBeTruthy()
        },
        { timeout: 3000 }
      )

      consoleSpy.mockRestore()
      vi.useFakeTimers()
    })

    it('should handle invalid response format', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock fetch before rendering
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'data' }),
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      vi.useRealTimers()

      await waitFor(
        () => {
          expect(result.current.error).toBeTruthy()
        },
        { timeout: 3000 }
      )

      consoleSpy.mockRestore()
      vi.useFakeTimers()
    })
  })

  describe('convertAmount', () => {
    it('should convert USD to BRL correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      const converted = result.current.convertAmount(100, 'USD', 'BRL')
      expect(converted).toBe(520) // 100 * 5.2
    })

    it('should convert BRL to USD correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      const converted = result.current.convertAmount(100, 'BRL', 'USD')
      expect(converted).toBe(19) // 100 * 0.19
    })

    it('should return same amount when converting to same currency', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      expect(result.current.convertAmount(100, 'USD', 'USD')).toBe(100)
      expect(result.current.convertAmount(100, 'BRL', 'BRL')).toBe(100)
    })
  })

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      const formatted = result.current.formatCurrency(1234.56, 'USD')
      expect(formatted).toBe('$1,234.56')
    })

    it('should format BRL correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      const formatted = result.current.formatCurrency(1234.56, 'BRL')
      expect(formatted).toContain('1.234,56') // pt-BR format
    })

    it('should use current currency when no currency specified', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CurrencyProvider>{children}</CurrencyProvider>
      )

      const { result } = renderHook(() => useCurrency(), { wrapper })

      act(() => {
        result.current.setCurrency('BRL')
      })

      const formatted = result.current.formatCurrency(1234.56)
      expect(formatted).toContain('1.234,56')
    })
  })
})
