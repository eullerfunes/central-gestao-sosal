# Auditoria Funcional — Módulo de Compras (Etapa 3.1)

**Projeto:** Central de Gestão Só Sal  
**Branch:** `feat/compras`  
**Base de referência:** `main` (commit `242e980d4e309be1a641bbc39b2f9b38c1caf871`)  
**Data:** 2026-11-13  
**Status:** Auditoria concluída, sem implementação de telas

---

## 1. Limitações Encontradas

### 1.1 Planilha de referência não disponível

**Fato verificado:** Nenhum arquivo de planilha (`.xlsx`, `.xlsm`, `.xltx`, `.csv`, `.tsv`) foi encontrado no repositório `C:\Users\PC\Desktop\central-gestao-sosal-1` (busca recursiva completa retornou zero resultados).

**Impacto:** As sete áreas operacionais do módulo de Compras não puderam ser auditadas contra a planilha de referência. Nenhum campo, fórmula, filtro ou indicador pôde ser identificado a partir da planilha.

**Classificação:** Limitação registrada — não inventar campos ou fórmulas (conforme AGENTS.md, regra 7).

### 1.2 Acesso ao Supabase não realizado

**Fato verificado:**
- Não existem arquivos `.env` no repositório.
- `src/lib/supabase/server.ts` e `src/lib/supabase/client.ts` retornam `null` quando as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` não estão definidas.
- `src/types/database.types.ts` está vazio: `Tables: Record<string, never>`, `Views: Record<string, never>`, `Functions: Record<string, never>`, `Enums: Record<string, never>`.
- Nenhuma pasta `supabase/` ou script `.sql` existe no repositório.

**Restrição aplicada:** Conforme AGENTS.md (regra 8) e restrição da Etapa 3.1, não foram acessados dados reais do Supabase sem validação de segurança (`security-review`).

**Classificação:** Auditoria do Supabase não executada — limitação registrada.

---

## 2. Áreas Operacionais do Módulo de Compras

As sete áreas abaixo foram identificadas no escopo do módulo de Compras, mas **não puderam ser auditadas funcionalmente** devido à ausência da planilha de referência e ao não-acesso ao Supabase.

| # | Área Operacional | Objetivo Operacional | Campos e Tipos | Tabelas/Bases | Fórmulas/Cálculos | Filtros/Indicadores | Relacionamentos | Operações Manuais | Dependências Externas | Regras Documentadas |
|---|------------------|---------------------|----------------|---------------|-------------------|---------------------|-----------------|-------------------|----------------------|---------------------|
| 1 | Pedidos de Compra | Não auditado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não documentada |
| 2 | Atendimento Fornecedor | Não auditado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não documentada |
| 3 | Painel OTB | Não auditado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não documentada |
| 4 | OTB | Não auditado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não documentada |
| 5 | Verba Comprador | Não auditado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não documentada |
| 6 | Plano de Estoque | Não auditado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não documentada |
| 7 | Produção Própria | Não auditado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não identificado | Não documentada |

**Classificação geral:** Todas as áreas estão como **Não confirmado**.

---

## 3. Auditoria do Supabase Existente

Não executada por falta de credenciais de ambiente e por restrição de segurança (não acessar dados reais sem `security-review`).

### 3.1 Estrutura de tipos no código

Arquivo: `src/types/database.types.ts`

```typescript
export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
```

**Fato verificado:** Nenhuma tabela, view, função ou enum está tipada no código TypeScript. O tipo `Database` está vazio.

### 3.2 Clientes Supabase

- `src/lib/supabase/server.ts` — `createSupabaseServerClient()`: retorna `null` sem env vars.
- `src/lib/supabase/client.ts` — `createSupabaseBrowserClient()`: retorna `null` sem env vars.

**Fato verificado:** Ambos os clientes são preparação apenas; nenhuma conexão ativa existe no código.

### 3.3 Tabelas/views/colunas/relacionamentos

Não verificados. Não há como confirmar a existência de tabelas de compras, estoque, vendas, fornecedores, pedidos, recebimentos, contas a pagar ou movimentações de planejamento sem acesso autorizado ao Supabase.

---

## 4. Mapeamento Excel × Supabase

Não executado. A matriz de rastreabilidade não pode ser preenchida sem:

1. A planilha de referência (não encontrada no repositório).
2. A estrutura real do Supabase (não acessada por restrição de segurança).

### 4.1 Classificação de campos (resumo)

| Campo da planilha | Cálculo/Transformação | Tabela/View Supabase | Coluna de origem | Critério de relacionamento | Necessidade de transformação | Dados ausentes | Pendências de validação | Classificação |
|-------------------|----------------------|---------------------|------------------|---------------------------|------------------------------|----------------|------------------------|---------------|
| Todos os campos das 7 áreas | Não identificados | Não verificados | Não verificados | Não verificados | Não verificados | Todos | Todas | Não confirmado |

**Classificação geral:** Todos os campos estão como **Não confirmado**.

---

## 5. Informações Verificadas no Repositório

Apesar das limitações acima, os seguintes fatos foram verificados no código e são relevantes para o módulo de Compras:

### 5.1 Módulo de Compras já registrado

Arquivo: `src/domains/shared/modules.ts`

```typescript
{ id: "compras", label: "Compras", path: "/compras", icon: "ShoppingCart", status: "em-desenvolvimento" }
```

**Fato verificado:** O módulo Compras já está registrado com status `"em-desenvolvimento"`.

### 5.2 Contratos SISCOM preparados

Arquivo: `src/integration/siscom/contracts/purchase-order.dto.ts`

DTOs definidos:
- `SISCOMPurchaseOrderDTO`: `externalId`, `supplierDocument`, `supplierName`, `totalAmount`, `currency`, `status`, `createdAt`
- `SISCOMSyncResult`: `sent`, `failed`, `errors`
- `SISCOMContractVersion`: `"1.0.0"`

Arquivo: `src/integration/siscom/ports/purchase-order.port.ts`

Porta definida: `PurchaseOrderSISCOMPort.sendPurchaseOrder(dto): Promise<SISCOMSyncResult>`

**Fato verificado:** Contratos e porta de saída para integração SISCOM existem, mas **sem comunicação ativa** (conforme skill `siscom-erp-integration`).

### 5.3 Estrutura de pastas modular

Conforme `docs/arquitetura-modular.md`, o domínio `compras` deve seguir:

```
src/domains/compras/
  domain/         # Entities, value objects, domain services, regras
  application/    # Use cases, application services
  infrastructure/ # Repositórios, adaptadores locais
  presentation/   # Componentes de UI específicos do módulo
  rules/          # Registro de regras de negócio (sosal-business-rules)
```

**Fato verificado:** Nenhuma dessas pastas existe ainda para compras.

### 5.4 Tipos de auth

Arquivo: `src/domains/shared/auth/types.ts`

```typescript
export type AuthSession = {
  user: { id: string; email: string | null; role: string | null } | null
  accessToken: string | null
}
```

**Fato verificado:** Suporte a autenticação com `user.id`, `user.email`, `user.role` e `accessToken`.

### 5.5 Classes de erro compartilhadas

Arquivo: `src/domains/shared/errors.ts`

- `AppError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`

**Fato verificado:** Infraestrutura de erros disponível para uso no domínio de compras.

---

## 6. Informações Já Existentes para Pedidos de Compra

Com base no que foi verificado, o seguinte já existe e pode ser aproveitado:

| Item | Status | Fonte |
|------|--------|-------|
| Módulo Compras registrado | ✅ Verificado | `src/domains/shared/modules.ts` |
| Rota `/compras` definida | ✅ Verificado | `src/domains/shared/modules.ts` |
| DTO SISCOMPurchaseOrderDTO | ✅ Verificado | `src/integration/siscom/contracts/purchase-order.dto.ts` |
| Porta PurchaseOrderSISCOMPort | ✅ Verificado | `src/integration/siscom/ports/purchase-order.port.ts` |
| Estrutura de pastas modular proposta | ✅ Verificado | `docs/arquitetura-modular.md` |
| Tipos de auth (usuário, role, token) | ✅ Verificado | `src/domains/shared/auth/types.ts` |
| Classes de erro (AppError, etc.) | ✅ Verificado | `src/domains/shared/errors.ts` |
| Utilitário `cn()` para classes CSS | ✅ Verificado | `src/lib/utils.ts` |

---

## 7. Informações Faltando

| Item | Motivo | Ação necessária |
|------|--------|-----------------|
| Planilha de referência | Não encontrada no repositório | Localizar e disponibilizar a planilha Excel de gestão de compras |
| Estrutura de tabelas Supabase | Não acessada (sem env vars + security-review) | Obter credenciais de ambiente e executar `security-review` antes de consultar |
| Tipos de banco (database.types.ts) | Vazio | Gerar a partir do Supabase após acesso autorizado |
| Regras de negócio de compras | Não documentadas | Documentar formalmente via skill `sosal-business-rules` |
| Campos e fórmulas das 7 áreas | Não auditados | Auditor a planilha quando disponível |

---

## 8. Regras de Negócio Pendentes

Conforme skill `sosal-business-rules`:

> "Nenhuma regra de compra está inventada nesta fase. As regras serão preenchidas aqui somente após documentação formal do domínio de compras do Só Sal."

As seguintes regras precisam de confirmação formal antes de qualquer implementação:

1. Fluxo de aprovação de pedidos de compra
2. Estados válidos de um pedido (rascunho, enviado, aprovado, recebido, cancelado)
3. Validações de campos obrigatórios
4. Regras de verba por comprador
5. Regras de OTB (Open To Buy)
6. Regras de atendimento a fornecedor
7. Regras de plano de estoque
8. Regras de produção própria
9. Regras de filiais e permissões de acesso
10. Regras de integração com SISCOM (quando ativado)

---

## 9. Próximos Passos (após aprovação)

1. Localizar e disponibilizar a planilha de referência de compras.
2. Obter credenciais de ambiente para acesso ao Supabase.
3. Executar `security-review` antes de qualquer consulta ao Supabase.
4. Gerar `database.types.ts` a partir do esquema real do Supabase.
5. Auditar a planilha contra as 7 áreas operacionais.
6. Preencher a matriz de rastreabilidade Excel × Supabase.
7. Documentar regras de negócio formalmente via `sosal-business-rules`.
8. Criar registro de regras em `src/domains/compras/domain/rules/registro.md`.
9. Somente após aprovação: iniciar implementação de Pedidos de Compra seguindo TDD.

---

## 10. Classificação de Confiança

| Item | Classificação | Base |
|------|--------------|------|
| Estrutura de pastas modular | Verificado | Código e docs existentes |
| Módulo Compras registrado | Verificado | `src/domains/shared/modules.ts` |
| Contratos SISCOM | Verificado | `src/integration/siscom/` |
| Tipos de auth | Verificado | `src/domains/shared/auth/types.ts` |
| Planilha de compras | Não encontrado | Busca recursiva no repositório |
| Estrutura Supabase | Não verificado | Sem env vars / sem security-review |
| Regras de negócio | Não documentadas | Conforme skill `sosal-business-rules` |

---

**Fim da auditoria funcional. Nenhuma tela de Compras foi criada. Nenhuma alteração no Supabase foi realizada. Nenhum commit ou push foi efetuado.**
