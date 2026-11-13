import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Cria o cliente Supabase do servidor para Server Components / API Routes.
 *
 * Usa @supabase/ssr com separação correta de sessões e cookies via
 * next/headers. Preparação apenas: instancia-se somente quando as variáveis
 * de ambiente estiverem definidas. Não acessa dados reais sem validação
 * de segurança (`security-review`). Credenciais nunca em código.
 */
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // O setAll pode falhar em Server Components de somente leitura.
          // Isso é esperado: o cliente ainda pode ler cookies de sessão.
        }
      },
    },
  })
}
