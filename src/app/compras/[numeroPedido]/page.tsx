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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { PedidoCompraSupabaseRepository } from "@/domains/compras/infrastructure/repositories/pedido-compra.repository"
import { ConsultarPedidoCompraUseCase } from "@/domains/compras/application/use-cases/consultar-pedido-compra.use-case"

interface PedidoDetalhePageProps {
  params: Promise<{ numeroPedido: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function valorFormatado(v: number | null): string {
  if (v === null) return "Não disponível"
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function dataFormatada(d: string | null): string {
  if (!d) return "Não disponível"
  return new Date(d).toLocaleDateString("pt-BR")
}

export default async function PedidoDetalhePage({
  params,
  searchParams,
}: PedidoDetalhePageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const numeroPedido =
    typeof resolvedParams.numeroPedido === "string"
      ? resolvedParams.numeroPedido
      : ""
  const loja =
    typeof resolvedSearchParams.loja === "string"
      ? resolvedSearchParams.loja
      : ""

  if (!loja || !numeroPedido) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-foreground">
          Identificador de pedido incompleto
        </h2>
        <p className="text-muted-foreground">
          É necessário informar loja e número do pedido para visualizar os detalhes.
        </p>
        <Button asChild className="mt-4">
          <Link href="/compras">Voltar</Link>
        </Button>
      </div>
    )
  }

  const repository = new PedidoCompraSupabaseRepository()
  const useCase = new ConsultarPedidoCompraUseCase(repository)

  const pedido = await useCase.executar(loja, numeroPedido)

  if (!pedido) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">
          Pedido não encontrado
        </h2>
        <p className="text-muted-foreground">
          O pedido {numeroPedido} da loja {loja} não existe ou não está disponível.
        </p>
        <Button asChild className="mt-4">
          <Link href="/compras">Voltar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border bg-background px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/compras?loja=${encodeURIComponent(loja)}`}>
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Pedido {pedido.pedido}
            </h1>
            <p className="text-sm text-muted-foreground">
              Detalhes do pedido de compra — Loja {pedido.loja}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-sm">Nº do pedido</CardTitle>
              <CardDescription>{pedido.pedido}</CardDescription>
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
              <CardDescription>{pedido.fornecedor_nome}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-sm">Condição de pagamento</CardTitle>
              <CardDescription>
                {pedido.condicao_pagamento ?? "Não informada"}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-6 border border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Resumo de valores (disponíveis na origem)
            </CardTitle>
            <CardDescription>
              Valores calculados a partir da view v_rpa_pedidos_compra.
              Campos sem dados de origem exibem &quot;Não disponível&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-0">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Valor total
              </div>
              <div className="text-lg font-semibold">
                {valorFormatado(pedido.valor_total)}
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Qtd. total solicitada
              </div>
              <div className="text-lg font-semibold">
                {pedido.quantidade_total}
              </div>
            </div>
            {pedido.tem_ambiguidade && (
              <div className="p-4 bg-yellow-50/50 rounded-lg border border-yellow-200">
                <div className="text-xs text-yellow-800 uppercase tracking-wider mb-1">
                  Ambiguidade de itens
                </div>
                <div className="text-sm text-yellow-900">
                  {pedido.mensagem_ambiguidade ?? "Totais podem não ser definitivos."}
                </div>
              </div>
            )}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Qtd. recebida
              </div>
              <div className="text-lg font-semibold text-muted-foreground">
                Não disponível
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Campo não existe na view de pedidos.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Qtd. pendente
              </div>
              <div className="text-lg font-semibold text-muted-foreground">
                Não disponível
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Campo não existe na view de pedidos.
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Itens do pedido ({pedido.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Linha Excel</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd.</TableHead>
                        <TableHead className="text-right">Custo Unit.</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead className="text-center">Importação</TableHead>
                        <TableHead className="text-center">Importado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedido.items.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Nenhum item encontrado para este pedido.
                          </TableCell>
                        </TableRow>
                      )}
                      {pedido.items.map((item) => (
                        <TableRow
                          key={`${item.linha_excel}||${item.produto_codigo}`}
                          className="hover:bg-accent transition-colors"
                        >
                          <TableCell>{item.linha_excel}</TableCell>
                          <TableCell>
                            {item.produto_codigo} - {item.descricao}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantidade}
                          </TableCell>
                          <TableCell className="text-right">
                            {valorFormatado(item.custo_unitario)}
                          </TableCell>
                          <TableCell className="text-right">
                            {valorFormatado(item.valor_total_calculado)}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.importacao_id || "Não disponível"}
                          </TableCell>
                          <TableCell className="text-center">
                            {dataFormatada(item.importado_em)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Importações históricas
            </CardTitle>
            <CardDescription className="text-xs">
              Versões do pedido nas extrações D-15 e históricas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <span className="font-semibold">Importações:</span>{" "}
                  {pedido.importacao_ids.length > 0
                    ? pedido.importacao_ids.join(", ")
                    : "Não disponível"}
                </p>
                <p>
                  <span className="font-semibold">Mais recente:</span>{" "}
                  {dataFormatada(pedido.importado_em_mais_recente)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Cada linha da view representa um item extraído em uma
                  importação específica. Histórico preservado, sem exclusão de
                  pedidos antigos por ausência em carga incremental.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Campos indisponíveis</CardTitle>
            <CardDescription className="text-xs">
              Informações que não existem na view v_rpa_pedidos_compra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4">
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Status do pedido</li>
                <li>Decisão de compra</li>
                <li>Recebimento (qtd. recebida / pendente)</li>
                <li>Valor pendente</li>
                <li>Situação de entrega</li>
                <li>OTB (Open To Buy)</li>
                <li>Trava de caixa</li>
                <li>Parcelas previstas</li>
                <li>Observações e histórico de auditoria</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Nenhum desses campos é preenchido com zero. Ausência de dado
                é indicada explicitamente como &quot;Não disponível&quot;.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
