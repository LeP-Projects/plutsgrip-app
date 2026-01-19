import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })

    it('should provide auth context when used within AuthProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('isAuthenticated')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('login')
      expect(result.current).toHaveProperty('register')
      expect(result.current).toHaveProperty('logout')
    })
  })

  describe('Initial state', () => {
    it('should start with no user and not loading', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should load user from localStorage on mount', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      }

      localStorage.setItem('jwt_token', 'test-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.login('admin@example.com', 'senha123')
      })

      expect(result.current.user).toEqual({
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
      })
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorage.getItem('jwt_token')).toContain('mock-jwt-token-')
      expect(localStorage.getItem('user')).toBeTruthy()
    })

    it('should fail login with incorrect credentials', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(async () => {
        await act(async () => {
          await result.current.login('wrong@example.com', 'wrongpass')
        })
      }).rejects.toThrow('Email ou senha inválidos')

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('should register new user successfully', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.register('New User', 'new@example.com', 'password123')
      })

      expect(result.current.user).toEqual({
        id: expect.any(String),
        name: 'New User',
        email: 'new@example.com',
      })
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorage.getItem('jwt_token')).toBeTruthy()
    })

    it('should fail to register with existing email', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(async () => {
        await act(async () => {
          await result.current.register('Admin', 'admin@example.com', 'password')
        })
      }).rejects.toThrow('Este email já está cadastrado')

      expect(result.current.user).toBeNull()
    })
  })

  describe('logout', () => {
    it('should logout user and clear storage', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      }

      localStorage.setItem('jwt_token', 'test-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorage.getItem('jwt_token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('Error handling', () => {
    it('should handle corrupted user data in localStorage', async () => {
      localStorage.setItem('jwt_token', 'test-token')
      localStorage.setItem('user', 'invalid-json{')

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('jwt_token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()

      consoleSpy.mockRestore()
    })
  })
})
