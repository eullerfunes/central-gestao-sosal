export interface Module {
  id: string
  label: string
  path: string
  icon: string
  disabled?: boolean
}

export const MODULES: Module[] = [
  { id: "compras", label: "Compras", path: "/compras", icon: "ShoppingCart" },
  { id: "estoque", label: "Estoque", path: "/estoque", icon: "Package" },
  { id: "financeiro", label: "Financeiro", path: "/financeiro", icon: "CreditCard" },
  { id: "comercial", label: "Comercial", path: "/comercial", icon: "Store" },
  { id: "sop", label: "S&OP", path: "/sop", icon: "BarChart" },
  { id: "diretoria", label: "Diretoria", path: "/diretoria", icon: "Building" },
  { id: "administracao", label: "Administração", path: "/administracao", icon: "Settings" },
]
