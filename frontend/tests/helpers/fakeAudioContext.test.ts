import { afterEach, describe, expect, it } from 'vitest'
import {
  FakeAudioContext,
  installFakeAudioContext,
  latestFakeAudioContext,
} from './fakeAudioContext'

describe('installFakeAudioContext / latestFakeAudioContext', () => {
  let uninstall: (() => void) | undefined

  afterEach(() => {
    uninstall?.()
    uninstall = undefined
  })

  it('[正常系] window.AudioContextをFakeに差し替え、生成したインスタンスをinstancesに記録する。', () => {
    uninstall = installFakeAudioContext()

    const context = new window.AudioContext()

    expect(context).toBeInstanceOf(FakeAudioContext)
    expect(latestFakeAudioContext()).toBe(context)
  })

  it('[正常系] createBufferSourceが返すノードはstart/stop/connectの呼び出しを記録する。', () => {
    uninstall = installFakeAudioContext()
    const context = new window.AudioContext()

    const source = context.createBufferSource()
    source.start(0, 1.5)

    expect(source.start).toHaveBeenCalledWith(0, 1.5)
  })

  it('[正常系] 差し替え解除後は、元のwindow.AudioContextに戻る。', () => {
    const original = window.AudioContext
    uninstall = installFakeAudioContext()

    uninstall()
    uninstall = undefined

    expect(window.AudioContext).toBe(original)
  })
})
