import { describe, it, expect, vi } from "vitest"
import { ListarPedidosCompraUseCase } from "./listar-pedidos-compra.use-case"
import type { PedidoCompraRepositoryPort } from "../ports/pedido-compra.repository.port"

const mockRepository = {
  listar: vi.fn(),
  buscarPorLoEPedido: vi.fn(),
}

describe("ListarPedidosCompraUseCase", () => {
  it("should return paginated pedidos from repository", async () => {
    const useCase = new ListarPedidosCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.listar.mockResolvedValue({
      pedidos: [
        {
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
        },
      ],
      total: 1,
      pagina: 1,
      tamanho_pagina: 20,
      total_paginas: 1,
      origem_disponivel: true,
      mensagem_indisponibilidade: null,
    })

    const resultado = await useCase.executar({
      pagina: 1,
      tamanho_pagina: 20,
    })

    expect(resultado.total).toBe(1)
    expect(resultado.pagina).toBe(1)
    expect(resultado.pedidos.length).toBe(1)
    expect(resultado.pedidos[0].pedido).toBe("PED-001")
    expect(resultado.pedidos[0].loja).toBe("Loja 01")
    expect(resultado.tem_dados).toBe(true)
    expect(resultado.origem_disponivel).toBe(true)
    expect(resultado.pedidos[0].quantidade_total_recebida).toBeNull()
    expect(resultado.pedidos[0].valor_total_pendente).toBeNull()
    expect(resultado.pedidos[0].status).toBeNull()
  })

  it("should return empty result when repository returns no pedidos", async () => {
    const useCase = new ListarPedidosCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.listar.mockResolvedValue({
      pedidos: [],
      total: 0,
      pagina: 1,
      tamanho_pagina: 20,
      total_paginas: 0,
      origem_disponivel: false,
      mensagem_indisponibilidade:
        "Não foi possível acessar a view de pedidos de compra.",
    })

    const resultado = await useCase.executar({})

    expect(resultado.tem_dados).toBe(false)
    expect(resultado.pedidos).toEqual([])
    expect(resultado.total).toBe(0)
    expect(resultado.origem_disponivel).toBe(false)
    expect(resultado.mensagem_indisponibilidade).not.toBeNull()
  })

  it("should apply filtros when calling repository", async () => {
    const useCase = new ListarPedidosCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.listar.mockResolvedValue({
      pedidos: [],
      total: 0,
      pagina: 1,
      tamanho_pagina: 20,
      total_paginas: 0,
      origem_disponivel: true,
      mensagem_indisponibilidade: null,
    })

    await useCase.executar({
      loja: "Loja 01",
      fornecedor: "F001",
      pedido: "PED-001",
      produto: "P001",
      data_inicial: "2026-01-01",
      data_final: "2026-01-31",
      pagina: 2,
      tamanho_pagina: 10,
    })

    expect(mockRepository.listar).toHaveBeenCalledWith(
      expect.objectContaining({
        loja: "Loja 01",
        fornecedor: "F001",
        pedido: "PED-001",
        produto: "P001",
        data_inicial: "2026-01-01",
        data_final: "2026-01-31",
        pagina: 2,
        tamanho_pagina: 10,
      }),
    )
  })
})
