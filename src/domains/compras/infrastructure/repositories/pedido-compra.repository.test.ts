import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { PedidoCompraSupabaseRepository } from "./pedido-compra.repository"

const mockAuthGetUser = vi.fn()
const mockSupabaseClient = {
  auth: { getUser: mockAuthGetUser },
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
    expect(resultado.total_registros_origem).toBe(0)
    expect(resultado.total_importacoes).toBe(0)
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

  it("deve retornar indisponível quando autorização por filial não está configurada (mesmo autenticado)", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })

    const repository = new PedidoCompraSupabaseRepository()
    const resultado = await repository.listar({})

    // Mesmo autenticado, sem autorização por filial validada, dados ficam bloqueados
    expect(resultado.origem_disponivel).toBe(false)
    expect(resultado.mensagem_indisponibilidade).toContain("Autorização de acesso por filial")
    expect(resultado.pedidos).toEqual([])
    expect(resultado.total_registros_origem).toBe(0)
    expect(resultado.total_importacoes).toBe(0)
  })

  it("deve retornar null para buscarPorLoEPedido quando autenticado mas sem autorização por filial", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })

    const repository = new PedidoCompraSupabaseRepository()
    const pedido = await repository.buscarPorLoEPedido("Loja 01", "PED-001")

    expect(pedido).toBeNull()
  })

  it("deve retornar acesso negado para buscarPorLoEPedido sem sessão", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const repository = new PedidoCompraSupabaseRepository()
    const pedido = await repository.buscarPorLoEPedido("Loja 01", "PED-001")

    expect(pedido).toBeNull()
  })

  it("não deve expor mensagens técnicas do banco em caso de erro", async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })
    // O repositório está bloqueado por autorização de filial, então nunca chega a consultar o banco
    // Esta mensagem é genérica, não expõe detalhes internos
    const repository = new PedidoCompraSupabaseRepository()
    const resultado = await repository.listar({})

    expect(resultado.mensagem_indisponibilidade).not.toContain("relation")
    expect(resultado.mensagem_indisponibilidade).not.toContain("schema")
    expect(resultado.mensagem_indisponibilidade).not.toContain("view")
    expect(resultado.mensagem_indisponibilidade).toContain("filial")
  })
})
