/**
 * Use case: Consultar detalhes de um pedido de compra por número.
 * Apenas leitura (Supabase read-only).
 */

import type { PedidoCompraRepositoryPort } from "../ports/pedido-compra.repository.port"
import type { PedidoCompraDetalheDTO } from "../dto/pedido-compra.dto"

export class ConsultarPedidoCompraUseCase {
  constructor(private readonly repository: PedidoCompraRepositoryPort) {}

  async executar(numeroPedido: string): Promise<PedidoCompraDetalheDTO | null> {
    const pedido = await this.repository.buscarPorNumero(numeroPedido)

    if (!pedido) {
      return null
    }

    const itemsDTO = pedido.items.map((item) => ({
      codigoProduto: item.codigoProduto,
      descricaoProduto: item.descricaoProduto,
      quantidadeSolicitada: item.quantidadeSolicitada,
      custoUnitario: item.custoUnitario,
      quantidadeRecebida: item.quantidadeRecebida,
      quantidadePendente: item.quantidadePendente,
      valorTotal: item.valorTotal.toUnits(),
      valorPendente: item.valorPendente.toUnits(),
      situacaoEntrega: item.situacaoEntrega,
      estaTotalmenteRecebido: item.estaTotalmenteRecebido,
      estaParcialmenteRecebido: item.estaParcialmenteRecebido,
      naoRecebido: item.naoRecebido,
    }))

    return {
      id: pedido.id,
      numeroPedido: pedido.numeroPedido,
      loja: pedido.loja,
      codigoFornecedor: pedido.codigoFornecedor,
      nomeFornecedor: pedido.nomeFornecedor,
      dataPedido: pedido.dataPedido.toISOString(),
      condicaoPagamento: pedido.condicaoPagamento,
      status: pedido.status,
      decisaoCompra: pedido.decisaoCompra ?? null,
      valorTotal: pedido.valorTotalPedido.toUnits(),
      quantidadeTotalSolicitada: pedido.quantidadeTotalSolicitada,
      quantidadeTotalRecebida: pedido.quantidadeTotalRecebida,
      quantidadeTotalPendente: pedido.quantidadeTotalPendente,
      valorTotalPendente: pedido.valorTotalPendente.toUnits(),
      situacaoEntrega: pedido.situacaoEntregaAgregada,
      origem: pedido.origem,
      previsaoChegada: pedido.previsaoChegada?.toISOString() ?? null,
      items: itemsDTO,
      travaCaixa: pedido.travaCaixa,
      motivoDecisao: pedido.motivoDecisao,
      observacoes: pedido.observacoes,
      situacaoOTB: pedido.situacaoOTB,
      situacaoFinanceira: pedido.situacaoFinanceira,
      curvaABC: pedido.curvaABC,
      alertas: pedido.alertas,
      parcelasPrevistas: pedido.parcelasPrevistas,
      usuarioAtualizacao: pedido.usuarioAtualizacao,
      dataAtualizacao: pedido.dataAtualizacao?.toISOString() ?? null,
    }
  }
}
