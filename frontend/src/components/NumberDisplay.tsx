interface Props {
  displayedNumber: number | null
}

/** 現在の表示番号(またはプレースホルダー)を表示する。抽選中/確定後の見た目の違いは呼び出し元の再描画タイミングに委ねる。 */
export function NumberDisplay({ displayedNumber }: Props) {
  return (
    <div
      data-testid="number-display"
      className="number-display"
    >
      {displayedNumber ?? '－'}
    </div>
  )
}
