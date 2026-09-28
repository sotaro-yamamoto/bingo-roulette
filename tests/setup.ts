import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { installFakeAudioContext } from './helpers/fakeAudioContext'

// jsdomはWeb Audio APIを実装していないため、AudioContextを使うコードがテストで
// 例外を出さないよう全テスト共通でFakeに差し替える。挙動そのものを検証するテストは
// tests/helpers/fakeAudioContext.tsのFakeAudioContext.instances経由で生成済みインスタンスを参照する。
installFakeAudioContext()

afterEach(() => {
  cleanup()
})
