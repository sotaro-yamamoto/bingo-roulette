import { describe, expect, it } from 'vitest'
import { createRouletteReducer } from '../../../src/logic/rouletteReducer'
import { createInitialState, stateFromHistory } from '../../../src/logic/rouletteState'
import { createFakePickNext } from '../../helpers/fakePickNext'

/**
 * 状態(idle/drawing/completed) × アクション(start/tick/stop/reset) の遷移 matrix。
 *
 * idleは「未出番号2個以上」「未出番号ちょうど1個」で挙動が分かれるため別行にした。
 * 「-」は仕様上到達しない、または他の組合せと結果が同一で個別のテストを持たない組合せ。
 *
 * | 状態             | start                  | tick                | stop                  | reset       |
 * |------------------|--------------------------|-----------------------|-------------------------|---------------|
 * | idle(残2個以上)  | drawingへ・pickNext呼ぶ  | no-op                 | no-op                   | 履歴クリア    |
 * | idle(残1個)      | 即confirmしcompletedへ   | -                      | -                        | 同上          |
 * | drawing          | no-op(拒否)              | pickNext再呼び出し    | confirmし履歴に追加      | no-op(拒否)   |
 * | completed        | no-op(拒否)              | no-op                 | -                        | 履歴クリア    |
 */
describe('rouletteReducer / start', () => {
  it('[正常系] 未出番号が2個以上ある待機中でstartすると、抽選中へ遷移しpickNextの結果を表示する。', () => {
    const { pickNext, calls } = createFakePickNext([7])
    const reducer = createRouletteReducer(pickNext)
    const next = reducer(createInitialState(), { type: 'start' })
    expect(next.phase).toBe('drawing')
    expect(next.displayedNumber).toBe(7)
    expect(next.history).toEqual([])
    expect(calls).toHaveLength(1)
    expect(calls[0]).toHaveLength(75)
  })

  it('[正常系] 未出番号がちょうど1個の場合、抽選中を経由せずその番号を即確定する。', () => {
    const history = Array.from({ length: 74 }, (_, i) => i + 1) // 残り75のみ
    const state = stateFromHistory(history)
    const { pickNext } = createFakePickNext([75])
    const reducer = createRouletteReducer(pickNext)
    const next = reducer(state, { type: 'start' })
    expect(next.phase).toBe('completed')
    expect(next.displayedNumber).toBe(75)
    expect(next.history[0]).toBe(75)
    expect(next.history).toHaveLength(75)
  })

  it('[異常系] 抽選中にstartしても状態は変化しない。', () => {
    const { pickNext, calls } = createFakePickNext([])
    const reducer = createRouletteReducer(pickNext)
    const drawingState = {
      phase: 'drawing' as const,
      history: [],
      displayedNumber: 3,
    }
    const next = reducer(drawingState, { type: 'start' })
    expect(next).toEqual(drawingState)
    expect(calls).toHaveLength(0)
  })

  it('[異常系] 完了状態でstartしても状態は変化しない。', () => {
    const { pickNext, calls } = createFakePickNext([])
    const reducer = createRouletteReducer(pickNext)
    const completed = stateFromHistory(
      Array.from({ length: 75 }, (_, i) => i + 1),
    )
    const next = reducer(completed, { type: 'start' })
    expect(next).toEqual(completed)
    expect(calls).toHaveLength(0)
  })
})

describe('rouletteReducer / tick', () => {
  it('[正常系] 抽選中のtickはpickNextで新たな候補を選び表示を更新する。同じ番号の連続も許容する。', () => {
    const { pickNext, calls } = createFakePickNext([1, 1])
    const reducer = createRouletteReducer(pickNext)
    const drawingState = {
      phase: 'drawing' as const,
      history: [],
      displayedNumber: 1,
    }
    const next = reducer(drawingState, { type: 'tick' })
    expect(next.phase).toBe('drawing')
    expect(next.displayedNumber).toBe(1)
    expect(calls).toHaveLength(1)
  })

  it('[異常系] 待機中・完了状態でのtickは状態を変化させない。', () => {
    const { pickNext, calls } = createFakePickNext([])
    const reducer = createRouletteReducer(pickNext)
    const idle = createInitialState()
    expect(reducer(idle, { type: 'tick' })).toEqual(idle)
    expect(calls).toHaveLength(0)
  })
})

describe('rouletteReducer / stop', () => {
  it('[正常系] 抽選中のstopは表示中の番号をそのまま確定し、履歴先頭へ追加する。新たな乱数選択は行わない。', () => {
    const { pickNext, calls } = createFakePickNext([])
    const reducer = createRouletteReducer(pickNext)
    const drawingState = {
      phase: 'drawing' as const,
      history: [3, 2, 1],
      displayedNumber: 50,
    }
    const next = reducer(drawingState, { type: 'stop' })
    expect(next.phase).toBe('idle')
    expect(next.displayedNumber).toBe(50)
    expect(next.history).toEqual([50, 3, 2, 1])
    expect(calls).toHaveLength(0)
  })

  it('[正常系] stopによって未出番号が0個になる場合、完了状態へ遷移する。', () => {
    const { pickNext } = createFakePickNext([])
    const reducer = createRouletteReducer(pickNext)
    const history = Array.from({ length: 74 }, (_, i) => i + 1)
    const drawingState = { phase: 'drawing' as const, history, displayedNumber: 75 }
    const next = reducer(drawingState, { type: 'stop' })
    expect(next.phase).toBe('completed')
    expect(next.history).toHaveLength(75)
  })

  it('[異常系] 待機中でのstopは状態を変化させない。', () => {
    const { pickNext } = createFakePickNext([])
    const reducer = createRouletteReducer(pickNext)
    const idle = createInitialState()
    expect(reducer(idle, { type: 'stop' })).toEqual(idle)
  })
})

describe('rouletteReducer / reset', () => {
  it('[正常系] 待機中でresetすると初期状態に戻る。', () => {
    const { pickNext } = createFakePickNext([])
    const reducer = createRouletteReducer(pickNext)
    const state = stateFromHistory([1, 2, 3])
    expect(reducer(state, { type: 'reset' })).toEqual(createInitialState())
  })

  it('[正常系] 完了状態でresetすると初期状態に戻る。', () => {
    const { pickNext } = createFakePickNext([])
    const reducer = createRouletteReducer(pickNext)
    const completed = stateFromHistory(
      Array.from({ length: 75 }, (_, i) => i + 1),
    )
    expect(reducer(completed, { type: 'reset' })).toEqual(createInitialState())
  })

  it('[異常系] 抽選中はresetを受け付けない。', () => {
    const { pickNext } = createFakePickNext([])
    const reducer = createRouletteReducer(pickNext)
    const drawingState = {
      phase: 'drawing' as const,
      history: [1],
      displayedNumber: 5,
    }
    expect(reducer(drawingState, { type: 'reset' })).toEqual(drawingState)
  })
})
