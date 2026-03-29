# Seguranca e Integracoes - Sprint 10

## Objetivo

Consolidar a camada final do roadmap com foco em:

- maturidade de seguranca e privacidade
- governanca de consentimento
- prontidao para integracoes financeiras
- backlog executavel para automacao futura

## Entregas desta sprint

- central de seguranca e privacidade expandida em Configuracoes
- modo de privacidade local para ocultacao de valores monetarios nas principais telas que usam formatacao centralizada
- politica local de consentimento para:
  - Open Finance
  - importacao de NFC-e
  - analiticos do produto
  - politica local pronta para biometria
- painel de prontidao de integracoes com fases de execucao

## Backlog executivo de integracoes

### Fase 1. Consentimento e seguranca

- mover autenticacao de tokens em localStorage para cookies httpOnly com rotacao
- introduzir expiracao e renovacao com trilha de auditoria
- criar entidade de consentimento por provedor e por escopo
- preparar callbacks assinados e validacao de origem

### Fase 2. NFC-e e ingestao documental

- pipeline de leitura de QR Code de NFC-e
- normalizacao de fornecedor, itens e totais
- conciliacao com categorias existentes
- fluxo de sugestao antes de gravar transacoes

### Fase 3. Open Finance

- camada de provedores para agregacao bancaria
- sincronizacao incremental de contas e transacoes
- reconciliacao com lancamentos manuais e recorrencias
- feedback dos alertas para o motor de classificacao e anomalias

## Riscos abertos

- autenticacao ainda usa estrategia provisoria no frontend
- consentimentos ainda sao locais e nao multi-dispositivo
- nao existe dominio explicito de contas, saldos e provedores no backend

## Proximo nivel recomendado

- criar epicos backend para `consents`, `providers`, `linked_accounts` e `import_jobs`
- introduzir sessao segura por cookie antes de qualquer integracao financeira real
- planejar automacoes de notificacao fora da interface apos consolidar governanca e trilha de auditoria
