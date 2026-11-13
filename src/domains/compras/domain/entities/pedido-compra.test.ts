import { describe, it, expect } from "vitest"
import { PedidoCompra } from "./pedido-compra"
import { ItemPedido } from "./item-pedido"
import { StatusPedido } from "../value-objects/status-pedido"
import { DecisaoCompra } from "../value-objects/decisao-compra"
import { CalculoInvalido } from "../exceptions"

function criarItemSobrecricao(props?: Partial<{
  codigoProduto: string
  descricaoProduto: string
  quantidadeSolicitada: number
  custoUnitario: number
  quantidadeRecebida: number
}>): ItemPedido {
  return new ItemPedido({
    codigoProduto: props?.codigoProduto ?? "P001",
    descricaoProduto: props?.descricaoProduto ?? "Produto Teste",
    quantidadeSolicitada: props?.quantidadeSolicitada ?? 10,
    custoUnitario: props?.custoUnitario ?? 10,
    quantidadeRecebida: props?.quantidadeRecebida ?? 0,
  })
}

function criarPedidoSobrecricao(props?: Partial<{
  numeroPedido: string
  loja: string
  codigoFornecedor: string
  nomeFornecedor: string
  condicaoPagamento: string | null
  items: ItemPedido[]
  status: StatusPedido
  decisaoCompra: DecisaoCompra | null
  quantidadeParcelas: number
  origem: string | null
}>): PedidoCompra {
  return new PedidoCompra({
    id: "id-1",
    loja: props?.loja ?? "Loja 01",
    codigoFornecedor: props?.codigoFornecedor ?? "F001",
    nomeFornecedor: props?.nomeFornecedor ?? "Fornecedor Teste",
    numeroPedido: props?.numeroPedido ?? "PED-001",
    dataPedido: new Date("2026-01-10"),
    condicaoPagamento: props?.condicaoPagamento === undefined ? "30/60/90" : props.condicaoPagamento,
    items: props?.items ?? [criarItemSobrecricao()],
    status: props?.status ?? "enviado",
    decisaoCompra: props?.decisaoCompra === undefined ? "aprovado" : props.decisaoCompra,
    travaCaixa: false,
    motivoDecisao: null,
    observacoes: null,
    situacaoOTB: null,
    situacaoFinanceira: null,
    curvaABC: null,
    alertas: [],
    previsaoChegada: null,
    origem: props?.origem === undefined ? null : props.origem,
    dataAtualizacao: null,
    usuarioAtualizacao: null,
    quantidadeParcelas: props?.quantidadeParcelas ?? 3,
  })
}

describe("PedidoCompra entity", () => {
  it("should calculate valor total do pedido = soma dos itens", () => {
    const pedido = criarPedidoSobrecricao({
      items: [
        criarItemSobrecricao({ quantidadeSolicitada: 2, custoUnitario: 50 }),
        criarItemSobrecricao({ quantidadeSolicitada: 3, custoUnitario: 30 }),
      ],
    })
    expect(pedido.valorTotalPedido.toUnits()).toBe(2 * 50 + 3 * 30)
  })

  it("should calculate quantidade total solicitada", () => {
    const pedido = criarPedidoSobrecricao({
      items: [
        criarItemSobrecricao({ quantidadeSolicitada: 5 }),
        criarItemSobrecricao({ quantidadeSolicitada: 8 }),
      ],
    })
    expect(pedido.quantidadeTotalSolicitada).toBe(13)
  })

  it("should calculate quantidade total pendente", () => {
    const pedido = criarPedidoSobrecricao({
      items: [
        criarItemSobrecricao({ quantidadeSolicitada: 10, quantidadeRecebida: 4 }),
        criarItemSobrecricao({ quantidadeSolicitada: 6, quantidadeRecebida: 2 }),
      ],
    })
    expect(pedido.quantidadeTotalPendente).toBe(6 + 4)
  })

  it("should detect partially received order", () => {
    const pedido = criarPedidoSobrecricao({
      items: [
        criarItemSobrecricao({ quantidadeSolicitada: 10, quantidadeRecebida: 4 }),
        criarItemSobrecricao({ quantidadeSolicitada: 10, quantidadeRecebida: 10 }),
      ],
    })
    expect(pedido.estaParcialmenteRecebido).toBe(true)
    expect(pedido.estaTotalmenteRecebido).toBe(false)
  })

  it("should detect fully received order", () => {
    const pedido = criarPedidoSobrecricao({
      items: [
        criarItemSobrecricao({ quantidadeSolicitada: 10, quantidadeRecebida: 10 }),
        criarItemSobrecricao({ quantidadeSolicitada: 5, quantidadeRecebida: 5 }),
      ],
    })
    expect(pedido.estaTotalmenteRecebido).toBe(true)
    expect(pedido.estaParcialmenteRecebido).toBe(false)
  })

  it("should detect not received order", () => {
    const pedido = criarPedidoSobrecricao({
      items: [
        criarItemSobrecricao({ quantidadeSolicitada: 10, quantidadeRecebida: 0 }),
        criarItemSobrecricao({ quantidadeSolicitada: 5, quantidadeRecebida: 0 }),
      ],
    })
    expect(pedido.naoRecebido).toBe(true)
    expect(pedido.situacaoEntregaAgregada).toBe("em-aberto")
  })

  it("should identify condição de pagamento presumida when absent", () => {
    const pedidoComCondicao = criarPedidoSobrecricao({
      condicaoPagamento: "30/60/90",
    })
    expect(pedidoComCondicao.condicaoPagamentoPresumida).toBe(false)

    const pedidoSemCondicao = criarPedidoSobrecricao({
      condicaoPagamento: null,
    })
    expect(pedidoSemCondicao.condicaoPagamentoPresumida).toBe(true)
    expect(pedidoSemCondicao.prazoPadraoDias).toBe(30)
  })

  it("should generate parcelas previstas when decisão is aprovado", () => {
    const pedido = criarPedidoSobrecricao({
      decisaoCompra: "aprovado",
      quantidadeParcelas: 3,
    })
    const parcelas = pedido.parcelasPrevistas
    expect(parcelas).not.toBeNull()
    expect(parcelas?.length).toBe(3)
    // valor total = 10 * 10 = 100, dividido por 3 = 33.33...
    expect(parcelas![0].prazoDias).toBe(30)
    expect(parcelas![1].prazoDias).toBe(60)
    expect(parcelas![2].prazoDias).toBe(90)
  })

  it("should NOT generate parcelas previstas for decisão Segurar", () => {
    const pedido = criarPedidoSobrecricao({
      decisaoCompra: "segurar",
      quantidadeParcelas: 3,
    })
    expect(pedido.parcelasPrevistas).toBeNull()
    expect(pedido.ehDecisaoSemParcelas).toBe(true)
  })

  it("should NOT generate parcelas previstas for decisão Cancelar", () => {
    const pedido = criarPedidoSobrecricao({
      decisaoCompra: "cancelar",
      quantidadeParcelas: 3,
    })
    expect(pedido.parcelasPrevistas).toBeNull()
  })

  it("should NOT generate parcelas previstas for decisão Já pago", () => {
    const pedido = criarPedidoSobrecricao({
      decisaoCompra: "ja-pago",
      quantidadeParcelas: 3,
    })
    expect(pedido.parcelasPrevistas).toBeNull()
  })

  it("should return null parcelas when no decisão", () => {
    const pedido = criarPedidoSobrecricao({
      decisaoCompra: null,
    })
    expect(pedido.parcelasPrevistas).toBeNull()
  })

  it("should identify itens sem cadastro", () => {
    const pedido = criarPedidoSobrecricao({
      items: [
        criarItemSobrecricao({ codigoProduto: "" }),
        criarItemSobrecricao({ codigoProduto: "P002" }),
      ],
    })
    expect(pedido.itensSemCadastro).toEqual([""])
  })

  it("should throw when número do pedido is empty", () => {
    expect(() => {
      new PedidoCompra({
        id: "id-1",
        loja: "Loja 01",
        codigoFornecedor: "F001",
        nomeFornecedor: "Fornecedor",
        numeroPedido: "",
        dataPedido: new Date(),
        condicaoPagamento: "30",
        items: [],
        status: "rascunho",
        decisaoCompra: null,
        travaCaixa: false,
        motivoDecisao: null,
        observacoes: null,
        situacaoOTB: null,
        situacaoFinanceira: null,
        curvaABC: null,
        alertas: [],
        previsaoChegada: null,
        origem: null,
        dataAtualizacao: null,
        usuarioAtualizacao: null,
        quantidadeParcelas: 0,
      })
    }).toThrow(CalculoInvalido)
  })

  it("should throw when loja is empty", () => {
    expect(() => {
      new PedidoCompra({
        id: "id-1",
        loja: "",
        codigoFornecedor: "F001",
        nomeFornecedor: "Fornecedor",
        numeroPedido: "PED-001",
        dataPedido: new Date(),
        condicaoPagamento: "30",
        items: [],
        status: "rascunho",
        decisaoCompra: null,
        travaCaixa: false,
        motivoDecisao: null,
        observacoes: null,
        situacaoOTB: null,
        situacaoFinanceira: null,
        curvaABC: null,
        alertas: [],
        previsaoChegada: null,
        origem: null,
        dataAtualizacao: null,
        usuarioAtualizacao: null,
        quantidadeParcelas: 0,
      })
    }).toThrow(CalculoInvalido)
  })
})
