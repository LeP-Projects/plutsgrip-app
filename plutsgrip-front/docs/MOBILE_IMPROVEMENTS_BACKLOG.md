# 📱 Melhorias Mobile Pendentes - PlutusGrip

> Melhorias identificadas para atingir 10/10 em todos os aspectos de responsividade mobile.

---

## 🎯 Layout Geral (9/10 → 10/10)

### Skeleton Loading
- [ ] Implementar skeleton loading para cards do dashboard
- [ ] Adicionar skeleton para lista de transações
- [ ] Criar componente `Skeleton` reutilizável com pulse animation

```tsx
// Exemplo de implementação
<Card>
  {isLoading ? (
    <Skeleton className="h-24 w-full" />
  ) : (
    <CardContent>...</CardContent>
  )}
</Card>
```

### Orientação Landscape
- [ ] Detectar orientação via `window.matchMedia('(orientation: landscape)')`
- [ ] Layout adaptativo para tablets em landscape (2 colunas no formulário)

---

## 📝 Formulário de Transações (9/10 → 10/10)

### Validação em Tempo Real
- [ ] Adicionar debounce (300ms) na validação de campos
- [ ] Feedback visual imediato (borda verde/vermelha)
- [ ] Mensagens de erro aparecem apenas após blur ou submit

```tsx
// Hook sugerido
const { value, error, isValid } = useDebounceValidation(formValue, 300)
```

### Keyboard Avoidance
- [ ] Scroll automático para input focado quando teclado abre
- [ ] Usar `visualViewport` API para detectar teclado virtual
- [ ] Adicionar padding bottom dinâmico ao container

```tsx
useEffect(() => {
  const viewport = window.visualViewport
  viewport?.addEventListener('resize', handleKeyboardResize)
  return () => viewport?.removeEventListener('resize', handleKeyboardResize)
}, [])
```

---

## 👆 Touch Targets (9/10 → 10/10)

### DropdownMenu Items
- [ ] Adicionar `min-h-[44px]` em `DropdownMenuItem`
- [ ] Aumentar padding vertical dos itens do menu

### Inputs Globais
- [ ] Criar classe utilitária `.touch-target` com `min-h-[44px]`
- [ ] Aplicar a todos os inputs, selects e botões no CSS base

```css
/* index.css */
@layer components {
  .touch-target {
    @apply min-h-[44px];
  }
}
```

---

## ✨ Feedback Visual (9/10 → 10/10)

### Haptic Feedback
- [ ] Criar hook `useHapticFeedback`
- [ ] Vibração sutil (10ms) em ações importantes
- [ ] Fallback silencioso para dispositivos sem suporte

```tsx
// hooks/use-haptic-feedback.ts
export function useHapticFeedback() {
  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }
  return { vibrate }
}
```

### Toast Notifications Animados
- [ ] Adicionar animação de slide-in no toast
- [ ] Toast de sucesso após criar transação
- [ ] Toast de erro com shake animation

### Loading States nos Botões
- [ ] Spinner dentro do botão durante submit
- [ ] Desabilitar botão durante loading
- [ ] Texto alternativo "Salvando..." / "Carregando..."

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="animate-spin mr-2" />
      Salvando...
    </>
  ) : (
    'Salvar'
  )}
</Button>
```

---

## 📋 Prioridade de Implementação

| Prioridade | Melhoria | Impacto |
|------------|----------|---------|
| 🔴 Alta | Skeleton Loading | UX percebida |
| 🔴 Alta | ~~Loading States Botões~~ | ✅ Implementado |
| 🟡 Média | Haptic Feedback | UX premium |
| 🟡 Média | Touch Targets 44px | Acessibilidade |
| 🟢 Baixa | Keyboard Avoidance | Edge case |
| 🟢 Baixa | Landscape Support | Tablet |

---

## 📅 Data de Criação
2026-01-19

## 🔗 Relacionado
- [responsiveness_report.md](./responsiveness_report.md)
