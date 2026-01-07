# Correção do Erro "MissingGreenlet" - Pydantic com SQLAlchemy Assíncrono

## Problema Identificado

Erro: `MissingGreenlet: greenlet_spawn has not been called; can't call await_only() here`

**Causa Raiz**: Ao usar `model_validate()` do Pydantic para converter objetos SQLAlchemy que contêm relacionamentos lazy-loaded, o Pydantic tenta carregar esses relacionamentos em um contexto onde greenlet não está disponível no ambiente assíncrono.

**Cenário do Erro**:
```python
# PROBLEMA: category é lazy-loaded e será acessado durante model_validate()
transaction = await transaction_repo.get_by_id(transaction_id)
return TransactionResponse.model_validate(transaction)  # ❌ Erro aqui!
```

---

## Solução Aplicada

A solução é garantir que todos os relacionamentos sejam carregados **dentro da sessão do banco de dados** usando `selectinload()` ANTES do `model_validate()`.

### Conceitos Chave

1. **selectinload**: Carrega relacionamentos de forma otimizada com uma query adicional (em vez de N+1 queries)
2. **get_by_id override**: Cada repositório especializado sobrescreve `get_by_id()` com selectinload
3. **Base repository simplificado**: Remove `await db.refresh(db_obj)` que causava o erro

---

## Alterações Realizadas

### 1. **app/repositories/base_repository.py**

```python
# ANTES:
async def create(self, obj_in: dict) -> ModelType:
    db_obj = self.model(**obj_in)
    self.db.add(db_obj)
    await self.db.flush()
    await self.db.refresh(db_obj)  # ❌ Problematico com relacionamentos
    return db_obj

# DEPOIS:
async def create(self, obj_in: dict) -> ModelType:
    db_obj = self.model(**obj_in)
    self.db.add(db_obj)
    await self.db.flush()
    # Objeto permanece na sessão para carga lazy se necessário
    return db_obj
```

**Por que**: A sessão continua ativa durante a execução do endpoint, então `model_validate()` consegue carregar relacionamentos lazy. O refresh removido estava tentando carregar tudo de uma vez, causando o erro greenlet.

---

### 2. **app/repositories/transaction_repository.py**

```python
# NOVO: Sobrescreve get_by_id() da classe base
async def get_by_id(self, id: int) -> Optional[Transaction]:
    """Get a transaction with relationships pre-loaded"""
    query = select(Transaction).options(
        selectinload(Transaction.category),
        selectinload(Transaction.user)
    ).where(Transaction.id == id)

    result = await self.db.execute(query)
    return result.scalars().first()

# MODIFICADO: get_by_user_id()
async def get_by_user_id(self, user_id: int, skip: int = 0, ...) -> List[Transaction]:
    query = select(Transaction).options(
        selectinload(Transaction.category),
        selectinload(Transaction.user)
    ).where(Transaction.user_id == user_id)
    # ... resto da query

# MODIFICADO: get_by_date_range()
async def get_by_date_range(self, user_id: int, ...) -> List[Transaction]:
    query = select(Transaction).options(
        selectinload(Transaction.category),
        selectinload(Transaction.user)
    ).where(...)
    # ... resto da query
```

---

### 3. **app/repositories/category_repository.py**

```python
# NOVO: Sobrescreve get_by_id()
async def get_by_id(self, id: int) -> Optional[Category]:
    query = select(Category).options(
        selectinload(Category.user)
    ).where(Category.id == id)
    result = await self.db.execute(query)
    return result.scalars().first()

# MODIFICADO: get_by_type(), get_by_name()
# Ambos agora incluem: .options(selectinload(Category.user))
```

---

### 4. **app/repositories/budget_repository.py**

```python
# NOVO: Sobrescreve get_by_id()
async def get_by_id(self, id: int) -> Optional[Budget]:
    query = select(Budget).options(
        selectinload(Budget.category),
        selectinload(Budget.user)
    ).where(Budget.id == id)
    result = await self.db.execute(query)
    return result.scalars().first()

# MODIFICADO: get_by_user_id(), get_by_user_and_category()
# Ambos agora incluem: .options(selectinload(...), selectinload(...))
```

---

### 5. **app/repositories/recurring_transaction_repository.py**

```python
# NOVO: Sobrescreve get_by_id()
async def get_by_id(self, id: int) -> Optional[RecurringTransaction]:
    query = select(RecurringTransaction).options(
        selectinload(RecurringTransaction.category),
        selectinload(RecurringTransaction.user)
    ).where(RecurringTransaction.id == id)
    result = await self.db.execute(query)
    return result.scalars().first()

# MODIFICADO: get_by_user_id(), get_due_for_execution()
# Ambos agora carregam relacionamentos com selectinload
```

---

### 6. **app/repositories/goal_repository.py**

```python
# NOVO: Sobrescreve get_by_id()
async def get_by_id(self, id: int) -> Optional[Goal]:
    query = select(Goal).options(
        selectinload(Goal.user)
    ).where(Goal.id == id)
    result = await self.db.execute(query)
    return result.scalars().first()

# MODIFICADO: get_by_user_id(), get_by_priority()
# Ambos agora incluem: .options(selectinload(Goal.user))
```

---

## Fluxo Corrigido

### Exemplo: GET /transactions/{id}

```python
# 1. Endpoint recebe AsyncSession via Depends(get_db)
@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db)  # ✓ Sessão ativa
):
    # 2. TransactionRepository.get_by_id() com selectinload
    transaction = await transaction_repo.get_by_id(transaction_id)
    #    ✓ category E user já carregados (selectinload)
    #    ✓ Não há lazy-loading posterior

    # 3. Validação Pydantic com dados já carregados
    return TransactionResponse.model_validate(transaction)
    #    ✓ Nenhum acesso a relacionamentos lazy
    #    ✓ ✓ Sem erro greenlet!

    # 4. FastAPI dependency manager executa finally:
    #    await session.commit()
    #    await session.close()
```

### Exemplo: POST /transactions

```python
@router.post("", response_model=TransactionResponse)
async def create_transaction(
    transaction_data: TransactionCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    # 1. Criar objeto no repositório
    transaction = await transaction_repo.create({
        "user_id": user_id,
        **transaction_data.model_dump()
    })
    #    ✓ db.add() + db.flush() (sem refresh)
    #    ✓ Objeto permanece na sessão

    # 2. Pydantic valida durante model_validate
    return TransactionResponse.model_validate(transaction)
    #    ✓ Sessão ainda ativa, pode lazy-load se necessário
    #    ✓ Mas já tem category carregado (model já tem valor)

    # 3. FastAPI:
    #    await session.commit()  ← Persiste as mudanças
    #    await session.close()
```

---

## Endpoints Afetados

### Transações
- ✓ GET `/transactions` → `list_transactions()`
- ✓ GET `/transactions/{id}` → `get_transaction()`
- ✓ POST `/transactions` → `create_transaction()`
- ✓ PUT `/transactions/{id}` → `update_transaction()`

### Categorias
- ✓ GET `/categories` → `list_categories()`
- ✓ GET `/categories/{id}` → `get_category()`
- ✓ POST `/categories` → `create_category()`
- ✓ PUT `/categories/{id}` → `update_category()`

### Orçamentos
- ✓ GET `/budgets` → `list_budgets()`
- ✓ GET `/budgets/{id}` → `get_budget()`
- ✓ POST `/budgets` → `create_budget()`
- ✓ PUT `/budgets/{id}` → `update_budget()`

### Transações Recorrentes
- ✓ GET `/recurring_transactions` → `list_recurring_transactions()`
- ✓ GET `/recurring_transactions/{id}` → `get_recurring_transaction()`
- ✓ POST `/recurring_transactions` → `create_recurring_transaction()`
- ✓ PUT `/recurring_transactions/{id}` → `update_recurring_transaction()`

### Metas
- ✓ GET `/goals` → `list_goals()`
- ✓ GET `/goals/{id}` → `get_goal()`
- ✓ POST `/goals` → `create_goal()`
- ✓ PUT `/goals/{id}` → `update_goal()`

---

## Testes Recomendados

### 1. Teste de Transação com Categoria

```bash
# GET transaction com categoria carregada
curl -X GET "http://localhost:8000/api/v1/transactions/1" \
  -H "Authorization: Bearer <token>"

# POST transaction nova
curl -X POST "http://localhost:8000/api/v1/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "description": "Test",
    "amount": 100.00,
    "date": "2024-11-10",
    "type": "expense",
    "category_id": 1
  }'
```

### 2. Teste de Lista com Paginação

```bash
curl -X GET "http://localhost:8000/api/v1/transactions?page=1&page_size=20" \
  -H "Authorization: Bearer <token>"
```

### 3. Teste de Categoria

```bash
curl -X GET "http://localhost:8000/api/v1/categories/1"

curl -X POST "http://localhost:8000/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Test Category",
    "type": "expense",
    "color": "#FF0000"
  }'
```

---

## Verificação de Sucesso

O erro `MissingGreenlet: greenlet_spawn has not been called; can't call await_only() here` deve desaparecer.

Se ainda ocorrer, verifique:

1. **Todas as queries GET têm `selectinload()`?**
   ```python
   query = select(Model).options(selectinload(Model.relationship))
   ```

2. **Nenhum `db.refresh(obj)` sem atributos**
   ```python
   # ❌ RUIM: await db.refresh(obj)
   # ✓ BOM: await db.refresh(obj, ["attr1", "attr2"])
   # ✓ MELHOR: Usar selectinload na query
   ```

3. **As schemas Pydantic têm `from_attributes = True`?**
   ```python
   class Config:
       from_attributes = True
   ```

4. **Os repositórios especializados sobrescrevem `get_by_id()`?**
   Cada repositório (Transaction, Category, Budget, etc.) deve sobrescrever com selectinload.

---

## Referências

- [SQLAlchemy Async - selectinload](https://docs.sqlalchemy.org/en/20/orm/relationships.html#selectinload)
- [SQLAlchemy greenlet Warning](https://docs.sqlalchemy.org/en/20/glossary.html#term-greenlet)
- [Pydantic model_validate](https://docs.pydantic.dev/latest/api/base_model/#pydantic.BaseModel.model_validate)

---

## Resumo das Mudanças

| Arquivo | Alteração |
|---------|-----------|
| `base_repository.py` | Remove `await db.refresh()` problemático |
| `transaction_repository.py` | Adiciona `get_by_id()` com selectinload; atualiza `get_by_user_id()` e `get_by_date_range()` |
| `category_repository.py` | Adiciona `get_by_id()` com selectinload; atualiza todos os métodos GET |
| `budget_repository.py` | Adiciona `get_by_id()` com selectinload; atualiza todos os métodos GET |
| `recurring_transaction_repository.py` | Adiciona `get_by_id()` com selectinload; atualiza todos os métodos GET |
| `goal_repository.py` | Adiciona `get_by_id()` com selectinload; atualiza todos os métodos GET |

**Total**: 6 arquivos modificados
**Linhas adicionadas**: ~150 (comentários + selectinload)
**Compatibilidade**: Backward compatible - melhor performance sem breaking changes

---

Data: 2024-11-10
Status: ✓ Implementado
