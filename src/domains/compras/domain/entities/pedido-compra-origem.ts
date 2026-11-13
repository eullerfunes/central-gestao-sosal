/**
 * Registro de origem extraído da view "Só Sal".v_rpa_pedidos_compra.
 * Cada linha representa um item extraído, não necessariamente um pedido completo.
 * Colunas compatíveis com a view existente (não alterar a view).
 */

export interface PedidoCompraOrigemRegistro {
  importacao_id: string
  importado_em: string
  linha_excel: number
  loja: string
  fornecedor_codigo: string
  fornecedor_nome: string
  pedido: string
  data_pedido: string
  condicao_pagamento: string | null
  produto_codigo: string
  descricao: string
  quantidade: number
  custo_unitario: number
  valor_total_informado: number
  valor_total_calculado: number
}

export interface PedidoCompraOrigemItem {
  linha_excel: number
  produto_codigo: string
  descricao: string
  quantidade: number
  custo_unitario: number
  valor_total_calculado: number
  importacao_id: string
  importado_em: string
}

export interface PedidoCompraAgrupado {
  loja: string
  pedido: string
  fornecedor_codigo: string
  fornecedor_nome: string
  data_pedido: string
  condicao_pagamento: string | null
  items: PedidoCompraOrigemItem[]
  quantidade_total: number
  valor_total: number
  importacao_ids: string[]
  importado_em_mais_recente: string
}
