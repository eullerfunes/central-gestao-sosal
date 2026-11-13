/**
 * Estratégia de reconciliação para extrações históricas e incrementais D-15.
 *
 * Regras:
 * - Preserva histórico: nunca remove importacao_ids antigas.
 * - Evita duplicidade: um item identificado por (loja, pedido, produto_codigo, linha_excel)
 *   aparece apenas uma vez na visão consolidada, na versão mais recente.
 * - Não elimina pedidos antigos apenas por ausência na extração D-15.
 * - Não interpreta ausência em carga incremental como cancelamento.
 */

import type {
  PedidoCompraAgrupado,
  PedidoCompraOrigemRegistro,
  PedidoCompraOrigemItem,
} from "../../domain/entities/pedido-compra-origem"

export type { PedidoCompraAgrupado }

const geraChaveItem = (
  loja: string,
  pedido: string,
  produto_codigo: string,
  linha_excel: number,
): string =>
  `${loja}||${pedido}||${produto_codigo}||${linha_excel}`

const geraChavePedido = (loja: string, pedido: string): string =>
  `${loja}||${pedido}`

export interface ItemVersaoMaisRecente {
  chaveItem: string
  registro: PedidoCompraOrigemRegistro
}

export function reconciliarRegistros(
  registros: PedidoCompraOrigemRegistro[],
): {
  pedidosAgrupados: PedidoCompraAgrupado[]
  totalImportacoes: number
  importacaoIds: string[]
} {
  if (registros.length === 0) {
    return { pedidosAgrupados: [], totalImportacoes: 0, importacaoIds: [] }
  }

  // 1. Identificar todas as importacoes distintas (preservar historico)
  const importacaoIds = Array.from(
    new Set(registros.map((r) => r.importacao_id)),
  ).sort()
  const totalImportacoes = importacaoIds.length

  // 2. Para cada item (loja, pedido, produto_codigo, linha_excel),
  //    manter apenas a versao mais recente (por importado_em)
  const versaoMaisRecentePorItem = new Map<string, PedidoCompraOrigemRegistro>()

  for (const reg of registros) {
    const chaveItem = geraChaveItem(
      reg.loja,
      reg.pedido,
      reg.produto_codigo,
      reg.linha_excel,
    )
    const existente = versaoMaisRecentePorItem.get(chaveItem)
    if (!existente || reg.importado_em > existente.importado_em) {
      versaoMaisRecentePorItem.set(chaveItem, reg)
    }
  }

  // 3. Agrupar versoes mais recentes por pedido (loja + pedido)
  const pedidosPorChave = new Map<string, PedidoCompraAgrupado>()

  for (const reg of versaoMaisRecentePorItem.values()) {
    const chavePedido = geraChavePedido(reg.loja, reg.pedido)

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

    const existente = pedidosPorChave.get(chavePedido)
    if (existente) {
      existente.items.push(item)
      existente.quantidade_total += reg.quantidade
      existente.valor_total += reg.valor_total_calculado
    } else {
      pedidosPorChave.set(chavePedido, {
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
      })
    }
  }

  // 4. Enriquecer cada pedido com todos os importacao_ids que o referenciam
  //    (preserva historico de todas as importacoes, nao apenas a mais recente)
  const importacoesPorPedido = new Map<string, Set<string>>()
  for (const reg of registros) {
    const chavePedido = geraChavePedido(reg.loja, reg.pedido)
    let set = importacoesPorPedido.get(chavePedido)
    if (!set) {
      set = new Set()
      importacoesPorPedido.set(chavePedido, set)
    }
    set.add(reg.importacao_id)
  }

  const pedidosAgrupados: PedidoCompraAgrupado[] = []
  for (const [chavePedido, pedido] of pedidosPorChave) {
    const ids = importacoesPorPedido.get(chavePedido)
    if (ids) {
      pedido.importacao_ids = Array.from(ids).sort()
    }
    pedidosAgrupados.push(pedido)
  }

  // Ordenar por importacao mais recente primeiro, depois por loja+pedido
  pedidosAgrupados.sort(
    (a, b) =>
      b.importado_em_mais_recente.localeCompare(a.importado_em_mais_recente) ||
      a.loja.localeCompare(b.loja) ||
      a.pedido.localeCompare(b.pedido),
  )

  return { pedidosAgrupados, totalImportacoes, importacaoIds }
}

export function filtrarPorPedido(
  pedidos: PedidoCompraAgrupado[],
  loja: string,
  pedido: string,
): PedidoCompraAgrupado | undefined {
  return pedidos.find((p) => p.loja === loja && p.pedido === pedido)
}

export { geraChavePedido, geraChaveItem }
