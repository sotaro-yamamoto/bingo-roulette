import { Play, RotateCcw, Square } from 'lucide-react'
import type { Phase } from '../logic/rouletteState'

interface Props {
  phase: Phase
  onToggleStart: () => void
  onReset: () => void
}

/** 開始/停止トグルとRESETを横並びの操作ボタン群として提供する。 */
export function Controls({ phase, onToggleStart, onReset }: Props) {
  const handleReset = () => {
    if (window.confirm('全ての履歴を消去します。よろしいですか？')) {
      onReset()
    }
  }

  return (
    <div className="controls">
      <button
        type="button"
        className="controls__toggle"
        disabled={phase === 'completed'}
        onClick={onToggleStart}
      >
        {phase === 'drawing' ? <Square size={24} /> : <Play size={24} />}
        {phase === 'drawing' ? 'STOP' : 'START'}
      </button>
      <button
        type="button"
        className="controls__reset"
        disabled={phase === 'drawing'}
        onClick={handleReset}
      >
        <RotateCcw size={24} />
        RESET
      </button>
    </div>
  )
}
