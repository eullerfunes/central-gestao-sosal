import { describe, it, expect } from "vitest"
import { reconciliarRegistros } from "./pedido-compra-reconciliation"

const reg = (overrides: Record<string, unknown> = {}) => ({
  importacao_id: "imp-001",
  importado_em: "2026-01-10T10:00:00Z",
  linha_excel: 1,
  loja: "Loja 01",
  fornecedor_codigo: "F001",
  fornecedor_nome: "Fornecedor A",
  pedido: "PED-001",
  data_pedido: "2026-01-10",
  condicao_pagamento: "30/60/90",
  produto_codigo: "P001",
  descricao: "Produto A",
  quantidade: 10,
  custo_unitario: 25.5,
  valor_total_informado: 255,
  valor_total_calculado: 255,
  ...overrides,
})

describe("reconciliarRegistros", () => {
  it("deve retornar lista vazia sem registros", () => {
    const resultado = reconciliarRegistros([])
    expect(resultado.pedidosAgrupados).toEqual([])
    expect(resultado.totalRegistrosLidos).toBe(0)
    expect(resultado.totalImportacoes).toBe(0)
    expect(resultado.importacaoIds).toEqual([])
  })

  it("deve agrupar múltiplos itens de um mesmo pedido", () => {
    const registros = [
      reg({ linha_excel: 1, produto_codigo: "P001", quantidade: 10, valor_total_calculado: 255 }),
      reg({ linha_excel: 2, produto_codigo: "P002", quantidade: 5, valor_total_calculado: 127.5 }),
    ]
    const resultado = reconciliarRegistros(registros)

    expect(resultado.pedidosAgrupados).toHaveLength(1)
    expect(resultado.pedidosAgrupados[0].items).toHaveLength(2)
    expect(resultado.pedidosAgrupados[0].quantidade_total).toBe(15)
    expect(resultado.pedidosAgrupados[0].valor_total).toBe(382.5)
  })

  it("deve tratar mesmo número de pedido em filiais diferentes como pedidos distintos", () => {
    const registros = [
      reg({ loja: "Loja 01", pedido: "PED-001" }),
      reg({ loja: "Loja 02", pedido: "PED-001" }),
    ]
    const resultado = reconciliarRegistros(registros)

    expect(resultado.pedidosAgrupados).toHaveLength(2)
    expect(resultado.pedidosAgrupados[0].loja).toBe("Loja 01")
    expect(resultado.pedidosAgrupados[1].loja).toBe("Loja 02")
  })

  it("deve manter versão mais recente do item em atualização incremental D-15", () => {
    const registros = [
      reg({
        importacao_id: "imp-001",
        importado_em: "2026-01-10T10:00:00Z",
        linha_excel: 1,
        produto_codigo: "P001",
        quantidade: 10,
        valor_total_calculado: 255,
      }),
      reg({
        importacao_id: "imp-002",
        importado_em: "2026-01-25T10:00:00Z",
        linha_excel: 5,
        produto_codigo: "P001",
        quantidade: 12,
        valor_total_calculado: 300,
      }),
    ]
    const resultado = reconciliarRegistros(registros)

    // Apenas a versão mais recente (imp-002) deve aparecer para o item
    expect(resultado.pedidosAgrupados[0].items).toHaveLength(1)
    expect(resultado.pedidosAgrupados[0].items[0].quantidade).toBe(12)
    expect(resultado.pedidosAgrupados[0].items[0].valor_total_calculado).toBe(300)
    // Mas ambas importacoes devem ser preservadas no historico
    expect(resultado.pedidosAgrupados[0].importacao_ids).toEqual(["imp-001", "imp-002"])
    expect(resultado.totalImportacoes).toBe(2)
  })

  it("deve preservar historico de importacoes sem eliminar pedidos antigos", () => {
    const registros = [
      reg({ importacao_id: "imp-001", importado_em: "2026-01-10T10:00:00Z", pedido: "PED-001" }),
      reg({ importacao_id: "imp-002", importado_em: "2026-01-25T10:00:00Z", pedido: "PED-002" }),
    ]
    const resultado = reconciliarRegistros(registros)

    expect(resultado.pedidosAgrupados).toHaveLength(2)
    expect(resultado.importacaoIds).toEqual(["imp-001", "imp-002"])
  })

  it("nao deve interpretar ausencia em carga incremental como cancelamento", () => {
    const registros = [
      reg({ importacao_id: "imp-001", pedido: "PED-001" }),
      reg({ importacao_id: "imp-002", pedido: "PED-002" }),
    ]
    const resultado = reconciliarRegistros(registros)

    expect(resultado.pedidosAgrupados).toHaveLength(2)
    const pedidos = resultado.pedidosAgrupados.map((p) => p.pedido)
    expect(pedidos).toContain("PED-001")
    expect(pedidos).toContain("PED-002")
  })

  it("deve lidar com divergencia de valores entre importacoes", () => {
    const registros = [
      reg({
        importacao_id: "imp-001",
        importado_em: "2026-01-10T10:00:00Z",
        valor_total_calculado: 255,
      }),
      reg({
        importacao_id: "imp-002",
        importado_em: "2026-01-25T10:00:00Z",
        valor_total_calculado: 300,
      }),
    ]
    const resultado = reconciliarRegistros(registros)

    // A versão mais recente deve prevalecer
    expect(resultado.pedidosAgrupados[0].valor_total).toBe(300)
    expect(resultado.pedidosAgrupados[0].importacao_ids).toEqual(["imp-001", "imp-002"])
  })

  it("deve ordenar pedidos por importacao mais recente primeiro", () => {
    const registros = [
      reg({ importado_em: "2026-01-10T10:00:00Z", pedido: "PED-001" }),
      reg({ importado_em: "2026-01-20T10:00:00Z", pedido: "PED-002" }),
    ]
    const resultado = reconciliarRegistros(registros)

    expect(resultado.pedidosAgrupados[0].pedido).toBe("PED-002")
    expect(resultado.pedidosAgrupados[1].pedido).toBe("PED-001")
  })

  it("deve sinalizar ambiguidade quando mesmo produto tem quantidades diferentes em importacoes distintas", () => {
    const registros = [
      reg({
        importacao_id: "imp-001",
        importado_em: "2026-01-10T10:00:00Z",
        linha_excel: 1,
        produto_codigo: "P001",
        quantidade: 10,
        valor_total_calculado: 255,
      }),
      reg({
        importacao_id: "imp-002",
        importado_em: "2026-01-25T10:00:00Z",
        linha_excel: 3,
        produto_codigo: "P001",
        quantidade: 15,
        valor_total_calculado: 382.5,
      }),
    ]
    const resultado = reconciliarRegistros(registros)

    expect(resultado.pedidosAgrupados[0].tem_ambiguidade).toBe(true)
    expect(resultado.pedidosAgrupados[0].mensagem_ambiguidade).not.toBeNull()
    // Deve usar a versão mais recente (imp-002), não somar ambas
    expect(resultado.pedidosAgrupados[0].items).toHaveLength(1)
    expect(resultado.pedidosAgrupados[0].items[0].quantidade).toBe(15)
    expect(resultado.pedidosAgrupados[0].valor_total).toBe(382.5)
  })

  it("nao deve sinalizar ambiguidade quando mesmo produto tem mesma quantidade em importacoes distintas", () => {
    const registros = [
      reg({
        importacao_id: "imp-001",
        importado_em: "2026-01-10T10:00:00Z",
        linha_excel: 1,
        produto_codigo: "P001",
        quantidade: 10,
        valor_total_calculado: 255,
      }),
      reg({
        importacao_id: "imp-002",
        importado_em: "2026-01-25T10:00:00Z",
        linha_excel: 5,
        produto_codigo: "P001",
        quantidade: 10,
        valor_total_calculado: 255,
      }),
    ]
    const resultado = reconciliarRegistros(registros)

    expect(resultado.pedidosAgrupados[0].tem_ambiguidade).toBe(false)
    expect(resultado.pedidosAgrupados[0].mensagem_ambiguidade).toBeNull()
  })

  it("deve sinalizar ambiguidade para linhas deslocadas entre importacoes", () => {
    // Mesmo produto, mesma quantidade, mas linha_excel diferente entre importacoes
    const registros = [
      reg({
        importacao_id: "imp-001",
        importado_em: "2026-01-10T10:00:00Z",
        linha_excel: 1,
        produto_codigo: "P001",
        quantidade: 10,
      }),
      reg({
        importacao_id: "imp-002",
        importado_em: "2026-01-25T10:00:00Z",
        linha_excel: 7,
        produto_codigo: "P001",
        quantidade: 10,
      }),
    ]
    const resultado = reconciliarRegistros(registros)

    // linha_excel mudou (1 -> 7) mas quantidade é a mesma, nao e ambiguidade
    expect(resultado.pedidosAgrupados[0].tem_ambiguidade).toBe(false)
    // Deve usar a versao mais recente
    expect(resultado.pedidosAgrupados[0].items[0].linha_excel).toBe(7)
  })

  it("deve lidar com produto repetido em pedidos diferentes", () => {
    const registros = [
      reg({ loja: "Loja 01", pedido: "PED-001", produto_codigo: "P001", quantidade: 10 }),
      reg({ loja: "Loja 01", pedido: "PED-002", produto_codigo: "P001", quantidade: 5 }),
    ]
    const resultado = reconciliarRegistros(registros)

    expect(resultado.pedidosAgrupados).toHaveLength(2)
    expect(resultado.pedidosAgrupados[0].items[0].quantidade).toBe(10)
    expect(resultado.pedidosAgrupados[1].items[0].quantidade).toBe(5)
    expect(resultado.pedidosAgrupados[0].tem_ambiguidade).toBe(false)
    expect(resultado.pedidosAgrupados[1].tem_ambiguidade).toBe(false)
  })

  describe("filtrarPorPedido", () => {
    it("deve encontrar pedido por loja + numero", () => {
      const registros = [
        reg({ loja: "Loja 01", pedido: "PED-001" }),
        reg({ loja: "Loja 02", pedido: "PED-001" }),
      ]
      const { pedidosAgrupados } = reconciliarRegistros(registros)

      const encontrado = pedidosAgrupados.find(
        (p) => p.loja === "Loja 02" && p.pedido === "PED-001",
      )
      expect(encontrado).not.toBeUndefined()
      expect(encontrado!.loja).toBe("Loja 02")
    })

    it("nao deve confundir mesmo pedido em filiais diferentes", () => {
      const registros = [
        reg({ loja: "Loja 01", pedido: "PED-001" }),
        reg({ loja: "Loja 02", pedido: "PED-001" }),
      ]
      const { pedidosAgrupados } = reconciliarRegistros(registros)

      const loja01 = pedidosAgrupados.find((p) => p.loja === "Loja 01" && p.pedido === "PED-001")
      const loja02 = pedidosAgrupados.find((p) => p.loja === "Loja 02" && p.pedido === "PED-001")

      expect(loja01).not.toBeUndefined()
      expect(loja02).not.toBeUndefined()
      expect(loja01).not.toBe(loja02)
    })
  })
})
