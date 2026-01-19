/**
 * Testes E2E de Autenticação
 *
 * Cobre fluxos completos de login, registro e logout
 */

import { test, expect, Page } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'
const API_URL = 'http://localhost:8000/api'

test.describe('Autenticação E2E', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto(BASE_URL)
    // Limpar localStorage
    await page.evaluate(() => localStorage.clear())
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('deve fazer login com credenciais válidas', async () => {
    // Ir para página de login
    await page.goto(`${BASE_URL}/login`)

    // Preencher formulário
    await page.fill('input[type="email"]', 'joao@example.com')
    await page.fill('input[type="password"]', 'SenhaForte123!')

    // Interceptar requisição de login
    const loginPromise = page.waitForResponse(
      response => response.url().includes('/auth/login')
    )

    // Clicar no botão
    await page.click('button:has-text("Login")')

    // Aguardar requisição
    const loginResponse = await loginPromise
    expect(loginResponse.status()).toBe(200)

    // Verificar redirecionamento para dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`)
    expect(page.url()).toContain('/dashboard')

    // Verificar se token foi salvo
    const token = await page.evaluate(() => localStorage.getItem('access_token'))
    expect(token).toBeTruthy()
  })

  test('deve exibir erro com credenciais inválidas', async () => {
    await page.goto(`${BASE_URL}/login`)

    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'WrongPassword')

    // Interceptar requisição falhada
    const loginPromise = page.waitForResponse(
      response => response.url().includes('/auth/login')
    )

    await page.click('button:has-text("Login")')

    const response = await loginPromise
    expect(response.status()).toBe(401)

    // Verificar mensagem de erro
    const errorMessage = await page.locator('text="Incorrect email or password"')
    await expect(errorMessage).toBeVisible()

    // Verificar que não foi redirecionado
    expect(page.url()).toContain('/login')
  })

  test('deve fazer logout corretamente', async () => {
    // Simular login (pré-requisito)
    localStorage.setItem('access_token', 'mock_token_123')

    await page.goto(`${BASE_URL}/dashboard`)

    // Aguardar carregamento
    await page.waitForLoadState('networkidle')

    // Clicar em menu de logout
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')

    // Interceptar requisição de logout
    const logoutPromise = page.waitForResponse(
      response => response.url().includes('/auth/logout')
    )

    // Confirmar logout
    await page.click('button:has-text("Confirm")')

    const response = await logoutPromise
    expect(response.status()).toBe(200)

    // Verificar redirecionamento para login
    await page.waitForURL(`${BASE_URL}/login`)

    // Verificar que token foi removido
    const token = await page.evaluate(() => localStorage.getItem('access_token'))
    expect(token).toBeNull()
  })

  test('deve rejeitar requisição sem autenticação', async () => {
    // Tentar acessar dashboard sem autenticação
    await page.goto(`${BASE_URL}/dashboard`)

    // Deve redirecionar para login
    await page.waitForURL(`${BASE_URL}/login`)
    expect(page.url()).toContain('/login')
  })

  test('deve fazer refresh de token automaticamente', async () => {
    // Simular token expirado
    localStorage.setItem('access_token', 'expired_token')
    localStorage.setItem('refresh_token', 'valid_refresh_token')

    await page.goto(`${BASE_URL}/dashboard`)

    // Mock da resposta refresh
    await page.route('**/auth/refresh', route => {
      route.abort('blockedbyclient')
    })

    // Interceptar requisição ao dashboard
    const dashboardRequest = page.waitForRequest(
      request => request.url().includes('/reports/dashboard')
    )

    const response = await dashboardRequest

    // Deve incluir token no header
    expect(response.headers()['authorization']).toContain('Bearer')
  })
})

test.describe('Fluxo de Transações E2E', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()

    // Setup: fazer login
    await page.goto(`${BASE_URL}/login`)
    localStorage.setItem('access_token', 'mock_token_123')

    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('deve criar nova transação', async () => {
    // Clicar em "Nova Transação"
    await page.click('[data-testid="new-transaction-button"]')

    // Preencher formulário
    await page.fill('[data-testid="transaction-description"]', 'Café')
    await page.fill('[data-testid="transaction-amount"]', '12.50')
    await page.selectOption('[data-testid="transaction-type"]', 'expense')
    await page.selectOption('[data-testid="transaction-category"]', 'cat_001')

    // Interceptar requisição POST
    const createPromise = page.waitForResponse(
      response => response.url().includes('/transactions') && response.request().method() === 'POST'
    )

    // Clicar em Salvar
    await page.click('button:has-text("Salvar")')

    const response = await createPromise
    expect(response.status()).toBe(201)

    // Verificar que formulário foi fechado
    const form = await page.locator('[data-testid="transaction-form"]')
    await expect(form).not.toBeVisible({ timeout: 2000 })

    // Verificar que transação apareceu na lista
    const transaction = await page.locator('text="Café"')
    await expect(transaction).toBeVisible()
  })

  test('deve listar transações com paginação', async () => {
    // Ir para lista de transações
    await page.click('[data-testid="nav-transactions"]')

    // Aguardar carregamento
    await page.waitForLoadState('networkidle')

    // Verificar que lista foi carregada
    const transactionList = await page.locator('[data-testid="transaction-list"]')
    await expect(transactionList).toBeVisible()

    // Verificar paginação
    const nextButton = await page.locator('[data-testid="pagination-next"]')
    const isEnabled = await nextButton.isEnabled()

    if (isEnabled) {
      await nextButton.click()

      // Aguardar carregamento da próxima página
      await page.waitForLoadState('networkidle')

      // Verificar que conteúdo mudou
      const pageInfo = await page.locator('[data-testid="pagination-info"]')
      await expect(pageInfo).toContainText('Página 2')
    }
  })

  test('deve editar transação existente', async () => {
    // Clicar em ícone de editar
    await page.click('[data-testid="transaction-edit-btn"]')

    // Modificar descrição
    const descriptionInput = await page.locator('[data-testid="transaction-description"]')
    await descriptionInput.clear()
    await descriptionInput.fill('Café Atualizado')

    // Interceptar requisição PUT
    const updatePromise = page.waitForResponse(
      response => response.url().includes('/transactions') && response.request().method() === 'PUT'
    )

    // Salvar
    await page.click('button:has-text("Salvar")')

    const response = await updatePromise
    expect(response.status()).toBe(200)

    // Verificar que foi atualizado na lista
    const transaction = await page.locator('text="Café Atualizado"')
    await expect(transaction).toBeVisible()
  })

  test('deve deletar transação', async () => {
    // Clicar em ícone de deletar
    await page.click('[data-testid="transaction-delete-btn"]')

    // Confirmar deleção
    await page.click('button:has-text("Confirmar")')

    // Interceptar requisição DELETE
    const deletePromise = page.waitForResponse(
      response => response.url().includes('/transactions') && response.request().method() === 'DELETE'
    )

    const response = await deletePromise
    expect(response.status()).toBe(204)

    // Verificar que foi removido da lista
    const transaction = await page.locator('text="Transação Deletada"')
    await expect(transaction).not.toBeVisible({ timeout: 2000 })
  })
})

test.describe('Fluxo de Relatórios E2E', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    localStorage.setItem('access_token', 'mock_token_123')
    await page.goto(`${BASE_URL}/reports`)
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('deve carregar e exibir dashboard', async () => {
    // Verificar que dados foram carregados
    const dashboard = await page.locator('[data-testid="dashboard-card"]')
    await expect(dashboard).toBeVisible()

    // Verificar que valores estão presentes
    const totalIncome = await page.locator('[data-testid="total-income"]')
    await expect(totalIncome).toContainText('R$')
  })

  test('deve filtrar por período', async () => {
    // Clicar em seletor de data
    await page.click('[data-testid="start-date-picker"]')

    // Selecionar data
    await page.click('button:has-text("1")')

    // Interceptar requisição
    const summaryPromise = page.waitForResponse(
      response => response.url().includes('/reports/summary')
    )

    const response = await summaryPromise
    expect(response.status()).toBe(200)

    // Verificar que relatório foi atualizado
    const summary = await page.locator('[data-testid="summary-card"]')
    await expect(summary).toBeVisible()
  })

  test('deve exibir gráfico de tendências', async () => {
    // Scroll para gráfico
    await page.locator('[data-testid="trends-chart"]').scrollIntoViewIfNeeded()

    // Verificar que gráfico foi renderizado
    const chart = await page.locator('[data-testid="trends-chart"]')
    await expect(chart).toBeVisible()

    // Verificar que contém dados
    const dataPoints = await page.locator('[data-testid="chart-point"]')
    expect(await dataPoints.count()).toBeGreaterThan(0)
  })
})

test.describe('Fluxo de Orçamentos E2E', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    localStorage.setItem('access_token', 'mock_token_123')
    await page.goto(`${BASE_URL}/budgets`)
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('deve criar novo orçamento', async () => {
    // Clicar em "Novo Orçamento"
    await page.click('[data-testid="new-budget-button"]')

    // Preencher formulário
    await page.selectOption('[data-testid="budget-category"]', 'cat_001')
    await page.fill('[data-testid="budget-amount"]', '1000')
    await page.selectOption('[data-testid="budget-period"]', 'monthly')

    // Interceptar requisição
    const createPromise = page.waitForResponse(
      response => response.url().includes('/budgets') && response.request().method() === 'POST'
    )

    await page.click('button:has-text("Criar")')

    const response = await createPromise
    expect(response.status()).toBe(201)

    // Verificar que apareceu na lista
    const budget = await page.locator('[data-testid="budget-card"]')
    await expect(budget).toBeVisible()
  })

  test('deve exibir status do orçamento', async () => {
    // Clicar em orçamento
    await page.click('[data-testid="budget-card"]')

    // Verificar status
    const statusCard = await page.locator('[data-testid="budget-status"]')
    await expect(statusCard).toBeVisible()

    // Verificar barra de progresso
    const progressBar = await page.locator('[data-testid="budget-progress-bar"]')
    await expect(progressBar).toBeVisible()

    // Verificar percentual
    const percentage = await page.locator('[data-testid="budget-percentage"]')
    const text = await percentage.textContent()
    expect(text).toMatch(/\d+%/)
  })
})

test.describe('Fluxo de Metas E2E', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    localStorage.setItem('access_token', 'mock_token_123')
    await page.goto(`${BASE_URL}/goals`)
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('deve criar nova meta', async () => {
    await page.click('[data-testid="new-goal-button"]')

    await page.fill('[data-testid="goal-name"]', 'Férias na Europa')
    await page.fill('[data-testid="goal-target"]', '5000')
    await page.click('[data-testid="priority-high"]')

    const createPromise = page.waitForResponse(
      response => response.url().includes('/goals') && response.request().method() === 'POST'
    )

    await page.click('button:has-text("Criar")')

    const response = await createPromise
    expect(response.status()).toBe(201)

    const goal = await page.locator('text="Férias na Europa"')
    await expect(goal).toBeVisible()
  })

  test('deve adicionar progresso à meta', async () => {
    // Clicar em meta
    await page.click('[data-testid="goal-card"]')

    // Clicar em "Adicionar Progresso"
    await page.click('[data-testid="add-progress-button"]')

    // Preencher valor
    await page.fill('[data-testid="progress-amount"]', '500')

    const progressPromise = page.waitForResponse(
      response => response.url().includes('/goals') && response.url().includes('/progress')
    )

    await page.click('button:has-text("Adicionar")')

    const response = await progressPromise
    expect(response.status()).toBe(200)

    // Verificar que progresso foi atualizado
    const progressBar = await page.locator('[data-testid="goal-progress"]')
    await expect(progressBar).toBeVisible()
  })
})
