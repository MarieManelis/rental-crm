import { expect, test } from '@playwright/test'

const SEED_DEAL_COUNT = 80

test('seed data loads on first visit and survives a reload', async ({ page }) => {
  await page.goto('deals')
  await expect(page.getByTestId('deal-total')).toHaveText(`${SEED_DEAL_COUNT} deals`)

  const stored = await page.evaluate(() => window.localStorage.getItem('rental-crm:deals'))
  expect(stored).not.toBeNull()

  await page.reload()
  await expect(page.getByTestId('deal-total')).toHaveText(`${SEED_DEAL_COUNT} deals`)
})
