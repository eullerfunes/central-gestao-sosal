/**
 * Porta de saída definida pelo domínio para repositório de pedidos de compra.
 * Apenas operações de leitura (Supabase read-only nesta etapa).
 *
 * Identidade do pedido: loja + pedido (coluna "pedido" da view v_rpa_pedidos_compra).
 * Nunca usar .single() em view de itens — cada linha da view é um item.
 */

import type { PedidoCompraAgrupado } from "../../domain/entities/pedido-compra-origem"

export interface PedidoCompraRepositoryPort {
  /**
   * Lista pedidos agrupados com paginação e filtros.
   * Conta pedidos, não linhas de itens.
   */
  listar(filtros: ListarPedidosFiltros): Promise<ListarPedidosResultado>

  /**
   * Busca um pedido por loja + numero do pedido, incluindo todos os itens.
   * Nao permite visualizar itens de outra filial por correspondencia ambigua.
   */
  buscarPorLoEPedido(loja: string, pedido: string): Promise<PedidoCompraAgrupado | null>
}

export interface ListarPedidosFiltros {
  loja?: string
  fornecedor?: string
  pedido?: string
  produto?: string
  data_inicial?: string
  data_final?: string
  pagina?: number
  tamanho_pagina?: number
}

export interface ListarPedidosResultado {
  pedidos: PedidoCompraAgrupado[]
  total: number
  pagina: number
  tamanho_pagina: number
  total_paginas: number
  origem_disponivel: boolean
  total_registros_origem: number
  total_importacoes: number
  mensagem_indisponibilidade: string | null
}
