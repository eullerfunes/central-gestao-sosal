/**
 * Use case: Listar pedidos de compra com paginação e filtros.
 * Apenas leitura (Supabase read-only via repository port).
 * Fluxo: Página → Use Case → Repository Port → Adaptador Supabase → DTO tipado.
 */

import type { PedidoCompraRepositoryPort } from "../ports/pedido-compra.repository.port"
import type {
  ListarPedidosRequest,
  ListarPedidosResponse,
  PedidoCompraResumoDTO,
} from "../dto/pedido-compra.dto"

export class ListarPedidosCompraUseCase {
  constructor(private readonly repository: PedidoCompraRepositoryPort) {}

  async executar(
    request: ListarPedidosRequest,
  ): Promise<ListarPedidosResponse> {
    const pagina = request.pagina ?? 1
    const tamanhoPagina = request.tamanho_pagina ?? 20

    const filtros = {
      loja: request.loja,
      fornecedor: request.fornecedor,
      pedido: request.pedido,
      produto: request.produto,
      data_inicial: request.data_inicial,
      data_final: request.data_final,
      pagina,
      tamanho_pagina: tamanhoPagina,
    }

    const resultado = await this.repository.listar(filtros)

    const pedidosDTO: PedidoCompraResumoDTO[] = resultado.pedidos.map(
      (p) => ({
        loja: p.loja,
        pedido: p.pedido,
        fornecedor_codigo: p.fornecedor_codigo,
        fornecedor_nome: p.fornecedor_nome,
        data_pedido: p.data_pedido || null,
        condicao_pagamento: p.condicao_pagamento,
        quantidade_total: p.quantidade_total,
        valor_total: p.valor_total,
        importacao_ids: p.importacao_ids,
        importado_em_mais_recente: p.importado_em_mais_recente || null,
        tem_ambiguidade: p.tem_ambiguidade,
        mensagem_ambiguidade: p.mensagem_ambiguidade,
        totaisConfiaveis: p.totaisConfiaveis,
        quantidade_total_recebida: null,
        quantidade_total_pendente: null,
        valor_total_pendente: null,
        situacao_entrega: null,
        status: null,
      }),
    )

    return {
      pedidos: pedidosDTO,
      total: resultado.total,
      pagina: resultado.pagina,
      tamanho_pagina: resultado.tamanho_pagina,
      total_paginas: resultado.total_paginas,
      tem_dados: resultado.pedidos.length > 0,
      origem_disponivel: resultado.origem_disponivel,
      total_registros_origem: resultado.total_registros_origem,
      total_importacoes: resultado.total_importacoes,
      mensagem_indisponibilidade: resultado.mensagem_indisponibilidade,
    }
  }
}
