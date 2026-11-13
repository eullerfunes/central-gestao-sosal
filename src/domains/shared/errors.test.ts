import { describe, it, expect } from "vitest"
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "@/domains/shared/errors"

describe("AppError", () => {
  it("armazena mensagem, código e status", () => {
    const e = new AppError("falha", "ERR", 400)
    expect(e.message).toBe("falha")
    expect(e.code).toBe("ERR")
    expect(e.statusCode).toBe(400)
    expect(e.name).toBe("AppError")
  })

  it("usa status 500 por padrão", () => {
    const e = new AppError("falha", "ERR")
    expect(e.statusCode).toBe(500)
  })
})

describe("NotFoundError", () => {
  it("usa código NOT_FOUND e status 404", () => {
    const e = new NotFoundError("Pedido")
    expect(e.code).toBe("NOT_FOUND")
    expect(e.statusCode).toBe(404)
    expect(e.message).toBe("Pedido não encontrado")
  })
})

describe("UnauthorizedError", () => {
  it("usa código UNAUTHORIZED e status 401", () => {
    const e = new UnauthorizedError()
    expect(e.code).toBe("UNAUTHORIZED")
    expect(e.statusCode).toBe(401)
  })
})

describe("ForbiddenError", () => {
  it("usa código FORBIDDEN e status 403", () => {
    const e = new ForbiddenError()
    expect(e.code).toBe("FORBIDDEN")
    expect(e.statusCode).toBe(403)
  })
})

describe("ValidationError", () => {
  it("usa código VALIDATION_ERROR e status 422", () => {
    const e = new ValidationError()
    expect(e.code).toBe("VALIDATION_ERROR")
    expect(e.statusCode).toBe(422)
  })
})
