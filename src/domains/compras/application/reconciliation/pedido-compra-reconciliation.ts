/**
 * Estratégia de reconciliação para extrações históricas e incrementais D-15.
 *
 * Regras:
 * - Preserva histórico: nunca remove importacao_ids antigas.
 * - Evita duplicidade: para cada (loja, pedido, produto_codigo), mantém apenas
 *   a versão mais recente (por importado_em).
 * - linha_excel NAO é usada como identidade: pode mudar entre extrações.
 * - Não elimina pedidos antigos apenas por ausência na extração D-15.
 * - Não interpreta ausência em carga incremental como cancelamento.
 * - Quando o mesmo produto_codigo aparece em importações diferentes para o mesmo
 *   pedido com quantidades divergentes, sinaliza ambiguidade em vez de somar
 *   totais como se fossem itens distintos.
 */

import type {
  PedidoCompraAgrupado,
  PedidoCompraOrigemRegistro,
  PedidoCompraOrigemItem,
} from "../../domain/entities/pedido-compra-origem"

export type { PedidoCompraAgrupado }

const geraChavePedido = (loja: string, pedido: string): string =>
  `${loja}||${pedido}`

const geraChaveProdutoPedido = (
  loja: string,
  pedido: string,
  produto_codigo: string,
): string =>
  `${loja}||${pedido}||${produto_codigo}`

export function reconciliarRegistros(
  registros: PedidoCompraOrigemRegistro[],
): {
  pedidosAgrupados: PedidoCompraAgrupado[]
  totalRegistrosLidos: number
  totalImportacoes: number
  importacaoIds: string[]
} {
  if (registros.length === 0) {
    return {
      pedidosAgrupados: [],
      totalRegistrosLidos: 0,
      totalImportacoes: 0,
      importacaoIds: [],
    }
  }

  // 1. Identificar todas as importacoes distintas (preservar historico)
  const importacaoIds = Array.from(
    new Set(registros.map((r) => r.importacao_id)),
  ).sort()
  const totalImportacoes = importacaoIds.length
  const totalRegistrosLidos = registros.length

  // 2. Detectar ambiguidade: mesmo produto_codigo em importacoes diferentes
  //    para o mesmo pedido com quantidades divergentes
  const produtosPorPedido = new Map<string, Set<string>>() // chaveProdutoPedido -> importacao_ids
  const quantidadesPorProdutoPedido = new Map<string, number[]>() // chaveProdutoPedido -> quantidades

  for (const reg of registros) {
    const chavePP = geraChaveProdutoPedido(reg.loja, reg.pedido, reg.produto_codigo)
    let ids = produtosPorPedido.get(chavePP)
    if (!ids) {
      ids = new Set()
      produtosPorPedido.set(chavePP, ids)
    }
    ids.add(reg.importacao_id)

    let qtds = quantidadesPorProdutoPedido.get(chavePP)
    if (!qtds) {
      qtds = []
      quantidadesPorProdutoPedido.set(chavePP, qtds)
    }
    qtds.push(reg.quantidade)
  }

  const produtosAmbiguos = new Set<string>()
  for (const [chavePP, ids] of produtosPorPedido) {
    if (ids.size > 1) {
      const qtds = quantidadesPorProdutoPedido.get(chavePP)!
      const qtdsUnicos = new Set(qtds)
      if (qtdsUnicos.size > 1) {
        produtosAmbiguos.add(chavePP)
      }
    }
  }

  // 3. Para cada (loja, pedido, produto_codigo), manter apenas a versão mais recente
  //    (por importado_em), independentemente do linha_excel
  const versaoMaisRecentePorProdutoPedido = new Map<string, PedidoCompraOrigemRegistro>()

  for (const reg of registros) {
    const chavePP = geraChaveProdutoPedido(reg.loja, reg.pedido, reg.produto_codigo)
    const existente = versaoMaisRecentePorProdutoPedido.get(chavePP)
    if (!existente || reg.importado_em > existente.importado_em) {
      versaoMaisRecentePorProdutoPedido.set(chavePP, reg)
    }
  }

  // 4. Agrupar por pedido (loja + pedido)
  const pedidosPorChave = new Map<string, PedidoCompraAgrupado>()

  for (const reg of versaoMaisRecentePorProdutoPedido.values()) {
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

    const chavePP = geraChaveProdutoPedido(reg.loja, reg.pedido, reg.produto_codigo)
    const itemEhAmbiguo = produtosAmbiguos.has(chavePP)

    const existente = pedidosPorChave.get(chavePedido)
    if (existente) {
      existente.items.push(item)
      existente.quantidade_total += reg.quantidade
      existente.valor_total += reg.valor_total_calculado
      if (itemEhAmbiguo) {
        existente.tem_ambiguidade = true
        existente.mensagem_ambiguidade =
          "Produto com quantidades divergentes entre importações. Totais podem não ser definitivos."
      }
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
        tem_ambiguidade: itemEhAmbiguo,
        mensagem_ambiguidade: itemEhAmbiguo
          ? "Produto com quantidades divergentes entre importações. Totais podem não ser definitivos."
          : null,
      })
    }
  }

  // 5. Enriquecer cada pedido com todos os importacao_ids que o referenciam
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

  return { pedidosAgrupados, totalRegistrosLidos, totalImportacoes, importacaoIds }
}

export function filtrarPorPedido(
  pedidos: PedidoCompraAgrupado[],
  loja: string,
  pedido: string,
): PedidoCompraAgrupado | undefined {
  return pedidos.find((p) => p.loja === loja && p.pedido === pedido)
}

export { geraChavePedido }
