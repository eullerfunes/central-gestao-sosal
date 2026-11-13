/**
 * Value Object: Money
 * Representa um valor monetário com precisão decimal.
 * Regras observadas da planilha (não políticas aprovadas):
 * - Valor do item = quantidade × custo unitário
 * - Valor pendente = quantidade pendente × custo unitário
 */

export class Money {
  readonly cents: number

  private constructor(cents: number) {
    this.cents = Math.round(cents)
  }

  static fromCents(cents: number): Money {
    return new Money(cents)
  }

  static fromUnits(units: number): Money {
    return new Money(units * 100)
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents)
  }

  subtract(other: Money): Money {
    return new Money(this.cents - other.cents)
  }

  multiply(factor: number): Money {
    return new Money(this.cents * factor)
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error("Divisão por zero não permitida")
    }
    return new Money(this.cents / divisor)
  }

  toUnits(): number {
    return this.cents / 100
  }

  equals(other: Money): boolean {
    return this.cents === other.cents
  }

  isZero(): boolean {
    return this.cents === 0
  }

  isPositive(): boolean {
    return this.cents > 0
  }

  isNegative(): boolean {
    return this.cents < 0
  }

  format(locale = "pt-BR", currency = "BRL"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(this.toUnits())
  }

  toString(): string {
    return this.format()
  }
}
