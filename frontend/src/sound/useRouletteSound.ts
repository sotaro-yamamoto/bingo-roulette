import { useEffect, useRef } from 'react'
import drumrollUrl from '../assets/roulette-drumroll.mp3'
import type { Phase } from '../logic/rouletteState'

// 抽選中にドラムロールをループさせる折返し秒数(シンバルの立ち上がりより十分手前であればよい)。
export const DRUMROLL_LOOP_END_SECONDS = 5.5

// 停止時に再生を始める、シンバルの音量が実際に跳ね上がる直前の秒数(波形解析で実測)。
export const CYMBAL_JUMP_SECONDS = 5.98

// HTMLAudioElement.currentTimeによるシークは、mp3等の圧縮フォーマットだと
// 実際に音が切り替わるまでに無視できない遅延(ラグ)が生じることがある。
// Web Audio APIで音源を事前にデコード済みのPCMバッファとして持ち、
// AudioBufferSourceNode.start(when, offset)で毎回再生し直すことで、
// シーク待ちなしに指定位置から即座に音を鳴らす。

/** 新しいAudioBufferSourceNodeを生成し、bufferを設定してdestinationに接続する(start()呼び出しとref更新は呼び出し側で行う)。 */
function createConnectedSource(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  return source
}

/** 抽選中はドラムロールをループ再生し、停止した瞬間にシンバル部分から再生し直して確定演出にする。 */
export function useRouletteSound(phase: Phase) {
  const contextRef = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const wasDrawingRef = useRef(false)

  useEffect(() => {
    const context = new AudioContext()
    contextRef.current = context
    let cancelled = false

    fetch(drumrollUrl)
      .then((res) => res.arrayBuffer())
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
        if (!cancelled) bufferRef.current = buffer
      })

    return () => {
      cancelled = true
      sourceRef.current?.stop()
      void context.close()
    }
  }, [])

  useEffect(() => {
    const context = contextRef.current
    const buffer = bufferRef.current
    if (!context || !buffer) return

    if (phase === 'drawing') {
      wasDrawingRef.current = true
      void context.resume()
      sourceRef.current?.stop()

      const source = createConnectedSource(context, buffer)
      source.loop = true
      source.loopStart = 0
      source.loopEnd = DRUMROLL_LOOP_END_SECONDS
      source.start()
      sourceRef.current = source
    } else if (wasDrawingRef.current) {
      wasDrawingRef.current = false
      sourceRef.current?.stop()

      const source = createConnectedSource(context, buffer)
      source.start(0, CYMBAL_JUMP_SECONDS)
      sourceRef.current = source
    }
  }, [phase])
}
