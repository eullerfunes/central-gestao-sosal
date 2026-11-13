"use client"

import * as React from "react"
import { ChevronLeft, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function PedidoDetalhePage() {
  const params = useParams()
  const numeroPedido = (params as { numeroPedido?: string }).numeroPedido || ""

  type PedidoDetalhe = {
    id: string
    numeroPedido: string
    loja: string
    codigoFornecedor: string
    nomeFornecedor: string
    dataPedido: string
    condicaoPagamento: string | null
    status: string
    decisaoCompra: string | null
    valorTotal: number
    quantidadeTotalSolicitada: number
    quantidadeTotalRecebida: number
    quantidadeTotalPendente: number
    valorTotalPendente: number
    situacaoEntrega: string
    origem: string | null
    previsaoChegada: string | null
    items: Array<{
      codigoProduto: string
      descricaoProduto: string
      quantidadeSolicitada: number
      custoUnitario: number
      quantidadeRecebida: number
      quantidadePendente: number
      valorTotal: number
      valorPendente: number
      situacaoEntrega: string
    }>
    travaCaixa: boolean
    motivoDecisao: string | null
    observacoes: string | null
    situacaoOTB: string | null
    situacaoFinanceira: string | null
    curvaABC: string | null
    alertas: string[]
    parcelasPrevistas: Array<{ valorParcela: number; prazoDias: number }> | null
    usuarioAtualizacao: string | null
    dataAtualizacao: string | null
  }

  const [pedido, setPedido] = React.useState<PedidoDetalhe | null>(null)
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)

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

        const { data, error } = await supabase
          .from('"Só Sal".v_rpa_pedidos_compra')
          .select("*")
          .eq("numero_pedido", numeroPedido)
          .single()

        if (error || !data) {
          if (!cancelado) {
            setErro("Pedido não encontrado.")
            setCarregando(false)
          }
          return
        }

        if (!cancelado) {
          setPedido({
            id: String(data.id ?? ""),
            numeroPedido: String(data.numero_pedido ?? ""),
            loja: String(data.loja ?? ""),
            codigoFornecedor: String(data.codigo_fornecedor ?? ""),
            nomeFornecedor: String(data.nome_fornecedor ?? ""),
            dataPedido: data.data_pedido
              ? new Date(String(data.data_pedido)).toISOString()
              : new Date().toISOString(),
            condicaoPagamento: data.condicao_pagamento
              ? String(data.condicao_pagamento)
              : null,
            status: "enviado",
            decisaoCompra: null,
            valorTotal: 0,
            quantidadeTotalSolicitada: 0,
            quantidadeTotalRecebida: 0,
            quantidadeTotalPendente: 0,
            valorTotalPendente: 0,
            situacaoEntrega: "em-aberto",
            origem: data.origem ? String(data.origem) : null,
            previsaoChegada: data.previsao_chegada
              ? new Date(String(data.previsao_chegada)).toISOString()
              : null,
            items: [],
            travaCaixa: false,
            motivoDecisao: null,
            observacoes: null,
            situacaoOTB: null,
            situacaoFinanceira: null,
            curvaABC: null,
            alertas: [],
            parcelasPrevistas: null,
            usuarioAtualizacao: null,
            dataAtualizacao: null,
          })
        }
      } catch {
        if (!cancelado) {
          setErro("Não foi possível carregar o pedido.")
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
  }, [numeroPedido])

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Clock className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Carregando pedido...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-foreground">{erro}</h2>
        <Button asChild className="mt-4">
          <Link href="/compras">Voltar</Link>
        </Button>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Pedido não encontrado</h2>
        <p className="text-muted-foreground">
          O pedido {numeroPedido} não existe ou não está disponível.
        </p>
        <Button asChild className="mt-4">
          <Link href="/compras">Voltar</Link>
        </Button>
      </div>
    )
  }

  const podeExibirResumo = Boolean(pedido.origem)

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border bg-background px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/compras">
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Pedido {pedido.numeroPedido}
            </h1>
            <p className="text-sm text-muted-foreground">
              Detalhes do pedido de compra
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-sm">Nº do pedido</CardTitle>
              <CardDescription>{pedido.numeroPedido}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-sm">Loja</CardTitle>
              <CardDescription>{pedido.loja}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-sm">Fornecedor</CardTitle>
              <CardDescription>{pedido.nomeFornecedor}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-sm">Condição de pagamento</CardTitle>
              <CardDescription>
                {pedido.condicaoPagamento ?? "Não informada (presumida: 30 dias)"}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {podeExibirResumo && (
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Resumo de valores</CardTitle>
              <CardDescription>
                Valores calculados a partir dos dados de origem confirmados.
                Origem: {pedido.origem}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-0">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Valor total
                </div>
                <div className="text-lg font-semibold">
                  {pedido.valorTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Valor pendente
                </div>
                <div className="text-lg font-semibold">
                  {pedido.valorTotalPendente.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Qtd. solicitada
                </div>
                <div className="text-lg font-semibold">
                  {pedido.quantidadeTotalSolicitada}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Qtd. pendente
                </div>
                <div className="text-lg font-semibold">
                  {pedido.quantidadeTotalPendente}
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

        <Separator className="my-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Itens */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Itens do pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd Solicitada</TableHead>
                        <TableHead className="text-right">Custo Unit.</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead className="text-right">Qtd Recebida</TableHead>
                        <TableHead className="text-right">Qtd Pendente</TableHead>
                        <TableHead className="text-right">Valor Pendente</TableHead>
                        <TableHead className="text-center">Situação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(pedido.items || []).map((item) => (
                        <TableRow key={item.codigoProduto}>
                          <TableCell>
                            {item.codigoProduto} - {item.descricaoProduto}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantidadeSolicitada}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.custoUnitario.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.valorTotal.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantidadeRecebida}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantidadePendente}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.valorPendente.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {item.situacaoEntrega}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indicadores OTB e Caixa */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">OTB</CardTitle>
                <CardDescription className="text-xs">
                  Open To Buy - Orçamento de compras
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Situação OTB
                  </div>
                  <div className="text-lg font-semibold text-muted-foreground">
                    Não disponível
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    OTB completo não está na view de pedidos.
                    Aguardando integração.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Trava de Caixa
                </CardTitle>
                <CardDescription className="text-xs">
                  Indicador de bloqueio financeiro
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="p-4">
                  <Badge variant="outline" className="text-xs">
                    Não informado
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    Trava de caixa não está na view de pedidos.
                    Aguardando integração.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Parcelas previstas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Parcelas previstas</CardTitle>
            <CardDescription className="text-xs">
              Previsão de pagamento por parcela
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4">
              <p className="text-xs text-muted-foreground text-center py-4">
                Parcelas previstas não estão na view de pedidos.
                Decisões Segurar, Cancelar e Já pago excluem geração de parcelas.
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Histórico e observações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Histórico e observações</CardTitle>
            <CardDescription className="text-xs">
              Auditoria de alterações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <span className="font-semibold">Usuário atualização:</span>{" "}
                  {pedido.usuarioAtualizacao ?? "Não disponível"}
                </p>
                <p>
                  <span className="font-semibold">Data atualização:</span>{" "}
                  {pedido.dataAtualizacao ?? "Não disponível"}
                </p>
                <p>
                  <span className="font-semibold">Observações:</span>{" "}
                  {pedido.observacoes ?? "Não disponível"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Histórico completo não está na view de pedidos.
                  Aguardando integração com fonte de auditoria.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
