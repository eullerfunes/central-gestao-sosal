"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, LoaderCircle, LockKeyhole, LogOut, ShieldCheck, ShoppingCart } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export function ComprasSair() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function signOut() {
    const client = createSupabaseBrowserClient()
    if (!client || busy) return
    setBusy(true)
    const { error } = await client.auth.signOut()
    setBusy(false)
    if (!error) router.refresh()
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
    >
      <LogOut size={15} /> Sair
    </button>
  )
}

export function ComprasLogin({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const client = createSupabaseBrowserClient()
    if (!client) {
      setError("Conexão com Supabase indisponível. Solicite a configuração ao administrador.")
      return
    }

    setBusy(true)
    setError("")
    const { error: signInError } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setBusy(false)
    if (signInError) {
      setError("Não foi possível entrar. Confira os dados ou solicite acesso ao administrador.")
      return
    }

    setPassword("")
    router.refresh()
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center py-10">
      <section className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_-45px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950">
        <div className="bg-slate-950 px-8 py-9 text-white">
          <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
            <ShoppingCart size={24} />
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Central de Gestão · Só Sal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Pedidos de compra</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Acesso protegido ao histórico de pedidos do SISCOM.</p>
        </div>
        <div className="px-8 py-8">
          {!configured ? (
            <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              A conexão com o Supabase precisa ser configurada na Vercel.
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-semibold">E-mail corporativo</label>
                <input
                  id="login-email" type="email" required autoComplete="username"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com.br"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm font-semibold">Senha</label>
                <input
                  id="login-password" type="password" required autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700"
                />
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <button
                type="submit" disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? <><LoaderCircle size={17} className="animate-spin" /> Entrando...</> : <>Entrar <ArrowRight size={17} /></>}
              </button>
            </form>
          )}
          <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500">
            <ShieldCheck size={17} className="mt-0.5 shrink-0" />
            Apenas usuários com perfil Master ativo podem consultar os dados. Nenhuma conta pode se tornar Master pela interface.
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><LockKeyhole size={14} /> Sessão protegida por Supabase Auth</p>
        </div>
      </section>
    </div>
  )
}
