export type AuthSession = {
  user: {
    id: string
    email: string | null
    role: string | null
  } | null
  accessToken: string | null
}

export type AuthState = "authenticated" | "unauthenticated" | "loading"
