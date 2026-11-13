import { describe, it, expect, vi } from "vitest"
import { ConsultarPedidoCompraUseCase } from "./consultar-pedido-compra.use-case"
import type { PedidoCompraRepositoryPort } from "../ports/pedido-compra.repository.port"

const mockRepository = {
  buscarPorNumero: vi.fn(),
  listar: vi.fn(),
  buscarPorId: vi.fn(),
}

describe("ConsultarPedidoCompraUseCase", () => {
  it("should return pedido detalhe when found", async () => {
    const useCase = new ConsultarPedidoCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.buscarPorNumero.mockResolvedValue({
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
      items: [
        {
          codigoProduto: "P001",
          descricaoProduto: "Produto A",
          quantidadeSolicitada: 10,
          custoUnitario: 10,
          quantidadeRecebida: 5,
          quantidadePendente: 5,
          valorTotal: { toUnits: () => 100 },
          valorPendente: { toUnits: () => 50 },
          situacaoEntrega: "chegada-parcial",
          estaTotalmenteRecebido: false,
          estaParcialmenteRecebido: true,
          naoRecebido: false,
        },
      ],
      travaCaixa: false,
      motivoDecisao: null,
      observacoes: null,
      situacaoOTB: null,
      situacaoFinanceira: null,
      curvaABC: null,
      alertas: [],
      parcelasPrevistas: null,
      usuarioAtualizacao: null,
      dataAtualizacao: null,
    })

    const resultado = await useCase.executar("PED-001")

    expect(resultado).not.toBeNull()
    expect(resultado?.numeroPedido).toBe("PED-001")
    expect(resultado?.valorTotal).toBe(100)
    expect(resultado?.valorTotalPendente).toBe(50)
    expect(resultado?.items.length).toBe(1)
    expect(resultado?.items[0].codigoProduto).toBe("P001")
    expect(resultado?.items[0].estaParcialmenteRecebido).toBe(true)
  })

  it("should return null when pedido not found", async () => {
    const useCase = new ConsultarPedidoCompraUseCase(
      mockRepository as unknown as PedidoCompraRepositoryPort,
    )

    mockRepository.buscarPorNumero.mockResolvedValue(null)

    const resultado = await useCase.executar("PED-999")

    expect(resultado).toBeNull()
  })
})
