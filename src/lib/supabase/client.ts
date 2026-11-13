import { createBrowserClient } from "@supabase/ssr"

/**
 * Cria o cliente Supabase do navegador.
 *
 * Preparação apenas: o cliente só é instanciado quando as variáveis de
 * ambiente estiverem definidas. Nenhum dado real é acessado sem validação
 * de segurança (`security-review`). As credenciais nunca ficam no código.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export type { SupabaseClient } from "@supabase/supabase-js"
