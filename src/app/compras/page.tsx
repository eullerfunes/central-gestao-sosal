import Link from "next/link"
import {
  AlertCircle, ArrowUpRight, Boxes, ChevronLeft, ChevronRight, ClipboardList,
  Clock3, Search, ShieldCheck, ShoppingCart, Wallet, CalendarDays,
} from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ComprasLogin, ComprasSair } from "@/components/compras/compras-auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

type SearchParams = Record<string, string | string[] | undefined>
type Props = { searchParams: Promise<SearchParams> }

type PurchaseItem = {
  importacao_id: number | null
  linha_excel: number | null
  importado_em: string | null
  loja: string | null
  fornecedor_codigo: string | null
  fornecedor_nome: string | null
  pedido: string | null
  data_pedido: string | null
  condicao_pagamento: string | null
  produto_codigo: string | null
  descricao: string | null
  quantidade: number | string | null
  custo_unitario: number | string | null
  valor_total: number | string | null
  total_itens: number | string
  total_pedidos: number | string
  soma_total: number | string
  ultima_importacao: string | null
}

const shops = ["CAMPO GRANDE", "SO SAL", "RIO VERDE", "COXIM", "PEDRO GOMES", "ANASTACIO"] as const
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const whole = new Intl.NumberFormat("pt-BR")
const amount = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 })

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : Array.isArray(value) ? (value[0] ?? "") : ""
}

function safeDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(value + "T00:00:00Z")
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) ? value : null
}

function num(value: number | string | null | undefined): number {
  const result = Number(value ?? 0)
  return Number.isFinite(result) ? result : 0
}

function dateBR(value: string | null): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value.slice(0, 10))) return "—"
  const [y, m, d] = value.slice(0, 10).split("-")
  return d + "/" + m + "/" + y
}

function dateTimeBR(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Campo_Grande",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function pageHref(values: { busca: string; loja: string; inicio: string; fim: string }, page: number) {
  const params = new URLSearchParams()
  if (values.busca) params.set("busca", values.busca)
  if (values.loja) params.set("loja", values.loja)
  if (values.inicio) params.set("inicio", values.inicio)
  if (values.fim) params.set("fim", values.fim)
  params.set("pagina", String(page))
  return "/compras?" + params.toString()
}

function Metric({ label, value, footnote, icon: Icon }: {
  label: string; value: string; footnote: string; icon: typeof ShoppingCart
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight" title={value}>{value}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{footnote}</p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <Icon size={19} />
        </span>
      </div>
    </div>
  )
}

export default async function ComprasPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return <ComprasLogin configured={false} />

  // Confere a identidade com Supabase Auth; não confia em metadados editáveis do navegador.
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return <ComprasLogin configured />

  const params = await searchParams
  const busca = first(params.busca).trim().slice(0, 90)
  const loja = shops.find((item) => item === first(params.loja)) ?? ""
  const inicio = safeDate(first(params.inicio)) ?? ""
  const fim = safeDate(first(params.fim)) ?? ""
  const pagina = Math.min(1000, Math.max(1, Number.parseInt(first(params.pagina), 10) || 1))
  const tamanho = 25
  const filters = { busca, loja, inicio, fim }

  // A função PostgreSQL exige JWT válido e profile Master ativo, devolvendo apenas leitura.
  const { data, error } = await supabase.rpc("fn_listar_pedidos_compra", {
    p_busca: busca || null,
    p_loja: loja || null,
    p_inicio: inicio || null,
    p_fim: fim || null,
    p_pagina: pagina,
    p_tamanho: tamanho,
  })

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="flex justify-end"><ComprasSair /></div>
        <div role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-7 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <AlertCircle size={27} className="mb-4" />
          <h1 className="text-xl font-semibold">{error.code === "42501" ? "Acesso restrito ao Master" : "Não foi possível consultar os pedidos"}</h1>
          <p className="mt-2 text-sm leading-6">
            {error.code === "42501"
              ? "Sua conta está autenticada, mas não tem autorização de Master ativo no módulo Compras."
              : "A consulta de leitura está indisponível. Nenhum dado foi exibido. Peça ao administrador para verificar a configuração do Supabase."}
          </p>
        </div>
      </div>
    )
  }

  const rows = (data ?? []) as PurchaseItem[]
  const summary = rows[0]
  const items = rows.filter((row) => row.pedido !== null)
  const total = num(summary?.total_itens)
  const totalPages = Math.max(1, Math.ceil(total / tamanho))
  const from = total === 0 || items.length === 0 ? 0 : (pagina - 1) * tamanho + 1
  const to = Math.min(total, pagina * tamanho)

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <nav className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          <Link href="/" className="hover:text-blue-600">Central de Gestão</Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-blue-600">Compras</span>
        </nav>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="hidden items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 sm:inline-flex dark:border-slate-800">
            <ShieldCheck size={13} className="text-emerald-600" /> Master
          </span>
          <span className="max-w-48 truncate" title={user.email ?? ""}>{user.email}</span>
          <ComprasSair />
        </div>
      </header>

      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-8 text-white shadow-lg sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-32 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
              <ShoppingCart size={14} /> Gestão centralizada
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Pedidos de compra</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Consulte o histórico integrado ao SISCOM por filial, fornecedor, pedido e produto.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Origem de dados</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Supabase · SISCOM RPA</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de compras">
        <Metric label="Itens de pedidos" value={whole.format(total)} footnote="Registros correspondentes aos filtros" icon={Boxes} />
        <Metric label="Pedidos distintos" value={whole.format(num(summary?.total_pedidos))} footnote="Número de pedido por filial" icon={ClipboardList} />
        <Metric label="Valor nominal" value={brl.format(num(summary?.soma_total))} footnote="Não equivale ao saldo a pagar" icon={Wallet} />
        <Metric label="Última importação" value={dateTimeBR(summary?.ultima_importacao)} footnote="Horário de Campo Grande (MS)" icon={Clock3} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Consulta de pedidos</h2>
              <p className="mt-1 text-sm text-slate-500">Pesquise e confira os itens e valores importados.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"><ShieldCheck size={14} /> Somente leitura</span>
          </div>

          <form action="/compras" method="get" className="mt-6 grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_175px_150px_150px_auto]">
            <div>
              <label htmlFor="busca" className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-400">Buscar</label>
              <div className="relative">
                <Search size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                <input id="busca" name="busca" type="search" maxLength={90} defaultValue={busca} placeholder="Pedido, fornecedor, produto..." className="h-11 w-full rounded-xl border border-slate-200 bg-transparent pl-10 pr-3 text-sm outline-none focus:border-blue-600 dark:border-slate-800" />
              </div>
            </div>
            <div>
              <label htmlFor="loja" className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-400">Filial</label>
              <select id="loja" name="loja" defaultValue={loja} className="h-11 w-full rounded-xl border border-slate-200 bg-transparent px-3 text-sm outline-none dark:border-slate-800">
                <option value="">Todas as filiais</option>
                {shops.map((shop) => <option key={shop} value={shop}>{shop}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="inicio" className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-400">Data inicial</label>
              <input id="inicio" name="inicio" type="date" defaultValue={inicio} className="h-11 w-full rounded-xl border border-slate-200 bg-transparent px-3 text-sm outline-none dark:border-slate-800" />
            </div>
            <div>
              <label htmlFor="fim" className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-400">Data final</label>
              <input id="fim" name="fim" type="date" defaultValue={fim} className="h-11 w-full rounded-xl border border-slate-200 bg-transparent px-3 text-sm outline-none dark:border-slate-800" />
            </div>
            <button type="submit" className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700">Filtrar</button>
          </form>
          <div className="mt-3 flex justify-end"><Link href="/compras" className="text-xs font-medium text-slate-500 hover:text-blue-600">Limpar filtros</Link></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/80">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-4 font-semibold">Pedido</th>
                <th className="px-5 py-4 font-semibold">Data</th>
                <th className="px-5 py-4 font-semibold">Filial</th>
                <th className="px-5 py-4 font-semibold">Fornecedor</th>
                <th className="px-5 py-4 font-semibold">Produto</th>
                <th className="px-5 py-4 text-right font-semibold">Qtde.</th>
                <th className="px-5 py-4 text-right font-semibold">Valor</th>
                <th className="px-5 py-4 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, index) => (
                <tr key={String(item.importacao_id) + "-" + String(item.linha_excel) + "-" + String(index)} className="align-top hover:bg-blue-50/30 dark:hover:bg-slate-900/70">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700 dark:text-blue-300">#{item.pedido}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-400">{dateBR(item.data_pedido)}</td>
                  <td className="whitespace-nowrap px-5 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.loja ?? "—"}</span></td>
                  <td className="max-w-56 px-5 py-4"><p className="max-w-56 truncate font-medium" title={item.fornecedor_nome ?? ""}>{item.fornecedor_nome || "Não informado"}</p><p className="mt-1 text-xs text-slate-500">Cód. {item.fornecedor_codigo ?? "—"}</p></td>
                  <td className="max-w-64 px-5 py-4"><p className="max-w-64 truncate" title={item.descricao ?? ""}>{item.descricao || "Não informado"}</p><p className="mt-1 text-xs text-slate-500">SKU {item.produto_codigo ?? "—"}</p></td>
                  <td className="whitespace-nowrap px-5 py-4 text-right tabular-nums">{amount.format(num(item.quantidade))}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums">{brl.format(num(item.valor_total))}</td>
                  <td className="px-5 py-4">
                    <details>
                      <summary className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300">Ver <ArrowUpRight size={13} /></summary>
                      <div className="mt-3 w-64 rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <dl className="space-y-2">
                          <div><dt className="text-slate-500">Pagamento</dt><dd className="mt-1 font-semibold">{item.condicao_pagamento || "Não informado"}</dd></div>
                          <div><dt className="text-slate-500">Custo unitário</dt><dd className="mt-1 font-semibold">{brl.format(num(item.custo_unitario))}</dd></div>
                          <div><dt className="text-slate-500">Importado em</dt><dd className="mt-1 font-semibold">{dateTimeBR(item.importado_em)}</dd></div>
                        </dl>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Search className="mx-auto mb-3 text-slate-300" size={28} />
                    <p className="font-semibold">Nenhum item encontrado</p>
                    <p className="mt-1 text-sm text-slate-500">Tente alterar os filtros ou o período.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm dark:border-slate-800 sm:px-7">
          <p className="text-slate-500">Exibindo <strong className="text-slate-900 dark:text-white">{whole.format(from)}–{whole.format(to)}</strong> de <strong className="text-slate-900 dark:text-white">{whole.format(total)}</strong> itens</p>
          <div className="flex items-center gap-2">
            {pagina > 1 ? <Link href={pageHref(filters, pagina - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800"><ChevronLeft size={14} /> Anterior</Link> : <span className="rounded-lg border border-slate-100 px-3 py-2 text-xs text-slate-400 dark:border-slate-800">Anterior</span>}
            <span className="px-2 text-xs text-slate-500">{pagina} / {totalPages}</span>
            {pagina < totalPages ? <Link href={pageHref(filters, pagina + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800">Próxima <ChevronRight size={14} /></Link> : <span className="rounded-lg border border-slate-100 px-3 py-2 text-xs text-slate-400 dark:border-slate-800">Próxima</span>}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-950">
          <CalendarDays size={20} className="mt-0.5 shrink-0 text-blue-600" />
          <div><h3 className="font-semibold">Origem e atualização</h3><p className="mt-1 leading-6 text-slate-500">Dados históricos provenientes das extrações SISCOM. A data da última importação é informada pelo banco, sem cópias no navegador.</p></div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-950">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div><h3 className="font-semibold">Consulta, não aprovação</h3><p className="mt-1 leading-6 text-slate-500">Valores nominais não são saldos pendentes. Recebimentos, aprovações, parcelas e OTB exigem conciliação e regras específicas antes de serem liberados.</p></div>
        </div>
      </section>
    </div>
  )
}
