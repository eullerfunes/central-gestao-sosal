import { describe, it, expect } from "vitest"
import { ItemPedido } from "./item-pedido"
import { CalculoInvalido } from "../exceptions"

describe("ItemPedido entity", () => {
  it("should calculate valor total = quantidade × custo unitário", () => {
    const item = new ItemPedido({
      codigoProduto: "P001",
      descricaoProduto: "Produto A",
      quantidadeSolicitada: 10,
      custoUnitario: 25.5,
    })
    expect(item.valorTotal.toUnits()).toBe(255)
  })

  it("should calculate quantidade pendente = solicitada − recebida", () => {
    const item = new ItemPedido({
      codigoProduto: "P001",
      descricaoProduto: "Produto A",
      quantidadeSolicitada: 10,
      custoUnitario: 25.5,
      quantidadeRecebida: 4,
    })
    expect(item.quantidadePendente).toBe(6)
  })

  it("should calculate valor pendente = pendente × custo unitário", () => {
    const item = new ItemPedido({
      codigoProduto: "P001",
      descricaoProduto: "Produto A",
      quantidadeSolicitada: 10,
      custoUnitario: 25.5,
      quantidadeRecebida: 4,
    })
    expect(item.valorPendente.toUnits()).toBe(6 * 25.5)
  })

  it("should detect fully received item", () => {
    const item = new ItemPedido({
      codigoProduto: "P001",
      descricaoProduto: "Produto A",
      quantidadeSolicitada: 10,
      custoUnitario: 25.5,
      quantidadeRecebida: 10,
    })
    expect(item.estaTotalmenteRecebido).toBe(true)
    expect(item.estaParcialmenteRecebido).toBe(false)
    expect(item.naoRecebido).toBe(false)
  })

  it("should detect partially received item", () => {
    const item = new ItemPedido({
      codigoProduto: "P001",
      descricaoProduto: "Produto A",
      quantidadeSolicitada: 10,
      custoUnitario: 25.5,
      quantidadeRecebida: 3,
    })
    expect(item.estaTotalmenteRecebido).toBe(false)
    expect(item.estaParcialmenteRecebido).toBe(true)
    expect(item.naoRecebido).toBe(false)
  })

  it("should detect not received item", () => {
    const item = new ItemPedido({
      codigoProduto: "P001",
      descricaoProduto: "Produto A",
      quantidadeSolicitada: 10,
      custoUnitario: 25.5,
      quantidadeRecebida: 0,
    })
    expect(item.estaTotalmenteRecebido).toBe(false)
    expect(item.estaParcialmenteRecebido).toBe(false)
    expect(item.naoRecebido).toBe(true)
  })

  it("should throw when quantidade recebida > solicitada", () => {
    expect(() => {
      new ItemPedido({
        codigoProduto: "P001",
        descricaoProduto: "Produto A",
        quantidadeSolicitada: 5,
        custoUnitario: 10,
        quantidadeRecebida: 10,
      })
    }).toThrow(CalculoInvalido)
  })

  it("should throw when quantidade solicitada is negative", () => {
    expect(() => {
      new ItemPedido({
        codigoProduto: "P001",
        descricaoProduto: "Produto A",
        quantidadeSolicitada: -1,
        custoUnitario: 10,
      })
    }).toThrow(CalculoInvalido)
  })

  it("should throw when custo unitário is negative", () => {
    expect(() => {
      new ItemPedido({
        codigoProduto: "P001",
        descricaoProduto: "Produto A",
        quantidadeSolicitada: 5,
        custoUnitario: -10,
      })
    }).toThrow(CalculoInvalido)
  })
})
