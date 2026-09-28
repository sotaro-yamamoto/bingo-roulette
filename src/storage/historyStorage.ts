import { TOTAL_NUMBERS } from '../logic/rouletteState'

export const STORAGE_KEY = 'bingoRouletteHistory'

/** 確定済み番号の履歴をlocalStorageへ保存する。 */
export function saveHistory(history: readonly number[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

/** localStorageから履歴を読み込む。データが無い/不正な場合は初期状態として空配列を返す。 */
export function loadHistory(): number[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  return isValidHistory(parsed) ? parsed : []
}

function isValidHistory(value: unknown): value is number[] {
  if (!Array.isArray(value)) return false
  if (!value.every((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL_NUMBERS)) {
    return false
  }
  // 重複があると未出番号(remainingNumbers)の導出が破綻するため、ここで弾く
  return new Set(value).size === value.length
}
