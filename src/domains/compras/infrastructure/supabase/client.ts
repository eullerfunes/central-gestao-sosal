/**
 * Cliente Supabase específico para leitura do módulo de Compras.
 *
 * Restrições:
 * - Somente leitura (read-only).
 * - Nenhuma service_role key no frontend.
 * - Nenhuma escrita em pedidos ou aprovações.
 * - Retorna null quando variáveis de ambiente não estiverem definidas.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function createComprasSupabaseClient() {
  return createSupabaseServerClient()
}
