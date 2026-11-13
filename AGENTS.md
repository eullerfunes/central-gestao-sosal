# AGENTS.md — Central de Gestão Só Sal

Este arquivo define as regras permanentes para agentes de IA que trabalham neste repositório.

## Identidade do projeto

- **Nome:** Central de Gestão Só Sal
- **Repositório oficial:** `eullerfunes/central-gestao-sosal`
- **Local de trabalho:** `C:\Users\PC\Desktop\central-gestao-sosal-1`
- **Primeiro módulo:** Pedidos de Compra
- **Módulos futuros:** Estoque, Financeiro, Comercial, S&OP, Diretoria

## Stack

- Next.js (App Router) + TypeScript strict
- React
- Tailwind CSS + shadcn/ui
- Supabase PostgreSQL + Auth (backend futuro, existente inalterado)
- GitHub
- Vercel (somente preparação, nenhum deploy nesta etapa)

## Regras permanentes (obrigatórias, válidas em todas as etapas)

1. **Não alterar o banco Supabase existente.** Nenhuma alteração de esquema, tabela, coluna ou dado no Supabase.
2. **Não executar migrations.** Não criar, aplicar ou rodar migrations do Supabase.
3. **Não alterar outros repositórios.** Trabalhar somente neste repositório.
4. **Não publicar na Vercel.** Nenhum deploy na Vercel.
5. **Não instalar skills duplicadas.** Verificar se a skill já existe antes de instalar/criar.
6. **Não expor credenciais.** Nenhuma senha, token, secret ou chave em código nem em variáveis com commit.
7. **Não inventar regras de negócio da planilha.** Planilhas são referência de entrada, não fonte de verdade. Regras só entram no código se documentadas formalmente (skill `sosal-business-rules`).
8. **Não utilizar dados fictícios como reais.** Dados de exemplo devem ser identificados claramente como mock/placeholder.
9. **Commit somente com autorização explícita do usuário.**

## Restrições temporárias desta etapa (Etapa 2 — fundação técnica)

As restrições abaixo valem somente para esta etapa e são revisadas a cada nova solicitação:

- Não implementar regras de negócio de Pedidos de Compra (regras só entram com documentação formal via `sosal-business-rules`).
- Não conectar serviços externos sem necessidade (inclusive ERP SISCOM — somente contratos e interfaces preparados, sem comunicação externa ativa).
- Não acessar dados reais do Supabase sem validação de segurança (`security-review`).
- Não criar telas específicas do módulo Pedidos de Compra além da fundação (layout, navegação, página inicial).

## Habilidades do projeto

- `sosal-business-rules` — regras de negócio por módulo (`.kilo/skills/sosal-business-rules/SKILL.md`).
- `siscom-erp-integration` — preparação para integração com ERP SISCOM (`.kilo/skills/siscom-erp-integration/SKILL.md`).

## Habilidades do Kilo a aproveitar

- Frontend: `frontend-design`, `ui-ux-pro-max`, `ui-styling`, `design-system`, `react-best-practices` (instalado como `vercel-react-best-practices`).
- Backend/arquitetura: `supabase`, `supabase-postgres-best-practices`, `security-review`, `siscom-erp-integration`, `sosal-business-rules`.
- Qualidade: `test-driven-development`, `systematic-debugging`, `code-review`, `webapp-testing`.

## Arquitetura

Monólito modular preparado para integração futura com ERP SISCOM (ver `docs/arquitetura-modular.md` e `docs/planejamento-fundacao-tecnica.md`).

## Fluxo de trabalho

1. Planejar e documentar (esta etapa).
2. Implementar seguindo TDD (teste primeiro).
3. Revisar com `security-review` quando houver auth/RLS/dados.
4. Validar com `supabase-postgres-best-practices` antes de tocar dados.
5. Executar typecheck, lint e build antes de entregar.

## Proibido

- Commit sem solicitação explícita do usuário.
- Deploy na Vercel.
- Alteração de banco Supabase.
- Execução de migrations no Supabase.
