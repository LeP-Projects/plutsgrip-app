/**
 * PlutusGrip Finance Tracker API Service
 *
 * Serviço centralizado para todas as chamadas HTTP da API
 * Gerencia autenticação, tratamento de erros e requisições
 *
 * @author PlutusGrip Team
 * @version 1.0.0
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api"

// Types para requisições e respostas
export interface User {
  id: string
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category_id: number
  category?: Category
  date: string
  notes?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface TransactionCreateRequest {
  description: string
  amount: number
  type: "income" | "expense"
  category_id: number
  date: string
  notes?: string
}

export interface TransactionListResponse {
  transactions: Transaction[]
  total: number
  page: number
  page_size: number
}

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  icon?: string
  color?: string
  is_default: boolean
}

export interface CategoryListResponse {
  categories: Category[]
  total: number
}

export interface Budget {
  id: string
  user_id: string
  category_id: number
  amount: number
  period: "monthly" | "quarterly" | "yearly"
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface BudgetCreateRequest {
  category_id: number
  amount: number
  period: "monthly" | "quarterly" | "yearly"
  start_date: string
}

export interface BudgetStatus {
  budget_amount: number
  spent_amount: number
  remaining_amount: number
  percentage_used: number
  is_exceeded: boolean
}

export interface Goal {
  id: string
  user_id: string
  name: string
  description?: string
  target_amount: number
  current_amount: number
  deadline?: string
  category?: string
  priority: "low" | "medium" | "high"
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface GoalCreateRequest {
  name: string
  description?: string
  target_amount: number
  deadline?: string
  category?: string
  priority: "low" | "medium" | "high"
}

export interface RecurringTransaction {
  id: string
  user_id: string
  description: string
  amount: number
  currency?: string
  type: "income" | "expense"
  category_id?: string
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly"
  start_date: string
  end_date?: string
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface RecurringTransactionCreateRequest {
  description: string
  amount: number
  currency?: string
  type: "income" | "expense"
  category_id?: string
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly"
  start_date: string
  end_date?: string
  notes?: string
}

export interface DashboardData {
  total_income: number
  total_expense: number
  balance: number
  transaction_count: number
  income_count: number
  expense_count: number
}

export interface FinancialSummary {
  period_start: string
  period_end: string
  total_income: number
  total_expense: number
  net_balance: number
  transaction_count: number
  income_by_category: Array<{
    category_id: string
    category_name: string
    total: number
    count: number
  }>
  expense_by_category: Array<{
    category_id: string
    category_name: string
    total: number
    count: number
  }>
  daily_totals: Record<string, number>
}

export interface MonthlyTrends {
  income: Array<{
    month: string
    value: number
  }>
  expense: Array<{
    month: string
    value: number
  }>
  balance: Array<{
    month: string
    value: number
  }>
}

export interface SpendingPatterns {
  top_expense_categories: Array<{
    category: string
    total: number
  }>
  average_daily_spending: number
  period_days: number
}

// Classe do serviço de API
class ApiService {
  private static instance: ApiService
  private _accessToken: string | null = null
  private _refreshToken: string | null = null

  private constructor() { }

  /**
   * Getter para accessToken - sempre lê do localStorage para evitar race conditions
   */
  private get accessToken(): string | null {
    // Sempre lê do localStorage para garantir valor fresco
    // Isso evita a race condition onde o token é lido como null antes do login
    // e fica em cache mesmo após o login armazenar um novo token
    const token = localStorage.getItem("access_token")
    if (token !== this._accessToken) {
      this._accessToken = token
      console.log("[API] Access token atualizado do localStorage")
    }
    return this._accessToken
  }

  /**
   * Setter para accessToken
   */
  private set accessToken(value: string | null) {
    this._accessToken = value
  }

  /**
   * Getter para refreshToken - sempre lê do localStorage
   */
  private get refreshToken(): string | null {
    // Sempre lê do localStorage para garantir valor fresco
    const token = localStorage.getItem("refresh_token")
    if (token !== this._refreshToken) {
      this._refreshToken = token
      console.log("[API] Refresh token atualizado do localStorage")
    }
    return this._refreshToken
  }

  /**
   * Setter para refreshToken
   */
  private set refreshToken(value: string | null) {
    this._refreshToken = value
  }

  /**
   * Obtém a instância única do serviço (Singleton)
   */
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  /**
   * Realiza uma requisição HTTP
   */


  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    // Adiciona token de autenticação se disponível
    if (this.accessToken && endpoint !== "/auth/login" && endpoint !== "/auth/register") {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })



    // Se receber 401, tenta refresh token
    if (response.status === 401 && this.refreshToken && endpoint !== "/auth/refresh") {
      await this.refreshAccessToken()
      return this.request<T>(endpoint, options)
    }

    // Trata erro de autorização
    if (response.status === 401) {
      this.clearTokens()
      throw new Error("Sessão expirada. Por favor, faça login novamente.")
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.detail || `Erro ${response.status}: ${response.statusText}`
      )
    }

    // Se a resposta for vazia (204 No Content), retorna void
    if (response.status === 204) {
      return undefined as unknown as T
    }

    return response.json()
  }

  /**
   * Salva tokens no localStorage
   */
  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("refresh_token", refreshToken)
  }

  /**
   * Limpa tokens do localStorage e dados do usuário
   */
  private clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    console.log("[API] Tokens e dados do usuário removidos do localStorage")
  }

  /**
   * Atualiza o token de acesso
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("Refresh token não disponível")
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      })

      if (!response.ok) {
        this.clearTokens()
        throw new Error("Falha ao atualizar token")
      }

      const data = await response.json()
      this.accessToken = data.access_token
      localStorage.setItem("access_token", data.access_token)
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  // ===================== AUTENTICAÇÃO =====================

  /**
   * Registra um novo usuário
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
    this.setTokens(response.access_token, response.refresh_token)
    return response
  }

  /**
   * Realiza login do usuário
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
    this.setTokens(response.access_token, response.refresh_token)
    return response
  }

  /**
   * Obtém informações do usuário atual
   */
  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me")
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      })
    } finally {
      this.clearTokens()
    }
  }

  // ===================== TRANSAÇÕES =====================

  /**
   * Lista transações do usuário com paginação
   */
  async listTransactions(
    page: number = 1,
    pageSize: number = 20,
    type?: "income" | "expense",
    categoryId?: string
  ): Promise<TransactionListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(type && { type }),
      ...(categoryId && { category: categoryId }),
    })

    return this.request<TransactionListResponse>(
      `/transactions?${params.toString()}`
    )
  }

  /**
   * Obtém detalhes de uma transação específica
   */
  async getTransaction(id: string): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`)
  }

  /**
   * Cria uma nova transação
   */
  async createTransaction(data: TransactionCreateRequest): Promise<Transaction> {
    return this.request<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  /**
   * Atualiza uma transação existente
   */
  async updateTransaction(
    id: string,
    data: Partial<TransactionCreateRequest>
  ): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  /**
   * Deleta uma transação
   */
  async deleteTransaction(id: string): Promise<void> {
    return this.request(`/transactions/${id}`, {
      method: "DELETE",
    })
  }

  // ===================== CATEGORIAS =====================

  /**
   * Lista todas as categorias
   */
  async listCategories(): Promise<CategoryListResponse> {
    return this.request<CategoryListResponse>("/categories")
  }

  /**
   * Obtém categorias de um tipo específico
   */
  async getCategoriesByType(type: "income" | "expense"): Promise<Category[]> {
    const params = new URLSearchParams({ type })
    return this.request<Category[]>(`/categories?${params.toString()}`)
  }

  /**
   * Cria uma nova categoria
   */
  async createCategory(data: {
    name: string
    type: "income" | "expense"
    color?: string
    icon?: string
  }): Promise<Category> {
    return this.request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  /**
   * Atualiza uma categoria existente
   */
  async updateCategory(
    id: string,
    data: Partial<{
      name: string
      type: "income" | "expense"
      color: string
      icon: string
    }>
  ): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  /**
   * Deleta uma categoria
   */
  async deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: "DELETE",
    })
  }

  // ===================== RELATÓRIOS =====================

  /**
   * Obtém resumo do dashboard
   */
  async getDashboard(): Promise<DashboardData> {
    return this.request<DashboardData>("/reports/dashboard")
  }

  /**
   * Obtém resumo financeiro detalhado para um período
   */
  async getFinancialSummary(
    startDate?: string,
    endDate?: string
  ): Promise<FinancialSummary> {
    const params = new URLSearchParams({
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    })

    return this.request<FinancialSummary>(
      `/reports/summary?${params.toString()}`
    )
  }

  /**
   * Obtém detalhamento por categoria
   */
  async getCategoryBreakdown(
    type: "income" | "expense",
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      category_id: string
      category_name: string
      total: number
      count: number
    }>
  > {
    const params = new URLSearchParams({
      type,
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    })

    return this.request(
      `/reports/categories?${params.toString()}`
    )
  }

  /**
   * Obtém tendências mensais
   */
  async getMonthlyTrends(months: number = 6): Promise<MonthlyTrends> {
    const params = new URLSearchParams({ months: months.toString() })
    return this.request<MonthlyTrends>(`/reports/trends?${params.toString()}`)
  }

  /**
   * Obtém padrões de gastos
   */
  async getSpendingPatterns(): Promise<SpendingPatterns> {
    return this.request<SpendingPatterns>("/reports/patterns")
  }

  // ===================== ORÇAMENTOS =====================

  /**
   * Lista orçamentos do usuário
   */
  async listBudgets(skip: number = 0, limit: number = 100): Promise<Budget[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    })

    return this.request<Budget[]>(`/budgets?${params.toString()}`)
  }

  /**
   * Obtém detalhes de um orçamento
   */
  async getBudget(id: string): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}`)
  }

  /**
   * Cria um novo orçamento
   */
  async createBudget(data: BudgetCreateRequest): Promise<Budget> {
    return this.request<Budget>("/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  /**
   * Atualiza um orçamento
   */
  async updateBudget(
    id: string,
    data: Partial<BudgetCreateRequest>
  ): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  /**
   * Deleta um orçamento
   */
  async deleteBudget(id: string): Promise<void> {
    return this.request(`/budgets/${id}`, {
      method: "DELETE",
    })
  }

  /**
   * Obtém status do orçamento (gasto vs limite)
   */
  async getBudgetStatus(id: string): Promise<BudgetStatus> {
    return this.request<BudgetStatus>(`/budgets/${id}/status`)
  }

  // ===================== METAS =====================

  /**
   * Lista metas do usuário
   */
  async listGoals(
    skip: number = 0,
    limit: number = 100,
    isCompleted?: boolean
  ): Promise<Goal[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(isCompleted !== undefined && { is_completed: isCompleted.toString() }),
    })

    return this.request<Goal[]>(`/goals?${params.toString()}`)
  }

  /**
   * Obtém detalhes de uma meta
   */
  async getGoal(id: string): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}`)
  }

  /**
   * Cria uma nova meta
   */
  async createGoal(data: GoalCreateRequest): Promise<Goal> {
    return this.request<Goal>("/goals", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  /**
   * Atualiza uma meta
   */
  async updateGoal(id: string, data: Partial<GoalCreateRequest>): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  /**
   * Deleta uma meta
   */
  async deleteGoal(id: string): Promise<void> {
    return this.request(`/goals/${id}`, {
      method: "DELETE",
    })
  }

  /**
   * Adiciona progresso a uma meta
   */
  async addGoalProgress(id: string, amount: number): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}/progress`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    })
  }

  /**
   * Marca uma meta como concluída
   */
  async completeGoal(id: string): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}/complete`, {
      method: "POST",
    })
  }

  // ===================== TRANSAÇÕES RECORRENTES =====================

  /**
   * Lista transações recorrentes do usuário
   */
  async listRecurringTransactions(
    skip: number = 0,
    limit: number = 100,
    isActive?: boolean
  ): Promise<RecurringTransaction[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(isActive !== undefined && { is_active: isActive.toString() }),
    })

    return this.request<RecurringTransaction[]>(
      `/recurring-transactions?${params.toString()}`
    )
  }

  /**
   * Obtém detalhes de uma transação recorrente
   */
  async getRecurringTransaction(id: string): Promise<RecurringTransaction> {
    return this.request<RecurringTransaction>(`/recurring-transactions/${id}`)
  }

  /**
   * Cria uma nova transação recorrente
   */
  async createRecurringTransaction(
    data: RecurringTransactionCreateRequest
  ): Promise<RecurringTransaction> {
    return this.request<RecurringTransaction>("/recurring-transactions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  /**
   * Atualiza uma transação recorrente
   */
  async updateRecurringTransaction(
    id: string,
    data: Partial<RecurringTransactionCreateRequest>
  ): Promise<RecurringTransaction> {
    return this.request<RecurringTransaction>(
      `/recurring-transactions/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    )
  }

  /**
   * Deleta uma transação recorrente
   */
  async deleteRecurringTransaction(id: string): Promise<void> {
    return this.request(`/recurring-transactions/${id}`, {
      method: "DELETE",
    })
  }

  // ===================== UTILITÁRIOS =====================

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  /**
   * Obtém o token de acesso atual
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Reseta o estado do serviço (útil para testes)
   */
  resetState(): void {
    this._accessToken = null
    this._refreshToken = null
  }
}

// Exporta instância única do serviço
export const apiService = ApiService.getInstance()

export default apiService
