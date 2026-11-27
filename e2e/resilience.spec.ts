import { expect, test } from '@playwright/test'

const SEED_DEAL_COUNT = 80

test.describe('errors, not found and demo reset', () => {
  test('failure mode shows the error screen and retry recovers once it is off', async ({ page }) => {
    await page.goto('deals?demo-fail')
    const alert = page.getByRole('alert').filter({ hasText: 'Something went wrong' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('failure mode is on')

    await page.getByRole('button', { name: 'Turn off failure mode and retry' }).click()
    await expect(page.getByTestId('deal-total')).toHaveText(`${SEED_DEAL_COUNT} deals`)
    expect(new URL(page.url()).search).not.toContain('demo-fail')
  })

  test('plain retry tries the request again', async ({ page }) => {
    await page.goto('./?demo-fail')
    await expect(page.getByRole('alert').filter({ hasText: 'Something went wrong' })).toBeVisible()

    await page.evaluate(() => window.history.replaceState(window.history.state, '', window.location.pathname))
    await page.getByRole('button', { name: 'Retry', exact: true }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()
  })

  test('unknown deal id shows a deal-specific not-found page', async ({ page }) => {
    await page.goto('deals/D-9999')
    await expect(page.getByRole('heading', { level: 1, name: 'Deal not found' })).toBeVisible()
    await page.getByRole('link', { name: 'Back to all deals' }).click()
    await expect(page.getByTestId('deal-total')).toHaveText(`${SEED_DEAL_COUNT} deals`)
  })

  test('unknown route shows the page not-found screen', async ({ page }) => {
    await page.goto('no-such-page')
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  })

  test('reset demo data restores an edited deal', async ({ page }) => {
    await page.goto('deals/D-1001')
    const originalName = await page.getByLabel('Client name').inputValue()
    await page.getByLabel('Client name').fill('Changed Before Reset')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByRole('status')).toHaveText('Changes saved')

    await page.getByRole('button', { name: 'Reset demo data' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(originalName)
    await page.reload()
    await expect(page.getByLabel('Client name')).toHaveValue(originalName)
  })

  test('corrupted stored data shows the error screen and reset recovers', async ({ page }) => {
    await page.goto('deals')
    await expect(page.getByTestId('deal-total')).toHaveText(`${SEED_DEAL_COUNT} deals`)

    await page.evaluate(() => window.localStorage.setItem('rental-crm:deals', '{not json'))
    await page.reload()
    await expect(page.getByRole('alert').filter({ hasText: 'Something went wrong' })).toBeVisible()

    await page.getByRole('alert').getByRole('button', { name: 'Reset demo data' }).click()
    await expect(page.getByTestId('deal-total')).toHaveText(`${SEED_DEAL_COUNT} deals`)
  })
})
