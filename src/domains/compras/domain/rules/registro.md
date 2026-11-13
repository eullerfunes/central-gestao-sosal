# Registro de Regras — Pedidos de Compra

**Módulo:** Compras  
**Caminho:** `src/domains/compras/domain/rules/registro.md`  
**Status:** Regras observadas (não políticas aprovadas)

---

## Princípio

Conforme skill `sosal-business-rules`:
- Nenhuma regra é inventada a partir de planilhas.
- Regras são documentadas explicitamente antes de qualquer implementação.
- Cada regra vive na camada de domínio.

---

## Regras Observadas (da planilha de referência)

Essas regras foram observadas na planilha Gestão Zacarini 2.2.24, aba "Pedidos de Compra". Elas são **observadas**, não aprovadas como políticas do sistema. Cada uma precisa de confirmação formal do domínio antes de ser tratada como regra de negócio vinculante.

| # | Regra Observada | Fonte | Confirmada |
|---|----------------|-------|------------|
| R01 | Valor do item = quantidade solicitada × custo unitário | Planilha colunas I:O | Não |
| R02 | Quantidade pendente = quantidade solicitada − quantidade recebida | Planilha colunas I:O | Não |
| R03 | Valor pendente = quantidade pendente × custo unitário | Planilha colunas I:O | Não |
| R04 | Situações de entrega: Em aberto / Chegada parcial / Já chegou — conferir/baixar | Planilha coluna O | Não |
| R05 | Previsão padrão de chegada: 7 dias | Planilha colunas P:AL | Não |
| R06 | Condição de pagamento pode ter múltiplos prazos (ex: 30/60/90) | Planilha colunas P:AL | Não |
| R07 | Prazo padrão: 30 dias (sinalizado como presumido quando condição ausente) | Planilha colunas P:AL | Não |
| R08 | Decisões: Aprovado / Segurar / Cancelar / Já pago | Planilha colunas AO:AQ | Não |
| R09 | Decisões Segurar, Cancelar e Já pago excluem geração de parcelas previstas | Planilha colunas AO:AQ | Não |
| R10 | Nunca aprovar pedidos implicitamente | Planilha colunas AO:AQ | Não |

---

## Regras Pendentes de Documentação Formal

As seguintes regras precisam ser documentadas pelo domínio do Só Sal antes de serem implementadas como políticas vinculantes:

1. Fluxo de aprovação de pedidos de compra
2. Estados válidos de um pedido e transições permitidas
3. Regras de trava de caixa
4. Regras de verba por comprador
5. Regras de OTB (Open To Buy)
6. Regras de classificação de produtos (subgrupo automático/manual)
7. Regras de curva ABC
8. Regras de filiais e permissões de acesso
9. Regras de integração com SISCOM (quando ativado)
10. Regras de conciliação de recebimentos com NF

---

## Fluxo de Implementação de uma Regra

1. Documentar a regra neste registro (com fonte e responsável).
2. Escrever teste falhando (TDD — red).
3. Implementar regra na camada de domínio (`src/domains/compras/domain/`).
4. Revisar com `security-review` quando houver impacto de autorização/dados.
5. Refatorar e registrar a regra como implementada.

---

**Nenhuma regra acima está implementada como política do sistema. Todas estão como observações pendentes de confirmação.**
