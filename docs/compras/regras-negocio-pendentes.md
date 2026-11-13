# Regras de Negócio Pendentes — Módulo de Compras (Etapa 3.1)

**Projeto:** Central de Gestão Só Sal  
**Branch:** `feat/compras`  
**Base de referência:** `main` (commit `242e980d4e309be1a641bbc39b2f9b38c1caf871`)  
**Data:** 2026-11-13  
**Status:** Nenhuma regra confirmada — registro vazio aguardando documentação formal

---

## 1. Princípio Fundamental

Conforme skill `sosal-business-rules`:

> "Nenhuma regra de compra está inventada nesta fase. As regras serão preenchidas aqui somente após documentação formal do domínio de compras do Só Sal."

> "Planilhas são referência de entrada, não fonte de verdade. Regras só entram no código se documentadas formalmente."

Este documento lista **apenas** as regras que precisam ser confirmadas. Nenhuma regra foi aprovada, nenhuma foi implementada, nenhuma deve ser assumida.

---

## 2. Registro de Regras — Pedidos de Compra

Conforme o modelo definido na skill:

```md
# src/domains/compras/domain/rules/registro.md
# Regras de Pedidos de Compra

## Pendente de documentação formal

Nenhuma regra foi aprovada ainda. Não implementar validações de compra
antes de regras documentadas pelo domínio do Só Sal.
```

**Status:** Registro vazio. Nenhuma regra listada.

---

## 3. Regras que Precisam de Confirmação

As regras abaixo são listadas como **pendentes de documentação formal**. Elas não são hipóteses validadas — são itens que precisam ser esclarecidos pelo domínio do Só Sal.

### 3.1 Fluxo de Aprovação de Pedidos

| Regra Pendente | Descrição | Por que precisa de confirmação |
|----------------|-----------|-------------------------------|
| Estados válidos | Quais estados um pedido pode ter (rascunho, enviado, aprovado, recebido, cancelado, etc.)? | Não confirmado contra planilha nem Supabase |
| Transições permitidas | Quais transições entre estados são válidas? Quem pode executar cada transição? | Não confirmado |
| Aprovação por valor | Existe limite de valor que exige aprovação de gestor? Qual o limite? | Não confirmado |
| Aprovação por filial | Existe regra diferente por filial? | Não confirmado |
| Aprovação por comprador | Um comprador pode aprovar seu próprio pedido? | Não confirmado |

### 3.2 Validações de Campos

| Regra Pendente | Descrição | Por que precisa de confirmação |
|----------------|-----------|-------------------------------|
| Campos obrigatórios | Quais campos são obrigatórios ao criar um pedido? | Não confirmado |
| Formato de número do pedido | Existe padrão de numeração automática ou manual? | Não confirmado |
| Valor mínimo/máximo | Existem limites de valor por pedido? | Não confirmado |
| Prazo de entrega | Existe regra de prazo mínimo/máximo? | Não confirmado |
| Fornecedor obrigatório | Todo pedido deve ter fornecedor vinculado? | Não confirmado |

### 3.3 Verba Comprador

| Regra Pendente | Descrição | Por que precisa de confirmação |
|----------------|-----------|-------------------------------|
| Cálculo da verba | Como a verba total é calculada? Por período? Por filial? | Não confirmado |
| Consumo da verba | Como o consumo é contabilizado? No momento do pedido ou do recebimento? | Não confirmado |
| Bloqueio por verba esgotada | O sistema bloqueia pedido quando a verba se esgota? | Não confirmado |
| Alerta de verba baixa | Existe limite de alerta antes de esgotar? | Não confirmado |

### 3.4 OTB (Open To Buy)

| Regra Pendente | Descrição | Por que precisa de confirmação |
|----------------|-----------|-------------------------------|
| Cálculo do OTB | Como o OTB é calculado? Orçado menos comprometido? | Não confirmado |
| Período do OTB | Mensal? Anual? Por filial? Por categoria? | Não confirmado |
| Comprometimento | O que conta como comprometido? Pedidos aprovados? Enviados? | Não confirmado |
| Bloqueio por OTB esgotado | O sistema bloqueia novos pedidos quando OTB se esgota? | Não confirmado |

### 3.5 Atendimento Fornecedor

| Regra Pendente | Descrição | Por que precisa de confirmação |
|----------------|-----------|-------------------------------|
| Status de atendimento | Quais estados de atendimento existem? | Não confirmado |
| Recebimento parcial | É permitido recebimento parcial de um pedido? | Não confirmado |
| Prazo de recebimento | Existe SLA de recebimento? | Não confirmado |

### 3.6 Plano de Estoque

| Regra Pendente | Descrição | Por que precisa de confirmação |
|----------------|-----------|-------------------------------|
| Gatilho de compra | O que dispara a necessidade de compra? Estoque mínimo? Venda prevista? | Não confirmado |
| Quantidade sugerida | Como a quantidade de compra é sugerida? | Não confirmado |

### 3.7 Produção Própria

| Regra Pendente | Descrição | Por que precisa de confirmação |
|----------------|-----------|-------------------------------|
| Integração com compras | A produção própria gera pedidos de compra de matéria-prima? | Não confirmado |
| Controle de produção | Existe controle de ordem de produção separado? | Não confirmado |

### 3.8 Filiais e Permissões

| Regra Pendente | Descrição | Por que precisa de confirmação |
|----------------|-----------|-------------------------------|
| Visibilidade por filial | Um usuário vê apenas pedidos de sua filial? | Não confirmado |
| Criação cross-filial | Um usuário pode criar pedido de outra filial? | Não confirmado |
| Papéis de usuário | Quais papéis existem (comprador, gestor, admin, etc.)? | Não confirmado |

### 3.9 Integração SISCOM

| Regra Pendente | Descrição | Por que precisa de confirmação |
|----------------|-----------|-------------------------------|
| Envio automático | Pedidos são enviados automaticamente ao SISCOM ou manualmente? | Não confirmado |
| Sincronização de status | O status do SISCOM atualiza o pedido local? | Não confirmado |
| Tratamento de erros | O que acontece quando o envio ao SISCOM falha? | Não confirmado |

---

## 4. Fluxo de Implementação de uma Regra (quando confirmada)

Conforme skill `sosal-business-rules`:

1. Documentar a regra no registro do módulo (com fonte e responsável).
2. Escrever teste falhando (TDD — red).
3. Implementar regra na camada de domínio (green).
4. Revisar com `security-review` quando houver impacto de autorização/dados.
5. Refatorar e registrar a regra como implementada.

---

## 5. Pendências de Documentação

| Item | Responsável Sugerido | Status |
|------|---------------------|--------|
| Documentação formal do domínio de compras | Analista funcional do Só Sal | Pendente |
| Regras de aprovação | Gestor de compras | Pendente |
| Regras de verba | Financeiro / Compras | Pendente |
| Regras de OTB | Compras / Planejamento | Pendente |
| Regras de filiais e permissões | TI / Segurança | Pendente |
| Regras de integração SISCOM | TI / ERP | Pendente |

---

## 6. Próximos Passos

1. Obter documentação formal do domínio de compras do Só Sal.
2. Preencher o registro de regras em `src/domains/compras/domain/rules/registro.md`.
3. Executar `security-review` para regras que envolvam permissões, visibilidade de dados ou alteração de estado.
4. Implementar regras seguindo TDD, somente após documentação formal.
5. Somente após aprovação: iniciar implementação de Pedidos de Compra.

---

**Fim do registro de regras pendentes. Nenhuma regra foi aprovada. Nenhuma implementada. Nenhum commit ou push efetuado.**
