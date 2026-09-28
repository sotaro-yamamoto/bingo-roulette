/** 抽選の進行段階(待機中/抽選中/完了)。 */
export type Phase = 'idle' | 'drawing' | 'completed'

/** ルーレットの現在状態。 */
export interface RouletteState {
  phase: Phase
  /** 確定済み番号を抽選順(新しい順、先頭が最新)に並べた履歴。未出番号はこの補集合として導出する。 */
  history: number[]
  displayedNumber: number | null
}

export const TOTAL_NUMBERS = 75

/** 抽選対象の1〜75を昇順で並べた配列。 */
export const ALL_NUMBERS: readonly number[] = Array.from(
  { length: TOTAL_NUMBERS },
  (_, i) => i + 1,
)

/** 履歴に含まれない1〜75の整数を昇順で返す。 */
export function remainingNumbers(history: readonly number[]): number[] {
  const drawn = new Set(history)
  return ALL_NUMBERS.filter((n) => !drawn.has(n))
}

/** 未着手時の状態(待機中・履歴なし)を返す。 */
export function createInitialState(): RouletteState {
  return { phase: 'idle', history: [], displayedNumber: null }
}

/** 永続化された履歴から起動直後の状態を復元する。 */
export function stateFromHistory(history: readonly number[]): RouletteState {
  const phase: Phase = history.length === TOTAL_NUMBERS ? 'completed' : 'idle'
  return {
    phase,
    history: [...history],
    displayedNumber: history[0] ?? null,
  }
}
