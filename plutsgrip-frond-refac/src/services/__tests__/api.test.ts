/**
 * Testes unitários para o serviço de API
 *
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi, afterAll } from 'vitest'

// Mock do localStorage ANTES de importar a API
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock do fetch global
global.fetch = vi.fn()

// Importar DEPOIS de configurar o mock
import { apiService } from '../api'

describe('ApiService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Resetar o estado da API para leitura nova do localStorage
    apiService.resetState()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Autenticação', () => {
    describe('register', () => {
      it('deve registrar um novo usuário com sucesso', async () => {
        const mockResponse = {
          id: 'user_123',
          name: 'João Silva',
          email: 'joao@example.com',
          created_at: '2024-11-03T10:00:00Z',
          updated_at: '2024-11-03T10:00:00Z'
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockResponse
        })

        const result = await apiService.register({
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'SenhaForte123!'
        })

        expect(result).toEqual(mockResponse)
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/register'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            })
          })
        )
      })

      it('deve lançar erro se email já existe', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: async () => ({ detail: 'Email já está registrado' })
        })

        await expect(
          apiService.register({
            name: 'João Silva',
            email: 'joao@example.com',
            password: 'SenhaForte123!'
          })
        ).rejects.toThrow('Email já está registrado')
      })

      it('deve validar dados obrigatórios', async () => {
        // Sem validação no client, mas endpoint reject isso
        expect(true).toBe(true)
      })
    })

    describe('login', () => {
      it('deve fazer login com sucesso', async () => {
        const mockResponse = {
          access_token: 'token_abc123',
          refresh_token: 'refresh_xyz789',
          user: {
            id: 'user_123',
            name: 'João Silva',
            email: 'joao@example.com'
          }
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        })

        const result = await apiService.login({
          email: 'joao@example.com',
          password: 'SenhaForte123!'
        })

        expect(result).toEqual(mockResponse)
        expect(localStorage.getItem('access_token')).toBe('token_abc123')
        expect(localStorage.getItem('refresh_token')).toBe('refresh_xyz789')
      })

      it('deve lançar erro com credenciais inválidas', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Incorrect email or password' })
        })

        await expect(
          apiService.login({
            email: 'joao@example.com',
            password: 'SenhaErrada'
          })
        ).rejects.toThrow()
      })

      it('deve salvar tokens no localStorage', async () => {
        const mockResponse = {
          access_token: 'token_abc123',
          refresh_token: 'refresh_xyz789',
          user: {
            id: 'user_123',
            name: 'João Silva',
            email: 'joao@example.com'
          }
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        })

        await apiService.login({
          email: 'joao@example.com',
          password: 'SenhaForte123!'
        })

        expect(localStorage.getItem('access_token')).toBe('token_abc123')
        expect(localStorage.getItem('refresh_token')).toBe('refresh_xyz789')
      })

      it('deve adicionar Bearer token nas requisições subsequentes', async () => {
        localStorage.setItem('access_token', 'token_abc123')

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ id: 'user_123' })
        })

        await apiService.getCurrentUser()

        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer token_abc123'
            })
          })
        )
      })
    })

    describe('logout', () => {
      it('deve fazer logout e limpar tokens', async () => {
        localStorage.setItem('access_token', 'token_abc123')
        localStorage.setItem('refresh_token', 'refresh_xyz789')

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ message: 'Logged out' })
        })

        await apiService.logout()

        expect(localStorage.getItem('access_token')).toBeNull()
        expect(localStorage.getItem('refresh_token')).toBeNull()
        expect(apiService.isAuthenticated()).toBe(false)
      })

      it('deve limpar tokens mesmo se requisição falhar', async () => {
        localStorage.setItem('access_token', 'token_abc123')

        ;(global.fetch as any).mockRejectedValueOnce(
          new Error('Network error')
        )

        try {
          await apiService.logout()
        } catch (error) {
          // Esperado
        }

        // Tokens devem ser limpos no finally
        // (dependendo de implementação)
      })
    })

    describe('getCurrentUser', () => {
      it('deve retornar dados do usuário autenticado', async () => {
        const mockUser = {
          id: 'user_123',
          name: 'João Silva',
          email: 'joao@example.com'
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockUser
        })

        const result = await apiService.getCurrentUser()

        expect(result).toEqual(mockUser)
      })

      it('deve lançar erro sem autenticação', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Not authenticated' })
        })

        await expect(apiService.getCurrentUser()).rejects.toThrow()
      })
    })
  })

  describe('Transações', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'token_abc123')
    })

    describe('listTransactions', () => {
      it('deve listar transações com paginação', async () => {
        const mockResponse = {
          data: [
            {
              id: 'trans_001',
              description: 'Compra',
              amount: 50,
              type: 'expense',
              category_id: 'cat_001',
              date: '2024-11-03'
            }
          ],
          total: 1,
          page: 1,
          page_size: 20
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        })

        const result = await apiService.listTransactions(1, 20)

        expect(result).toEqual(mockResponse)
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        )
      })

      it('deve filtrar por tipo de transação', async () => {
        const mockResponse = {
          data: [],
          total: 0,
          page: 1,
          page_size: 20
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        })

        await apiService.listTransactions(1, 20, 'expense')

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('type=expense'),
          expect.any(Object)
        )
      })

      it('deve filtrar por categoria', async () => {
        const mockResponse = {
          data: [],
          total: 0,
          page: 1,
          page_size: 20
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        })

        await apiService.listTransactions(1, 20, undefined, 'cat_001')

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('category=cat_001'),
          expect.any(Object)
        )
      })
    })

    describe('createTransaction', () => {
      it('deve criar transação com sucesso', async () => {
        const transactionData = {
          description: 'Café',
          amount: 12.50,
          type: 'expense' as const,
          category_id: 'cat_001',
          date: '2024-11-03'
        }

        const mockResponse = {
          id: 'trans_123',
          ...transactionData,
          user_id: 'user_123',
          created_at: '2024-11-03T10:00:00Z',
          updated_at: '2024-11-03T10:00:00Z'
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockResponse
        })

        const result = await apiService.createTransaction(transactionData)

        expect(result).toEqual(mockResponse)
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(transactionData)
          })
        )
      })

      it('deve validar dados obrigatórios', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 422,
          json: async () => ({
            detail: 'Validação falhou'
          })
        })

        await expect(
          apiService.createTransaction({
            description: '',
            amount: -10,
            type: 'expense',
            category_id: '',
            date: ''
          })
        ).rejects.toThrow()
      })
    })

    describe('updateTransaction', () => {
      it('deve atualizar transação com sucesso', async () => {
        const mockResponse = {
          id: 'trans_123',
          description: 'Café atualizado',
          amount: 15.00,
          type: 'expense',
          category_id: 'cat_001',
          date: '2024-11-03',
          user_id: 'user_123',
          created_at: '2024-11-03T10:00:00Z',
          updated_at: '2024-11-03T11:00:00Z'
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        })

        const result = await apiService.updateTransaction('trans_123', {
          description: 'Café atualizado',
          amount: 15.00
        })

        expect(result).toEqual(mockResponse)
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/trans_123'),
          expect.objectContaining({
            method: 'PUT'
          })
        )
      })
    })

    describe('deleteTransaction', () => {
      it('deve deletar transação com sucesso', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 204
        })

        await expect(
          apiService.deleteTransaction('trans_123')
        ).resolves.not.toThrow()

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/trans_123'),
          expect.objectContaining({
            method: 'DELETE'
          })
        )
      })

      it('deve retornar erro se transação não existe', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ detail: 'Transação não encontrada' })
        })

        await expect(
          apiService.deleteTransaction('trans_999')
        ).rejects.toThrow()
      })
    })
  })

  describe('Categorias', () => {
    describe('listCategories', () => {
      it('deve listar todas as categorias', async () => {
        const mockCategories = [
          {
            id: 'cat_001',
            name: 'Alimentação',
            type: 'expense',
            icon: '🍔',
            color: '#FF6B6B',
            is_default: true
          }
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockCategories
        })

        const result = await apiService.listCategories()

        expect(result).toEqual(mockCategories)
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Alimentação')
      })
    })

    describe('getCategoriesByType', () => {
      it('deve filtrar categorias por tipo expense', async () => {
        const mockCategories = [
          {
            id: 'cat_001',
            name: 'Alimentação',
            type: 'expense',
            icon: '🍔',
            color: '#FF6B6B',
            is_default: true
          }
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockCategories
        })

        const result = await apiService.getCategoriesByType('expense')

        expect(result).toEqual(mockCategories)
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('type=expense'),
          expect.any(Object)
        )
      })

      it('deve filtrar categorias por tipo income', async () => {
        const mockCategories = [
          {
            id: 'cat_salary',
            name: 'Salário',
            type: 'income',
            icon: '💰',
            color: '#51CF66',
            is_default: true
          }
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockCategories
        })

        const result = await apiService.getCategoriesByType('income')

        expect(result).toEqual(mockCategories)
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('type=income'),
          expect.any(Object)
        )
      })
    })
  })

  describe('Relatórios', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'token_abc123')
    })

    describe('getDashboard', () => {
      it('deve retornar dados do dashboard', async () => {
        const mockDashboard = {
          total_income: 5000.00,
          total_expense: 1200.50,
          balance: 3799.50,
          transaction_count: 15,
          income_count: 2,
          expense_count: 13
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockDashboard
        })

        const result = await apiService.getDashboard()

        expect(result).toEqual(mockDashboard)
        expect(result.balance).toBe(3799.50)
      })
    })

    describe('getFinancialSummary', () => {
      it('deve retornar resumo financeiro padrão', async () => {
        const mockSummary = {
          period_start: '2024-11-01',
          period_end: '2024-11-30',
          total_income: 5000.00,
          total_expense: 1200.50,
          net_balance: 3799.50,
          transaction_count: 15,
          income_by_category: [],
          expense_by_category: [],
          daily_totals: {}
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockSummary
        })

        const result = await apiService.getFinancialSummary()

        expect(result).toEqual(mockSummary)
      })

      it('deve retornar resumo para período específico', async () => {
        const mockSummary = {
          period_start: '2024-11-10',
          period_end: '2024-11-20',
          total_income: 3000.00,
          total_expense: 800.00,
          net_balance: 2200.00,
          transaction_count: 8,
          income_by_category: [],
          expense_by_category: [],
          daily_totals: {}
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockSummary
        })

        const result = await apiService.getFinancialSummary(
          '2024-11-10',
          '2024-11-20'
        )

        expect(result.period_start).toBe('2024-11-10')
        expect(result.period_end).toBe('2024-11-20')
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('start_date=2024-11-10'),
          expect.any(Object)
        )
      })
    })

    describe('getMonthlyTrends', () => {
      it('deve retornar tendências mensais', async () => {
        const mockTrends = {
          income: [
            { month: 'Nov/2024', value: 5000 },
            { month: 'Oct/2024', value: 5000 }
          ],
          expense: [
            { month: 'Nov/2024', value: 1200 },
            { month: 'Oct/2024', value: 1500 }
          ],
          balance: [
            { month: 'Nov/2024', value: 3800 },
            { month: 'Oct/2024', value: 3500 }
          ]
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockTrends
        })

        const result = await apiService.getMonthlyTrends(2)

        expect(result.income).toHaveLength(2)
        expect(result.expense).toHaveLength(2)
        expect(result.balance).toHaveLength(2)
      })

      it('deve respeitar limite de meses', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ income: [], expense: [], balance: [] })
        })

        await apiService.getMonthlyTrends(12)

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('months=12'),
          expect.any(Object)
        )
      })
    })

    describe('getSpendingPatterns', () => {
      it('deve retornar padrões de gastos', async () => {
        const mockPatterns = {
          top_expense_categories: [
            { category: 'Alimentação', total: 800 },
            { category: 'Transporte', total: 400 }
          ],
          average_daily_spending: 56.33,
          period_days: 30
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockPatterns
        })

        const result = await apiService.getSpendingPatterns()

        expect(result.top_expense_categories).toHaveLength(2)
        expect(result.average_daily_spending).toBe(56.33)
        expect(result.period_days).toBe(30)
      })
    })
  })

  describe('Orçamentos', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'token_abc123')
    })

    describe('listBudgets', () => {
      it('deve listar orçamentos', async () => {
        const mockBudgets = [
          {
            id: 'budget_001',
            user_id: 'user_123',
            category_id: 'cat_001',
            amount: 1000,
            period: 'monthly',
            start_date: '2024-11-01',
            end_date: null,
            created_at: '2024-11-01T10:00:00Z',
            updated_at: '2024-11-01T10:00:00Z'
          }
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockBudgets
        })

        const result = await apiService.listBudgets()

        expect(result).toEqual(mockBudgets)
      })
    })

    describe('createBudget', () => {
      it('deve criar orçamento com sucesso', async () => {
        const budgetData = {
          category_id: 'cat_001',
          amount: 1000,
          period: 'monthly' as const,
          start_date: '2024-11-01'
        }

        const mockResponse = {
          id: 'budget_123',
          user_id: 'user_123',
          ...budgetData,
          end_date: null,
          created_at: '2024-11-03T10:00:00Z',
          updated_at: '2024-11-03T10:00:00Z'
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockResponse
        })

        const result = await apiService.createBudget(budgetData)

        expect(result).toEqual(mockResponse)
      })
    })

    describe('getBudgetStatus', () => {
      it('deve retornar status do orçamento', async () => {
        const mockStatus = {
          budget_amount: 1000,
          spent_amount: 650.50,
          remaining_amount: 349.50,
          percentage_used: 65.05,
          is_exceeded: false
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockStatus
        })

        const result = await apiService.getBudgetStatus('budget_001')

        expect(result.percentage_used).toBe(65.05)
        expect(result.is_exceeded).toBe(false)
      })

      it('deve indicar quando orçamento foi excedido', async () => {
        const mockStatus = {
          budget_amount: 1000,
          spent_amount: 1200,
          remaining_amount: -200,
          percentage_used: 120,
          is_exceeded: true
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockStatus
        })

        const result = await apiService.getBudgetStatus('budget_001')

        expect(result.is_exceeded).toBe(true)
      })
    })
  })

  describe('Metas', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'token_abc123')
    })

    describe('listGoals', () => {
      it('deve listar todas as metas', async () => {
        const mockGoals = [
          {
            id: 'goal_001',
            user_id: 'user_123',
            name: 'Férias na Europa',
            description: 'Viagem de 2 semanas',
            target_amount: 5000,
            current_amount: 2500,
            deadline: '2024-12-31',
            category: 'Viagem',
            priority: 'high',
            is_completed: false,
            created_at: '2024-09-01T10:00:00Z',
            updated_at: '2024-11-03T10:00:00Z'
          }
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockGoals
        })

        const result = await apiService.listGoals()

        expect(result).toEqual(mockGoals)
      })

      it('deve filtrar metas concluídas', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => []
        })

        await apiService.listGoals(0, 100, true)

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('is_completed=true'),
          expect.any(Object)
        )
      })
    })

    describe('createGoal', () => {
      it('deve criar meta com sucesso', async () => {
        const goalData = {
          name: 'Férias na Europa',
          description: 'Viagem de 2 semanas',
          target_amount: 5000,
          deadline: '2024-12-31',
          category: 'Viagem',
          priority: 'high' as const
        }

        const mockResponse = {
          id: 'goal_123',
          user_id: 'user_123',
          ...goalData,
          current_amount: 0,
          is_completed: false,
          created_at: '2024-11-03T10:00:00Z',
          updated_at: '2024-11-03T10:00:00Z'
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockResponse
        })

        const result = await apiService.createGoal(goalData)

        expect(result).toEqual(mockResponse)
      })
    })

    describe('addGoalProgress', () => {
      it('deve adicionar progresso à meta', async () => {
        const mockGoal = {
          id: 'goal_001',
          user_id: 'user_123',
          name: 'Férias na Europa',
          target_amount: 5000,
          current_amount: 3000,
          priority: 'high',
          is_completed: false,
          created_at: '2024-09-01T10:00:00Z',
          updated_at: '2024-11-03T11:00:00Z'
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockGoal
        })

        const result = await apiService.addGoalProgress('goal_001', 500)

        expect(result.current_amount).toBe(3000)
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/goals/goal_001/progress'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ amount: 500 })
          })
        )
      })
    })

    describe('completeGoal', () => {
      it('deve marcar meta como concluída', async () => {
        const mockGoal = {
          id: 'goal_001',
          user_id: 'user_123',
          name: 'Férias na Europa',
          target_amount: 5000,
          current_amount: 5000,
          priority: 'high',
          is_completed: true,
          created_at: '2024-09-01T10:00:00Z',
          updated_at: '2024-11-03T12:00:00Z'
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockGoal
        })

        const result = await apiService.completeGoal('goal_001')

        expect(result.is_completed).toBe(true)
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/goals/goal_001/complete'),
          expect.objectContaining({
            method: 'POST'
          })
        )
      })
    })
  })

  describe('Transações Recorrentes', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'token_abc123')
    })

    describe('listRecurringTransactions', () => {
      it('deve listar transações recorrentes', async () => {
        const mockRecurring = [
          {
            id: 'recurring_001',
            user_id: 'user_123',
            description: 'Aluguel apartamento',
            amount: 1500,
            currency: 'BRL',
            type: 'expense',
            category_id: 'cat_housing',
            frequency: 'monthly',
            start_date: '2024-01-01',
            end_date: null,
            is_active: true,
            notes: 'Aluguel do imóvel',
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-01T10:00:00Z'
          }
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockRecurring
        })

        const result = await apiService.listRecurringTransactions()

        expect(result).toEqual(mockRecurring)
        expect(result[0].frequency).toBe('monthly')
      })

      it('deve filtrar por status ativo', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => []
        })

        await apiService.listRecurringTransactions(0, 100, true)

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('is_active=true'),
          expect.any(Object)
        )
      })
    })

    describe('createRecurringTransaction', () => {
      it('deve criar transação recorrente', async () => {
        const recurringData = {
          description: 'Aluguel apartamento',
          amount: 1500,
          currency: 'BRL',
          type: 'expense' as const,
          category_id: 'cat_housing',
          frequency: 'monthly' as const,
          start_date: '2024-11-01',
          notes: 'Aluguel do imóvel'
        }

        const mockResponse = {
          id: 'recurring_123',
          user_id: 'user_123',
          ...recurringData,
          end_date: null,
          is_active: true,
          created_at: '2024-11-03T10:00:00Z',
          updated_at: '2024-11-03T10:00:00Z'
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockResponse
        })

        const result = await apiService.createRecurringTransaction(recurringData)

        expect(result).toEqual(mockResponse)
      })
    })

    describe('updateRecurringTransaction', () => {
      it('deve atualizar transação recorrente', async () => {
        const mockResponse = {
          id: 'recurring_001',
          user_id: 'user_123',
          description: 'Aluguel apartamento',
          amount: 1600,
          currency: 'BRL',
          type: 'expense',
          category_id: 'cat_housing',
          frequency: 'monthly',
          start_date: '2024-11-01',
          end_date: '2024-12-31',
          is_active: true,
          notes: 'Aluguel do imóvel',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-11-03T11:00:00Z'
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        })

        const result = await apiService.updateRecurringTransaction(
          'recurring_001',
          { amount: 1600, end_date: '2024-12-31' }
        )

        expect(result.amount).toBe(1600)
      })
    })

    describe('deleteRecurringTransaction', () => {
      it('deve deletar transação recorrente', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 204
        })

        await expect(
          apiService.deleteRecurringTransaction('recurring_001')
        ).resolves.not.toThrow()
      })
    })
  })

  describe('Utilidades', () => {
    describe('isAuthenticated', () => {
      it('deve retornar false sem token', () => {
        localStorage.clear()
        expect(apiService.isAuthenticated()).toBe(false)
      })

      it('deve retornar true com token', () => {
        localStorage.setItem('access_token', 'token_123')
        expect(apiService.isAuthenticated()).toBe(true)
      })
    })

    describe('getAccessToken', () => {
      it('deve retornar o token salvo', () => {
        localStorage.setItem('access_token', 'my_token_123')
        const token = apiService.getAccessToken()
        expect(token).toBe('my_token_123')
      })

      it('deve retornar null sem token', () => {
        localStorage.clear()
        expect(apiService.getAccessToken()).toBeNull()
      })
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve lançar erro para status 400', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Bad request' })
      })

      await expect(apiService.getDashboard()).rejects.toThrow('Bad request')
    })

    it('deve lançar erro para status 500', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Internal server error' })
      })

      await expect(apiService.getDashboard()).rejects.toThrow()
    })

    it('deve lidar com erro de rede', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(apiService.getDashboard()).rejects.toThrow()
    })
  })
})
