# Mapeamento Excel × Supabase — Módulo de Compras (Etapa 3.1)

**Projeto:** Central de Gestão Só Sal  
**Branch:** `feat/compras`  
**Base de referência:** `main` (commit `242e980d4e309be1a641bbc39b2f9b38c1caf871`)  
**Data:** 2026-11-13  
**Status:** Matriz não preenchida — limitações registradas

---

## 1. Limitações Encontradas

### 1.1 Planilha de referência não disponível

**Fato verificado:** Nenhum arquivo de planilha (`.xlsx`, `.xlsm`, `.xltx`, `.csv`, `.tsv`) foi encontrado no repositório por busca recursiva completa.

**Consequência:** Não foi possível identificar abas, campos, fórmulas ou transformações da planilha de gestão de compras.

### 1.2 Estrutura do Supabase não acessada

**Fato verificado:**
- Não existem arquivos `.env` com credenciais de Supabase.
- `src/types/database.types.ts` está vazio (`Tables: Record<string, never>`).
- Não há scripts `.sql` nem pasta `supabase/` no repositório.
- Restrição de segurança: não acessar dados reais do Supabase sem `security-review` (AGENTS.md, regra 8).

**Consequência:** Não foi possível confirmar nenhuma tabela, view, coluna ou relacionamento do banco Supabase.

---

## 2. Matriz de Rastreabilidade (Não Preenchida)

A matriz abaixo não pode ser preenchida sem a planilha de referência e sem acesso autorizado ao Supabase.

| # | Área Operacional | Aba/Campo da Planilha | Cálculo/Transformação | Tabela/View Supabase | Coluna de Origem | Critério de Relacionamento | Necessidade de Transformação | Dados Ausentes | Pendências de Validação | Classificação |
|---|------------------|----------------------|----------------------|---------------------|------------------|---------------------------|------------------------------|----------------|------------------------|---------------|
| 1 | Pedidos de Compra | Não identificado | Não identificado | Não verificado | Não verificado | Não verificado | Não verificado | Todos | Todas | Não confirmado |
| 2 | Atendimento Fornecedor | Não identificado | Não identificado | Não verificado | Não verificado | Não verificado | Não verificado | Todos | Todas | Não confirmado |
| 3 | Painel OTB | Não identificado | Não identificado | Não verificado | Não verificado | Não verificado | Não verificado | Todos | Todas | Não confirmado |
| 4 | OTB | Não identificado | Não identificado | Não verificado | Não verificado | Não verificado | Não verificado | Todos | Todas | Não confirmado |
| 5 | Verba Comprador | Não identificado | Não identificado | Não verificado | Não verificado | Não verificado | Não verificado | Todos | Todas | Não confirmado |
| 6 | Plano de Estoque | Não identificado | Não identificado | Não verificado | Não verificado | Não verificado | Não verificado | Todos | Todas | Não confirmado |
| 7 | Produção Própria | Não identificado | Não identificado | Não verificado | Não verificado | Não verificado | Não verificado | Todos | Todas | Não confirmado |

**Classificação de todos os campos:** Não confirmado.

---

## 3. Legenda de Classificação

| Classificação | Significado |
|---------------|-------------|
| Disponível no Supabase | Campo confirmado como existente no banco Supabase, sem necessidade de transformação |
| Disponível mediante transformação | Campo existe no Supabase mas requer cálculo ou transformação para uso na planilha |
| Ausente | Campo não existe no Supabase; precisaria ser criado ou obtido de outra fonte |
| Não confirmado | Não foi possível verificar a existência do campo (limitação de acesso ou de planilha) |

---

## 4. Informações Parciais do Repositório

Apesar de não haver mapeamento possível, os seguintes artefatos de integração existem no código e podem orientar o mapeamento futuro:

### 4.1 DTO SISCOMPurchaseOrderDTO

Arquivo: `src/integration/siscom/contracts/purchase-order.dto.ts`

| Campo | Tipo | Observação |
|-------|------|------------|
| externalId | string | ID externo no SISCOM |
| supplierDocument | string | Documento do fornecedor |
| supplierName | string | Nome do fornecedor |
| totalAmount | number | Valor total |
| currency | string | Moeda |
| status | string | Status do pedido |
| createdAt | string | Data de criação |

**Observação:** Este DTO é para integração com o ERP SISCOM, não representa necessariamente tabelas do Supabase.

### 4.2 Porta PurchaseOrderSISCOMPort

Arquivo: `src/integration/siscom/ports/purchase-order.port.ts`

| Método | Retorno | Observação |
|--------|---------|------------|
| sendPurchaseOrder(dto) | Promise<SISCOMSyncResult> | Porta de saída; sem implementação ativa |

---

## 5. Pendências para Preenchimento da Matriz

1. Localizar e disponibilizar a planilha Excel de referência de compras.
2. Obter credenciais de ambiente para acesso ao Supabase.
3. Executar `security-review` antes de consultar o Supabase.
4. Gerar `database.types.ts` a partir do esquema real do Supabase.
5. Preencher a matriz campo a campo para cada uma das 7 áreas operacionais.
6. Classificar cada campo conforme a legenda da seção 3.

---

**Fim do mapeamento. Nenhuma correspondência foi inventada. Nenhum commit ou push foi efetuado.**
