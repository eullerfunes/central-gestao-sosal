# Arquitetura — Monólito Modular

Central de Gestão Só Sal adota um **monólito modular** com preparação para integração futura com o ERP SISCOM. Cada módulo de negócio é um domínio autocontido, com limites claros, e o restante da aplicação é compartilhado (shared kernel).

## Visão geral

```
src/
  app/                # Next.js App Router (rotas por módulo)
  domains/            # Domínios de negócio (módulos)
    shared/           # Shared kernel (auth, tipos comuns, exceções)
    compras/          # Módulo Pedidos de Compra (primeiro módulo)
      domain/         # Entities, value objects, domain services, regras
      application/    # Use cases, application services
      infrastructure/ # Repositórios, adaptadores locais
      presentation/   # Componentes de UI específicos do módulo
      rules/          # Registro de regras de negócio (sosal-business-rules)
    estoque/          # Futuro
    financeiro/       # Futuro
    comercial/        # Futuro
    sop/              # Futuro
    diretoria/        # Futuro
  integration/        # Camadas de integração externa
    siscom/           # Integração ERP SISCOM (siscom-erp-integration)
      contracts/      # DTOs versionados
      adapters/       # Adaptadores por canal
      anti-corruption/# Tradução domínio ↔ SISCOM
      mappers/        # Mapeadores de entidades
      ports/          # Portas de saída definidas pelo domínio
  lib/                # Utilitários compartilhados
  components/         # Componentes UI compartilhados (shadcn/ui)
```

## Princípios

1. **Domínio autocontido.** Cada módulo possui domínio, aplicação e infraestrutura próprios. Não há importação de lógica de negócio entre módulos.
2. **Shared kernel mínimo.** Apenas autenticação, tipos comuns e exceções são compartilhados.
3. **Dependência direcionada.** `presentation` → `application` → `domain` → `infrastructure`. A infraestrutura depende do domínio, nunca o inverso.
4. **Anti-corruption layer (SISCOM).** O domínio nunca conhece o modelo do SISCOM. Toda tradução ocorre em `src/integration/siscom/anti-corruption/`.
5. **Portas e adaptadores.** Portas de saída (`ports/`) são definidas pelo domínio; adaptadores as implementam.
6. **TDD.** Todo código de domínio tem teste falhando primeiro.
7. **Supabase existente inalterado.** Não há migrations nem alterações de esquema.

## Comunicação entre módulos

A comunicação entre módulos ocorre por meio de eventos ou chamadas de use cases expostos, jamais acessando diretamente o domínio de outro módulo. Cada módulo expõe uma API de aplicação estável.

## Próximo passo (não nesta etapa)

Implementação de telas do módulo Pedidos de Compra, somente após nova solicitação.
