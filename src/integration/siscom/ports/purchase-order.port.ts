import type { SISCOMPurchaseOrderDTO, SISCOMSyncResult } from "../contracts/purchase-order.dto"

/**
 * Porta de saída definida pelo domínio para integração com o ERP SISCOM.
 *
 * A implementação do adaptador vive em src/integration/siscom/adapters
 * e é acionada apenas quando solicitada explicitamente.
 */

export interface PurchaseOrderSISCOMPort {
  /**
   * Envia um pedido de compra para o SISCOM.
   * Retorno é um contrato de sincronização, nunca dados reais do ERP.
   */
  sendPurchaseOrder(dto: SISCOMPurchaseOrderDTO): Promise<SISCOMSyncResult>
}
