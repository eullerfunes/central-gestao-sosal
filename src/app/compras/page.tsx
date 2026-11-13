"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronRight,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { PedidoCompraResumoDTO } from "@/domains/compras/application/dto/pedido-compra.dto"

const PAGE_SIZE = 20

export default function ComprasPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [pedidos, setPedidos] = React.useState<PedidoCompraResumoDTO[]>([])
  const [total, setTotal] = React.useState(0)
  const [pagina, setPagina] = React.useState(1)
  const [totalPaginas, setTotalPaginas] = React.useState(0)
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)
  const [origemDados, setOrigemDados] = React.useState<string | null>(null)

  const filtros = {
    loja: searchParams.get("loja") || "",
    fornecedor: searchParams.get("fornecedor") || "",
    numeroPedido: searchParams.get("numeroPedido") || "",
    produto: searchParams.get("produto") || "",
    dataInicial: searchParams.get("dataInicial") || "",
    dataFinal: searchParams.get("dataFinal") || "",
  }

  React.useEffect(() => {
    let cancelado = false

    async function carregar() {
      setCarregando(true)
      setErro(null)
      try {
        const supabase = createSupabaseBrowserClient()
        if (!supabase) {
          setErro(
            "Variáveis de ambiente do Supabase não configuradas. Dados indisponíveis.",
          )
          setCarregando(false)
          return
        }

        // View candidata: não confirmada como existente no Supabase.
        const { data, error, count } = await supabase
          .from('"Só Sal".v_rpa_pedidos_compra')
          .select("*", { count: "exact" })
          .ilike(
            "numero_pedido",
            `%${filtros.numeroPedido || ""}%`,
          )
          .range(
            (pagina - 1) * PAGE_SIZE,
            pagina * PAGE_SIZE - 1,
          )

        if (error) {
          setErro("Não foi possível carregar os pedidos.")
          setCarregando(false)
          return
        }

        const pedidosMapeados: PedidoCompraResumoDTO[] = (data ?? []).map(
          (row) => ({
            id: String(row.id ?? ""),
            numeroPedido: String(row.numero_pedido ?? ""),
            loja: String(row.loja ?? ""),
            codigoFornecedor: String(row.codigo_fornecedor ?? ""),
            nomeFornecedor: String(row.nome_fornecedor ?? ""),
            dataPedido: row.data_pedido
              ? new Date(String(row.data_pedido)).toISOString()
              : new Date().toISOString(),
            condicaoPagamento: row.condicao_pagamento
              ? String(row.condicao_pagamento)
              : null,
            status: "enviado",
            decisaoCompra: null,
            valorTotal: 0,
            quantidadeTotalSolicitada: 0,
            quantidadeTotalRecebida: 0,
            quantidadeTotalPendente: 0,
            valorTotalPendente: 0,
            situacaoEntrega: "em-aberto",
            origem: row.origem ? String(row.origem) : null,
            previsaoChegada: row.previsao_chegada
              ? new Date(String(row.previsao_chegada)).toISOString()
              : null,
          }),
        )

        if (!cancelado) {
          setPedidos(pedidosMapeados)
          setTotal(count ?? 0)
          setTotalPaginas(Math.ceil((count ?? 0) / PAGE_SIZE))
          setOrigemDados(
            pedidosMapeados.length > 0
              ? pedidosMapeados[0].origem ?? null
              : null,
          )
        }
      } catch {
        if (!cancelado) {
          setErro("Não foi possível carregar os pedidos. Tente novamente.")
        }
      } finally {
        if (!cancelado) {
          setCarregando(false)
        }
      }
    }

    carregar()

    return () => {
      cancelado = true
    }
  }, [filtros.numeroPedido, pagina])

  const podeExibirResumo = Boolean(origemDados && total > 0)

  const atualizarFiltros = (novosFiltros: Partial<typeof filtros>) => {
    const params = new URLSearchParams()
    if (novosFiltros.loja) params.set("loja", novosFiltros.loja)
    if (novosFiltros.fornecedor) params.set("fornecedor", novosFiltros.fornecedor)
    if (novosFiltros.numeroPedido)
      params.set("numeroPedido", novosFiltros.numeroPedido)
    if (novosFiltros.produto) params.set("produto", novosFiltros.produto)
    if (novosFiltros.dataInicial)
      params.set("dataInicial", novosFiltros.dataInicial)
    if (novosFiltros.dataFinal) params.set("dataFinal", novosFiltros.dataFinal)
    params.set("pagina", "1")
    router.push(`/compras?${params.toString()}`)
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Carregando pedidos...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Erro ao carregar</h3>
        <p className="text-muted-foreground">{erro}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho do módulo */}
      <header className="border-b border-border bg-background px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Pedidos de Compra
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestão de pedidos, recebimentos e parcelas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/compras">
              <Button variant="outline" className="hidden sm:inline-flex">
                Ver todos os pedidos
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <Card className="border border-border p-4 mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Loja</Label>
              <Input
                value={filtros.loja}
                onChange={(e) =>
                  atualizarFiltros({ loja: e.target.value })
                }
                placeholder="Loja"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Fornecedor</Label>
              <Input
                value={filtros.fornecedor}
                onChange={(e) =>
                  atualizarFiltros({ fornecedor: e.target.value })
                }
                placeholder="Fornecedor"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Nº Pedido</Label>
              <Input
                value={filtros.numeroPedido}
                onChange={(e) =>
                  atualizarFiltros({ numeroPedido: e.target.value })
                }
                placeholder="Nº pedido"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Produto</Label>
              <Input
                value={filtros.produto}
                onChange={(e) => atualizarFiltros({ produto: e.target.value })}
                placeholder="Produto"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">De</Label>
              <Input
                type="date"
                value={filtros.dataInicial}
                onChange={(e) =>
                  atualizarFiltros({ dataInicial: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Até</Label>
              <Input
                type="date"
                value={filtros.dataFinal}
                onChange={(e) =>
                  atualizarFiltros({ dataFinal: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                atualizarFiltros({
                  loja: "",
                  fornecedor: "",
                  numeroPedido: "",
                  produto: "",
                  dataInicial: "",
                  dataFinal: "",
                })
              }}
            >
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto p-4">
        {!erro && (
          <>
            {/* Resumo de valores - apenas quando origem confirmada */}
            {podeExibirResumo && (
              <Card className="mb-6 border border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Resumo de valores
                  </CardTitle>
                  <CardDescription>
                    Valores calculados a partir dos dados de origem confirmados.
                    Origem: {origemDados}
                    <br />
                    <span className="text-xs text-muted-foreground mt-2 block">
                      Resumo exibido apenas quando origem e cálculo estão comprovados.
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-0">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Total de pedidos
                    </div>
                    <div className="text-lg font-semibold">{total}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Valor total pendente
                    </div>
                    <div className="text-lg font-semibold">
                      {pedidos
                        .reduce((acc, p) => acc + p.valorTotalPendente, 0)
                        .toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Itens pendentes
                    </div>
                    <div className="text-lg font-semibold">
                      {pedidos.reduce(
                        (acc, p) => acc + p.quantidadeTotalPendente,
                        0,
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Origem dos dados
                    </div>
                    <div className="text-sm font-medium text-muted-foreground truncate">
                      {origemDados ?? "Não disponível"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!podeExibirResumo && (
              <Card className="mb-6 border border-border p-4">
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Dados não disponíveis
                  </h3>
                  <p className="text-muted-foreground">
                    Aguardando integração com a fonte de dados.
                    Nenhum KPI será exibido sem origem confirmada.
                  </p>
                </div>
              </Card>
            )}

            {/* Lista de pedidos */}
            <div className="rounded-md border border-border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Nº Pedido</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Valor Pendente</TableHead>
                      <TableHead className="w-32">Situação</TableHead>
                      <TableHead className="w-24">Data</TableHead>
                      <TableHead className="w-16" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidos.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          Nenhum pedido encontrado com os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    )}
                    {pedidos.map((pedido) => (
                      <TableRow
                        key={pedido.id}
                        className="hover:bg-accent transition-colors"
                      >
                        <Link href={`/compras/${pedido.numeroPedido}`}>
                          <a className="block p-4">
                            <TableCell className="font-medium">
                              {pedido.numeroPedido}
                            </TableCell>
                            <TableCell>{pedido.loja}</TableCell>
                            <TableCell>{pedido.nomeFornecedor}</TableCell>
                            <TableCell className="text-right">
                              {pedido.valorTotal.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              {pedido.valorTotalPendente.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {pedido.situacaoEntrega}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(pedido.dataPedido).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-right">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                          </a>
                        </Link>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-6 px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Página {pagina} de {totalPaginas}
                </div>
                <div className="flex items-center gap-2">
                  {pagina > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagina((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                  )}
                  {pagina < totalPaginas && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagina((p) => p + 1)}
                    >
                      Próxima
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
