/**
 * Estratégia de reconciliação para extrações históricas e incrementais D-15.
 *
 * Regras:
 * - Preserva histórico: nunca remove importacao_ids antigas.
 * - NAO faz segunda deduplicacao destrutiva: a view v_rpa_pedidos_compra ja realiza
 *   reconciliação na origem. Todas as linhas sao preservadas.
 * - linha_excel NAO é usada como identidade: pode mudar entre extrações.
 * - Não elimina pedidos antigos apenas por ausência na extração D-15.
 * - Não interpreta ausência em carga incremental como cancelamento.
 * - Quando o mesmo produto_codigo aparece múltiplas vezes para o mesmo (loja, pedido),
 *   sinaliza inconsistência e não apresenta o total como definitivo.
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

  // 2. Detectar inconsistencia: mesmo produto_codigo aparecendo múltiplas vezes
  //    para o mesmo (loja, pedido) — pode ser linha legítima duplicada na origem
  //    ou dados divergentes entre importacoes. Não descartar: sinalizar.
  const ocorrenciasPorProdutoPedido = new Map<
    string,
    PedidoCompraOrigemRegistro[]
  >()

  for (const reg of registros) {
    const chavePP = geraChaveProdutoPedido(reg.loja, reg.pedido, reg.produto_codigo)
    let ocorrencias = ocorrenciasPorProdutoPedido.get(chavePP)
    if (!ocorrencias) {
      ocorrencias = []
      ocorrenciasPorProdutoPedido.set(chavePP, ocorrencias)
    }
    ocorrencias.push(reg)
  }

  const produtosInconsistentes = new Set<string>()
  for (const [chavePP, ocorrencias] of ocorrenciasPorProdutoPedido) {
    if (ocorrencias.length > 1) {
      // Mesmo produto_codigo em múltiplas linhas para o mesmo pedido
      // Verificar se há divergência de quantidade entre elas
      const quantidades = new Set(ocorrencias.map((o) => o.quantidade))
      const importacoes = new Set(ocorrencias.map((o) => o.importacao_id))

      // Inconsistente se: mesma importacao com linhas duplicadas, ou
      // importacoes diferentes com quantidades divergentes
      if (importacoes.size === 1 && ocorrencias.length > 1) {
        // Mesmo produto repetido na mesma importacao — linha legítima ou duplicacao
        produtosInconsistentes.add(chavePP)
      } else if (importacoes.size > 1 && quantidades.size > 1) {
        // Importacoes diferentes com quantidades divergentes
        produtosInconsistentes.add(chavePP)
      }
    }
  }

  // 3. Agrupar TODAS as linhas por pedido (loja + pedido) — sem deduplicacao destrutiva
  const pedidosPorChave = new Map<string, PedidoCompraAgrupado>()

  for (const reg of registros) {
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
    const itemInconsistente = produtosInconsistentes.has(chavePP)

    const existente = pedidosPorChave.get(chavePedido)
    if (existente) {
      existente.items.push(item)
      existente.quantidade_total += reg.quantidade
      existente.valor_total += reg.valor_total_calculado
      if (itemInconsistente) {
        existente.tem_ambiguidade = true
        existente.mensagem_ambiguidade =
          "Produto com ocorrências múltiplas entre linhas/importações. Totais não são definitivos."
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
        tem_ambiguidade: itemInconsistente,
        mensagem_ambiguidade: itemInconsistente
          ? "Produto com ocorrências múltiplas entre linhas/importações. Totais não são definitivos."
          : null,
      })
    }
  }

  // 4. Enriquecer cada pedido com todos os importacao_ids que o referenciam
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
