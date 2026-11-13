export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} não encontrado`, "NOT_FOUND", 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autorizado") {
    super(message, "UNAUTHORIZED", 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso proibido") {
    super(message, "FORBIDDEN", 403)
  }
}

export class ValidationError extends AppError {
  constructor(message = "Dados inválidos") {
    super(message, "VALIDATION_ERROR", 422)
  }
}
