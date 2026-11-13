import { Money } from "../value-objects/money"
import { SituacaoEntrega } from "../value-objects/situacao-entrega"
import { CalculoInvalido } from "../exceptions"

/**
 * ItemPedido - Item de um pedido de compra.
 * Regras observadas (não políticas aprovadas):
 * - Valor do item = quantidade solicitada × custo unitário
 * - Quantidade pendente = quantidade solicitada − quantidade recebida
 * - Valor pendente = quantidade pendente × custo unitário
 */
export interface ItemPedidoProps {
  codigoProduto: string
  descricaoProduto: string
  quantidadeSolicitada: number
  custoUnitario: number
  quantidadeRecebida?: number
  situacaoEntrega?: SituacaoEntrega
}

export class ItemPedido {
  readonly codigoProduto: string
  readonly descricaoProduto: string
  readonly quantidadeSolicitada: number
  readonly custoUnitario: number
  readonly quantidadeRecebida: number
  readonly situacaoEntrega: SituacaoEntrega

  constructor(props: ItemPedidoProps) {
    if (props.quantidadeSolicitada < 0) {
      throw new CalculoInvalido("Quantidade solicitada não pode ser negativa")
    }
    if (props.custoUnitario < 0) {
      throw new CalculoInvalido("Custo unitário não pode ser negativo")
    }
    if (
      props.quantidadeRecebida !== undefined &&
      props.quantidadeRecebida > props.quantidadeSolicitada
    ) {
      throw new CalculoInvalido(
        "Quantidade recebida não pode exceder quantidade solicitada",
      )
    }

    this.codigoProduto = props.codigoProduto
    this.descricaoProduto = props.descricaoProduto
    this.quantidadeSolicitada = props.quantidadeSolicitada
    this.custoUnitario = props.custoUnitario
    this.quantidadeRecebida = props.quantidadeRecebida ?? 0
    this.situacaoEntrega = props.situacaoEntrega ?? "em-aberto"
  }

  get valorTotal(): Money {
    return Money.fromUnits(this.quantidadeSolicitada * this.custoUnitario)
  }

  get quantidadePendente(): number {
    return this.quantidadeSolicitada - this.quantidadeRecebida
  }

  get valorPendente(): Money {
    return Money.fromUnits(this.quantidadePendente * this.custoUnitario)
  }

  get estaTotalmenteRecebido(): boolean {
    return this.quantidadeRecebida >= this.quantidadeSolicitada
  }

  get estaParcialmenteRecebido(): boolean {
    return this.quantidadeRecebida > 0 && this.quantidadeRecebida < this.quantidadeSolicitada
  }

  get naoRecebido(): boolean {
    return this.quantidadeRecebida === 0
  }
}
