# Modelo de Dados Preliminar — Módulo de Compras (Etapa 3.1)

**Projeto:** Central de Gestão Só Sal  
**Branch:** `feat/compras`  
**Base de referência:** `main` (commit `242e980d4e309be1a641bbc39b2f9b38c1caf871`)  
**Data:** 2026-11-13  
**Status:** Proposta preliminar — sem regras de negócio confirmadas, sem tabelas Supabase verificadas

---

## 1. Observação Importante

Este modelo de dados é **preliminar e hipotético**. Foi elaborado com base na estrutura de pastas modular existente e nos contratos SISCOM já preparados, mas:

- Nenhuma tabela do Supabase foi verificada (não acessada por restrição de segurança).
- Nenhuma regra de negócio foi documentada (conforme skill `sosal-business-rules`).
- Nenhum campo, fórmula ou estado de pedido foi confirmado a partir da planilha (não encontrada).

Este modelo serve apenas como ponto de partida para discussão e deve ser revisado após auditoria da planilha e acesso autorizado ao Supabase.

---

## 2. Princípios Arquiteturais Aplicados

Conforme `docs/arquitetura-modular.md`:

1. **Domínio autocontido:** O módulo `compras` possui domínio, aplicação e infraestrutura próprios.
2. **Shared kernel mínimo:** Apenas auth, tipos comuns e exceções são compartilhados via `src/domains/shared/`.
3. **Dependência direcionada:** `presentation` → `application` → `domain` → `infrastructure`.
4. **Anti-corruption layer (SISCOM):** O domínio nunca conhece o modelo do SISCOM diretamente.
5. **Supabase existente inalterado:** Nenhuma migration ou alteração de esquema.

---

## 3. Estrutura de Pastas Proposta

```
src/domains/compras/
  domain/
    entities/         # Entidades de domínio (ex: PedidoCompra, ItemPedido, Fornecedor)
    value-objects/    # Value objects (ex: Money, StatusPedido, DocumentoFornecedor)
    domain-services/  # Serviços de domínio (ex: calculoVerbaComprador, validacaoOTB)
    validators/       # Validadores de domínio
    exceptions/       # Exceções de domínio específicas de compras
    rules/            # Registro de regras de negócio (sosal-business-rules)
      registro.md
  application/
    use-cases/        # Casos de uso (ex: criarPedidoCompra, aprovarPedido, receberPedido)
    application-services/ # Serviços de aplicação
    dto/              # DTOs de entrada/saída dos use cases
    ports/            # Portas de saída (interfaces definidas pelo domínio)
  infrastructure/
    repositories/     # Implementações de repositórios (Supabase)
    supabase/         # Clientes e tipos Supabase específicos de compras
  presentation/
    components/       # Componentes de UI específicos do módulo
    hooks/            # Hooks React específicos
    validations/      # Schemas de validação (zod)
```

**Status:** Nenhuma dessas pastas existe ainda.

---

## 4. Entidades Hipotéticas (Não Confirmadas)

As entidades abaixo são propostas com base no domínio de compras típico, mas **não foram validadas contra a planilha nem contra o Supabase**.

### 4.1 Pedido de Compra (hipotético)

| Campo | Tipo | Observação |
|-------|------|------------|
| id | string (UUID) | Identificador primário |
| numero | string | Número do pedido |
| fornecedorId | string | Referência ao fornecedor |
| filialId | string | Identificador de filial |
| dataPedido | date | Data do pedido |
| status | string | Status (rascunho, enviado, aprovado, recebido, cancelado) |
| totalAmount | number | Valor total |
| currency | string | Moeda |
| observacoes | string | Observações |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Data de atualização |
| createdBy | string | Usuário que criou |

### 4.2 Item do Pedido (hipotético)

| Campo | Tipo | Observação |
|-------|------|------------|
| id | string (UUID) | Identificador primário |
| pedidoId | string | Referência ao pedido |
| produtoId | string | Referência ao produto |
| descricao | string | Descrição do item |
| quantidade | number | Quantidade solicitada |
| precoUnitario | number | Preço unitário |
| subtotal | number | Quantidade × preço unitário |
| prazoEntrega | date | Prazo de entrega esperado |

### 4.3 Fornecedor (hipotético)

| Campo | Tipo | Observação |
|-------|------|------------|
| id | string (UUID) | Identificador primário |
| nome | string | Nome do fornecedor |
| documento | string | CPF/CNPJ |
| contato | string | Contato comercial |
| email | string | E-mail |
| ativo | boolean | Se está ativo |

### 4.4 Verba Comprador (hipotético)

| Campo | Tipo | Observação |
|-------|------|------------|
| id | string (UUID) | Identificador primário |
| compradorId | string | Identificador do comprador |
| filialId | string | Identificador de filial |
| periodo | string | Período (ex: "2026-11") |
| valorTotal | number | Verba total alocada |
| valorUtilizado | number | Verba já utilizada |
| valorDisponivel | number | Verba restante |

### 4.5 OTB (Open To Buy) (hipotético)

| Campo | Tipo | Observação |
|-------|------|------------|
| id | string (UUID) | Identificador primário |
| filialId | string | Identificador de filial |
| categoria | string | Categoria de produto |
| periodo | string | Período |
| orcado | number | Valor orçado |
| comprometido | number | Valor comprometido |
| disponivel | number | Valor disponível |

**Classificação:** Todas as entidades acima são **hipotéticas e não confirmadas**.

---

## 5. Casos de Uso Hipotéticos (Não Confirmados)

| Caso de Uso | Descrição | Status |
|-------------|-----------|--------|
| Criar pedido de compra | Inserir novo pedido com itens | Não confirmado |
| Aprovar pedido de compra | Fluxo de aprovação | Não confirmado |
| Receber pedido de compra | Baixa de recebimento | Não confirmado |
| Cancelar pedido de compra | Cancelamento | Não confirmado |
| Consultar verba comprador | Consulta de verba disponível | Não confirmado |
| Consultar OTB | Consulta de open to buy | Não confirmado |
| Sincronizar com SISCOM | Envio de pedido ao ERP | Não confirmado (porta existe) |

---

## 6. Repositórios e Interfaces (Hipotéticos)

| Interface | Métodos Hipotéticos | Local |
|-----------|---------------------|-------|
| PedidoCompraRepository | save, findById, findByStatus, findByFornecedor, findByFilial | `infrastructure/repositories/` |
| FornecedorRepository | save, findById, findByDocumento, findAll | `infrastructure/repositories/` |
| VerbaCompradorRepository | findByCompradorEFilial, save | `infrastructure/repositories/` |
| OTBRepository | findByFilialEPERiodo, save | `infrastructure/repositories/` |
| PurchaseOrderSISCOMPort | sendPurchaseOrder | `application/ports/` (já existe) |

---

## 7. Serviços de Cálculo (Hipotéticos)

| Serviço | Cálculo Hipotético | Status |
|---------|-------------------|--------|
| CalculoVerbaComprador | valorDisponivel = valorTotal - valorUtilizado | Não confirmado |
| CalculoOTB | disponivel = orcado - comprometido | Não confirmado |
| CalculoTotalPedido | soma de subtotais dos itens | Não confirmado |
| CalculoMargem | (precoVenda - precoCusto) / precoVenda | Não confirmado |

**Classificação:** Todos os serviços de cálculo são **hipotéticos** — dependem de validação contra a planilha.

---

## 8. Integração com Supabase

### 8.1 Estado atual

- `src/lib/supabase/server.ts`: cliente de servidor (retorna `null` sem env vars)
- `src/lib/supabase/client.ts`: cliente de navegador (retorna `null` sem env vars)
- `src/types/database.types.ts`: vazio (sem tabelas tipadas)

### 8.2 Preparação necessária

Após acesso autorizado ao Supabase (com `security-review`):

1. Gerar tipos TypeScript a partir do esquema real do Supabase.
2. Criar repositórios em `src/domains/compras/infrastructure/repositories/` usando os clientes Supabase existentes.
3. Implementar portas de saída definidas pelo domínio.

**Restrição:** Nenhuma migration ou alteração de esquema no Supabase.

---

## 9. Preparação para Integração SISCOM

Conforme skill `siscom-erp-integration`:

- `src/integration/siscom/contracts/purchase-order.dto.ts`: DTOs já definidos (versão 1.0.0).
- `src/integration/siscom/ports/purchase-order.port.ts`: Porta de saída já definida.
- Camada anti-corrupção: a ser implementada em `src/integration/siscom/anti-corruption/` quando solicitado.
- **Sem comunicação ativa** até solicitação explícita.

---

## 10. Segurança, Usuários, Permissões e Filiais

### 10.1 Auth disponível

Arquivo: `src/domains/shared/auth/types.ts`

```typescript
export type AuthSession = {
  user: { id: string; email: string | null; role: string | null } | null
  accessToken: string | null
}
```

Campos disponíveis: `user.id`, `user.email`, `user.role`, `accessToken`.

### 10.2 Filiais

Não há confirmação de campo `filialId` em nenhuma tabela do Supabase. A entidade hipotética de Pedido de Compra inclui `filialId`, mas isso **não foi verificado**.

### 10.3 Permissões

Não verificadas. Regras de permissão precisam de `security-review` antes de implementação.

---

## 11. Dados SISCOM vs Dados do Sistema

| Tipo de Dado | Origem | Local no Código | Status |
|--------------|--------|-----------------|--------|
| Pedidos do SISCOM | ERP externo | `src/integration/siscom/` | DTOs preparados, sem comunicação ativa |
| Pedidos criados no Sistema | Módulo Compras | `src/domains/compras/` | Não implementado |
| Fornecedores do SISCOM | ERP externo | `src/integration/siscom/` | Não mapeado |
| Fornecedores do Sistema | Módulo Compras | `src/domains/compras/` | Não implementado |

**Princípio:** Dados do SISCOM são originados externamente; dados do sistema são gerados pelo módulo de Compras. A camada anti-corrupção faz a tradução.

---

## 12. Rastreabilidade e Auditoria

Não definidas. Após confirmação das regras de negócio, devem ser criados:

- Log de alterações de pedidos (quem, quando, o quê)
- Campos de auditoria (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`)
- Registro de regras em `src/domains/compras/domain/rules/registro.md`

---

## 13. Pendências de Validação

| Item | Motivo | Ação |
|------|--------|------|
| Todas as entidades | Não confirmadas contra planilha nem Supabase | Auditar planilha e Supabase |
| Todos os casos de uso | Não confirmados funcionalmente | Documentar regras via `sosal-business-rules` |
| Campos de filial | Não verificados | Confirmar no esquema Supabase |
| Regras de aprovação | Não documentadas | Obter documentação formal do domínio |
| Regras de verba/OTB | Não documentadas | Obter documentação formal do domínio |

---

## 14. Próximos Passos

1. Localizar planilha de referência de compras.
2. Obter credenciais de ambiente para Supabase.
3. Executar `security-review` antes de acessar Supabase.
4. Gerar `database.types.ts` a partir do esquema real.
5. Revisar e validar este modelo preliminar contra fatos confirmados.
6. Documentar regras de negócio formalmente.
7. Criar registro de regras em `src/domains/compras/domain/rules/registro.md`.
8. Somente após aprovação: iniciar implementação de Pedidos de Compra seguindo TDD.

---

**Fim do modelo preliminar. Nenhuma entidade foi confirmada. Nenhuma tela criada. Nenhum commit ou push efetuado.**
