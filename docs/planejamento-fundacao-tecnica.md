# Planejamento da Fundação Técnica

Documento de planejamento da base técnica da Central de Gestão Só Sal, antes de qualquer implementação de telas.

## 1. Objetivo da etapa

Preparar o repositório, a estrutura de pastas, as regras permanentes (AGENTS.md), as skills do projeto e a arquitetura modular. Nenhuma tela de compras é criada nesta etapa. Nenhuma alteração no banco Supabase é realizada.

## 2. Stack técnica

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js (App Router) + TypeScript |
| UI | React, Tailwind CSS, shadcn/ui |
| Banco / Auth | Supabase PostgreSQL + Auth (existente, inalterado) |
| Versionamento | GitHub |
| Deploy | Vercel (não publicar nesta etapa) |

## 3. Estrutura de pastas proposta

Ver `docs/arquitetura-modular.md`.

## 4. Habilidades a aplicar

- `test-driven-development`: teste antes do código de produção.
- `security-review`: revisão de auth, RLS, permissões e dados sensíveis.
- `supabase`: integração com banco/Auth existente (sem alterar esquema).
- `supabase-postgres-best-practices`: boas práticas de Postgres/RLS/consultas.
- `frontend-design`, `ui-ux-pro-max`, `vercel-react-best-practices`: direção de UI e boas práticas React/Next.js.
- `sosal-business-rules`: regras de negócio por módulo (sem inventar da planilha).
- `siscom-erp-integration`: preparação para integração futura com ERP SISCOM.

## 5. Regras permanentes (AGENTS.md)

Ver `AGENTS.md`. Destaques:

- Não alterar banco Supabase existente.
- Não executar migrations.
- Não publicar na Vercel.
- Não criar telas de compras nesta etapa.
- Não inventar regras de negócio da planilha.
- Não instalar skills duplicadas.

## 6. Entregas desta etapa

- Estado do repositório inspecionado (vazio, git `main`).
- Skills verificadas (todas as 7 solicitadas já instaladas; nenhuma duplicata).
- Duas skills criadas: `sosal-business-rules`, `siscom-erp-integration`.
- `AGENTS.md` configurado.
- Arquitetura de monólito modular proposta (docs/arquitetura-modular.md).
- Planejamento da fundação técnica documentado (docs/planejamento-fundacao-tecnica.md).

## 7. Próximos passos (após nova solicitação)

- Implementar telas do módulo Pedidos de Compra seguindo TDD.
- Definir regras de negócio de compras com base em documentação formal do domínio.
- Integrar com Supabase existente (sem migrations).
- Preparar contratos de integração SISCOM quando solicitado.

## 8. Comandos disponíveis

| Comando | Finalidade |
|---------|------------|
| `npm install` | Instala dependências |
| `npm run dev` | Servidor de desenvolvimento (localhost:3000) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção (após build) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Verificação de tipos TypeScript |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:watch` | Testes em modo watch |

