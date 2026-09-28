import { useEffect, useReducer, useState } from 'react'
import type { CSSProperties } from 'react'
import crandimLogo from './assets/crandim-logo.png'
import { Board } from './components/Board'
import { Controls } from './components/Controls'
import { NumberDisplay } from './components/NumberDisplay'
import { randomPick } from './logic/randomPick'
import { createRouletteReducer } from './logic/rouletteReducer'
import { stateFromHistory } from './logic/rouletteState'
import { useRouletteSound } from './sound/useRouletteSound'
import { loadHistory, saveHistory } from './storage/historyStorage'

// 視認できる速度での切り替えを狙った調整値。体感を見ながら実装時に変更可能なパラメータとして扱う。
export const TICK_INTERVAL_MS = 80

// レイアウトはこの解像度で固定設計し、実ウィンドウサイズに合わせてtransform: scaleで一括縮小表示する。
// HP ProBook 460 16 inch G11のブラウザ表示を主対象とするが、機種依存の数値をコードに埋め込まないための固定基準値。
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1200

function calcScale() {
  return Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT)
}

// 実ウィンドウサイズと設計解像度の比率を返す。ブレークポイントでレイアウト構造を変えるのではなく、
// 固定レイアウトを一様に縮小/拡大してフィットさせるためのフック。
function useCanvasScale() {
  const [scale, setScale] = useState(calcScale)

  useEffect(() => {
    const handleResize = () => setScale(calcScale())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return scale
}

const rouletteReducer = createRouletteReducer(randomPick)

/** ルーレット全体の状態を結線し、単一画面として描画するルートコンポーネント。 */
export function App() {
  const [state, dispatch] = useReducer(rouletteReducer, undefined, () =>
    stateFromHistory(loadHistory()),
  )
  const scale = useCanvasScale()
  useRouletteSound(state.phase)

  useEffect(() => {
    saveHistory(state.history)
  }, [state.history])

  useEffect(() => {
    if (state.phase !== 'drawing') return
    const id = setInterval(() => dispatch({ type: 'tick' }), TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [state.phase])

  const handleToggleStart = () => {
    dispatch({ type: state.phase === 'drawing' ? 'stop' : 'start' })
  }

  return (
    // 実ウィンドウサイズいっぱいに、固定レイアウト(DESIGN_WIDTH x DESIGN_HEIGHT)をscaleで一様フィットさせる。
    <div className="app__viewport">
      <div
        className="app__canvas"
        style={
          {
            '--scale': scale,
            '--design-width': `${DESIGN_WIDTH}px`,
            '--design-height': `${DESIGN_HEIGHT}px`,
          } as CSSProperties
        }
      >
        <section className="app__roulette-section">
          <div className="app__roulette-content">
            <span className="app__roulette-badge">BINGO ROULETTE</span>
            <NumberDisplay displayedNumber={state.displayedNumber} />
            <Controls
              phase={state.phase}
              onToggleStart={handleToggleStart}
              onReset={() => dispatch({ type: 'reset' })}
            />
          </div>
        </section>

        <section className="app__board-section">
          <Board
            phase={state.phase}
            history={state.history}
            displayedNumber={state.displayedNumber}
          />
        </section>

        <footer className="app__footer">
          <img src={crandimLogo} alt="Crandim" className="app__logo" />
        </footer>
      </div>
    </div>
  )
}
