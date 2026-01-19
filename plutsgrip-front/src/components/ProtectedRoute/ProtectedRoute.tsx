import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

/**
 * Componente ProtectedRoute
 * Protege rotas que requerem autenticação
 * Redireciona para /login se o usuário não estiver autenticado
 *
 * @example
 * ```tsx
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 * ```
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const token = localStorage.getItem("access_token")

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  // Verifica tanto autenticação quanto existência de token válido
  if (!isAuthenticated || !token) {
    console.log("[PROTECTED_ROUTE] Acesso negado:", {
      isAuthenticated,
      hasToken: !!token
    })
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
