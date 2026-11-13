import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Cliente Supabase para uso em Server Components / API Routes.
 *
 * Preparação apenas: instancia-se somente quando as variáveis de ambiente
 * estiverem definidas. Não acessa dados reais sem validação de segurança
 * (`security-review`). Credenciais nunca em código.
 */
export function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export { supabaseUrl, supabaseAnonKey }
