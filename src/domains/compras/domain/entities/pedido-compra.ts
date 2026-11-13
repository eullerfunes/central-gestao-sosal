import { Money } from "../value-objects/money"
import { StatusPedido } from "../value-objects/status-pedido"
import { SituacaoEntrega } from "../value-objects/situacao-entrega"
import { DecisaoCompra, geraParcelasPrevistas, DECISOES_SEM_PARCELAS } from "../value-objects/decisao-compra"
import { ItemPedido } from "./item-pedido"
import { CalculoInvalido } from "../exceptions"

/**
 * PedidoCompra - Entidade de domínio representando um pedido de compra.
 * Campos identificação (A:H da planilha):
 * - Loja, Código do fornecedor, Nome do fornecedor, Número do pedido,
 *   Data do pedido, Condição de pagamento, Código do produto, Descrição do produto
 *
 * Regras observadas (não políticas aprovadas):
 * - Nunca aprovar pedidos implicitamente
 * - Decisões Segurar/Cancelar/Já pago excluem geração de parcelas previstas
 * - Prazo padrão: 30 dias (sinalizado como presumido quando condição ausente)
 * - Previsão padrão de chegada: 7 dias
 */
export interface PedidoCompraProps {
  id: string
  loja: string
  codigoFornecedor: string
  nomeFornecedor: string
  numeroPedido: string
  dataPedido: Date
  condicaoPagamento: string | null
  items: ItemPedido[]
  status: StatusPedido
  decisaoCompra: DecisaoCompra | null
  travaCaixa: boolean
  motivoDecisao: string | null
  observacoes: string | null
  situacaoOTB: string | null
  situacaoFinanceira: string | null
  curvaABC: string | null
  alertas: string[]
  previsaoChegada: Date | null
  origem: string | null
  dataAtualizacao: Date | null
  usuarioAtualizacao: string | null
  quantidadeParcelas: number
}

export class PedidoCompra {
  readonly id: string
  readonly loja: string
  readonly codigoFornecedor: string
  readonly nomeFornecedor: string
  readonly numeroPedido: string
  readonly dataPedido: Date
  readonly condicaoPagamento: string | null
  readonly items: ItemPedido[]
  readonly status: StatusPedido
  readonly decisaoCompra: DecisaoCompra | null
  readonly travaCaixa: boolean
  readonly motivoDecisao: string | null
  readonly observacoes: string | null
  readonly situacaoOTB: string | null
  readonly situacaoFinanceira: string | null
  readonly curvaABC: string | null
  readonly alertas: string[]
  readonly previsaoChegada: Date | null
  readonly origem: string | null
  readonly dataAtualizacao: Date | null
  readonly usuarioAtualizacao: string | null
  readonly quantidadeParcelas: number

  constructor(props: PedidoCompraProps) {
    if (!props.numeroPedido.trim()) {
      throw new CalculoInvalido("Número do pedido é obrigatório")
    }
    if (!props.loja.trim()) {
      throw new CalculoInvalido("Loja é obrigatória")
    }

    this.id = props.id
    this.loja = props.loja
    this.codigoFornecedor = props.codigoFornecedor
    this.nomeFornecedor = props.nomeFornecedor
    this.numeroPedido = props.numeroPedido
    this.dataPedido = props.dataPedido
    this.condicaoPagamento = props.condicaoPagamento
    this.items = props.items
    this.status = props.status
    this.decisaoCompra = props.decisaoCompra
    this.travaCaixa = props.travaCaixa
    this.motivoDecisao = props.motivoDecisao
    this.observacoes = props.observacoes
    this.situacaoOTB = props.situacaoOTB
    this.situacaoFinanceira = props.situacaoFinanceira
    this.curvaABC = props.curvaABC
    this.alertas = props.alertas
    this.previsaoChegada = props.previsaoChegada
    this.origem = props.origem
    this.dataAtualizacao = props.dataAtualizacao
    this.usuarioAtualizacao = props.usuarioAtualizacao
    this.quantidadeParcelas = props.quantidadeParcelas
  }

  get valorTotalPedido(): Money {
    return this.items.reduce(
      (acc, item) => acc.add(item.valorTotal),
      Money.fromUnits(0),
    )
  }

  get quantidadeTotalSolicitada(): number {
    return this.items.reduce((acc, item) => acc + item.quantidadeSolicitada, 0)
  }

  get quantidadeTotalRecebida(): number {
    return this.items.reduce((acc, item) => acc + item.quantidadeRecebida, 0)
  }

  get quantidadeTotalPendente(): number {
    return this.items.reduce((acc, item) => acc + item.quantidadePendente, 0)
  }

  get valorTotalPendente(): Money {
    return this.items.reduce(
      (acc, item) => acc.add(item.valorPendente),
      Money.fromUnits(0),
    )
  }

  get estaTotalmenteRecebido(): boolean {
    return this.items.length > 0 && this.items.every((i) => i.estaTotalmenteRecebido)
  }

  get estaParcialmenteRecebido(): boolean {
    return this.items.some((i) => i.estaParcialmenteRecebido)
  }

  get naoRecebido(): boolean {
    return this.items.length > 0 && this.items.every((i) => i.naoRecebido)
  }

  get situacaoEntregaAgregada(): SituacaoEntrega {
    if (this.naoRecebido) return "em-aberto"
    if (this.estaTotalmenteRecebido) return "ja-chegou"
    return "chegada-parcial"
  }

  get condicaoPagamentoPresumida(): boolean {
    return !this.condicaoPagamento || this.condicaoPagamento.trim() === ""
  }

  get prazoPadraoDias(): number {
    return this.condicaoPagamentoPresumida ? 30 : 0
  }

  get ehDecisaoSemParcelas(): boolean {
    return !!this.decisaoCompra && DECISOES_SEM_PARCELAS.includes(this.decisaoCompra)
  }

  get parcelasPrevistas(): { valorParcela: number; prazoDias: number }[] | null {
    if (!this.decisaoCompra) return null
    if (this.ehDecisaoSemParcelas) return null
    if (this.quantidadeParcelas <= 0) return []

    return geraParcelasPrevistas(
      this.decisaoCompra,
      this.valorTotalPedido.toUnits(),
      this.quantidadeParcelas,
    )
  }

  get itensSemCadastro(): string[] {
    return this.items.filter((i) => !i.codigoProduto.trim()).map((i) => i.codigoProduto)
  }
}
