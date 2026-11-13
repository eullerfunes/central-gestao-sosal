/**
 * Repositório de pedidos de compra — implementação read-only sobre Supabase.
 *
 * Restrições desta etapa:
 * - Somente leitura no Supabase existente.
 * - Nenhuma migration.
 * - Nenhuma alteração de schema, tabela ou view.
 * - Nenhuma escrita em pedidos ou aprovações.
 * - View candidata: "Só Sal".v_rpa_pedidos_compra (não confirmada como existente).
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  PedidoCompraRepositoryPort,
  ListarPedidosFiltros,
  ListarPedidosResultado,
} from "../../application/ports/pedido-compra.repository.port"
import { PedidoCompra } from "../../domain/entities/pedido-compra"
import { ItemPedido } from "../../domain/entities/item-pedido"

/**
 * Nota: o cliente Supabase só é instanciado quando as variáveis de ambiente
 * estiverem definidas. Caso contrário, o repositório retorna dados vazios
 * com origem "Não disponível".
 */
export class PedidoCompraSupabaseRepository implements PedidoCompraRepositoryPort {
  constructor(
    private readonly supabaseClient: SupabaseClient,
  ) {}

  async listar(filtros: ListarPedidosFiltros): Promise<ListarPedidosResultado> {
    if (!this.supabaseClient) {
      return this.resultadoVazio(filtros.pagina ?? 1, filtros.tamanhoPagina ?? 20)
    }

    try {
      // View candidata: não confirmada como existente no Supabase.
      // A consulta abaixo é um contrato de leitura; falha graciosamente se a view não existir.
      const { data, error, count } = await this.supabaseClient
        .from('"Só Sal".v_rpa_pedidos_compra')
        .select("*", { count: "exact" })
        .ilike("numero_pedido", `%${filtros.numeroPedido ?? ""}%`)
        .range(
          ((filtros.pagina ?? 1) - 1) * (filtros.tamanhoPagina ?? 20),
          (filtros.pagina ?? 1) * (filtros.tamanhoPagina ?? 20) - 1,
        )

      if (error) {
        // View não existe ou sem permissão: retorna vazio sem expor erro ao cliente
        return this.resultadoVazio(filtros.pagina ?? 1, filtros.tamanhoPagina ?? 20)
      }

      const pedidos = (data ?? []).map((row: Record<string, unknown>) => this.mapearParaPedido(row))

      return {
        pedidos,
        total: count ?? 0,
        pagina: filtros.pagina ?? 1,
        tamanhoPagina: filtros.tamanhoPagina ?? 20,
        totalPaginas: Math.ceil((count ?? 0) / (filtros.tamanhoPagina ?? 20)),
      }
    } catch {
      // Qualquer falha de conexão ou schema: retorna vazio sem expor detalhes internos
      return this.resultadoVazio(filtros.pagina ?? 1, filtros.tamanhoPagina ?? 20)
    }
  }

  async buscarPorNumero(numeroPedido: string): Promise<PedidoCompra | null> {
    if (!this.supabaseClient) {
      return null
    }

    try {
      const { data, error } = await this.supabaseClient
        .from('"Só Sal".v_rpa_pedidos_compra')
        .select("*")
        .eq("numero_pedido", numeroPedido)
        .single()

      if (error || !data) {
        return null
      }

      return this.mapearParaPedido(data as Record<string, unknown>)
    } catch {
      return null
    }
  }

  async buscarPorId(id: string): Promise<PedidoCompra | null> {
    if (!this.supabaseClient) {
      return null
    }

    try {
      const { data, error } = await this.supabaseClient
        .from('"Só Sal".v_rpa_pedidos_compra')
        .select("*")
        .eq("id", id)
        .single()

      if (error || !data) {
        return null
      }

      return this.mapearParaPedido(data as Record<string, unknown>)
    } catch {
      return null
    }
  }

  private resultadoVazio(
    pagina: number,
    tamanhoPagina: number,
  ): ListarPedidosResultado {
    return {
      pedidos: [],
      total: 0,
      pagina,
      tamanhoPagina,
      totalPaginas: 0,
    }
  }

  private mapearParaPedido(row: Record<string, unknown>): PedidoCompra {
    const items: ItemPedido[] = []

    // Mapeamento provisório — colunas da view não confirmadas.
    // A view de pedidos não contém todos os controles da planilha (aprovação, recebimentos, OTB completo).
    const rowItens = row.itens
    if (rowItens && Array.isArray(rowItens)) {
      rowItens.forEach((item: Record<string, unknown>) => {
        items.push(
          new ItemPedido({
            codigoProduto: String(item.codigo_produto ?? ""),
            descricaoProduto: String(item.descricao_produto ?? ""),
            quantidadeSolicitada: Number(item.quantidade_solicitada) || 0,
            custoUnitario: Number(item.custo_unitario) || 0,
            quantidadeRecebida: Number(item.quantidade_recebida) || 0,
            situacaoEntrega:
              item.situacao_entrega === "ja-chegou"
                ? "ja-chegou"
                : item.situacao_entrega === "chegada-parcial"
                  ? "chegada-parcial"
                  : "em-aberto",
          }),
        )
      })
    }

    return new PedidoCompra({
      id: String(row.id ?? ""),
      loja: String(row.loja ?? ""),
      codigoFornecedor: String(row.codigo_fornecedor ?? ""),
      nomeFornecedor: String(row.nome_fornecedor ?? ""),
      numeroPedido: String(row.numero_pedido ?? ""),
      dataPedido: row.data_pedido ? new Date(String(row.data_pedido)) : new Date(),
      condicaoPagamento: row.condicao_pagamento ? String(row.condicao_pagamento) : null,
      items,
      status: "enviado",
      decisaoCompra: null,
      travaCaixa: false,
      motivoDecisao: null,
      observacoes: null,
      situacaoOTB: null,
      situacaoFinanceira: null,
      curvaABC: null,
      alertas: [],
      previsaoChegada: row.previsao_chegada ? new Date(String(row.previsao_chegada)) : null,
      origem: row.origem ? String(row.origem) : null,
      dataAtualizacao: row.data_atualizacao ? new Date(String(row.data_atualizacao)) : null,
      usuarioAtualizacao: row.usuario_atualizacao ? String(row.usuario_atualizacao) : null,
      quantidadeParcelas: 0,
    })
  }
}
