import { describe, it, expect, vi } from "vitest"
import { ConsultarPedidoCompraUseCase } from "./consultar-pedido-compra.use-case"
import type { PedidoCompraRepositoryPort } from "../ports/pedido-compra.repository.port"

const mockRepository = {
  buscarPorLoEPedido: vi.fn(),
  listar: vi.fn(),
}

describe("ConsultarPedidoCompraUseCase", () => {
  it("should return pedido detalhe when found with loja + pedido", async () => {
    const useCase = new ConsultarPedidoCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.buscarPorLoEPedido.mockResolvedValue({
      loja: "Loja 01",
      pedido: "PED-001",
      fornecedor_codigo: "F001",
      fornecedor_nome: "Fornecedor A",
      data_pedido: "2026-01-10",
      condicao_pagamento: "30/60/90",
      quantidade_total: 10,
      valor_total: 100,
      importacao_ids: ["imp-001"],
      importado_em_mais_recente: "2026-01-10T10:00:00Z",
      items: [
        {
          linha_excel: 1,
          produto_codigo: "P001",
          descricao: "Produto A",
          quantidade: 10,
          custo_unitario: 10,
          valor_total_calculado: 100,
          importacao_id: "imp-001",
          importado_em: "2026-01-10T10:00:00Z",
          quantidade_recebida: null,
          quantidade_pendente: null,
          valor_pendente: null,
          situacao_entrega: null,
        },
      ],
    })

    const resultado = await useCase.executar("Loja 01", "PED-001")

    expect(resultado).not.toBeNull()
    expect(resultado?.pedido).toBe("PED-001")
    expect(resultado?.loja).toBe("Loja 01")
    expect(resultado?.valor_total).toBe(100)
    expect(resultado?.items.length).toBe(1)
    expect(resultado?.items[0].produto_codigo).toBe("P001")
    expect(resultado?.quantidade_total_recebida).toBeNull()
    expect(resultado?.status).toBeNull()
  })

  it("should return null when loja is empty", async () => {
    const useCase = new ConsultarPedidoCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    const resultado = await useCase.executar("", "PED-001")

    expect(resultado).toBeNull()
  })

  it("should return null when pedido is empty", async () => {
    const useCase = new ConsultarPedidoCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    const resultado = await useCase.executar("Loja 01", "")

    expect(resultado).toBeNull()
  })

  it("should return null when pedido not found", async () => {
    const useCase = new ConsultarPedidoCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.buscarPorLoEPedido.mockResolvedValue(null)

    const resultado = await useCase.executar("Loja 02", "PED-999")

    expect(resultado).toBeNull()
  })

  it("should not return pedido from different loja", async () => {
    const useCase = new ConsultarPedidoCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.buscarPorLoEPedido.mockImplementation((l: string, p: string) => {
      if (l === "Loja 01" && p === "PED-001") {
        return Promise.resolve({
          loja: "Loja 01",
          pedido: "PED-001",
          fornecedor_codigo: "F001",
          fornecedor_nome: "Fornecedor A",
          data_pedido: "2026-01-10",
          condicao_pagamento: null,
          quantidade_total: 5,
          valor_total: 50,
          importacao_ids: ["imp-001"],
          importado_em_mais_recente: "2026-01-10T10:00:00Z",
          items: [],
        })
      }
      return Promise.resolve(null)
    })

    const resultado = await useCase.executar("Loja 02", "PED-001")

    expect(resultado).toBeNull()
  })
})
