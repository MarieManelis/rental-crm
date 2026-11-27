import { expect, test } from '@playwright/test'

test('app opens at the base path and nav switches screens', async ({ page }) => {
  await page.goto('./')

  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()

  const nav = page.getByRole('navigation', { name: 'Main' })
  await nav.getByRole('link', { name: 'Deals' }).click()
  await expect(page).toHaveURL(/\/rental-crm\/deals$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Deals' })).toBeVisible()

  await nav.getByRole('link', { name: 'Dashboard' }).click()
  await expect(page).toHaveURL(/\/rental-crm\/$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()
})
