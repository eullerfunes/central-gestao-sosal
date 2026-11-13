/**
 * Use case: Consultar detalhes de um pedido de compra por loja + número.
 * Apenas leitura (Supabase read-only via repository port).
 * Fluxo: Página → Use Case → Repository Port → Adaptador Supabase → DTO tipado.
 *
 * Nao permite visualizar itens de outra filial por correspondencia parcial.
 * A identidade eh loja + pedido (ambos obrigatórios).
 */

import type { PedidoCompraRepositoryPort } from "../ports/pedido-compra.repository.port"
import type { PedidoCompraDetalheDTO } from "../dto/pedido-compra.dto"

export class ConsultarPedidoCompraUseCase {
  constructor(private readonly repository: PedidoCompraRepositoryPort) {}

  async executar(
    loja: string,
    pedido: string,
  ): Promise<PedidoCompraDetalheDTO | null> {
    if (!loja.trim() || !pedido.trim()) {
      return null
    }

    const pedidoAgrupado = await this.repository.buscarPorLoEPedido(loja, pedido)

    if (!pedidoAgrupado) {
      return null
    }

    const itemsDTO = pedidoAgrupado.items.map((item) => ({
      linha_excel: item.linha_excel,
      produto_codigo: item.produto_codigo,
      descricao: item.descricao,
      quantidade: item.quantidade,
      custo_unitario: item.custo_unitario,
      valor_total_calculado: item.valor_total_calculado,
      importacao_id: item.importacao_id,
      importado_em: item.importado_em,
      quantidade_recebida: null,
      quantidade_pendente: null,
      valor_pendente: null,
      situacao_entrega: null,
    }))

    return {
      loja: pedidoAgrupado.loja,
      pedido: pedidoAgrupado.pedido,
      fornecedor_codigo: pedidoAgrupado.fornecedor_codigo,
      fornecedor_nome: pedidoAgrupado.fornecedor_nome,
      data_pedido: pedidoAgrupado.data_pedido || null,
      condicao_pagamento: pedidoAgrupado.condicao_pagamento,
      quantidade_total: pedidoAgrupado.quantidade_total,
      valor_total: pedidoAgrupado.valor_total,
      importacao_ids: pedidoAgrupado.importacao_ids,
      importado_em_mais_recente: pedidoAgrupado.importado_em_mais_recente || null,
      tem_ambiguidade: pedidoAgrupado.tem_ambiguidade,
      mensagem_ambiguidade: pedidoAgrupado.mensagem_ambiguidade,
      totaisConfiaveis: pedidoAgrupado.totaisConfiaveis,
      quantidade_total_recebida: null,
      quantidade_total_pendente: null,
      valor_total_pendente: null,
      situacao_entrega: null,
      status: null,
      items: itemsDTO,
      decisao_compra: null,
      trava_caixa: null,
      motivo_decisao: null,
      observacoes: null,
      situacao_otb: null,
      situacao_financeira: null,
      curva_abc: null,
      alertas: [],
      parcelas_previstas: null,
      usuario_atualizacao: null,
      data_atualizacao: null,
    }
  }
}
