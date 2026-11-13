/**
 * Porta de saída definida pelo domínio para repositório de pedidos de compra.
 * Apenas operações de leitura (Supabase read-only nesta etapa).
 */

import type { PedidoCompra } from "../../domain/entities/pedido-compra"

export interface PedidoCompraRepositoryPort {
  /**
   * Lista pedidos com paginação no servidor e filtros.
   */
  listar(filtros: ListarPedidosFiltros): Promise<ListarPedidosResultado>

  /**
   * Busca um pedido pelo número, incluindo itens.
   */
  buscarPorNumero(numeroPedido: string): Promise<PedidoCompra | null>

  /**
   * Busca um pedido pelo ID interno.
   */
  buscarPorId(id: string): Promise<PedidoCompra | null>
}

export interface ListarPedidosFiltros {
  loja?: string
  fornecedor?: string
  numeroPedido?: string
  produto?: string
  dataInicial?: Date
  dataFinal?: Date
  pagina?: number
  tamanhoPagina?: number
}

export interface ListarPedidosResultado {
  pedidos: PedidoCompra[]
  total: number
  pagina: number
  tamanhoPagina: number
  totalPaginas: number
}
