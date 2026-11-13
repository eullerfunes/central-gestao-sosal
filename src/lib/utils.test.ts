import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("mescla classes múltiplas", () => {
    expect(cn("a", "b", "c")).toBe("a b c")
  })

  it("ignora valores falsos", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c")
  })

  it("resolve conflitos do Tailwind vencendo o último", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
    expect(cn("bg-primary", "bg-secondary")).toBe("bg-secondary")
  })

  it("aceita objetos condicionais", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active")
  })
})
