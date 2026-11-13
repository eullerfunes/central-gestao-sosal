---
name: sosal-business-rules
description: "Use when defining, validating, or enforcing business rules for Central de Gestão Só Sal modules (Pedidos de Compra, Estoque, Financeiro, Comercial, S&OP, Diretoria). Ensures rules come from documented domain requirements, never invented from spreadsheets. Triggers: purchase order workflows, approval chains, validation constraints, module-specific business logic."
---

# Regras de Negócio — Central de Gestão Só Sal

## Propósito

Definir, validar e impor as regras de negócio de cada módulo da plataforma Só Sal, garantindo que:

- Nenhuma regra seja inventada a partir de planilhas ou suposições.
- As regras sejam documentadas explicitamente antes de qualquer implementação.
- Cada módulo tenha seus próprios limites de responsabilidade (domínio).
- As regras sejam aplicadas na camada de domínio, não apenas na interface.

## Quando usar

Sempre que houver:

- Definição ou alteração de regras de negócio de qualquer módulo.
- Validação de pedidos de compra, fluxos de aprovação ou restrições de domínio.
- Implementação de regras de validação (schemas, use cases, domain services).
- Dúvida sobre se uma regra pertence ao módulo compras, estoque, financeiro, etc.

## Princípios fundamentais

1. **Não inventar regras de negócio.** Regras só entram no código se estiverem documentadas nos requisitos de domínio do Só Sal. Planilhas são referência de entrada, não fonte de verdade.
2. **Regra vivendo na camada de domínio.** Regras de negócio ficam em `src/domains/<modulo>/domain/` (entities, value objects, domain services, validators), jamais apenas no frontend.
3. **Um módulo, um conjunto de regras.** Cada módulo declara suas próprias regras; não há vazamento de regras entre módulos sem contrato explícito.
4. **TDD obrigatório.** Toda regra de negócio tem teste antes da implementação (skill `test-driven-development`).
5. **Revisão de segurança.** Regras que envolvem permissões, visibilidade de dados ou alteração de estado passam por `security-review`.
6. **Registro de regras.** Toda regra implementada é listada no registro de regras do módulo (veja abaixo).

## Módulos e escopo

| Módulo | Pasta | Status |
|--------|-------|--------|
| Compras (Pedidos de Compra) | `src/domains/compras` | Primeiro módulo — em definição |
| Estoque | `src/domains/estoque` | Futuro |
| Financeiro | `src/domains/financeiro` | Futuro |
| Comercial | `src/domains/comercial` | Futuro |
| S&OP | `src/domains/sop` | Futuro |
| Diretoria | `src/domains/diretoria` | Futuro |

## Registro de regras — Pedidos de Compra

Nenhuma regra de compra está inventada nesta fase. As regras serão preenchidas aqui somente após documentação formal do domínio de compras do Só Sal.

```md
# src/domains/compras/domain/rules/registro.md
# Regras de Pedidos de Compra

## Pendente de documentação formal

Nenhuma regra foi aprovada ainda. Não implementar validações de compra
antes de regras documentadas pelo domínio do Só Sal.
```

## Fluxo de implementação de uma regra

1. Documentar a regra no registro do módulo (com fonte e responsável).
2. Escrever teste falhando (TDD — red).
3. Implementar regra na camada de domínio (green).
4. Revisar com `security-review` quando houver impacto de autorização/dados.
5. Refatorar e registrar a regra como implementada.

## Habilidades relacionadas

- `test-driven-development` — regra só vira código com teste falhando primeiro.
- `security-review` — regras de acesso e visibilidade.
- `siscom-erp-integration` — regras que cruzam o limite com o ERP SISCOM.
