/**
 * DTOs de entrada/saída para uso cases de Pedidos de Compra.
 * Dados sintéticos identificados como de teste quando usados em fixtures.
 */

export interface PedidoCompraResumoDTO {
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
}

export interface PedidoCompraDetalheDTO extends PedidoCompraResumoDTO {
  items: ItemPedidoDTO[]
  travaCaixa: boolean
  motivoDecisao: string | null
  observacoes: string | null
  situacaoOTB: string | null
  situacaoFinanceira: string | null
  curvaABC: string | null
  alertas: string[]
  parcelasPrevistas: ParcelaPrevistaDTO[] | null
  usuarioAtualizacao: string | null
  dataAtualizacao: string | null
}

export interface ItemPedidoDTO {
  codigoProduto: string
  descricaoProduto: string
  quantidadeSolicitada: number
  custoUnitario: number
  quantidadeRecebida: number
  quantidadePendente: number
  valorTotal: number
  valorPendente: number
  situacaoEntrega: string
  estaTotalmenteRecebido: boolean
  estaParcialmenteRecebido: boolean
  naoRecebido: boolean
}

export interface ParcelaPrevistaDTO {
  valorParcela: number
  prazoDias: number
}

export interface ListarPedidosRequest {
  loja?: string
  fornecedor?: string
  numeroPedido?: string
  produto?: string
  dataInicial?: string
  dataFinal?: string
  pagina?: number
  tamanhoPagina?: number
}

export interface ListarPedidosResponse {
  pedidos: PedidoCompraResumoDTO[]
  total: number
  pagina: number
  tamanhoPagina: number
  totalPaginas: number
  temDados: boolean
  origemDados: string | null
}
