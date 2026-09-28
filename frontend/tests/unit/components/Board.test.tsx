import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Board } from '../../../src/components/Board'

function setup(overrides: Partial<React.ComponentProps<typeof Board>> = {}) {
  const props: React.ComponentProps<typeof Board> = {
    phase: 'idle',
    history: [],
    displayedNumber: null,
    ...overrides,
  }
  render(<Board {...props} />)
}

describe('Board / 番号一覧', () => {
  it('[正常系] 1〜75の75マスを表示する。', () => {
    setup()
    const grid = screen.getByTestId('board-grid')
    expect(within(grid).getByText('1')).toBeInTheDocument()
    expect(within(grid).getByText('75')).toBeInTheDocument()
  })

  it('[正常系] displayedNumberは現在当選として区別される。', () => {
    setup({ history: [10, 5], displayedNumber: 10 })
    const grid = screen.getByTestId('board-grid')
    expect(within(grid).getByText('10')).toHaveAttribute('data-state', 'current')
  })

  it('[正常系] displayedNumber以外の履歴は次点済みとして区別される。', () => {
    setup({ history: [10, 5], displayedNumber: 10 })
    const grid = screen.getByTestId('board-grid')
    expect(within(grid).getByText('5')).toHaveAttribute('data-state', 'confirmed')
  })

  it('[正常系] 履歴に含まれない番号は未抽選として区別される。', () => {
    setup({ history: [10, 5], displayedNumber: 10 })
    const grid = screen.getByTestId('board-grid')
    expect(within(grid).getByText('1')).toHaveAttribute('data-state', 'undrawn')
  })

  it('[正常系] 抽選中はdisplayedNumberと一致していても現在当選として扱わない。', () => {
    setup({ phase: 'drawing', history: [5], displayedNumber: 10 })
    const grid = screen.getByTestId('board-grid')
    expect(within(grid).getByText('10')).toHaveAttribute('data-state', 'undrawn')
  })
})

describe('Board / 抽選済み件数表示', () => {
  it('[正常系] 履歴件数と総数を"抽選済み：件数 / 75"の形式で表示する。', () => {
    setup({ history: [10, 5, 3] })
    expect(screen.getByText('抽選済み：3 / 75')).toBeInTheDocument()
  })

  it('[正常系] 履歴が空の場合は0件と表示する。', () => {
    setup({ history: [] })
    expect(screen.getByText('抽選済み：0 / 75')).toBeInTheDocument()
  })
})
