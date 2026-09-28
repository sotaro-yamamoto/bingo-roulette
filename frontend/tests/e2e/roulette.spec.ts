import { expect, test } from '@playwright/test'

test.describe('ビンゴ抽選ルーレット', () => {
  test('[正常系] 開始〜確定・番号一覧表示・全消去まで一連の操作ができる。', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('number-display')).toHaveText('－')

    // 開始→停止で1件確定させる
    await page.getByRole('button', { name: 'START' }).click()
    await expect(page.getByRole('button', { name: 'STOP' })).toBeVisible()
    await page.getByRole('button', { name: 'STOP' }).click()
    await expect(page.getByRole('button', { name: 'START' })).toBeVisible()

    const confirmedText = await page.getByTestId('number-display').textContent()
    const confirmed = Number(confirmedText)
    expect(confirmed).toBeGreaterThanOrEqual(1)
    expect(confirmed).toBeLessThanOrEqual(75)

    await expect(page.getByText('抽選済み：1 / 75')).toBeVisible()

    // 番号一覧上で確定番号が現在当選として強調表示される
    await expect(
      page.getByTestId('board-grid').getByText(String(confirmed), { exact: true }),
    ).toHaveAttribute('data-state', 'current')

    // 全消去する
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'RESET' }).click()

    await expect(page.getByTestId('number-display')).toHaveText('－')
    await expect(page.getByText('抽選済み：0 / 75')).toBeVisible()
  })

  test('[正常系] 確定後にリロードしても、履歴と表示番号がブラウザに保持されている。', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'START' }).click()
    await page.getByRole('button', { name: 'STOP' }).click()
    const confirmedText = await page.getByTestId('number-display').textContent()

    await page.reload()

    await expect(page.getByTestId('number-display')).toHaveText(confirmedText ?? '')
    await expect(page.getByText('抽選済み：1 / 75')).toBeVisible()
  })
})
