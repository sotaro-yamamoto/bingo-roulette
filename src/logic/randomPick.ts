import type { PickNext } from './rouletteReducer'

/** 本番用のPickNext。テスト時はfakePickNext等の決定的な実装に差し替える。 */
export const randomPick: PickNext = (candidates) =>
  candidates[Math.floor(Math.random() * candidates.length)]
