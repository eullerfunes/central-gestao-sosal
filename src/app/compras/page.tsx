import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { PedidoCompraSupabaseRepository } from "@/domains/compras/infrastructure/repositories/pedido-compra.repository"
import { ListarPedidosCompraUseCase } from "@/domains/compras/application/use-cases/listar-pedidos-compra.use-case"

const PAGE_SIZE = 20

interface ComprasPageProps {
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

export default async function ComprasPage({
  searchParams,
}: ComprasPageProps) {
  const params = await searchParams

  const loja = (typeof params.loja === "string" ? params.loja : "") || ""
  const fornecedor =
    (typeof params.fornecedor === "string" ? params.fornecedor : "") || ""
  const pedido =
    (typeof params.pedido === "string" ? params.pedido : "") || ""
  const produto =
    (typeof params.produto === "string" ? params.produto : "") || ""
  const dataInicial =
    (typeof params.data_inicial === "string" ? params.data_inicial : "") || ""
  const dataFinal =
    (typeof params.data_final === "string" ? params.data_final : "") || ""
  const pagina = params.pagina
    ? Number(Array.isArray(params.pagina) ? params.pagina[0] : params.pagina)
    : 1

  const repository = new PedidoCompraSupabaseRepository()
  const useCase = new ListarPedidosCompraUseCase(repository)

  const resultado = await useCase.executar({
    loja: loja || undefined,
    fornecedor: fornecedor || undefined,
    pedido: pedido || undefined,
    produto: produto || undefined,
    data_inicial: dataInicial || undefined,
    data_final: dataFinal || undefined,
    pagina,
    tamanho_pagina: PAGE_SIZE,
  })

  const temAmbiguidade = resultado.pedidos.some((p) => p.tem_ambiguidade)
  const mensagemAmbiguidade =
    resultado.pedidos.find((p) => p.mensagem_ambiguidade)?.mensagem_ambiguidade ??
    null

  if (!resultado.origem_disponivel) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground">
          {resultado.mensagem_indisponibilidade ?? "Dados indisponíveis"}
        </h3>
        <p className="text-muted-foreground mt-2">
          A leitura de pedidos de compra está indisponível no momento.
          Verifique a configuração de ambiente e as permissões de acesso.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border bg-background px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Pedidos de Compra
            </h1>
            <p className="text-sm text-muted-foreground">
              Consulta de pedidos de origem v_rpa_pedidos_compra
            </p>
          </div>
        </div>
      </header>

      <Card className="border border-border p-4 mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form action="/compras" method="get" id="filtros-compras" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Loja</Label>
              <Input
                name="loja"
                defaultValue={loja}
                placeholder="Loja"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Fornecedor</Label>
              <Input
                name="fornecedor"
                defaultValue={fornecedor}
                placeholder="Fornecedor"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Nº Pedido</Label>
              <Input
                name="pedido"
                defaultValue={pedido}
                placeholder="Nº pedido"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Produto</Label>
              <Input
                name="produto"
                defaultValue={produto}
                placeholder="Produto"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">De</Label>
              <Input type="date" name="data_inicial" defaultValue={dataInicial} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Até</Label>
              <Input type="date" name="data_final" defaultValue={dataFinal} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium">Página</Label>
              <Input
                type="number"
                name="pagina"
                defaultValue={String(pagina)}
                min="1"
              />
            </div>
          </form>
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" type="submit" form="filtros-compras">
              Aplicar filtros
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/compras">Limpar filtros</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {temAmbiguidade && (
        <Card className="border border-border p-4 mb-6 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-yellow-900">
              Atenção: dados ambíguos entre importações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-yellow-800">
              {mensagemAmbiguidade ??
                "Totais podem não ser definitivos devido a divergências entre importações."}
            </p>
          </CardContent>
        </Card>
      )}

      <main className="flex-1 overflow-y-auto p-4">
        <div className="rounded-md border border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Nº Pedido</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Qtd Total</TableHead>
                  <TableHead className="w-32">Data Pedido</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultado.pedidos.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhum pedido encontrado com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
                {resultado.pedidos.map((pedido) => (
                  <TableRow
                    key={`${pedido.loja}||${pedido.pedido}`}
                    className="hover:bg-accent transition-colors"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/compras/${pedido.pedido}?loja=${encodeURIComponent(pedido.loja)}`}
                      >
                        {pedido.pedido}
                      </Link>
                    </TableCell>
                    <TableCell>{pedido.loja}</TableCell>
                    <TableCell>{pedido.fornecedor_nome}</TableCell>
                    <TableCell className="text-right">
                      {valorFormatado(pedido.valor_total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {pedido.quantidade_total}
                    </TableCell>
                    <TableCell>{dataFormatada(pedido.data_pedido)}</TableCell>
                    <TableCell className="text-right">
                      <ChevronRightIcon />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Página {resultado.pagina} de {resultado.total_paginas}
              &nbsp;({resultado.total} pedido(s))
            </span>
            {resultado.total_registros_origem > 0 && (
              <span className="text-xs">
                ({resultado.total_registros_origem} registro(s) de origem /
                {resultado.total_importacoes} importação(ões))
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {resultado.pagina > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={construirURLFiltros({
                    loja,
                    fornecedor,
                    pedido,
                    produto,
                    data_inicial: dataInicial,
                    data_final: dataFinal,
                    pagina: String(resultado.pagina - 1),
                  })}
                >
                  Anterior
                </Link>
              </Button>
            )}
            {resultado.pagina < resultado.total_paginas && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={construirURLFiltros({
                    loja,
                    fornecedor,
                    pedido,
                    produto,
                    data_inicial: dataInicial,
                    data_final: dataFinal,
                    pagina: String(resultado.pagina + 1),
                  })}
                >
                  Próxima
                </Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      className="h-4 w-4 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  )
}

function construirURLFiltros(filtros: Record<string, string>): string {
  const params = new URLSearchParams()
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) params.set(chave, valor)
  })
  return `/compras?${params.toString()}`
}
