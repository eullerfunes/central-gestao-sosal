/**
 * DecisaoCompra - Decisão sobre um pedido de compra.
 * Valores observados na planilha (não políticas aprovadas):
 * - Aprovado
 * - Segurar
 * - Cancelar
 * - Já pago
 *
 * Regra observada: decisões Segurar, Cancelar e Já pago são excluídas
 * da geração de parcelas previstas.
 */
export type DecisaoCompra = "aprovado" | "segurar" | "cancelar" | "ja-pago"

export const DECISAO_COMPRA_LABELS: Record<DecisaoCompra, string> = {
  aprovado: "Aprovado",
  segurar: "Segurar",
  cancelar: "Cancelar",
  "ja-pago": "Já pago",
}

export const DECISOES_SEM_PARCELAS: DecisaoCompra[] = [
  "segurar",
  "cancelar",
  "ja-pago",
]

export function geraParcelasPrevistas(
  decisao: DecisaoCompra,
  valorTotal: number,
  quantidadeParcelas: number,
): { valorParcela: number; prazoDias: number }[] | null {
  if (DECISOES_SEM_PARCELAS.includes(decisao)) {
    return null
  }

  if (quantidadeParcelas <= 0) {
    return []
  }

  const valorParcela = valorTotal / quantidadeParcelas
  const prazoPadrao = 30

  return Array.from({ length: quantidadeParcelas }, (_, i) => ({
    valorParcela,
    prazoDias: prazoPadrao * (i + 1),
  }))
}

export function isDecisaoCompra(value: string): value is DecisaoCompra {
  return ["aprovado", "segurar", "cancelar", "ja-pago"].includes(value)
}
