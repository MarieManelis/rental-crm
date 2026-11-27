import { expect, test } from '@playwright/test'

const SCREENS = [
  { name: 'dashboard', path: './' },
  { name: 'deal list', path: 'deals' },
  { name: 'deal page', path: 'deals/D-1001' },
]

for (const screen of SCREENS) {
  test(`${screen.name} has no horizontal scroll`, async ({ page }) => {
    await page.goto(screen.path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}
