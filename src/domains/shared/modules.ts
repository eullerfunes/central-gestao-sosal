export type ModuleStatus = "disponível" | "em-desenvolvimento" | "em-breve"

export interface Module {
  id: string
  label: string
  path: string
  icon: string
  status: ModuleStatus
}

export const MODULES: Module[] = [
  { id: "compras", label: "Compras", path: "/compras", icon: "ShoppingCart", status: "em-desenvolvimento" },
  { id: "estoque", label: "Estoque", path: "/estoque", icon: "Package", status: "em-breve" },
  { id: "financeiro", label: "Financeiro", path: "/financeiro", icon: "CreditCard", status: "em-breve" },
  { id: "comercial", label: "Comercial", path: "/comercial", icon: "Store", status: "em-breve" },
  { id: "sop", label: "S&OP", path: "/sop", icon: "BarChart", status: "em-breve" },
  { id: "diretoria", label: "Diretoria", path: "/diretoria", icon: "Building", status: "em-breve" },
  { id: "administracao", label: "Administração", path: "/administracao", icon: "Settings", status: "em-breve" },
]

export const isModuleAvailable = (module: Module) => module.status === "disponível"
