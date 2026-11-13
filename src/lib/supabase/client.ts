import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Cria o cliente Supabase do navegador.
 *
 * Preparação apenas: o cliente só é instanciado quando as variáveis de
 * ambiente estiverem definidas. Nenhum dado real é acessado sem validação
 * de segurança (`security-review`). As credenciais nunca ficam no código.
 */
export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devem ser definidas no ambiente.",
    )
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export { supabaseUrl, supabaseAnonKey }
