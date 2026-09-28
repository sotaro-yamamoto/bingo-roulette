import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NumberDisplay } from '../../../src/components/NumberDisplay'

describe('NumberDisplay', () => {
  it('[正常系] 表示番号がnullの場合、非数字のプレースホルダーを表示する。', () => {
    render(<NumberDisplay displayedNumber={null} />)
    expect(screen.getByTestId('number-display')).toHaveTextContent('－')
  })

  it('[正常系] 表示番号がある場合はその数値をそのまま表示する。', () => {
    render(<NumberDisplay displayedNumber={42} />)
    expect(screen.getByTestId('number-display')).toHaveTextContent('42')
  })
})
