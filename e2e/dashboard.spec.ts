import { expect, test, type Page } from '@playwright/test'
import { createSeedDeals } from '../src/api/seed'
import { summarize } from '../src/domain/aggregates'
import { formatMoney } from '../src/ui/format'

const seedSummary = summarize(createSeedDeals())

function tile(page: Page, name: string) {
  return page.getByRole('group', { name }).getByTestId('tile-value')
}

test.describe('dashboard', () => {
  test('summary numbers match the seed data', async ({ page }) => {
    expect(seedSummary.openDeals).toBeGreaterThan(0)
    expect(seedSummary.closedThisMonth).toBeGreaterThan(0)

    await page.goto('./')
    await expect(tile(page, 'Open deals')).toHaveText(String(seedSummary.openDeals))
    await expect(tile(page, 'Closed this month')).toHaveText(String(seedSummary.closedThisMonth))
    await expect(tile(page, 'Average won deal')).toHaveText(formatMoney(seedSummary.averageWonValue))
    await expect(page.getByText('Data as of 27 Nov 2026')).toBeVisible()
  })

  test('renders both charts', async ({ page }) => {
    await page.goto('./')
    const pipeline = page.getByRole('figure', { name: 'Deals by stage' })
    const income = page.getByRole('figure', { name: 'Expected income by month' })
    await expect(pipeline.locator('.recharts-bar-rectangle').first()).toBeVisible()
    await expect(income.locator('.recharts-bar-rectangle').first()).toBeVisible()
  })

  test('clicking a stage bar opens the list filtered by that stage', async ({ page }) => {
    await page.goto('./')
    const pipeline = page.getByRole('figure', { name: 'Deals by stage' })
    await pipeline.locator('.recharts-bar-rectangle').first().click()

    await expect(page).toHaveURL(/\/deals\?stage=inquiry/)
    const stages = page.getByRole('table', { name: 'Deals' }).getByTestId('deal-stage')
    await expect.poll(async () => new Set(await stages.allInnerTexts())).toEqual(new Set(['Inquiry']))
  })

  test('stage links offer the same drill-down without the chart', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('link', { name: /^Won: \d+ deals?$/ }).click()
    await expect(page).toHaveURL(/\/deals\?stage=won/)
  })

  test('reflects a saved edit without a reload', async ({ page }) => {
    await page.goto('./')
    await expect(tile(page, 'Open deals')).toHaveText(String(seedSummary.openDeals))

    await page.goto('deals?stage=inquiry')
    await page.getByRole('table', { name: 'Deals' }).locator('tbody tr').first().getByRole('link').click()
    await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible()
    await page.getByLabel('Stage', { exact: true }).selectOption('lost')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByRole('status')).toHaveText('Changes saved')

    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Dashboard' }).click()
    await expect(tile(page, 'Open deals')).toHaveText(String(seedSummary.openDeals - 1))
    await expect(tile(page, 'Closed this month')).toHaveText(String(seedSummary.closedThisMonth + 1))
  })
})
