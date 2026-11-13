/**
 * Use case: Listar pedidos de compra com paginação e filtros.
 * Apenas leitura (Supabase read-only).
 */

import type { PedidoCompraRepositoryPort } from "../ports/pedido-compra.repository.port"
import type {
  ListarPedidosRequest,
  ListarPedidosResponse,
  PedidoCompraResumoDTO,
} from "../dto/pedido-compra.dto"

export class ListarPedidosCompraUseCase {
  constructor(private readonly repository: PedidoCompraRepositoryPort) {}

  async executar(request: ListarPedidosRequest): Promise<ListarPedidosResponse> {
    const pagina = request.pagina ?? 1
    const tamanhoPagina = request.tamanhoPagina ?? 20

    const filtros = {
      loja: request.loja,
      fornecedor: request.fornecedor,
      numeroPedido: request.numeroPedido,
      produto: request.produto,
      dataInicial: request.dataInicial ? new Date(request.dataInicial) : undefined,
      dataFinal: request.dataFinal ? new Date(request.dataFinal) : undefined,
      pagina,
      tamanhoPagina,
    }

    const resultado = await this.repository.listar(filtros)

    const pedidosDTO: PedidoCompraResumoDTO[] = resultado.pedidos.map((p) => ({
      id: p.id,
      numeroPedido: p.numeroPedido,
      loja: p.loja,
      codigoFornecedor: p.codigoFornecedor,
      nomeFornecedor: p.nomeFornecedor,
      dataPedido: p.dataPedido.toISOString(),
      condicaoPagamento: p.condicaoPagamento,
      status: p.status,
      decisaoCompra: p.decisaoCompra ?? null,
      valorTotal: p.valorTotalPedido.toUnits(),
      quantidadeTotalSolicitada: p.quantidadeTotalSolicitada,
      quantidadeTotalRecebida: p.quantidadeTotalRecebida,
      quantidadeTotalPendente: p.quantidadeTotalPendente,
      valorTotalPendente: p.valorTotalPendente.toUnits(),
      situacaoEntrega: p.situacaoEntregaAgregada,
      origem: p.origem,
      previsaoChegada: p.previsaoChegada?.toISOString() ?? null,
    }))

    return {
      pedidos: pedidosDTO,
      total: resultado.total,
      pagina: resultado.pagina,
      tamanhoPagina: resultado.tamanhoPagina,
      totalPaginas: resultado.totalPaginas,
      temDados: resultado.pedidos.length > 0,
      origemDados: resultado.pedidos.length > 0 ? resultado.pedidos[0]?.origem ?? null : null,
    }
  }
}
