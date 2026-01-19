import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiService, type User } from "@/services/api"
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
    console.log("[AUTH] Inicializando autenticação")
    const token = localStorage.getItem("access_token")
    const savedUser = localStorage.getItem("user")

    console.log("[AUTH] Verificando localStorage:", {
      hasToken: !!token,
      hasUser: !!savedUser,
      timestamp: new Date().toISOString()
    })

    // Validar consistência: se tem user, DEVE ter token
    if (savedUser && !token) {
      console.warn("[AUTH] Estado inconsistente detectado: user existe mas token não, limpando dados")
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
      setUser(null)
    } else if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        console.log("[AUTH] Usuário restaurado da sessão:", parsedUser)
      } catch (error) {
        console.error("[AUTH] Erro ao carregar usuário:", error)
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
        setUser(null)
      }
    } else {
      console.log("[AUTH] Nenhuma sessão anterior encontrada")
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
      console.log("[AUTH] Iniciando login para:", email)
      setIsLoading(true)

      const response = await apiService.login({ email, password })

      console.log("[AUTH] Resposta recebida da API:", {
        hasAccessToken: !!response.access_token,
        hasRefreshToken: !!response.refresh_token,
        user: response.user
      })

      // Armazena token e usuário
      localStorage.setItem("access_token", response.access_token)
      localStorage.setItem("refresh_token", response.refresh_token)
      localStorage.setItem("user", JSON.stringify(response.user))
      console.log("[AUTH] Tokens e usuário armazenados em localStorage")

      setUser(response.user)
      console.log("[AUTH] Estado do usuário atualizado:", response.user)
    } catch (error) {
      console.error("[AUTH] Erro no login:", {
        email,
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString()
      })
      throw error
    } finally {
      setIsLoading(false)
      console.log("[AUTH] Estado de carregamento definido como false")
    }
  }

  /**
   * Realiza registro de novo usuário via API
   */
  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("[AUTH] Iniciando registro para:", { name, email })
      setIsLoading(true)

      const response = await apiService.register({ name, email, password })

      console.log("[AUTH] Resposta de registro recebida da API:", {
        hasAccessToken: !!response.access_token,
        hasRefreshToken: !!response.refresh_token,
        user: response.user
      })

      // Armazena token e usuário
      localStorage.setItem("access_token", response.access_token)
      localStorage.setItem("refresh_token", response.refresh_token)
      localStorage.setItem("user", JSON.stringify(response.user))
      console.log("[AUTH] Tokens e usuário armazenados em localStorage")

      setUser(response.user)
      console.log("[AUTH] Estado do usuário atualizado:", response.user)
    } catch (error) {
      console.error("[AUTH] Erro no registro:", {
        email,
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString()
      })
      throw error
    } finally {
      setIsLoading(false)
      console.log("[AUTH] Estado de carregamento definido como false")
    }
  }

  /**
   * Realiza logout do usuário
   */
  const logout = () => {
    console.log("[AUTH] Realizando logout")
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    setUser(null)
    console.log("[AUTH] Logout concluído - localStorage limpo e estado resetado")
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
