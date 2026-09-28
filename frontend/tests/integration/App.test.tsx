import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App, TICK_INTERVAL_MS } from '../../src/App'
import { STORAGE_KEY } from '../../src/storage/historyStorage'

/**
 * App結線シナリオ — ロジック層(reducer)・永続化層(storage)自体の仕様は
 * それぞれのユニットテストで検証済み。ここではApp.tsxがそれらを正しく
 * 結線しているか(初期化・保存・タイマー・トグル操作の配線)のみを検証する。
 *
 * | シナリオ                   | 検証点                                       |
 * |-----------------------------|-----------------------------------------------|
 * | 保存済み履歴からのマウント | loadHistoryの結果が初期表示に反映される       |
 * | 確定操作後                 | saveHistoryがlocalStorageへ反映される         |
 * | 抽選中のtickタイマー       | setIntervalが設定され一定間隔で発火し続ける   |
 * | 停止操作後                 | clearIntervalが呼ばれタイマーが解除される     |
 */
describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('[正常系] 保存済み履歴があるとき、初期表示にlocalStorageの内容を反映する。', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([5, 3, 1]))
    render(<App />)

    expect(screen.getByTestId('number-display')).toHaveTextContent('5')
    expect(screen.getByText('抽選済み：3 / 75')).toBeInTheDocument()
  })

  it('[正常系] 抽選開始→停止で1件確定すると、localStorageへ保存される。', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'START' }))
    expect(screen.getByRole('button', { name: 'STOP' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'STOP' }))
    expect(screen.getByRole('button', { name: 'START' })).toBeInTheDocument()

    const confirmed = screen.getByTestId('number-display').textContent
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([Number(confirmed)])
  })

  it('[正常系] 抽選中はTICK_INTERVAL_MSごとにtickが発火し、停止するとタイマーが解除される。', () => {
    vi.useFakeTimers()
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'START' }))
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), TICK_INTERVAL_MS)

    act(() => {
      vi.advanceTimersByTime(TICK_INTERVAL_MS * 3)
    })
    const displayedDuringDrawing = Number(screen.getByTestId('number-display').textContent)
    expect(displayedDuringDrawing).toBeGreaterThanOrEqual(1)
    expect(displayedDuringDrawing).toBeLessThanOrEqual(75)

    const timerId = setIntervalSpy.mock.results[0]?.value
    fireEvent.click(screen.getByRole('button', { name: 'STOP' }))
    expect(clearIntervalSpy).toHaveBeenCalledWith(timerId)
  })
})
