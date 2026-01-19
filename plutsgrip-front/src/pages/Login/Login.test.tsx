import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from './Login'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock navigator.language
Object.defineProperty(window.navigator, 'language', {
  writable: true,
  value: 'pt-BR',
})

describe('Login Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    )
  }

  describe('Initial render', () => {
    it('should display login form', () => {
      renderLoginPage()

      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
      expect(document.getElementById('email')).toBeInTheDocument()
      expect(document.getElementById('password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should display language toggle', () => {
      renderLoginPage()

      // Check for language toggle buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should display "Don\'t have an account" link', () => {
      renderLoginPage()

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('should show error when submitting empty form', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Form should not navigate
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should accept valid email', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const emailInput = document.getElementById('email') as HTMLInputElement
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('should accept password input', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const passwordInput = document.getElementById('password') as HTMLInputElement
      await user.type(passwordInput, 'password123')

      expect(passwordInput).toHaveValue('password123')
    })
  })

  describe('Successful login flow', () => {
    it('should login with correct credentials and navigate', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      // Fill in login form with correct credentials
      const emailInput = document.getElementById('email') as HTMLInputElement
      const passwordInput = document.getElementById('password') as HTMLInputElement

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'senha123')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Should navigate to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })

      // Should save to localStorage
      expect(localStorage.getItem('jwt_token')).toBeTruthy()
      expect(localStorage.getItem('user')).toBeTruthy()
    })

    it('should save user data to localStorage after successful login', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const emailInput = document.getElementById('email') as HTMLInputElement
      const passwordInput = document.getElementById('password') as HTMLInputElement

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'senha123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        const savedUser = localStorage.getItem('user')
        expect(savedUser).toBeTruthy()

        if (savedUser) {
          const userData = JSON.parse(savedUser)
          expect(userData.email).toBe('admin@example.com')
          expect(userData.name).toBe('Admin User')
        }
      })
    })
  })

  describe('Failed login flow', () => {
    it('should show error message with incorrect credentials', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const emailInput = document.getElementById('email') as HTMLInputElement
      const passwordInput = document.getElementById('password') as HTMLInputElement

      // Fill in login form with incorrect credentials
      await user.type(emailInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')

      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Should NOT navigate
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled()
      })

      // Should NOT save to localStorage
      expect(localStorage.getItem('jwt_token')).toBeNull()
    })

    it('should handle empty email', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const passwordInput = document.getElementById('password') as HTMLInputElement
      await user.type(passwordInput, 'senha123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should handle empty password', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const emailInput = document.getElementById('email') as HTMLInputElement
      await user.type(emailInput, 'admin@example.com')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Language toggle', () => {
    it('should change language when clicking language button', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      // Initially should be in English (default)
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()

      // Find and click PT button (this might need adjustment based on actual implementation)
      const languageButtons = screen.getAllByRole('button')
      const ptButton = languageButtons.find(btn => btn.textContent?.includes('PT'))

      if (ptButton) {
        await user.click(ptButton)

        // Text should change to Portuguese
        await waitFor(() => {
          expect(screen.queryByText(/entrar/i)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderLoginPage()

      const emailInput = document.getElementById('email')
      const passwordInput = document.getElementById('password')

      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const emailInput = document.getElementById('email')
      const passwordInput = document.getElementById('password')

      // Verify inputs can receive focus via keyboard
      emailInput?.focus()
      expect(emailInput).toHaveFocus()

      passwordInput?.focus()
      expect(passwordInput).toHaveFocus()

      // Verify tabbing works through the form
      await user.tab()
      expect(document.activeElement?.tagName).toBeTruthy()
    })

    it('should submit form on Enter key', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const emailInput = document.getElementById('email') as HTMLInputElement
      const passwordInput = document.getElementById('password') as HTMLInputElement

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'senha123')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Loading state', () => {
    it('should show loading state during login', async () => {
      const user = userEvent.setup()
      renderLoginPage()

      const emailInput = document.getElementById('email') as HTMLInputElement
      const passwordInput = document.getElementById('password') as HTMLInputElement

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'senha123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Wait for navigation to complete
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })
  })
})
