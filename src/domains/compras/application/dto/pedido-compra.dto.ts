/**
 * DTOs de entrada/saída para casos de uso de Pedidos de Compra.
 * Apenas campos comprovadamente disponíveis na view v_rpa_pedidos_compra
 * ou calculados a partir dela. Campos sem dados de origem exibem
 * "Não disponível" — nunca zero para mascarar ausência de informação.
 */

export interface PedidoCompraResumoDTO {
  loja: string
  pedido: string
  fornecedor_codigo: string
  fornecedor_nome: string
  data_pedido: string | null
  condicao_pagamento: string | null
  quantidade_total: number
  valor_total: number
  importacao_ids: string[]
  importado_em_mais_recente: string | null
  /** Indica que a identidade dos itens não é confiável entre importacoes */
  tem_ambiguidade: boolean
  /** Mensagem descritiva da ambiguidade, quando presente */
  mensagem_ambiguidade: string | null
  /* Campos indisponíveis na view — nunca preenchidos com zero */
  quantidade_total_recebida: null
  quantidade_total_pendente: null
  valor_total_pendente: null
  situacao_entrega: null
  status: null
}

export interface PedidoCompraDetalheDTO extends PedidoCompraResumoDTO {
  items: ItemPedidoDTO[]
  /* Campos indisponíveis na view */
  decisao_compra: null
  trava_caixa: null
  motivo_decisao: null
  observacoes: null
  situacao_otb: null
  situacao_financeira: null
  curva_abc: null
  alertas: string[]
  parcelas_previstas: null
  usuario_atualizacao: null
  data_atualizacao: null
}

export interface ItemPedidoDTO {
  linha_excel: number
  produto_codigo: string
  descricao: string
  quantidade: number
  custo_unitario: number
  valor_total_calculado: number
  importacao_id: string
  importado_em: string
  /* Campos indisponíveis na view */
  quantidade_recebida: null
  quantidade_pendente: null
  valor_pendente: null
  situacao_entrega: null
}

export interface ListarPedidosRequest {
  loja?: string
  fornecedor?: string
  pedido?: string
  produto?: string
  data_inicial?: string
  data_final?: string
  pagina?: number
  tamanho_pagina?: number
}

export interface ListarPedidosResponse {
  pedidos: PedidoCompraResumoDTO[]
  total: number
  pagina: number
  tamanho_pagina: number
  total_paginas: number
  tem_dados: boolean
  origem_disponivel: boolean
  total_registros_origem: number
  total_importacoes: number
  mensagem_indisponibilidade: string | null
}
