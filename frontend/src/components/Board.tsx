import type { Phase } from '../logic/rouletteState'
import { ALL_NUMBERS, TOTAL_NUMBERS } from '../logic/rouletteState'

interface Props {
  phase: Phase
  history: number[]
  displayedNumber: number | null
}

type CellState = 'current' | 'confirmed' | 'undrawn'

const cellModifierClass: Record<CellState, string> = {
  current: 'board__cell--current',
  confirmed: 'board__cell--confirmed',
  undrawn: 'board__cell--undrawn',
}

/** 1〜75の全番号を一覧表示し、現在当選・次点済み・未抽選を区別して強調表示する。 */
export function Board({ phase, history, displayedNumber }: Props) {
  const confirmedSet = new Set(history)

  return (
    <div className="board">
      <div className="board__header">
        <div>
          <h2 className="board__title">BOARD</h2>
          <p className="board__subtitle">
            抽選済み：{history.length} / {TOTAL_NUMBERS}
          </p>
        </div>
      </div>

      <div className="board__grid-container">
        <div data-testid="board-grid" className="board__grid">
          {ALL_NUMBERS.map((n) => {
            const state: CellState =
              phase !== 'drawing' && n === displayedNumber
                ? 'current'
                : confirmedSet.has(n)
                  ? 'confirmed'
                  : 'undrawn'
            return (
              <span
                key={n}
                data-state={state}
                className={`board__cell ${cellModifierClass[state]}`}
              >
                {n}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
