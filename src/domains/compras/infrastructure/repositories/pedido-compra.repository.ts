/**
 * Repositório de pedidos de compra — implementação read-only sobre Supabase.
 *
 * Restrições desta etapa:
 * - Somente leitura no Supabase existente.
 * - Nenhuma migration.
 * - Nenhuma alteração de schema, tabela ou view.
 * - Nenhuma escrita em pedidos ou aprovações.
 * - Leitura apenas no servidor (createSupabaseServerClient).
 * - Nenhuma service_role key no navegador.
 * - View candidata: "Só Sal".v_rpa_pedidos_compra.
 *
 * Segurança:
 * - Verifica sessao de autenticacao antes de consultar.
 * - Autenticacao nao implica autorizacao por filial.
 * - Dados reais so sao expostos quando politica de autorizacao por filial
 *   estiver validada no servidor e na fonte de dados.
 * - Nao expoe mensagens tecnicas ou detalhes internos do banco.
 * - Nao concede SELECT automaticamente na view existente.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  PedidoCompraRepositoryPort,
  ListarPedidosFiltros,
  ListarPedidosResultado,
} from "../../application/ports/pedido-compra.repository.port"
import {
  reconciliarRegistros,
  type PedidoCompraAgrupado,
} from "../../application/reconciliation/pedido-compra-reconciliation"
import type { PedidoCompraOrigemRegistro } from "../../domain/entities/pedido-compra-origem"

type LeituraResultado =
  | { tipo: "sucesso"; registros: PedidoCompraOrigemRegistro[] }
  | { tipo: "indisponivel"; mensagem: string }
  | { tipo: "acesso_negado" }

export class PedidoCompraSupabaseRepository implements PedidoCompraRepositoryPort {
  async listar(
    filtros: ListarPedidosFiltros,
  ): Promise<ListarPedidosResultado> {
    const leitura = await this.lerRegistros()

    if (leitura.tipo === "acesso_negado") {
      return this.resultadoAcessoNegado(
        filtros.pagina ?? 1,
        filtros.tamanho_pagina ?? 20,
      )
    }

    if (leitura.tipo === "indisponivel") {
      return this.resultadoIndisponivel(
        filtros.pagina ?? 1,
        filtros.tamanho_pagina ?? 20,
        leitura.mensagem,
      )
    }

    const { registros } = leitura
    const {
      pedidosAgrupados,
      totalRegistrosLidos,
      totalImportacoes,
    } = reconciliarRegistros(registros)

    let filtrados: PedidoCompraAgrupado[] = pedidosAgrupados

    if (filtros.loja) {
      filtrados = filtrados.filter((p: PedidoCompraAgrupado) =>
        p.loja.toLowerCase().includes(filtros.loja!.toLowerCase()),
      )
    }
    if (filtros.fornecedor) {
      filtrados = filtrados.filter((p: PedidoCompraAgrupado) =>
        p.fornecedor_nome.toLowerCase().includes(filtros.fornecedor!.toLowerCase()),
      )
    }
    if (filtros.pedido) {
      filtrados = filtrados.filter((p: PedidoCompraAgrupado) =>
        p.pedido.toLowerCase().includes(filtros.pedido!.toLowerCase()),
      )
    }
    if (filtros.produto) {
      filtrados = filtrados.filter((p: PedidoCompraAgrupado) =>
        p.items.some((i: { produto_codigo: string }) =>
          i.produto_codigo.toLowerCase().includes(filtros.produto!.toLowerCase()),
        ),
      )
    }
    if (filtros.data_inicial) {
      filtrados = filtrados.filter((p: PedidoCompraAgrupado) =>
        p.data_pedido >= filtros.data_inicial!,
      )
    }
    if (filtros.data_final) {
      filtrados = filtrados.filter((p: PedidoCompraAgrupado) =>
        p.data_pedido <= filtros.data_final!,
      )
    }

    const pagina = filtros.pagina ?? 1
    const tamanhoPagina = filtros.tamanho_pagina ?? 20
    const inicio = (pagina - 1) * tamanhoPagina
    const fim = inicio + tamanhoPagina
    const paginaPedidos = filtrados.slice(inicio, fim)

    return {
      pedidos: paginaPedidos,
      total: filtrados.length,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: Math.ceil(filtrados.length / tamanhoPagina),
      origem_disponivel: true,
      total_registros_origem: totalRegistrosLidos,
      total_importacoes: totalImportacoes,
      mensagem_indisponibilidade: null,
    }
  }

  async buscarPorLoEPedido(
    loja: string,
    pedido: string,
  ): Promise<PedidoCompraAgrupado | null> {
    const leitura = await this.lerRegistros()

    if (leitura.tipo !== "sucesso") {
      return null
    }

    const { pedidosAgrupados } = reconciliarRegistros(leitura.registros)
    return pedidosAgrupados.find(
      (p: PedidoCompraAgrupado) => p.loja === loja && p.pedido === pedido,
    ) ?? null
  }

  private async lerRegistros(): Promise<LeituraResultado> {
    const supabase = await createSupabaseServerClient()

    if (!supabase) {
      return {
        tipo: "indisponivel",
        mensagem:
          "Variáveis de ambiente do Supabase não configuradas. Dados indisponíveis.",
      }
    }

    // Verificar sessão de autenticação antes de consultar dados.
    // Sem sessão autenticada, retorna acesso negado (não lista vazia legítima).
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData?.user) {
      return {
        tipo: "acesso_negado",
      }
    }

    // Autorização por filial não é validada neste módulo.
    // Não expor dados reais enquanto a política de autorização por filial
    // não estiver aprovada no servidor e na fonte de dados.
    return {
      tipo: "indisponivel",
      mensagem:
        "Autorização de acesso por filial não configurada. Dados indisponíveis.",
    }

    // Quando a autorizacao por filial for aprovada, desbloquear a leitura abaixo:
    /*
    try {
      const todosRegistros: Record<string, unknown>[] = []
      let offset = 0
      let temMais = true

      while (temMais) {
        const { data, error } = await supabase
          .schema("Só Sal")
          .from("v_rpa_pedidos_compra")
          .select("*")
          .range(offset, offset + 999)

        if (error) {
          return {
            tipo: "indisponivel",
            mensagem: "Nao foi possível acessar os dados de pedidos de compra.",
          }
        }

        const lote = data ?? []
        todosRegistros.push(...lote)
        offset += 1000
        temMais = lote.length === 1000
      }

      const registros = todosRegistros.map((row) =>
        extrairRegistroDeOrigem(row),
      )

      return { tipo: "sucesso", registros }
    } catch {
      return {
        tipo: "indisponivel",
        mensagem: "Nao foi possível conectar à fonte de dados de pedidos.",
      }
    }
    */
  }

  private resultadoAcessoNegado(
    pagina: number,
    tamanhoPagina: number,
  ): ListarPedidosResultado {
    return {
      pedidos: [],
      total: 0,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: 0,
      origem_disponivel: false,
      total_registros_origem: 0,
      total_importacoes: 0,
      mensagem_indisponibilidade:
        "Acesso negado: sessão de autenticação não encontrada.",
    }
  }

  private resultadoIndisponivel(
    pagina: number,
    tamanhoPagina: number,
    mensagem: string,
  ): ListarPedidosResultado {
    return {
      pedidos: [],
      total: 0,
      pagina,
      tamanho_pagina: tamanhoPagina,
      total_paginas: 0,
      origem_disponivel: false,
      total_registros_origem: 0,
      total_importacoes: 0,
      mensagem_indisponibilidade: mensagem,
    }
  }
}
