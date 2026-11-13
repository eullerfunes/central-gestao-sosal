import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { PedidoCompraSupabaseRepository } from "./pedido-compra.repository"

const mockAuthGetUser = vi.fn()
const mockFromSelect = vi.fn()
const mockSupabaseClient = {
  auth: { getUser: mockAuthGetUser },
  from: vi.fn(() => ({ select: mockFromSelect })),
}

const mockCreateSupabaseServerClient = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => mockCreateSupabaseServerClient(),
}))

beforeEach(() => {
  vi.resetAllMocks()
  mockCreateSupabaseServerClient.mockResolvedValue(mockSupabaseClient)
})

afterEach(() => {
  vi.resetAllMocks()
})

describe("PedidoCompraSupabaseRepository", () => {
  it("deve retornar indisponível quando variáveis de ambiente não configuradas", async () => {
    mockCreateSupabaseServerClient.mockResolvedValue(null)

    const repository = new PedidoCompraSupabaseRepository()
    const resultado = await repository.listar({})

    expect(resultado.origem_disponivel).toBe(false)
    expect(resultado.mensagem_indisponibilidade).toContain("não configuradas")
    expect(resultado.pedidos).toEqual([])
  })

  it("deve retornar acesso negado quando não há sessão autenticada", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const repository = new PedidoCompraSupabaseRepository()
    const resultado = await repository.listar({})

    expect(resultado.origem_disponivel).toBe(false)
    expect(resultado.mensagem_indisponibilidade).toContain("Acesso negado")
    expect(resultado.pedidos).toEqual([])
  })

  it("deve retornar acesso negado quando auth falha", async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" },
    })

    const repository = new PedidoCompraSupabaseRepository()
    const resultado = await repository.listar({})

    expect(resultado.origem_disponivel).toBe(false)
    expect(resultado.mensagem_indisponibilidade).toContain("Acesso negado")
  })

  it("deve retornar indisponível quando view não existe ou sem permissão", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })
    mockFromSelect.mockResolvedValue({
      data: null,
      error: { message: 'relation "Só Sal".v_rpa_pedidos_compra does not exist' },
    })

    const repository = new PedidoCompraSupabaseRepository()
    const resultado = await repository.listar({})

    expect(resultado.origem_disponivel).toBe(false)
    expect(resultado.mensagem_indisponibilidade).toContain("Não foi possível acessar")
    expect(resultado.pedidos).toEqual([])
  })

  it("deve retornar sucesso com registros quando autenticado e view acessível", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })
    mockFromSelect.mockResolvedValue({
      data: [
        {
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
        },
      ],
      error: null,
    })

    const repository = new PedidoCompraSupabaseRepository()
    const resultado = await repository.listar({})

    expect(resultado.origem_disponivel).toBe(true)
    expect(resultado.mensagem_indisponibilidade).toBeNull()
    expect(resultado.total).toBe(1)
    expect(resultado.pedidos[0].pedido).toBe("PED-001")
    expect(resultado.pedidos[0].loja).toBe("Loja 01")
    expect(resultado.pedidos[0].items).toHaveLength(1)
    expect(resultado.pedidos[0].quantidade_total).toBe(10)
    expect(resultado.pedidos[0].valor_total).toBe(255)
  })

  it("deve buscar pedido por loja + pedido com sucesso", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })
    mockFromSelect.mockResolvedValue({
      data: [
        {
          importacao_id: "imp-001",
          importado_em: "2026-01-10T10:00:00Z",
          linha_excel: 1,
          loja: "Loja 01",
          fornecedor_codigo: "F001",
          fornecedor_nome: "Fornecedor A",
          pedido: "PED-001",
          data_pedido: "2026-01-10",
          condicao_pagamento: null,
          produto_codigo: "P001",
          descricao: "Produto A",
          quantidade: 5,
          custo_unitario: 10,
          valor_total_informado: 50,
          valor_total_calculado: 50,
        },
      ],
      error: null,
    })

    const repository = new PedidoCompraSupabaseRepository()
    const pedido = await repository.buscarPorLoEPedido("Loja 01", "PED-001")

    expect(pedido).not.toBeNull()
    expect(pedido!.pedido).toBe("PED-001")
    expect(pedido!.loja).toBe("Loja 01")
    expect(pedido!.items).toHaveLength(1)
  })

  it("deve retornar null para pedido inexistente", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })
    mockFromSelect.mockResolvedValue({ data: [], error: null })

    const repository = new PedidoCompraSupabaseRepository()
    const pedido = await repository.buscarPorLoEPedido("Loja 02", "PED-999")

    expect(pedido).toBeNull()
  })

  it("deve retornar acesso negado para buscarPorLoEPedido sem sessão", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const repository = new PedidoCompraSupabaseRepository()
    const pedido = await repository.buscarPorLoEPedido("Loja 01", "PED-001")

    expect(pedido).toBeNull()
  })
})
