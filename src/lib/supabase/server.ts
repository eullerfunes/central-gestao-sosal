import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/** Cliente SSR com acesso apenas à chave pública e à sessão do usuário. */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null
  const store = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          )
        } catch {
          // Server Components de leitura não podem atualizar cookies.
        }
      },
    },
  })
}
