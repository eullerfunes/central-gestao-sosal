import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { EmptyState } from "@/components/shared/empty-state"

describe("EmptyState", () => {
  it("renderiza título e descrição", () => {
    render(
      <EmptyState
        title="Sem registros"
        description="Não há dados para exibir."
      />,
    )
    expect(screen.getByText("Sem registros")).toBeInTheDocument()
    expect(screen.getByText("Não há dados para exibir.")).toBeInTheDocument()
  })

  it("renderiza ação com link quando informada", () => {
    render(
      <EmptyState
        title="Vazio"
        action={{ label: "Criar", href: "/novo" }}
      />,
    )
    const link = screen.getByRole("link", { name: /criar/i })
    expect(link).toHaveAttribute("href", "/novo")
  })
})
