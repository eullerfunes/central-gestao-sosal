/**
 * SituacaoEntrega - Situação da entrega de um pedido/item.
 * Valores observados na planilha (não políticas aprovadas):
 * - Em aberto
 * - Chegada parcial
 * - Já chegou — conferir/baixar
 */
export type SituacaoEntrega = "em-aberto" | "chegada-parcial" | "ja-chegou"

export const SITUACAO_ENTREGA_LABELS: Record<SituacaoEntrega, string> = {
  "em-aberto": "Em aberto",
  "chegada-parcial": "Chegada parcial",
  "ja-chegou": "Já chegou — conferir/baixar",
}

export function isSituacaoEntrega(value: string): value is SituacaoEntrega {
  return ["em-aberto", "chegada-parcial", "ja-chegou"].includes(value)
}
