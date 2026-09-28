import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub PagesはリポジトリのサブパスでHostされるため、本番ビルド時だけbaseを切り替える
  base: command === 'build' ? '/bingo-roulette/' : '/',
  // devコンテナのポートフォワーディング経由でホスト側から到達できるよう、全インターフェースでlistenする
  server: {
    host: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
      'tests/helpers/**/*.test.{ts,tsx}',
    ],
  },
}))
