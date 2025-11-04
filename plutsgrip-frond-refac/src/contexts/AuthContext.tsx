import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiService } from "@/services/api"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Hook para acessar funcionalidades de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Provider de autenticação
 * Gerencia estado de login, registro e logout do usuário
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica se há token salvo ao carregar
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const savedUser = localStorage.getItem("user")

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  /**
   * Realiza login do usuário via API
   *
   * ⚠️ SECURITY WARNING - APENAS PARA DESENVOLVIMENTO/DEMONSTRAÇÃO
   * Em produção, NÃO armazene tokens JWT em localStorage devido a:
   * - Vulnerabilidade a XSS attacks
   * - Tokens acessíveis por qualquer script
   * - Sem proteção contra CSRF
   *
   * RECOMENDAÇÕES PARA PRODUÇÃO:
   * - Use httpOnly cookies para armazenar tokens
   * - Implemente refresh token rotation
   * - Use Content Security Policy (CSP)
   * - Criptografe dados sensíveis antes de armazenar
   * - Valide tokens no backend a cada requisição
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await apiService.login({ email, password })

      // Armazena token e usuário
      localStorage.setItem("jwt_token", response.access_token)
      localStorage.setItem("user", JSON.stringify(response.user))
      setUser(response.user)
    } catch (error) {
      console.error("Erro no login:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Realiza registro de novo usuário via API
   */
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await apiService.register({ name, email, password })

      // Armazena token e usuário
      localStorage.setItem("jwt_token", response.access_token)
      localStorage.setItem("user", JSON.stringify(response.user))
      setUser(response.user)
    } catch (error) {
      console.error("Erro no registro:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Realiza logout do usuário
   */
  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
