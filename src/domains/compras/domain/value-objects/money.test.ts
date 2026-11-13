import { describe, it, expect } from "vitest"
import { Money } from "./money"

describe("Money value object", () => {
  it("should create from cents", () => {
    const money = Money.fromCents(1500)
    expect(money.toUnits()).toBe(15)
  })

  it("should create from units", () => {
    const money = Money.fromUnits(15.5)
    expect(money.toUnits()).toBe(15.5)
  })

  it("should add two money values", () => {
    const a = Money.fromUnits(10)
    const b = Money.fromUnits(5.5)
    const result = a.add(b)
    expect(result.toUnits()).toBe(15.5)
  })

  it("should subtract two money values", () => {
    const a = Money.fromUnits(10)
    const b = Money.fromUnits(4.25)
    const result = a.subtract(b)
    expect(result.toUnits()).toBe(5.75)
  })

  it("should multiply money by a factor", () => {
    const money = Money.fromUnits(10)
    const result = money.multiply(3)
    expect(result.toUnits()).toBe(30)
  })

  it("should divide money by a divisor", () => {
    const money = Money.fromUnits(100)
    const result = money.divide(4)
    expect(result.toUnits()).toBe(25)
  })

  it("should throw on division by zero", () => {
    const money = Money.fromUnits(100)
    expect(() => money.divide(0)).toThrow("Divisão por zero não permitida")
  })

  it("should compare equality", () => {
    const a = Money.fromUnits(10)
    const b = Money.fromUnits(10)
    const c = Money.fromUnits(20)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it("should identify zero, positive and negative", () => {
    expect(Money.fromUnits(0).isZero()).toBe(true)
    expect(Money.fromUnits(5).isPositive()).toBe(true)
    expect(Money.fromUnits(-5).isNegative()).toBe(true)
  })

  it("should format as currency", () => {
    const money = Money.fromUnits(1234.56)
    expect(money.format()).toContain("1.234,56")
  })
})
