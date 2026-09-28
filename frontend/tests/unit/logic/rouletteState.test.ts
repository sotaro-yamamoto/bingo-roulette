import { describe, expect, it } from 'vitest'
import {
  createInitialState,
  remainingNumbers,
  stateFromHistory,
} from '../../../src/logic/rouletteState'

describe('remainingNumbers', () => {
  it('[正常系] 履歴が空の場合、1〜75の75個すべてを返す。', () => {
    const remaining = remainingNumbers([])
    expect(remaining).toHaveLength(75)
    expect(remaining[0]).toBe(1)
    expect(remaining.at(-1)).toBe(75)
  })

  it('[正常系] 履歴にある番号は未出番号から除外される。', () => {
    const remaining = remainingNumbers([5, 10, 75])
    expect(remaining).toHaveLength(72)
    expect(remaining).not.toContain(5)
    expect(remaining).not.toContain(10)
    expect(remaining).not.toContain(75)
  })

  it('[正常系] 履歴が74個の場合、未出番号はちょうど1個になる。', () => {
    const history = Array.from({ length: 74 }, (_, i) => i + 1)
    expect(remainingNumbers(history)).toHaveLength(1)
  })

  it('[正常系] 履歴が75個(全出)の場合、未出番号は0個になる。', () => {
    const history = Array.from({ length: 75 }, (_, i) => i + 1)
    expect(remainingNumbers(history)).toHaveLength(0)
  })
})

describe('createInitialState', () => {
  it('[正常系] 待機中・履歴なし・表示番号nullの初期状態を返す。', () => {
    expect(createInitialState()).toEqual({
      phase: 'idle',
      history: [],
      displayedNumber: null,
    })
  })
})

describe('stateFromHistory', () => {
  it('[正常系] 空の履歴からは初期状態と同じ状態を復元する。', () => {
    expect(stateFromHistory([])).toEqual({
      phase: 'idle',
      history: [],
      displayedNumber: null,
    })
  })

  it('[正常系] 履歴が1件以上ある場合、先頭(最新の確定番号)を表示番号として復元する。', () => {
    const state = stateFromHistory([42, 1, 2])
    expect(state.phase).toBe('idle')
    expect(state.displayedNumber).toBe(42)
    expect(state.history).toEqual([42, 1, 2])
  })

  it('[正常系] 履歴が75件(全出)の場合、完了状態として復元する。', () => {
    const history = Array.from({ length: 75 }, (_, i) => i + 1)
    const state = stateFromHistory(history)
    expect(state.phase).toBe('completed')
  })

  it('[正常系] 履歴が74件の場合、待機中として復元する。', () => {
    const history = Array.from({ length: 74 }, (_, i) => i + 1)
    const state = stateFromHistory(history)
    expect(state.phase).toBe('idle')
  })
})
