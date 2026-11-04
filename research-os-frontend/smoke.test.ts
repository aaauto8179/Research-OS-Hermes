import { describe, it, expect } from 'vitest'

describe('Smoke Tests', () => {
  it('should pass basic math', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have vitest working', () => {
    expect(true).toBeTruthy()
  })
})