# Plano de Implementacao e Relatorio Vivo

## 1. Objetivo

Este documento transforma o roadmap executivo do PlutusGrip em um plano pratico de implementacao por sprint, com foco em:

- estabilizacao da base tecnica
- reorganizacao do produto e da arquitetura
- evolucao das regras de negocio
- melhorias de design e experiencia
- criacao de um relatorio vivo para acompanhamento continuo

O objetivo final e evoluir o PlutusGrip de um sistema de registro financeiro para uma plataforma de decisao financeira pessoal, com diagnostico, planejamento, projecao, alertas e automacao.

---

## 2. Principios de Execucao

- Primeiro estabilizar, depois expandir.
- Cada sprint deve entregar valor visivel e reduzir risco futuro.
- Regras financeiras devem nascer cobertas por testes.
- Frontend e backend devem evoluir por dominio, nao por acoplamento acidental.
- Toda sprint encerrada deve atualizar o relatorio vivo deste documento.

---

## 3. Estrutura de Entrega

### Trilhas de trabalho

- Plataforma e arquitetura
- Backend e regras de negocio
- Frontend e experiencia do usuario
- Design system e organizacao visual
- Qualidade, testes e observabilidade

### Cadencia sugerida

- Sprints de 2 semanas
- Revisao tecnica no meio da sprint
- Demo e fechamento com relatorio no ultimo dia

---

## 4. Macro Roadmap

### Fase 1. Fundacao e Confiabilidade

Objetivo:
Corrigir inconsistencias da base, alinhar contratos e garantir que o produto atual seja confiavel.

Resultado esperado:
Uma fundacao limpa, documentada e segura para evolucao.

### Fase 2. Estruturacao do Produto

Objetivo:
Transformar o produto em modulos claros, reduzindo concentracao excessiva no dashboard.

Resultado esperado:
Navegacao mais escalavel, melhor arquitetura de frontend e melhor entendimento do produto pelo usuario.

### Fase 3. Inteligencia Financeira

Objetivo:
Adicionar regras de negocio de planejamento, saude financeira e projecao.

Resultado esperado:
O produto deixa de ser apenas reativo e passa a orientar decisoes.

### Fase 4. Automacao e Diferenciacao

Objetivo:
Preparar o ecossistema para alertas proativos, ingestao automatizada e inteligencia comportamental.

Resultad esperado:
Maior retencao, menos friccao operacional e um diferencial competitivo claro.

---

## 5. Plano por Sprint

## Sprint 1. Estabilizacao da Base

Objetivo:
Remover desalinhamentos entre codigo, documentacao e contratos.

Escopo principal:

- atualizar documentacao tecnica para refletir a stack real
- revisar contratos entre frontend e backend
- corrigir inconsistencias de schemas e respostas
- revisar filtros, paginacao e respostas de transacoes
- fortalecer testes de integracao para fluxos principais

Entregas esperadas:

- documentacao coerente com FastAPI, SQLAlchemy e PostgreSQL
- endpoints de transacoes com comportamento previsivel
- relatorios com schemas consistentes
- base minima de testes de caracterizacao

Criterios de pronto:

- nenhuma documentacao critica descrevendo stack incorreta
- contratos de API usados pelo frontend sem divergencias conhecidas
- fluxos de transacao e relatorio cobertos por testes essenciais

Dependencias:

- nenhuma

---

## Sprint 2. Organizacao do Produto e Navegacao

Objetivo:
Reduzir o acoplamento ao dashboard e preparar o produto para escalar por modulos.

Escopo principal:

- reorganizar frontend por dominios
- criar rotas reais para modulos centrais
- separar visao geral, transacoes, categorias, orcamentos, metas, recorrencias e configuracoes
- revisar estado compartilhado e estrategia de consumo da API
- melhorar experiencia mobile e navegacao lateral

Entregas esperadas:

- estrutura de frontend orientada a features
- rotas e telas modulares
- dashboard menos sobrecarregado

Criterios de pronto:

- usuario consegue navegar pelos modulos sem depender de abas internas gigantes
- estrutura de codigo permite evolucao independente de cada dominio

Dependencias:

- fechamento tecnico da Sprint 1

---

## Sprint 3. Consolidacao do Nucleo Financeiro

Objetivo:
Fechar o produto base que ja existe parcialmente na API, mas ainda nao esta maduro na experiencia completa.

Escopo principal:

- finalizar CRUD real de edicao e exclusao de transacoes no frontend
- integrar corretamente orcamentos, metas e recorrencias na UI
- remover filtros e categorias hardcoded em relatorios
- conectar filtros do dashboard e relatorios a consultas reais
- revisar mensagens de erro, feedback visual e estados vazios

Entregas esperadas:

- produto base completo e coerente ponta a ponta
- modulos de orcamentos, metas e recorrencias com uso real
- relatorios mais confiaveis

Criterios de pronto:

- edicao e exclusao persistem em API e interface
- modulos de orcamento, meta e recorrencia sao utilizaveis por um usuario final

Dependencias:

- estrutura modular definida na Sprint 2

---

## Sprint 4. Redesign da Experiencia Financeira

Objetivo:
Melhorar clareza, hierarquia visual e percepcao de valor do produto.

Escopo principal:

- revisar arquitetura visual do dashboard
- criar componentes de indicadores, alertas, blocos de decisao e cards analiticos
- padronizar visualizacao de graficos e textos de apoio
- melhorar design system, tipografia, espacamento e estados
- refinar jornada principal para mobile e desktop

Entregas esperadas:

- experiencia mais madura e orientada a decisao
- maior consistencia visual entre modulos
- melhor leitura de metricas financeiras

Criterios de pronto:

- dashboard comunica acao e contexto, nao apenas numeros
- experiencia entre modulos segue linguagem visual unica

Dependencias:

- modulos centrais da Sprint 3 funcionando

---

## Sprint 5. Planejamento Financeiro

Objetivo:
Introduzir o primeiro bloco forte de inteligencia de negocio.

Escopo principal:

- implementar regra 50-30-20
- implementar orcamento base zero
- criar painel de distribuicao da renda
- vincular orcamentos e metas ao planejamento mensal
- definir motores de recomendacao simples baseados em regras

Entregas esperadas:

- usuario consegue planejar o mes, nao apenas registrar historico
- sistema aponta excesso ou folga em categorias macro

Criterios de pronto:

- usuario consegue montar um plano mensal
- sistema calcula e exibe distribuicao planejada versus realizada

Dependencias:

- modulo de orcamentos consolidado

---

## Sprint 6. Saude Financeira

Objetivo:
Transformar o app em um termometro financeiro.

Escopo principal:

- calcular reserva de emergencia ideal
- calcular cobertura atual da reserva
- implementar indice de endividamento
- criar score interno de saude financeira
- preparar benchmark comparativo inspirado em referencia nacional

Entregas esperadas:

- area dedicada a saude financeira
- indicadores explicados em linguagem acessivel
- recomendacoes praticas por faixa de risco

Criterios de pronto:

- usuario entende sua situacao financeira em poucos minutos
- indicadores sao rastreaveis e testados

Dependencias:

- planejamento e dados historicos consolidados

---

## Sprint 7. Projecao e Fluxo de Caixa Futuro

Objetivo:
Levar o produto do diagnostico para a previsao.

Escopo principal:

- projetar saldo futuro em 30, 60 e 90 dias
- usar transacoes recorrentes e historico para previsao
- destacar pontos de saldo minimo e risco
- exibir grafico de fluxo de caixa futuro
- preparar alertas de escassez financeira

Entregas esperadas:

- usuario passa a enxergar risco antes de ocorrer
- area de previsao integrada ao dashboard e relatorios

Criterios de pronto:

- projecao utiliza regras claras e reproduziveis
- alertas de saldo critico sao gerados com explicacao

Dependencias:

- recorrencias e regras de planejamento estaveis

---

## Sprint 8. Insights e Sazonalidade

Objetivo:
Evoluir relatorios historicos para analise comportamental.

Escopo principal:

- analise de sazonalidade por categoria
- comparativo mensal e trimestral
- custo de oportunidade de saldo parado
- insights textuais baseados em regras
- priorizacao visual de categorias com maior impacto

Entregas esperadas:

- relatorios mais estrategicos
- insights que orientam cortes e escolhas

Criterios de pronto:

- usuario identifica tendencias e desvios com clareza
- relatorios conseguem sustentar recomendacoes simples e relevantes

Dependencias:

- base de relatorios consolidada

---

## Sprint 9. Alertas Proativos e Deteccao de Anomalias

Objetivo:
Criar comportamento proativo no produto.

Escopo principal:

- alertas de gasto fora do padrao
- identificacao de cobrancas duplicadas
- sugestao de assinaturas possivelmente esquecidas
- monitoramento de ruptura de orcamento
- centro de alertas no produto

Entregas esperadas:

- sistema avisa antes do problema escalar
- usuario percebe ganho operacional e economico

Criterios de pronto:

- motor de alertas com regras auditaveis
- notificacoes nao intrusivas e com valor pratico

Dependencias:

- historico, recorrencias e projecao funcionando

---

## Sprint 10. Automacao, Integracoes e Seguranca Avancada

Objetivo:
Preparar o produto para um novo patamar de maturidade e diferenciacao.

Escopo principal:

- modelar pipeline de integracao com NFC-e e futuras integracoes financeiras
- preparar camada de consentimento e governanca de dados
- revisar estrategia de autenticacao mais segura
- endurecer politicas de armazenamento de credenciais
- planejar modo discreto, biometria e protecoes locais

Entregas esperadas:

- arquitetura pronta para ingestao automatizada
- trilha de seguranca mais adequada ao dominio financeiro

Criterios de pronto:

- backlog de integracoes quebrado em epicos tecnicos executaveis
- seguranca deixa de depender de estrategia provisoria no frontend

Dependencias:

- estabilizacao funcional anterior

---

## 6. Priorizacao

### Prioridade alta

- Sprint 1
- Sprint 2
- Sprint 3
- Sprint 5
- Sprint 6
- Sprint 7

### Prioridade media

- Sprint 4
- Sprint 8
- Sprint 9

### Prioridade estrategica posterior

- Sprint 10

---

## 7. Riscos

- crescer feature sem corrigir a fundacao tecnica
- ampliar regras financeiras sem testes adequados
- adicionar UX sofisticada antes de fechar contratos e persistencia
- aumentar escopo analitico sem qualidade de dados suficiente
- introduzir integracoes financeiras sem trilha de seguranca madura

---

## 8. Indicadores de Acompanhamento

- taxa de bugs em fluxos criticos
- cobertura de testes de regras financeiras
- uso de modulos principais
- retencao semanal e mensal
- percentual de usuarios com orcamento configurado
- percentual de usuarios com metas configuradas
- uso da projecao de saldo
- taxa de interacao com alertas

---

## 9. Relatorio Vivo

Este bloco deve ser atualizado ao fim de cada sprint concluida.

### Status geral atual

- Fase atual: Fase 4. Automacao e Diferenciacao
- Sprint atual: Sprint 10 concluida
- Estado geral: Sprint 10 encerrada com reforco de seguranca e privacidade em Configuracoes, prontidao de integracoes documentada e uma rodada pratica de usabilidade executada em ambiente local

### Sprint 0. Diagnostico e Planejamento

Status:
- concluida

Objetivo:
- entender a estrutura atual da aplicacao
- comparar a base existente com o documento estrategico de melhorias
- definir um plano executivo e operacional

Concluido:

- analise da arquitetura atual do frontend e backend
- mapeamento dos principais gaps de negocio, UX e organizacao
- identificacao de inconsistencias entre documentacao e implementacao real
- definicao do roadmap executivo
- definicao deste plano por sprint

Achados principais:

- a documentacao ainda descreve partes antigas da arquitetura
- o frontend esta muito concentrado em um dashboard central
- ha funcionalidades ja existentes na API que ainda nao viraram produto de forma plena
- as regras atuais sao boas para controle operacional, mas ainda insuficientes para inteligencia financeira

Riscos abertos:

- divergencias de contrato entre frontend e backend
- regras financeiras ainda pouco testadas
- experiencia de produto ainda excessivamente reativa

Proxima sprint:

- Sprint 1. Estabilizacao da Base

### Sprint 1. Estabilizacao da Base

Status:
- concluida

Objetivo:
- remover desalinhamentos entre documentacao, contratos e fluxos criticos da base atual

Escopo concluido:

- atualizacao da documentacao arquitetural do frontend para refletir a stack real
- correcao do schema de relatorios para representar corretamente categorias e totais diarios
- substituicao do teste superficial de relatorios por testes de integracao com dados semeados
- validacao sintatica do backend com `python -m compileall app tests`
- ajuste do backend de transacoes para retornar total consistente em listagens paginadas
- persistencia real de edicao e exclusao de transacoes no frontend
- extensao do endpoint de transacoes para aceitar intervalo de datas e aplicar os filtros no totalizador
- dashboard e secao de relatorios conectados a filtros reais de periodo e categorias dinamicas vindas da API
- graficos de categoria e comparativo financeiro consumindo dados reais do backend por periodo
- exportacao de relatorios deixando de depender de dados simulados e passando a usar transacoes reais filtradas
- adicao de teste de integracao cobrindo paginacao com total filtrado por intervalo de datas

Entregas visiveis:

- o arquivo de arquitetura do frontend nao descreve mais Express e banco em memoria
- o contrato de `daily_totals` agora representa `income` e `expense` por dia
- a cobertura planejada para relatorios ficou mais proxima do comportamento real do produto
- o endpoint de listagem de transacoes passou a separar itens retornados e total real
- a lista de transacoes deixou de simular edicao e exclusao apenas em estado local
- dashboard e relatorios deixaram de depender majoritariamente de filtros locais e categorias hardcoded
- exportacoes passaram a refletir os dados reais apresentados ao usuario no periodo filtrado

Nao concluido:

- execucao real dos testes de integracao com `pytest`
- validacao do frontend com `tsc` ou `vite build`
- limpeza adicional de divergencias entre frontend e backend fora dos dominios de transacoes e relatorios

Riscos e impedimentos:

- o ambiente atual nao possui `pytest` instalado, o que impede validacao automatizada completa nesta maquina
- o workspace atual nao possui `node_modules`, entao a validacao do frontend por `tsc` e `vite build` nao pode ser executada
- ainda existem outros modulos do produto que continuam concentrados no dashboard e precisam ser modularizados nas proximas sprints

Metricas da sprint:

- 1 documento arquitetural corrigido
- 1 contrato central de relatorio corrigido
- 1 arquivo de testes de integracao refeito
- 1 arquivo adicional de testes de integracao ampliado
- 1 fluxo critico de transacoes corrigido no backend
- 1 fluxo critico de transacoes corrigido no frontend
- 3 componentes analiticos conectados a dados reais da API
- 1 utilitario de exportacao refeito para usar dados reais

Aprendizados:

- a divergencia mais perigosa nao estava apenas no codigo, mas tambem na documentacao desatualizada
- o fluxo de relatorios precisava de contrato mais explicito antes de qualquer evolucao analitica maior
- o dashboard acumulava responsabilidade de visualizacao e regra de filtro demais, o que reforca a necessidade de modularizacao na proxima fase

Proxima sprint:

- Sprint 2. Organizacao do Produto e Navegacao

### Sprint 2. Organizacao do Produto e Navegacao

Status:
- concluida

Objetivo:
- reduzir o acoplamento do produto ao dashboard e preparar a navegacao modular do frontend

Escopo concluido:

- alinhamento do workspace TypeScript para usar `plutsgrip-front/src` como base real da aplicacao
- restauracao da build de producao na raiz do repositorio com `tsc -b && vite build`
- execucao de `npm audit fix` com eliminacao das vulnerabilidades reportadas nas dependencias
- abertura de rotas protegidas reais para `dashboard`, `transactions`, `categories`, `reports` e `settings`
- sincronizacao da navegacao lateral do dashboard com a URL para comecar a separar modulos por rota
- aplicacao de lazy loading nas paginas principais para reduzir o peso do bundle inicial
- criacao de uma shell protegida compartilhada para navegacao lateral, logout e contexto de idioma
- separacao das areas protegidas em paginas reais de overview, transacoes, categorias, relatorios e configuracoes
- reducao adicional do acoplamento do dashboard, que deixou de concentrar a navegacao e passou a focar apenas em visao geral

Entregas visiveis:

- a aplicacao volta a compilar em producao a partir da raiz do projeto
- as vulnerabilidades identificadas por `npm audit` foram reduzidas a zero
- o usuario consegue navegar entre modulos por caminhos reais, e nao apenas por abas internas locais
- o bundle de producao deixou de sair em um unico arquivo principal gigante, passando a gerar chunks separados
- a area autenticada agora tem uma estrutura de shell reaproveitavel, pronta para evolucoes futuras por dominio
- cada modulo central ja possui ponto de entrada proprio, mesmo quando ainda reutiliza componentes da fase anterior

Nao concluido:

- saneamento da base de lint historica do frontend
- modularizacao de dominios adicionais como orcamentos, metas e recorrencias
- nova rodada de code splitting fino para componentes analiticos mais pesados

Riscos e impedimentos:

- o frontend ainda carrega uma divida de lint anterior a esta sprint, com erros historicos em testes, utilitarios e componentes compartilhados
- o maior chunk de frontend ainda ficou acima do limiar de aviso do Vite e vai exigir nova rodada de code splitting ou `manualChunks`

Metricas da sprint ate aqui:

- 1 build de producao restaurada
- 1 rodada de `npm audit fix` executada com 0 vulnerabilidades restantes
- 5 rotas protegidas reais habilitadas para modulos centrais
- 1 primeira rodada de code splitting aplicada nas rotas principais
- 1 shell autenticada compartilhada criada
- 5 paginas modulares reais estruturadas sobre a shell protegida

Aprendizados:

- parte do acoplamento atual nao estava apenas nos componentes, mas tambem na configuracao da raiz do workspace
- a migracao para navegacao modular pode avancar de forma incremental sem reescrever toda a shell da aplicacao de uma vez
- a melhoria de bundle responde bem a lazy loading, mas o dashboard ainda concentra codigo demais para ficar realmente leve

Proxima sprint:

- Sprint 3. Consolidacao do Nucleo Financeiro

### Sprint 3. Consolidacao do Nucleo Financeiro

Status:
- concluida

Objetivo:
- fechar o produto base ja suportado pela API e transformar os modulos financeiros centrais em experiencia utilizavel ponta a ponta

Escopo concluido:

- extensao da shell protegida para incluir navegacao real de orcamentos, metas e recorrencias
- criacao de paginas reais para `budgets`, `goals` e `recurring`, integradas aos endpoints existentes
- consolidacao da area de transacoes e visao geral em paginas separadas sobre a shell compartilhada
- integracao de orcamentos com listagem, criacao, exclusao e consulta de status por categoria
- integracao de metas com criacao, resumo agregado, progresso, conclusao e exclusao
- integracao de transacoes recorrentes com criacao, listagem, alternancia de status e exclusao
- alinhamento dos tipos do frontend para suportar melhor contratos de orcamentos, metas, progresso e recorrencias
- validacao de build do frontend e validacao sintatica do backend apos a consolidacao dos modulos

Entregas visiveis:

- o usuario agora navega por modulos financeiros reais, nao apenas por dashboard e relatorios
- orcamentos, metas e recorrencias deixaram de existir apenas na API e passaram a ter interface funcional
- o dashboard ficou mais focado em visao geral, enquanto os demais dominios ganharam pontos de entrada proprios

Nao concluido:

- edicao completa de orcamentos, metas e recorrencias em formularios dedicados
- cobertura automatizada especifica de frontend para os novos modulos
- limpeza da divida historica de lint do frontend

Riscos e impedimentos:

- a base ainda carrega passivos antigos de lint e componentes compartilhados que nao foram o foco desta sprint
- o bundle analitico segue pesado, embora a aplicacao esteja dividida em rotas e chunks melhores

Metricas da sprint:

- 3 novos modulos funcionais entregues sobre a shell protegida
- 3 novas rotas de dominio adicionadas ao produto autenticado
- 1 rodada completa de build do frontend aprovada apos a consolidacao dos modulos
- 1 validacao sintatica do backend aprovada apos os ajustes de contratos no frontend

Aprendizados:

- a API ja tinha boa parte do nucleo financeiro pronta, e o gargalo principal era a ausencia de interfaces utilizaveis por dominio
- separar visao geral de modulo operacional reduz ambiguidade do produto e deixa o roadmap seguinte mais limpo

Proxima sprint:

- Sprint 4. Redesign da Experiencia Financeira

### Sprint 4. Redesign da Experiencia Financeira

Status:
- concluida

Objetivo:
- melhorar clareza, hierarquia visual e percepcao de valor do produto, reduzindo a sensacao de CRUD com graficos e reforcando a ideia de cockpit financeiro

Escopo concluido:

- definicao de uma direcao visual mais editorial para o produto, com nova paleta, tipografia e atmosfera de interface
- revisao dos tokens globais de estilo e do fundo da aplicacao em `index.css`
- criacao de um cabecalho reutilizavel de pagina para padronizar narrativa, contexto e acao nos modulos
- redesign da shell autenticada para uma navegacao mais elegante, com maior identidade visual e melhor separacao entre navegação e conteudo
- redesign do dashboard para destacar leitura de decisao, filtros como camada de sinal e cards de metricas com mais hierarquia
- refinamento visual das paginas de transacoes, categorias, orcamentos, metas, recorrencias, relatorios e configuracoes com headers consistentes e superficies mais maduras

Entregas visiveis:

- a aplicacao passou a ter uma identidade visual mais coesa e memoravel
- os modulos protegidos agora compartilham uma linguagem comum de entrada, contexto e ritmo visual
- o dashboard comunica mais claramente “visao geral e decisao” do que “lista com graficos”

Nao concluido:

- auditoria completa de acessibilidade visual e contraste apos o redesign
- uma rodada dedicada de refinamento fino em componentes legados internos como relatorios e gerenciadores de categoria
- eliminacao da divida historica de lint do frontend

Riscos e impedimentos:

- ainda ha componentes antigos com estilo interno menos alinhado que vao precisar de polimento adicional nas proximas sprints
- a identidade visual evoluiu bem na shell e nos headers, mas alguns blocos operacionais ainda carregam heranca visual da fase anterior

Metricas da sprint:

- 1 shell autenticada redesenhada
- 1 sistema de header reutilizavel criado para modulos
- 8 areas protegidas beneficiadas por nova hierarquia visual
- 1 build de frontend validada apos o redesign
- 1 validacao sintatica de backend reaprovada para garantir ausencia de regressao estrutural

Aprendizados:

- a experiencia melhorou mais quando a hierarquia narrativa foi tratada junto com a estetica, e nao apenas por troca de cores
- a shell compartilhada criada na Sprint 2 acelerou bastante o redesign da Sprint 4, porque reduziu o custo de propagar a linguagem visual

Proxima sprint:

- Sprint 5. Planejamento Financeiro

### Sprint 5. Planejamento Financeiro

Status:
- concluida

Objetivo:
- introduzir o primeiro bloco forte de inteligencia de negocio, transformando renda mensal e orcamentos existentes em um plano financeiro legivel e acionavel

Escopo concluido:

- criacao de uma rota e modulo dedicados de planejamento financeiro
- extensao da shell autenticada para incorporar a area de planejamento como dominio proprio do produto
- implementacao de leitura 50-30-20 com percentuais editaveis para essenciais, estilo de vida e poupanca
- implementacao de leitura de orcamento base zero com comparativo entre renda mensal e alocacao total
- mapeamento de categorias de despesa para blocos de planejamento, com persistencia local das atribuicoes
- geracao de sugestoes mensais por categoria com base em bucket alvo e historico recente de despesas
- integracao do modulo com dados reais de categorias, orcamentos, transacoes e resumo financeiro do mes atual

Entregas visiveis:

- o usuario agora possui um modulo proprio para planejar o mes, e nao apenas registrar e revisar historico
- a aplicacao exibe metas de alocacao por bloco financeiro e mostra quanto esta planejado e realizado em cada um
- o produto passa a oferecer uma leitura inicial de distribuicao da renda, folga de caixa e sugestao de envelopes por categoria

Nao concluido:

- persistencia em backend das configuracoes de planejamento e do mapeamento de categorias por bucket
- criacao automatica de orcamentos a partir das sugestoes do planejador
- simulacoes mais avancadas de cenarios, ajustes sazonais e planejamento multi-periodo

Riscos e impedimentos:

- nesta primeira versao, parte do planejamento e persistida localmente no navegador por falta de entidade dedicada no backend
- o modelo 50-30-20 ainda depende de classificacao manual ou inferida das categorias, o que pede refinamento futuro

Metricas da sprint:

- 1 novo modulo de planejamento adicionado ao produto autenticado
- 1 nova rota financeira de alto nivel incorporada a shell
- 3 blocos de planejamento operacionalizados: 50-30-20, base zero e sugestao por categoria
- 1 build de frontend validada apos a entrega do modulo
- 1 validacao sintatica de backend reaprovada

Aprendizados:

- o passo mais importante desta sprint nao foi apenas calcular percentuais, mas transformar dados ja existentes em um artefato de decisao compreensivel
- o produto ja tinha informacao suficiente para iniciar planejamento antes mesmo de introduzir um dominio backend especifico para isso

Proxima sprint:

- Sprint 6. Saude Financeira

### Sprint 6. Saude Financeira

Status:
- concluida

Objetivo:
- transformar o app em um termometro financeiro, capaz de sintetizar reserva, resiliencia, pressao fixa e ritmo de poupanca em uma leitura unica e acionavel

Escopo concluido:

- criacao de uma rota e modulo dedicados de saude financeira no frontend autenticado
- extensao da shell protegida para incorporar a area de saude como dominio proprio do produto
- implementacao de score interno de saude financeira combinando cobertura de reserva, taxa de poupanca, pressao fixa e equilibrio mensal
- calculo da reserva ideal com base em custo essencial mensal e meta configuravel de meses de cobertura
- calculo da cobertura atual da reserva a partir de metas identificadas como reserva, emergencia ou poupanca
- implementacao de indice estimado de dividas usando transacoes recorrentes e despesas mensais com sinais de cartao, financiamento ou servico de divida
- criacao de diagnosticos centrais e recomendacoes praticas por faixa de risco
- persistencia local das premissas de saude financeira para permitir calibracao do benchmark por usuario
- validacao de build do frontend e validacao sintatica do backend apos a entrega

Entregas visiveis:

- o usuario agora possui uma area propria para entender sua saude financeira em poucos minutos
- o produto exibe score, benchmark, cobertura da reserva, carga fixa, pressao de dividas e ritmo de poupanca em uma leitura unificada
- a experiencia deixa de tratar planejamento e saude como a mesma coisa, abrindo uma camada mais diagnostica e orientada a decisao

Nao concluido:

- persistencia em backend das configuracoes e heuristicas de saude financeira
- modelagem explicita de dividas, passivos e patrimonio no dominio backend
- testes automatizados dedicados para o score e para as heuristicas de classificacao financeira

Riscos e impedimentos:

- nesta primeira versao, a leitura de dividas ainda e estimada por heuristicas de descricao, categoria e recorrencia, porque o produto nao possui entidade propria para passivos
- a leitura de reserva depende da existencia de metas identificaveis como reserva ou poupanca, o que pode subestimar o caixa de usuarios que ainda nao organizam metas dessa forma
- as premissas de benchmark e persistidas localmente no navegador, o que resolve a experiencia inicial, mas ainda nao fecha o dominio de forma multi-dispositivo

Metricas da sprint:

- 1 novo modulo de saude financeira adicionado ao produto autenticado
- 1 nova rota de alto nivel incorporada a shell
- 4 diagnosticos centrais operacionalizados: reserva, pressao fixa, dividas e poupanca
- 1 score interno de saude financeira entregue com benchmark acionavel
- 1 build de frontend validada apos a entrega do modulo
- 1 auditoria de dependencias executada com `npm audit` sem vulnerabilidades
- 1 validacao sintatica de backend reaprovada

Aprendizados:

- o produto ja tinha sinal suficiente para entregar leitura de saude financeira relevante antes mesmo de introduzir um dominio backend dedicado para passivos
- a combinacao de planejamento configurado na sprint anterior com dados reais do mes atual reduziu bastante o custo para criar um benchmark inicial de resiliencia
- a proxima evolucao natural precisa sair de heuristica e caminhar para modelagem explicita de dividas, patrimonio e fluxo futuro

Proxima sprint:

- Sprint 7. Projecao e Fluxo de Caixa Futuro

### Sprint 7. Projecao e Fluxo de Caixa Futuro

Status:
- concluida

Objetivo:
- levar o produto do diagnostico para a previsao, permitindo ao usuario enxergar risco de caixa antes que ele aconteca

Escopo concluido:

- criacao de uma rota e modulo dedicados de projecao de caixa futuro no frontend autenticado
- extensao da shell protegida para incorporar a area de projecao como dominio proprio do produto
- implementacao de horizonte de saldo projetado para 30, 60 e 90 dias
- simulacao diaria de saldo futuro a partir de um saldo inicial configuravel e de um piso de seguranca ajustavel
- uso de datas reais das transacoes recorrentes para compor eventos futuros de entrada e saida
- uso do historico recente de 90 dias para estimar o ritmo diario medio de entradas e saidas nao recorrentes
- destaque de ponto minimo projetado, primeira data de risco e velocidade de deterioracao do caixa
- persistencia local das premissas de projecao para permitir calibracao rapida sem criar um dominio backend novo nesta fase
- validacao de build do frontend, validacao sintatica do backend e nova auditoria de dependencias

Entregas visiveis:

- o usuario agora possui uma area propria para prever saldo futuro e nao apenas olhar passado ou diagnostico atual
- o produto exibe saldos projetados para 30, 60 e 90 dias com leitura de risco clara
- a aplicacao passou a destacar quando o caixa cruza o piso de seguranca e qual e o pior ponto previsto da janela

Nao concluido:

- modelagem backend dedicada de saldo consolidado por conta, patrimonio e fluxo de caixa multi-conta
- calibracao mais fina da projecao por sazonalidade, calendario mensal e comportamento por categoria
- testes automatizados especificos para o motor de simulacao e para a geracao de eventos recorrentes

Riscos e impedimentos:

- nesta primeira versao, o saldo inicial ainda e informado ou ajustado localmente pelo usuario, porque o produto nao possui um dominio de contas com saldo consolidado
- a projecao usa uma media historica simples para o componente nao recorrente, o que funciona bem como primeira leitura, mas ainda nao captura sazonalidade profunda
- as recorrencias mensais usam uma aproximacao pratica de calendario para manter a simulacao simples e previsivel nesta etapa

Metricas da sprint:

- 1 novo modulo de projecao financeira adicionado ao produto autenticado
- 1 nova rota de alto nivel incorporada a shell
- 3 horizontes futuros operacionalizados: 30, 60 e 90 dias
- 1 simulador diario de saldo com eventos recorrentes entregue ao usuario final
- 1 build de frontend validada apos a entrega do modulo
- 1 auditoria de dependencias executada com `npm audit` sem vulnerabilidades
- 1 validacao sintatica de backend reaprovada

Aprendizados:

- a combinacao de recorrencias reais com um ritmo medio historico ja gera uma previsao suficientemente util para apontar risco com baixo custo de implementacao
- a maior lacuna agora nao e mais visual ou de navegacao, mas sim de modelagem de saldo e de calibracao analitica
- a proxima evolucao natural e aprofundar leitura historica e comportamento por categoria, preparando o terreno para insights e sazonalidade

Proxima sprint:

- Sprint 8. Insights e Sazonalidade

### Sprint 8. Insights e Sazonalidade

Status:
- concluida

Objetivo:
- evoluir a leitura historica do produto para um plano de insights comportamentais, com foco em sazonalidade, concentracao e desvios recentes

Escopo concluido:

- criacao de uma rota e modulo dedicados de insights e sazonalidade no frontend autenticado
- extensao da shell protegida para incorporar a area de insights como dominio proprio do produto
- analise de concentracao das despesas do mes atual com destaque para o peso das tres categorias lideres
- analise de movimento recente comparando o gasto do mes contra a media dos tres meses anteriores
- leitura de sazonalidade por categoria com base nos ultimos 12 meses de despesas
- identificacao de categorias com amplitude historica suficiente para sinalizar picos recorrentes
- geracao de um feed textual de insights priorizando risco de concentracao, aceleracao de gasto e sinais sazonais relevantes
- reaproveitamento dos endpoints e dados historicos ja existentes para entregar valor sem depender de um motor backend novo nesta etapa
- validacao de build do frontend, validacao sintatica do backend e nova auditoria de dependencias

Entregas visiveis:

- o usuario agora possui uma area propria para ler comportamento e tendencias, nao apenas saldo, planejamento ou projecao
- o produto passou a destacar se o gasto esta concentrado demais, acelerando ou se existe categoria com pico historico previsivel
- a aplicacao entrega uma camada inicial de recomendacao textual baseada em dados reais do historico

Nao concluido:

- analise trimestral e comparativos sazonais mais profundos por janela fixa
- custo de oportunidade de saldo parado e simulacoes de impacto financeiro por categoria
- testes automatizados especificos para o motor de insights e para as regras de deteccao de sazonalidade

Riscos e impedimentos:

- nesta primeira versao, a sazonalidade depende do volume historico disponivel e pode ficar conservadora em bases ainda curtas
- o feed de insights ainda usa regras heuristicas simples, o que e adequado para a fase atual, mas ainda nao substitui uma camada mais robusta de inteligencia
- a leitura de concentracao considera o mes corrente, entao parte do sinal pode variar conforme o momento em que o usuario consulta a pagina

Metricas da sprint:

- 1 novo modulo de insights adicionado ao produto autenticado
- 1 nova rota de alto nivel incorporada a shell
- 3 blocos analiticos entregues ao usuario: concentracao, movimento recente e sazonalidade
- 1 feed textual de insights acionaveis incorporado ao produto
- 1 build de frontend validada apos a entrega do modulo
- 1 auditoria de dependencias executada com `npm audit` sem vulnerabilidades
- 1 validacao sintatica de backend reaprovada

Aprendizados:

- boa parte do valor analitico desta fase veio mais da sintese e da narrativa dos dados do que de novos endpoints
- a combinacao de historico de transacoes, tendencias mensais e padroes de gasto ja sustenta uma camada inicial de inteligencia comportamental
- o proximo passo natural agora e tornar o produto proativo, transformando esses sinais em alertas e deteccao de anomalias

Proxima sprint:

- Sprint 9. Alertas Proativos e Deteccao de Anomalias

### Sprint 9. Alertas Proativos e Deteccao de Anomalias

Status:
- concluida

Objetivo:
- transformar os sinais analiticos das sprints anteriores em comportamento proativo do produto, com alertas auditaveis e de valor pratico

Escopo concluido:

- criacao de uma rota e modulo dedicados de alertas no frontend autenticado
- extensao da shell protegida para incorporar a central de alertas como dominio proprio do produto
- consolidacao de alertas de ruptura de orcamento e de consumo critico de budgets ja perto do limite
- deteccao inicial de anomalias de gasto por comparacao com a media historica da categoria
- identificacao de recorrencias de maior peso mensal para revisao ativa pelo usuario
- criacao de alerta de risco de caixa baseado na aceleracao recente das saidas
- priorizacao visual por severidade, separando sinais criticos, atencoes e informativos
- validacao de build do frontend, validacao sintatica do backend e nova auditoria de dependencias

Entregas visiveis:

- o produto agora possui uma central unica para leitura proativa de risco financeiro
- o usuario passa a ser avisado quando orcamentos rompem, quando gastos disparam acima do padrao e quando recorrencias merecem revisao
- os sinais produzidos em projecao, budgets e historico finalmente aparecem como alertas acionaveis, e nao apenas como leitura passiva

Nao concluido:

- notificacoes push, email ou automacoes fora da interface
- deduplicacao mais sofisticada entre alertas parecidos em janelas consecutivas
- testes automatizados especificos para o motor de regras de alerta e thresholds de anomalia

Riscos e impedimentos:

- nesta primeira versao, os thresholds de anomalia ainda sao heuristicas simples e podem precisar ajuste fino com uso real
- a central de alertas e apenas in-product, entao ainda depende de o usuario abrir a aplicacao para perceber os sinais
- o alerta de risco de caixa usa aceleracao recente de saidas como proxy, o que funciona bem como sinal inicial, mas ainda nao substitui uma modelagem integrada com o motor completo de projecao

Metricas da sprint:

- 1 novo modulo de alertas adicionado ao produto autenticado
- 1 nova rota de alto nivel incorporada a shell
- 4 classes de alerta operacionalizadas: budget, anomalia, recorrencia e risco de caixa
- 1 central de priorizacao por severidade entregue ao usuario final
- 1 build de frontend validada apos a entrega do modulo
- 1 auditoria de dependencias executada com `npm audit` sem vulnerabilidades
- 1 validacao sintatica de backend reaprovada

Aprendizados:

- os dados e modulos criados nas sprints anteriores ja eram suficientes para sustentar uma camada proativa sem depender de novas APIs
- a diferenca entre analise e valor percebido pelo usuario aparece quando o sinal vira alerta claro, curto e acionavel
- a proxima etapa natural agora e entrar na camada de automacao, integracoes e seguranca avancada para dar escala e maturidade ao ecossistema

Proxima sprint:

- Sprint 10. Automacao, Integracoes e Seguranca Avancada

### Sprint 10. Automacao, Integracoes e Seguranca Avancada

Status:
- concluida

Objetivo:
- preparar o produto para um novo patamar de maturidade, com reforco de seguranca, governanca de consentimento e prontidao executavel para integracoes futuras

Escopo concluido:

- expansao da area de Configuracoes para uma central de seguranca, privacidade e consentimento
- implementacao de modo de privacidade local na formatacao monetaria centralizada
- criacao de controles locais de consentimento para Open Finance, importacao NFC-e, analiticos do produto e politica local pronta para biometria
- exposicao clara da limitacao atual de autenticacao com `localStorage` e do alvo de producao com cookies `httpOnly`
- criacao de uma trilha visual de prontidao para integracoes em tres fases
- consolidacao do backlog executivo de seguranca e integracoes em documento dedicado
- validacao de build do frontend, validacao sintatica do backend e nova auditoria de dependencias
- execucao pratica da aplicacao local com verificacao da jornada publica e da area autenticada simulada

Entregas visiveis:

- o produto agora comunica explicitamente sua postura de seguranca e privacidade dentro da propria experiencia
- o usuario consegue ativar modo de privacidade e registrar consentimentos locais sem depender de backlog invisivel
- a aplicacao ganhou um ponto claro de preparacao para NFC-e e Open Finance, em vez de manter essa discussao apenas no plano

Nao concluido:

- migracao real da autenticacao para cookies `httpOnly`
- entidades backend dedicadas para consentimentos, provedores e contas conectadas
- automacoes externas de notificacao e ingestao financeira

Riscos e impedimentos:

- a autenticacao continua em estrategia provisoria no frontend, o que ja fica explicitado na interface, mas ainda precisa de migracao real
- a governanca de consentimento desta etapa ainda e local ao navegador, e nao multi-dispositivo
- o teste pratico completo de cadastro e login foi bloqueado por ausencia de PostgreSQL acessivel no ambiente local, gerando `500` no backend por `ConnectionRefusedError`

Metricas da sprint:

- 1 area de Configuracoes expandida para seguranca e privacidade
- 1 modo de privacidade entregue sobre a formatacao monetaria centralizada
- 4 controles locais de consentimento adicionados ao produto
- 1 documento executivo de seguranca e integracoes criado
- 1 build de frontend validada apos a entrega
- 1 auditoria de dependencias executada com `npm audit` sem vulnerabilidades
- 1 validacao sintatica de backend reaprovada
- 1 rodada pratica de usabilidade executada em ambiente local

Aprendizados:

- a ultima camada de maturidade do produto nao depende apenas de codigo de integracao, mas de governanca, consentimento e narrativa clara de seguranca
- o frontend agora comunica bem o estado-alvo de seguranca, mas a migracao real de sessao segue sendo o maior ponto estrutural em aberto
- o maior bloqueio da rodada pratica nao foi UX do frontend, e sim dependencia de infraestrutura local para a jornada autenticada completa

Proxima sprint:

- backlog concluido no plano atual; proximo ciclo recomendado: implementacao real de sessao segura, consentimentos persistidos em backend e preparacao de ingestao financeira

---

## Template de atualizacao por sprint

Copiar a estrutura abaixo ao fim de cada sprint:

### Sprint X. Nome da Sprint

Status:
- planejada | em andamento | concluida

Objetivo:
- objetivo principal da sprint

Escopo concluido:

- item 1
- item 2
- item 3

Entregas visiveis:

- entrega 1
- entrega 2

Nao concluido:

- item 1
- item 2

Riscos e impedimentos:

- risco 1
- risco 2

Metricas da sprint:

- metrica 1
- metrica 2

Aprendizados:

- aprendizado 1
- aprendizado 2

Proxima sprint:

- nome e foco da proxima sprint
