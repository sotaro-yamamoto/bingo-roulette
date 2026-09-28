import { vi } from 'vitest'

/** Web Audio APIのAudioBufferSourceNodeを模した手書きFake。呼び出し記録をvi.fn()で保持する。 */
export class FakeAudioBufferSourceNode {
  buffer: AudioBuffer | null = null
  loop = false
  loopStart = 0
  loopEnd = 0
  connect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

/** Web Audio APIのAudioContextを模した手書きFake。生成したインスタンスをinstancesに記録する。 */
export class FakeAudioContext {
  static instances: FakeAudioContext[] = []
  destination = {}
  resume = vi.fn(() => Promise.resolve())
  close = vi.fn(() => Promise.resolve())
  createBufferSource = vi.fn(() => new FakeAudioBufferSourceNode())
  decodeAudioData = vi.fn(() => Promise.resolve({} as AudioBuffer))

  constructor() {
    FakeAudioContext.instances.push(this)
  }
}

/** テスト内で最後に生成されたFakeAudioContextインスタンスを返す。 */
export function latestFakeAudioContext(): FakeAudioContext {
  return FakeAudioContext.instances[FakeAudioContext.instances.length - 1]
}

/**
 * window.AudioContext / window.fetch をFakeに差し替える。
 * 戻り値の関数を呼ぶと差し替え前の状態に戻る。
 */
export function installFakeAudioContext(): () => void {
  FakeAudioContext.instances = []
  const originalAudioContext = window.AudioContext
  const originalFetch = window.fetch

  window.AudioContext = FakeAudioContext as unknown as typeof AudioContext
  window.fetch = vi.fn(() =>
    Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) } as Response),
  )

  return () => {
    window.AudioContext = originalAudioContext
    window.fetch = originalFetch
  }
}
