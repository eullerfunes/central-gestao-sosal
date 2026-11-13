import { describe, it, expect } from "vitest"
import {
  adaptarRegistrosDeOrigem,
  extrairRegistroDeOrigem,
  geraChavePedido,
} from "./pedido-compra-origem.adapter"

const registroBase = (overrides: Record<string, unknown> = {}) => ({
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

describe("adaptarRegistrosDeOrigem", () => {
  it("deve agrupar pedido com múltiplos itens por loja + pedido", () => {
    const registros = [
      registroBase({ linha_excel: 1, produto_codigo: "P001", quantidade: 10, valor_total_calculado: 255 }),
      registroBase({ linha_excel: 2, produto_codigo: "P002", quantidade: 5, custo_unitario: 40, valor_total_calculado: 200 }),
    ]

    const resultado = adaptarRegistrosDeOrigem(registros)

    expect(resultado).toHaveLength(1)
    expect(resultado[0].loja).toBe("Loja 01")
    expect(resultado[0].pedido).toBe("PED-001")
    expect(resultado[0].items).toHaveLength(2)
    expect(resultado[0].quantidade_total).toBe(15)
    expect(resultado[0].valor_total).toBe(455)
  })

  it("deve tratar mesmo número de pedido em filiais diferentes como pedidos distintos", () => {
    const registros = [
      registroBase({ loja: "Loja 01", pedido: "PED-001" }),
      registroBase({ loja: "Loja 02", pedido: "PED-001" }),
    ]

    const resultado = adaptarRegistrosDeOrigem(registros)

    expect(resultado).toHaveLength(2)
    expect(resultado[0].loja).toBe("Loja 01")
    expect(resultado[1].loja).toBe("Loja 02")
  })

  it("deve extrair registro de origem com colunas da view real", () => {
    const linha = {
      importacao_id: "imp-001",
      importado_em: "2026-01-10T10:00:00Z",
      linha_excel: "3",
      loja: "Loja 01",
      fornecedor_codigo: "F001",
      fornecedor_nome: "Fornecedor A",
      pedido: "PED-001",
      data_pedido: "2026-01-10",
      condicao_pagamento: null,
      produto_codigo: "P001",
      descricao: "Produto A",
      quantidade: "10",
      custo_unitario: "25.5",
      valor_total_informado: "255",
      valor_total_calculado: "255",
    }

    const reg = extrairRegistroDeOrigem(linha)

    expect(reg.importacao_id).toBe("imp-001")
    expect(reg.linha_excel).toBe(3)
    expect(reg.condicao_pagamento).toBeNull()
    expect(reg.quantidade).toBe(10)
    expect(reg.custo_unitario).toBe(25.5)
  })

  it("deve gerar chave de pedido estável", () => {
    expect(geraChavePedido("Loja 01", "PED-001")).toBe("Loja 01||PED-001")
    expect(geraChavePedido("Loja 02", "PED-001")).toBe("Loja 02||PED-001")
  })
})
