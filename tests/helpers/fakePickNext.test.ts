import { describe, expect, it } from 'vitest'
import { createFakePickNext } from './fakePickNext'

describe('createFakePickNext', () => {
  it('[正常系] queueの値を呼び出し順に返し、candidatesをcallsへ記録する。', () => {
    const { pickNext, calls } = createFakePickNext([3, 7])
    expect(pickNext([1, 3, 5])).toBe(3)
    expect(pickNext([7, 9])).toBe(7)
    expect(calls).toEqual([[1, 3, 5], [7, 9]])
  })

  it('[異常系] queueが枯渇した状態で呼び出すと例外を投げる。', () => {
    const { pickNext } = createFakePickNext([1])
    pickNext([1, 2])
    expect(() => pickNext([1, 2])).toThrow(/queueが枯渇した/)
  })

  it('[異常系] queueの値がcandidatesに含まれない場合、例外を投げる。', () => {
    const { pickNext } = createFakePickNext([99])
    expect(() => pickNext([1, 2, 3])).toThrow(/candidatesに含まれない/)
  })
})
