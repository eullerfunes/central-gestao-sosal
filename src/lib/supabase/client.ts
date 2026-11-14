import { createBrowserClient } from "@supabase/ssr"

/**
 * Autenticação da Central Só Sal: conectar exclusivamente ao Supabase
 * API Siscom Completa, sem usar credenciais do banco provisionado pela Vercel.
 * Chave publishable é pública; jamais usar service_role no navegador.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SOSAL_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SOSAL_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return null
  try {
    if (new URL(url).hostname !== "eclcqhmclfspskawdcaw.supabase.co") return null
  } catch {
    return null
  }
  return createBrowserClient(url, key)
}

export type { SupabaseClient } from "@supabase/supabase-js"
