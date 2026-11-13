/**
 * Exportações públicas do domínio de Compras.
 * Camada de aplicação, domínio e infraestrutura (somente leitura).
 */

export type {
  PedidoCompraRepositoryPort,
  ListarPedidosFiltros,
  ListarPedidosResultado,
} from "./application/ports/pedido-compra.repository.port"

export { PedidoCompraSupabaseRepository } from "./infrastructure/repositories/pedido-compra.repository"

export { ListarPedidosCompraUseCase } from "./application/use-cases/listar-pedidos-compra.use-case"
export { ConsultarPedidoCompraUseCase } from "./application/use-cases/consultar-pedido-compra.use-case"

export type {
  PedidoCompraResumoDTO,
  PedidoCompraDetalheDTO,
  ItemPedidoDTO,
  ParcelaPrevistaDTO,
  ListarPedidosRequest,
  ListarPedidosResponse,
} from "./application/dto/pedido-compra.dto"

export { createComprasSupabaseClient } from "./infrastructure/supabase/client"

export {
  PedidoCompra,
  type PedidoCompraProps,
} from "./domain/entities/pedido-compra"

export {
  ItemPedido,
  type ItemPedidoProps,
} from "./domain/entities/item-pedido"

export { Money } from "./domain/value-objects/money"
export {
  STATUS_PEDIDO_LABELS,
  isStatusPedido,
} from "./domain/value-objects/status-pedido"
export type { StatusPedido } from "./domain/value-objects/status-pedido"
export {
  SITUACAO_ENTREGA_LABELS,
  isSituacaoEntrega,
} from "./domain/value-objects/situacao-entrega"
export type { SituacaoEntrega } from "./domain/value-objects/situacao-entrega"
export {
  DECISAO_COMPRA_LABELS,
  DECISOES_SEM_PARCELAS,
  geraParcelasPrevistas,
  isDecisaoCompra,
} from "./domain/value-objects/decisao-compra"
export type { DecisaoCompra } from "./domain/value-objects/decisao-compra"

export {
  PedidoNaoEncontrado,
  FornecedorNaoIdentificado,
  ProdutoSemCadastro,
  CondicaoPagamentoAusente,
  CalculoInvalido,
} from "./domain/exceptions"
