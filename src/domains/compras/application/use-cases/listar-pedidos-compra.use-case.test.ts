import { describe, it, expect, vi } from "vitest"
import { ListarPedidosCompraUseCase } from "./listar-pedidos-compra.use-case"
import type { PedidoCompraRepositoryPort } from "../ports/pedido-compra.repository.port"

const mockRepository = {
  listar: vi.fn(),
  buscarPorNumero: vi.fn(),
  buscarPorId: vi.fn(),
}

describe("ListarPedidosCompraUseCase", () => {
  it("should return paginated pedidos from repository", async () => {
    const useCase = new ListarPedidosCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.listar.mockResolvedValue({
      pedidos: [
        {
          id: "1",
          numeroPedido: "PED-001",
          loja: "Loja 01",
          codigoFornecedor: "F001",
          nomeFornecedor: "Fornecedor A",
          dataPedido: new Date("2026-01-10"),
          condicaoPagamento: "30/60/90",
          status: "enviado",
          decisaoCompra: "aprovado",
          valorTotalPedido: { toUnits: () => 100 },
          quantidadeTotalSolicitada: 10,
          quantidadeTotalRecebida: 5,
          quantidadeTotalPendente: 5,
          valorTotalPendente: { toUnits: () => 50 },
          situacaoEntregaAgregada: "chegada-parcial",
          origem: null,
          previsaoChegada: null,
          items: [],
        },
      ],
      total: 1,
      pagina: 1,
      tamanhoPagina: 20,
      totalPaginas: 1,
    })

    const resultado = await useCase.executar({
      pagina: 1,
      tamanhoPagina: 20,
    })

    expect(resultado.total).toBe(1)
    expect(resultado.pagina).toBe(1)
    expect(resultado.pedidos.length).toBe(1)
    expect(resultado.pedidos[0].numeroPedido).toBe("PED-001")
    expect(resultado.temDados).toBe(true)
  })

  it("should return empty result when repository returns no pedidos", async () => {
    const useCase = new ListarPedidosCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.listar.mockResolvedValue({
      pedidos: [],
      total: 0,
      pagina: 1,
      tamanhoPagina: 20,
      totalPaginas: 0,
    })

    const resultado = await useCase.executar({})

    expect(resultado.temDados).toBe(false)
    expect(resultado.pedidos).toEqual([])
    expect(resultado.total).toBe(0)
  })

  it("should apply filtros when calling repository", async () => {
    const useCase = new ListarPedidosCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.listar.mockResolvedValue({
      pedidos: [],
      total: 0,
      pagina: 1,
      tamanhoPagina: 20,
      totalPaginas: 0,
    })

    await useCase.executar({
      loja: "Loja 01",
      fornecedor: "F001",
      numeroPedido: "PED-001",
      produto: "P001",
      dataInicial: "2026-01-01",
      dataFinal: "2026-01-31",
      pagina: 2,
      tamanhoPagina: 10,
    })

    expect(mockRepository.listar).toHaveBeenCalledWith(
      expect.objectContaining({
        loja: "Loja 01",
        fornecedor: "F001",
        numeroPedido: "PED-001",
        produto: "P001",
        pagina: 2,
        tamanhoPagina: 10,
      }),
    )
  })
})
