import type { PickNext } from '../../src/logic/rouletteReducer'

/** 呼び出し順にあらかじめ用意した値を返す、決定的なpickNextのFake。 */
export function createFakePickNext(queue: readonly number[]) {
  const calls: (readonly number[])[] = []
  let index = 0
  const pickNext: PickNext = (candidates) => {
    calls.push(candidates)
    if (index >= queue.length) {
      throw new Error(
        `createFakePickNext: queueが枯渇した(${calls.length}回目の呼び出し)`,
      )
    }
    const value = queue[index]
    index += 1
    if (!candidates.includes(value)) {
      throw new Error(
        `createFakePickNext: queueの値${value}がcandidatesに含まれない`,
      )
    }
    return value
  }
  return { pickNext, calls }
}
