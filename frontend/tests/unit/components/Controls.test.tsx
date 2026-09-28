import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Controls } from '../../../src/components/Controls'

/** 呼び出し記録を保持するだけの手書きFake。汎用モックの代わりに使う。 */
function createRecorder() {
  const calls: unknown[][] = []
  return { fn: (...args: unknown[]) => calls.push(args), calls }
}

/** window.confirmを固定の戻り値で差し替える手書きFake。呼び出しメッセージを記録する。 */
function stubConfirm(returnValue: boolean) {
  const original = window.confirm
  const calls: string[] = []
  window.confirm = (message?: string) => {
    calls.push(message ?? '')
    return returnValue
  }
  return { calls, restore: () => { window.confirm = original } }
}

function setup(overrides: Partial<React.ComponentProps<typeof Controls>> = {}) {
  const onToggleStart = createRecorder()
  const onReset = createRecorder()
  const props: React.ComponentProps<typeof Controls> = {
    phase: 'idle',
    onToggleStart: onToggleStart.fn,
    onReset: onReset.fn,
    ...overrides,
  }
  render(<Controls {...props} />)
  return { onToggleStart, onReset }
}

describe('Controls / 開始・停止トグル', () => {
  it('[正常系] 待機中はボタン押下でonToggleStartを呼ぶ。', async () => {
    const { onToggleStart } = setup({ phase: 'idle' })
    await userEvent.click(screen.getByRole('button', { name: 'START' }))
    expect(onToggleStart.calls).toHaveLength(1)
  })

  it('[正常系] 抽選中はラベルが停止表示になり、押下でonToggleStartを呼ぶ。', async () => {
    const { onToggleStart } = setup({ phase: 'drawing' })
    await userEvent.click(screen.getByRole('button', { name: 'STOP' }))
    expect(onToggleStart.calls).toHaveLength(1)
  })

  it('[異常系] 完了状態では開始/停止ボタンが無効化される。', () => {
    setup({ phase: 'completed' })
    expect(screen.getByRole('button', { name: 'START' })).toBeDisabled()
  })
})

describe('Controls / RESET', () => {
  it('[正常系] 確認ダイアログでOKした場合のみonResetを呼ぶ。', async () => {
    const confirm = stubConfirm(true)
    const { onReset } = setup({ phase: 'idle' })
    await userEvent.click(screen.getByRole('button', { name: 'RESET' }))
    expect(confirm.calls).toHaveLength(1)
    expect(onReset.calls).toHaveLength(1)
    confirm.restore()
  })

  it('[異常系] 確認ダイアログでキャンセルした場合はonResetを呼ばない。', async () => {
    const confirm = stubConfirm(false)
    const { onReset } = setup({ phase: 'idle' })
    await userEvent.click(screen.getByRole('button', { name: 'RESET' }))
    expect(onReset.calls).toHaveLength(0)
    confirm.restore()
  })

  it('[異常系] 抽選中はRESETボタンが無効化される。', () => {
    setup({ phase: 'drawing' })
    expect(screen.getByRole('button', { name: 'RESET' })).toBeDisabled()
  })
})
