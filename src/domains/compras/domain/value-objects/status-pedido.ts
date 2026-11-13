/**
 * StatusPedido - Status de um pedido de compra.
 * Valores observados na planilha (não políticas aprovadas).
 */
export type StatusPedido =
  | "rascunho"
  | "enviado"
  | "aprovado"
  | "recebido"
  | "cancelado"

export const STATUS_PEDIDO_LABELS: Record<StatusPedido, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recebido: "Recebido",
  cancelado: "Cancelado",
}

export function isStatusPedido(value: string): value is StatusPedido {
  return [
    "rascunho",
    "enviado",
    "aprovado",
    "recebido",
    "cancelado",
  ].includes(value)
}
