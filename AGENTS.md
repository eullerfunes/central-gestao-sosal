# AGENTS.md — Central de Gestão Só Sal

Este arquivo define as regras permanentes para agentes de IA que trabalham neste repositório.

## Identidade do projeto

- **Nome:** Central de Gestão Só Sal
- **Repositório oficial:** `eullerfunes/central-gestao-sosal`
- **Local de trabalho:** `C:\Users\PC\Desktop\central-gestao-sosal-1`
- **Primeiro módulo:** Pedidos de Compra
- **Módulos futuros:** Estoque, Financeiro, Comercial, S&OP, Diretoria

## Stack

- Next.js + TypeScript
- React
- Tailwind CSS + shadcn/ui
- Supabase PostgreSQL + Auth
- GitHub
- Vercel

## Regras permanentes (obrigatórias)

1. **Não alterar o banco Supabase existente.** Nenhuma alteração de esquema, tabela, coluna ou dado no Supabase.
2. **Não executar migrations.** Não criar, aplicar ou rodar migrations do Supabase.
3. **Não alterar outros repositórios.** Trabalhar somente neste repositório.
4. **Não publicar na Vercel.** Nenhum deploy na Vercel.
5. **Não criar telas de compras ainda.** A preparação e documentação vêm primeiro; telas só após nova solicitação.
6. **Não inventar regras de negócio da planilha.** Planilhas são referência de entrada, não fonte de verdade. Regras só entram no código se documentadas formalmente (skill `sosal-business-rules`).
7. **Não instalar skills duplicadas.** Verificar se a skill já existe antes de instalar/criar.

## Habilidades do projeto

- `sosal-business-rules` — regras de negócio por módulo.
- `siscom-erp-integration` — preparação para integração com ERP SISCOM.

## Habilidades do Kilo a aproveitar

- `frontend-design`, `ui-ux-pro-max`, `vercel-react-best-practices` (instalado como `react-best-practices`)
- `supabase`, `supabase-postgres-best-practices`
- `security-review`
- `test-driven-development`

## Arquitetura

Monólito modular preparado para integração futura com ERP SISCOM (ver `docs/arquitetura-modular.md` e `docs/planejamento-fundacao-tecnica.md`).

## Fluxo de trabalho

1. Planejar e documentar (esta etapa).
2. Implementar seguindo TDD (teste primeiro).
3. Revisar com `security-review` quando houver auth/RLS/dados.
4. Validar com `supabase-postgres-best-practices` antes de tocar dados.

## Proibido

- Commit sem solicitação explícita do usuário.
- Deploy na Vercel.
- Alteração de banco Supabase.
- Criação de telas de compras nesta etapa.
