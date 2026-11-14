import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Mesmo projeto Supabase usado pelo navegador. Restringe a conexão ao
 * banco original do SISCOM e usa somente a chave pública e cookies de sessão.
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SOSAL_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SOSAL_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return null
  try {
    if (new URL(url).hostname !== "eclcqhmclfspskawdcaw.supabase.co") return null
  } catch {
    return null
  }

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
