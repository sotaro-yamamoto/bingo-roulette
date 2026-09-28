import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { Phase } from '../../../src/logic/rouletteState'
import {
  CYMBAL_JUMP_SECONDS,
  DRUMROLL_LOOP_END_SECONDS,
  useRouletteSound,
} from '../../../src/sound/useRouletteSound'
import {
  type FakeAudioBufferSourceNode,
  installFakeAudioContext,
  latestFakeAudioContext,
} from '../../helpers/fakeAudioContext'

function renderRouletteSound() {
  return renderHook(({ phase }: { phase: Phase }) => useRouletteSound(phase), {
    initialProps: { phase: 'idle' },
  })
}

/**
 * useRouletteSound — phase遷移 × 再生状態 matrix。
 *
 * 音声再生はWeb Audio API(AudioContext)に依存するため、jsdomにはないAPIを
 * 手書きFakeで差し替える。シーク待ちが発生しないことの検証は実ブラウザでの
 * currentTime実測(手動確認)で担保し、ここでは「どの位置から再生し直すか」
 * というロジックのみを検証する。
 *
 * | ケース                       | phase遷移         | 再生状態 | 期待                               |
 * |-------------------------------|--------------------|----------|-------------------------------------|
 * | 抽選開始                     | idle→drawing       | -        | 先頭からループ再生を開始する       |
 * | 抽選中の再開始               | drawing→drawing    | 再生中   | 前の再生を止めて先頭から鳴らし直す |
 * | 停止(再生中から)             | drawing→idle       | 再生中   | シンバル開始位置から単発再生する   |
 * | 初期表示のみ                 | (mount)            | -        | 何も再生しない                     |
 * | 残り1個で即確定(仕様として無音) | idle→completed  | -        | drawingを経由しないため何も再生しない |
 *
 * 最後の1行は仕様として確定済み(rouletteReducer.tsのhandleStartは残り未出番号が
 * 1個のときdrawingを経由せず直接completedへ遷移する)。この場合ドラムロール/シンバル
 * とも一切鳴らないが、意図した挙動としてここに固定する。
 */

/** 音源フェッチ〜デコードの非同期チェーンが解決するのを待つ。 */
async function flushAsync() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

let uninstall: () => void

afterEach(() => {
  uninstall()
})

describe('useRouletteSound', () => {
  it('[正常系] idleからdrawingになると、先頭からドラムロールのループ再生を開始する。', async () => {
    uninstall = installFakeAudioContext()
    const { rerender } = renderRouletteSound()
    await flushAsync()

    rerender({ phase: 'drawing' })

    const context = latestFakeAudioContext()
    const source = context.createBufferSource.mock.results[0].value as FakeAudioBufferSourceNode
    expect(source.loop).toBe(true)
    expect(source.loopStart).toBe(0)
    expect(source.loopEnd).toBe(DRUMROLL_LOOP_END_SECONDS)
    expect(source.start).toHaveBeenCalledWith()
  })

  it('[正常系] 抽選中に再度drawingへ遷移すると、前の再生を止めて先頭から鳴らし直す。', async () => {
    uninstall = installFakeAudioContext()
    const { rerender } = renderRouletteSound()
    await flushAsync()

    rerender({ phase: 'drawing' })
    const context = latestFakeAudioContext()
    const firstSource = context.createBufferSource.mock.results[0].value as FakeAudioBufferSourceNode

    rerender({ phase: 'idle' })
    rerender({ phase: 'drawing' })

    expect(firstSource.stop).toHaveBeenCalled()
    expect(context.createBufferSource.mock.results.length).toBeGreaterThanOrEqual(2)
  })

  it('[正常系] 再生中に停止すると、シンバル開始位置から単発で再生し直す。', async () => {
    uninstall = installFakeAudioContext()
    const { rerender } = renderRouletteSound()
    await flushAsync()

    rerender({ phase: 'drawing' })
    const context = latestFakeAudioContext()
    const drawingSource = context.createBufferSource.mock.results[0]
      .value as FakeAudioBufferSourceNode

    rerender({ phase: 'idle' })

    const stopSource = context.createBufferSource.mock.results[1].value as FakeAudioBufferSourceNode
    expect(drawingSource.stop).toHaveBeenCalled()
    expect(stopSource.loop).toBe(false)
    expect(stopSource.start).toHaveBeenCalledWith(0, CYMBAL_JUMP_SECONDS)
  })

  it('[異常系] 一度もdrawingになっていない状態でidleのまま推移しても、何も再生しない。', async () => {
    uninstall = installFakeAudioContext()
    const { rerender } = renderRouletteSound()
    await flushAsync()

    rerender({ phase: 'idle' })

    const context = latestFakeAudioContext()
    expect(context.createBufferSource).not.toHaveBeenCalled()
  })

  it('[仕様] 残り1個で即確定しdrawingを経由しない場合、無音のまま確定する。', async () => {
    uninstall = installFakeAudioContext()
    const { rerender } = renderRouletteSound()
    await flushAsync()

    rerender({ phase: 'completed' })

    const context = latestFakeAudioContext()
    expect(context.createBufferSource).not.toHaveBeenCalled()
  })
})
