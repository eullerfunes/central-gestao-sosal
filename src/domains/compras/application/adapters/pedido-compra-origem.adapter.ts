/**
 * Adaptador tipado para o contrato real de dados da view v_rpa_pedidos_compra.
 * Mapeia registros achatados (uma linha por item) para pedidos agrupados
 * por loja + número do pedido.
 *
 * Não assume colunas inexistentes na view (id, numero_pedido, codigo_fornecedor,
 * quantidade_solicitada, itens, quantidade_recebida, etc.).
 */

import type {
  PedidoCompraAgrupado,
  PedidoCompraOrigemRegistro,
  PedidoCompraOrigemItem,
} from "../../domain/entities/pedido-compra-origem"

const geraChavePedido = (loja: string, pedido: string): string =>
  `${loja}||${pedido}`

export function adaptarRegistrosDeOrigem(
  registros: PedidoCompraOrigemRegistro[],
): PedidoCompraAgrupado[] {
  const porPedido = new Map<string, PedidoCompraAgrupado>()

  for (const reg of registros) {
    const chave = geraChavePedido(reg.loja, reg.pedido)

    const item: PedidoCompraOrigemItem = {
      linha_excel: reg.linha_excel,
      produto_codigo: reg.produto_codigo,
      descricao: reg.descricao,
      quantidade: reg.quantidade,
      custo_unitario: reg.custo_unitario,
      valor_total_calculado: reg.valor_total_calculado,
      importacao_id: reg.importacao_id,
      importado_em: reg.importado_em,
    }

    const existente = porPedido.get(chave)
    if (existente) {
      existente.items.push(item)
      existente.quantidade_total += reg.quantidade
      existente.valor_total += reg.valor_total_calculado
      if (!existente.importacao_ids.includes(reg.importacao_id)) {
        existente.importacao_ids.push(reg.importacao_id)
      }
      if (reg.importado_em > existente.importado_em_mais_recente) {
        existente.importado_em_mais_recente = reg.importado_em
      }
    } else {
      porPedido.set(chave, {
        loja: reg.loja,
        pedido: reg.pedido,
        fornecedor_codigo: reg.fornecedor_codigo,
        fornecedor_nome: reg.fornecedor_nome,
        data_pedido: reg.data_pedido,
        condicao_pagamento: reg.condicao_pagamento,
        items: [item],
        quantidade_total: reg.quantidade,
        valor_total: reg.valor_total_calculado,
        importacao_ids: [reg.importacao_id],
        importado_em_mais_recente: reg.importado_em,
        tem_ambiguidade: false,
        mensagem_ambiguidade: null,
        totaisConfiaveis: true,
      })
    }
  }

  return Array.from(porPedido.values())
}

export function extrairRegistroDeOrigem(
  linha: Record<string, unknown>,
): PedidoCompraOrigemRegistro {
  return {
    importacao_id: String(linha.importacao_id ?? ""),
    importado_em: String(linha.importado_em ?? ""),
    linha_excel: Number(linha.linha_excel) || 0,
    loja: String(linha.loja ?? ""),
    fornecedor_codigo: String(linha.fornecedor_codigo ?? ""),
    fornecedor_nome: String(linha.fornecedor_nome ?? ""),
    pedido: String(linha.pedido ?? ""),
    data_pedido: String(linha.data_pedido ?? ""),
    condicao_pagamento:
      linha.condicao_pagamento === null ||
      linha.condicao_pagamento === undefined
        ? null
        : String(linha.condicao_pagamento),
    produto_codigo: String(linha.produto_codigo ?? ""),
    descricao: String(linha.descricao ?? ""),
    quantidade: Number(linha.quantidade) || 0,
    custo_unitario: Number(linha.custo_unitario) || 0,
    valor_total_informado: Number(linha.valor_total_informado) || 0,
    valor_total_calculado: Number(linha.valor_total_calculado) || 0,
  }
}

export { geraChavePedido }
