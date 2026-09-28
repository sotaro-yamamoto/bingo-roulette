import { TOTAL_NUMBERS, remainingNumbers, type RouletteState } from './rouletteState'

/** 未出番号の候補群から次に表示する1件を選ぶ。真の乱数/固定シーケンス等、呼び出し元が注入する。 */
export type PickNext = (candidates: readonly number[]) => number

/** ルーレットの状態を変化させる操作の種別。 */
export type RouletteAction =
  | { type: 'start' }
  | { type: 'tick' }
  | { type: 'stop' }
  | { type: 'reset' }

/** pickNextを注入した抽選状態のreducerを生成する。 */
export function createRouletteReducer(pickNext: PickNext) {
  return function rouletteReducer(
    state: RouletteState,
    action: RouletteAction,
  ): RouletteState {
    switch (action.type) {
      case 'start':
        return handleStart(state, pickNext)
      case 'tick':
        return handleTick(state, pickNext)
      case 'stop':
        return handleStop(state)
      case 'reset':
        return handleReset(state)
      default:
        return state
    }
  }
}

function handleStart(state: RouletteState, pickNext: PickNext): RouletteState {
  if (state.phase !== 'idle') return state
  const remaining = remainingNumbers(state.history)
  if (remaining.length === 1) {
    return confirmNumber(state, remaining[0])
  }
  return { ...state, phase: 'drawing', displayedNumber: pickNext(remaining) }
}

function handleTick(state: RouletteState, pickNext: PickNext): RouletteState {
  if (state.phase !== 'drawing') return state
  const remaining = remainingNumbers(state.history)
  return { ...state, displayedNumber: pickNext(remaining) }
}

function handleStop(state: RouletteState): RouletteState {
  if (state.phase !== 'drawing' || state.displayedNumber === null) return state
  return confirmNumber(state, state.displayedNumber)
}

// 停止時点の表示値をそのまま確定値として採用する。新たな乱数選択は行わない。
function confirmNumber(state: RouletteState, confirmed: number): RouletteState {
  const history = [confirmed, ...state.history]
  const phase = history.length === TOTAL_NUMBERS ? 'completed' : 'idle'
  return { phase, history, displayedNumber: confirmed }
}

function handleReset(state: RouletteState): RouletteState {
  if (state.phase === 'drawing') return state
  return { phase: 'idle', history: [], displayedNumber: null }
}
