/**
 * Exceções de domínio específicas do módulo de Compras.
 */

export class PedidoNaoEncontrado extends Error {
  constructor(public readonly numeroPedido: string) {
    super(`Pedido não encontrado: ${numeroPedido}`)
    this.name = "PedidoNaoEncontrado"
  }
}

export class FornecedorNaoIdentificado extends Error {
  constructor(public readonly codigoFornecedor: string) {
    super(`Fornecedor não identificado: ${codigoFornecedor}`)
    this.name = "FornecedorNaoIdentificado"
  }
}

export class ProdutoSemCadastro extends Error {
  constructor(public readonly codigoProduto: string) {
    super(`Produto sem cadastro: ${codigoProduto}`)
    this.name = "ProdutoSemCadastro"
  }
}

export class CondicaoPagamentoAusente extends Error {
  constructor(public readonly numeroPedido: string) {
    super(`Condição de pagamento ausente: ${numeroPedido}`)
    this.name = "CondicaoPagamentoAusente"
  }
}

export class CalculoInvalido extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = "CalculoInvalido"
  }
}
