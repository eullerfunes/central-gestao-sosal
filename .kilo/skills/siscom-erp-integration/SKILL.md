---
name: siscom-erp-integration
description: "Use when preparing the Central de Gestão Só Sal modular monolith for future integration with ERP SISCOM. Defines integration boundaries, adapters, contracts, data mapping, and anti-corruption layer patterns. Triggers: ERP integration, data exchange, adapter patterns, boundary contracts."
---

# Integração ERP SISCOM — Central de Gestão Só Sal

## Propósito

Preparar o monólito modular para integração futura com o ERP SISCOM, sem acoplar o domínio do Só Sal ao ERP. Define:

- Camada anti-corrupção entre o domínio e o SISCOM.
- Contratos de integração (DTOs, contratos de troca de dados).
- Adaptadores por canal de integração (REST, arquivo, tabela de staging).
- Mapeamento de dados entre o modelo Só Sal e o modelo SISCOM.

Este skill **não implementa integração ativa**. Apenas estabelece o contrato e a estrutura para quando a integração for solicitada.

## Quando usar

Sempre que houver:

- Planejamento de troca de dados com o ERP SISCOM.
- Criação de adaptadores ou contratos de integração.
- Mapeamento de entidades Só Sal ↔ entidades SISCOM.
- Definição de camada de tradução entre domínio e ERP.

## Princípios fundamentais

1. **Anti-corruption layer.** O domínio do Só Sal nunca conhece o modelo do SISCOM diretamente. Toda tradução passa por adaptadores em `src/integration/siscom/`.
2. **Sem acoplamento direto ao banco do SISCOM.** Nenhuma leitura/gravação direta no banco do ERP; integração via contratos expostos pelo SISCOM (API, arquivo, staging).
3. **Contratos versionados.** DTOs de integração são versionados e imutáveis após consenso.
4. **Módulo isolado.** Integração vive em `src/integration/siscom`, separada dos domínios de negócio.
5. **Pronto para futuro, vazio hoje.** Nenhuma integração ativa é implementada antes de solicitação explícita.

## Estrutura proposta

```
src/integration/siscom/
  contracts/        # DTOs e contratos de troca de dados (versioneados)
  adapters/         # Adaptadores por canal (rest, arquivo, staging)
  anti-corruption/  # Camada de tradução domínio ↔ SISCOM
  mappers/          # Mapeadores de entidades
  ports/            # Portas de saída (interfaces) definidas pelo domínio
```

## Fluxo de integração (quando ativado)

1. Definir contrato de dados (DTO) versão 1.
2. Criar porta de saída no módulo de origem (ex: compras).
3. Implementar adaptador SISCOM seguindo o contrato.
4. Mapear entidades Só Sal → DTO SISCOM (e vice-versa).
5. Testar com dados de sandbox do SISCOM.
6. Registrar o contrato versãoado.

## Habilidades relacionadas

- `sosal-business-rules` — regras de negócio que cruzam o limite com o ERP.
- `supabase` — persistência local antes de enviar ao ERP.
- `security-review` — credenciais e dados sensíveis trocados com o ERP.
