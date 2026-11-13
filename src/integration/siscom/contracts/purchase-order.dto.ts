/**
 * Contratos de integração com o ERP SISCOM — versão 1.
 *
 * Apenas preparação: DTOs e portas de saída definidos pelo domínio.
 * Nenhuma comunicação externa ativa é implementada nesta etapa
 * (skill `siscom-erp-integration`).
 */

export type SISCOMPurchaseOrderDTO = {
  readonly externalId: string
  readonly supplierDocument: string
  readonly supplierName: string
  readonly totalAmount: number
  readonly currency: string
  readonly status: string
  readonly createdAt: string
}

export type SISCOMSyncResult = {
  readonly sent: number
  readonly failed: number
  readonly errors: Array<{ readonly externalId: string; readonly reason: string }>
}

export type SISCOMContractVersion = "1.0.0"
