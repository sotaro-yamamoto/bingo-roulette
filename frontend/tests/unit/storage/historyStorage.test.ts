import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY, loadHistory, saveHistory } from '../../../src/storage/historyStorage'

/**
 * 保存データの正常/異常ケース matrix。
 *
 * | ケース             | 保存内容                     | 期待     | 検証点             |
 * |--------------------|-------------------------------|----------|--------------------|
 * | 正常               | [3,1,2]                       | そのまま | 読み込み成功       |
 * | キーなし           | (未設定)                      | []       | 初期状態フォールバック |
 * | パース不能         | "{not json"                   | []       | 初期状態フォールバック |
 * | 配列でない         | {"a":1}                       | []       | 初期状態フォールバック |
 * | 範囲外の値を含む   | [0, 5]                        | []       | 初期状態フォールバック |
 * | 範囲外の値を含む   | [76, 5]                       | []       | 初期状態フォールバック |
 * | 整数でない値を含む | [1.5, 5]                      | []       | 初期状態フォールバック |
 * | 数値でない値を含む | ["5", 6]                      | []       | 初期状態フォールバック |
 * | 重複を含む         | [5, 5, 6]                     | []       | 初期状態フォールバック |
 */
describe('historyStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('[正常系] 保存した履歴をそのまま読み込める。', () => {
    saveHistory([3, 1, 2])
    expect(loadHistory()).toEqual([3, 1, 2])
  })

  it('[異常系] キーが存在しない場合、空配列を返す。', () => {
    expect(loadHistory()).toEqual([])
  })

  it('[異常系] JSONとしてパースできない場合、空配列を返す。', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadHistory()).toEqual([])
  })

  it('[異常系] 配列でない場合、空配列を返す。', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 1 }))
    expect(loadHistory()).toEqual([])
  })

  it('[異常系] 0を含む場合、空配列を返す。', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([0, 5]))
    expect(loadHistory()).toEqual([])
  })

  it('[異常系] 76を含む場合、空配列を返す。', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([76, 5]))
    expect(loadHistory()).toEqual([])
  })

  it('[正常系] 1と75ちょうどは許容する。', () => {
    saveHistory([1, 75])
    expect(loadHistory()).toEqual([1, 75])
  })

  it('[異常系] 整数でない値(小数)を含む場合、空配列を返す。', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1.5, 5]))
    expect(loadHistory()).toEqual([])
  })

  it('[異常系] 数値でない値を含む場合、空配列を返す。', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['5', 6]))
    expect(loadHistory()).toEqual([])
  })

  it('[異常系] 重複した番号を含む場合、空配列を返す。', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([5, 5, 6]))
    expect(loadHistory()).toEqual([])
  })

  it('[正常系] saveHistoryは呼ぶたびに保存内容を最新化する。', () => {
    saveHistory([1])
    saveHistory([2, 1])
    expect(loadHistory()).toEqual([2, 1])
  })
})
