# Plano de Implementação — Módulo de Compras (Etapa 3.1)

**Projeto:** Central de Gestão Só Sal  
**Branch:** `feat/compras`  
**Base de referência:** `main` (commit `242e980d4e309be1a641bbc39b2f9b38c1caf871`)  
**Data:** 2026-11-13  
**Status:** Plano preliminar — aguardando aprovação para iniciar implementação

---

## 1. Objetivo

Definir o plano de implementação do módulo de Compras, priorizando **Pedidos de Compra** como primeiro caso de uso, conforme a arquitetura modular existente.

**Restrições absolutas:**
- Não criar telas de Compras nesta etapa (Etapa 3.1 é de auditoria e planejamento).
- Não executar migrations.
- Não alterar dados, tabelas, views, políticas ou permissões do Supabase.
- Não publicar na Vercel.
- Não fazer commit ou push sem autorização explícita.
- Não inventar regras de negócio.

---

## 2. Pré-requisitos (Antes de qualquer implementação)

Esses itens devem ser resolvidos antes de escrever código de produção do módulo:

| # | Pré-requisito | Status | Ação |
|---|--------------|--------|------|
| 1 | Localizar planilha de referência de compras | ❌ Não encontrada | Disponibilizar o Excel de gestão de compras |
| 2 | Obter credenciais de ambiente do Supabase | ❌ Não definidas | Configurar `.env` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 3 | Executar `security-review` | ❌ Não executado | Validar acesso ao Supabase, RLS, permissões |
| 4 | Gerar `database.types.ts` a partir do esquema real | ❌ Não gerado | Executar supabase CLI ou equivalente após acesso autorizado |
| 5 | Auditar planilha contra 7 áreas operacionais | ❌ Não executado | Preencher matriz de rastreabilidade |
| 6 | Documentar regras de negócio formalmente | ❌ Pendente | Preencher `src/domains/compras/domain/rules/registro.md` |
| 7 | Aprovação do plano | ❌ Pendente | Solicitar autorização para iniciar implementação |

---

## 3. Fases de Implementação (Priorizando Pedidos de Compra)

### Fase 1 — Domínio de Pedidos de Compra (sem tela)

**Objetivo:** Implementar entidades, value objects, domain services e validadores de Pedido de Compra seguindo TDD.

**Entidades hipotéticas (a validar):**
- `PedidoCompra`
- `ItemPedido`
- `Fornecedor` (se confirmado como entidade de compras)

**Casos de uso (a validar):**
- `CriarPedidoCompra`
- `ConsultarPedidoCompra`
- `ListarPedidosCompra`

**Artefatos a criar:**
```
src/domains/compras/
  domain/
    entities/pedido-compra.entity.ts
    entities/item-pedido.entity.ts
    value-objects/status-pedido.vo.ts
    value-objects/money.vo.ts
    domain-services/
    validators/
    exceptions/
    rules/
      registro.md
  application/
    use-cases/criar-pedido-compra.use-case.ts
    use-cases/consultar-pedido-compra.use-case.ts
    dto/
    ports/
  infrastructure/
    repositories/
  presentation/  # vazio nesta fase (sem telas)
```

**Testes:** Todo uso case e domain service deve ter teste falhando antes da implementação (TDD).

**Saída esperada:** Domínio de pedidos de compra implementado e testado, sem tela, sem alteração no Supabase.

---

### Fase 2 — Repositório e Infraestrutura (Supabase, apenas leitura)

**Objetivo:** Implementar repositórios que leem do Supabase existente (sem migrations, sem alterações).

**Artefatos a criar:**
```
src/domains/compras/
  infrastructure/
    repositories/pedido-compra.repository.ts
    repositories/fornecedor.repository.ts
    supabase/
      client.ts (wrapper sobre src/lib/supabase)
```

**Restrição:** Apenas leitura no Supabase existente. Nenhuma gravação, migration ou alteração de esquema.

**Saída esperada:** Repositórios capazes de consultar dados existentes do Supabase (se tabelas relevantes existirem e forem confirmadas).

---

### Fase 3 — Camada de Integração SISCOM (preparação apenas)

**Objetivo:** Preparar adaptadores e mapeadores para futura integração com SISCOM.

**Artefatos a preparar (sem comunicação ativa):**
```
src/integration/siscom/
  contracts/  # já existe: purchase-order.dto.ts
  adapters/   # a preparar
  anti-corruption/  # a preparar
  mappers/    # a preparar
  ports/      # já existe: purchase-order.port.ts
```

**Restrição:** Sem comunicação externa ativa até solicitação explícita.

---

### Fase 4 — Apresentação (Telas de Pedidos de Compra)

**Objetivo:** Implementar telas de Pedidos de Compra.

**Restrição:** Somente após aprovação explícita e após conclusão das fases 1-3.

**Não fazer nesta etapa (Etapa 3.1).**

---

## 4. Critérios de Aceite por Fase

| Fase | Critério de Aceite |
|------|-------------------|
| 1 — Domínio | Testes TDD passando, regras de negócio documentadas no registro, `security-review` aprovado quando aplicável |
| 2 — Infraestrutura | Repositórios compilam, consultas de leitura funcionam contra Supabase existente (se acessível) |
| 3 — SISCOM | Contratos e portas existentes são respeitados, sem comunicação ativa |
| 4 — Apresentação | Telas implementadas, acessíveis via rota `/compras`, integradas ao domínio |

---

## 5. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Planilha de referência não encontrada | Não é possível validar campos e fórmulas | Registrar limitação, aguardar disponibilização |
| Supabase inacessível | Não é possível confirmar tabelas nem gerar tipos | Obter credenciais, executar `security-review` |
| Regras de negócio não documentadas | Não é possível implementar validações de domínio | Documentar formalmente via `sosal-business-rules` |
| Inventar regras | Viola AGENTS.md (regra 7) | Apenas implementar regras documentadas formalmente |
| Alterar Supabase | Viola restrição absoluta | Apenas leitura, sem migrations |

---

## 6. Cronograma Indicativo (sujeito a aprovação)

| Semana | Atividade | Entregável |
|--------|-----------|------------|
| 1 | Pré-requisitos (planilha, env vars, security-review) | Plano aprovado |
| 2-3 | Fase 1 — Domínio de Pedidos de Compra (TDD) | Entidades, use cases, testes |
| 4 | Fase 2 — Repositório Supabase (leitura) | Repositórios implementados |
| 5 | Fase 3 — Preparação SISCOM (sem ativação) | Adaptadores preparados |
| 6+ | Fase 4 — Telas (após aprovação) | Telas de Pedidos de Compra |

---

## 7. Arquivos de Documentação Gerados

| Documento | Caminho | Conteúdo |
|-----------|---------|----------|
| Auditoria Funcional | `docs/compras/auditoria-funcional.md` | Limitações, áreas operacionais, auditoria Supabase, mapeamento Excel×Supabase |
| Mapeamento Excel × Supabase | `docs/compras/mapeamento-excel-supabase.md` | Matriz de rastreabilidade (não preenchida por limitações) |
| Modelo de Dados Preliminar | `docs/compras/modelo-dados-preliminar.md` | Entidades, casos de uso, repositórios, serviços hipotéticos |
| Regras de Negócio Pendentes | `docs/compras/regras-negocio-pendentes.md` | Regras que precisam de confirmação formal |
| Plano de Implementação | `docs/compras/planejamento-implementacao.md` | Este documento |

---

## 8. Próxima Ação Necessária

**Solicitar aprovação para:**

1. Disponibilizar a planilha de referência de compras.
2. Fornecer credenciais de ambiente para acesso ao Supabase.
3. Executar `security-review`.
4. Autorizar início da implementação da Fase 1 (Domínio de Pedidos de Compra).

**Não iniciar implementação sem aprovação.**

---

**Fim do plano de implementação. Nenhuma tela criada. Nenhuma alteração no Supabase. Nenhum commit ou push efetuado.**
