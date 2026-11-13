import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { DataTable } from "@/components/shared/data-table"

interface Row {
  id: string
  name: string
  status: string
}

describe("DataTable", () => {
  const columns = [
    { key: "id" as const, label: "ID" },
    { key: "name" as const, label: "Nome" },
    { key: "status" as const, label: "Status" },
  ]

  it("renderiza cabeçalhos e linhas de dados", () => {
    const data: Row[] = [
      { id: "1", name: "Produto A", status: "Ativo" },
      { id: "2", name: "Produto B", status: "Inativo" },
    ]
    render(<DataTable columns={columns} data={data} />)

    expect(screen.getByText("ID")).toBeInTheDocument()
    expect(screen.getByText("Nome")).toBeInTheDocument()
    expect(screen.getByText("Produto A")).toBeInTheDocument()
    expect(screen.getByText("Produto B")).toBeInTheDocument()
    expect(screen.getByText("Ativo")).toBeInTheDocument()
  })

  it("exibe mensagem de vazio sem dados", () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByText("Nenhum registro encontrado.")).toBeInTheDocument()
  })

  it("exibe mensagem de vazio personalizada", () => {
    render(
      <DataTable columns={columns} data={[]} emptyMessage="Sem pedidos." />,
    )
    expect(screen.getByText("Sem pedidos.")).toBeInTheDocument()
  })
})
