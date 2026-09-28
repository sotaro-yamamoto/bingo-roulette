import { describe, expect, it } from 'vitest'
import { randomPick } from '../../../src/logic/randomPick'

describe('randomPick', () => {
  it('[正常系] candidatesの中から必ず1件を返す。', () => {
    const candidates = [3, 7, 21]
    for (let i = 0; i < 20; i += 1) {
      expect(candidates).toContain(randomPick(candidates))
    }
  })

  it('[正常系] candidatesが1件のみの場合、その値を返す。', () => {
    expect(randomPick([42])).toBe(42)
  })
})
