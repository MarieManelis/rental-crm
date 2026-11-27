import { expect, test, type Locator, type Page } from '@playwright/test'

const SEED_DEAL_COUNT = 80
const PAGE_SIZE = 20

function rows(page: Page): Locator {
  return page.getByRole('table', { name: 'Deals' }).locator('tbody tr')
}

async function totalCount(page: Page): Promise<number> {
  const text = await page.getByTestId('deal-total').innerText()
  return Number(text.replace(/\D/g, ''))
}

async function columnTexts(page: Page, testId: string): Promise<string[]> {
  return rows(page).getByTestId(testId).allInnerTexts()
}

async function columnValues(page: Page): Promise<number[]> {
  const texts = await columnTexts(page, 'deal-value')
  return texts.map((text) => Number(text.replace(/[^\d]/g, '')))
}

test.describe('deal list', () => {
  test('shows the first page of all deals by default', async ({ page }) => {
    await page.goto('deals')
    await expect(page.getByTestId('deal-total')).toHaveText(`${SEED_DEAL_COUNT} deals`)
    await expect(rows(page)).toHaveCount(PAGE_SIZE)
    await expect(page.getByText(`Page 1 of ${SEED_DEAL_COUNT / PAGE_SIZE}`)).toBeVisible()
  })

  test('filters by rental type, stage and city and stores them in the URL', async ({ page }) => {
    await page.goto('deals')

    await page.getByLabel('Rental type').selectOption('short')
    await expect(page).toHaveURL(/type=short/)
    await expect.poll(() => columnTexts(page, 'deal-type')).not.toContain('Long-term')

    await page.getByLabel('Stage', { exact: true }).selectOption('won')
    await expect(page).toHaveURL(/stage=won/)
    await expect.poll(async () => new Set(await columnTexts(page, 'deal-stage'))).toEqual(new Set(['Won']))

    await page.getByLabel('City').selectOption('Porto')
    await expect(page).toHaveURL(/city=Porto/)
    await expect.poll(async () => new Set(await columnTexts(page, 'deal-city'))).toEqual(new Set(['Porto']))

    const filteredTotal = await totalCount(page)
    expect(filteredTotal).toBeLessThan(SEED_DEAL_COUNT)

    await page.reload()
    await expect(page.getByLabel('Rental type')).toHaveValue('short')
    await expect(page.getByLabel('Stage', { exact: true })).toHaveValue('won')
    await expect(page.getByLabel('City')).toHaveValue('Porto')
    await expect(page.getByTestId('deal-total')).toHaveText(`${filteredTotal} deals`)
  })

  test('filters by value range and text', async ({ page }) => {
    await page.goto('deals')

    await page.getByLabel('Min value').fill('5000')
    await page.getByLabel('Min value').press('Enter')
    await expect(page).toHaveURL(/minValue=5000/)
    await expect.poll(async () => Math.min(...(await columnValues(page)))).toBeGreaterThanOrEqual(5000)

    await page.getByLabel('Max value').fill('10000')
    await page.getByLabel('Max value').press('Enter')
    await expect(page).toHaveURL(/maxValue=10000/)
    await expect.poll(async () => Math.max(...(await columnValues(page)))).toBeLessThanOrEqual(10000)

    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page.getByTestId('deal-total')).toHaveText(`${SEED_DEAL_COUNT} deals`)

    const firstClient = (await columnTexts(page, 'deal-client'))[0]!
    await page.getByLabel('Search').fill(firstClient)
    await expect(page).toHaveURL(/q=/)
    await expect.poll(async () => new Set(await columnTexts(page, 'deal-client'))).toEqual(new Set([firstClient]))
  })

  test('sorts with the mobile sort control', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'The sort select is shown on narrow screens only')
    await page.goto('deals')

    await page.getByLabel('Sort by', { exact: true }).selectOption('value:desc')
    await expect(page).toHaveURL(/sort=value/)
    await expect
      .poll(async () => {
        const values = await columnValues(page)
        return values.every((value, i) => i === 0 || values[i - 1]! >= value)
      })
      .toBe(true)

    await page.getByLabel('Sort by', { exact: true }).selectOption('stage:desc')
    await expect(page).toHaveURL(/sort=stage/)
    await expect(rows(page).first().getByTestId('deal-stage')).toHaveText('Lost')
  })

  test('sorts by value and stage in both directions', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Column headers are hidden on narrow screens')
    await page.goto('deals')

    await page.getByRole('button', { name: 'Sort by value' }).click()
    await expect(page).toHaveURL(/sort=value/)
    await expect
      .poll(async () => {
        const values = await columnValues(page)
        return values.every((value, i) => i === 0 || values[i - 1]! >= value)
      })
      .toBe(true)

    await page.getByRole('button', { name: 'Sort by value' }).click()
    await expect(page).toHaveURL(/order=asc/)
    await expect
      .poll(async () => {
        const values = await columnValues(page)
        return values.every((value, i) => i === 0 || values[i - 1]! <= value)
      })
      .toBe(true)

    await page.getByRole('button', { name: 'Sort by stage' }).click()
    await expect(page).toHaveURL(/sort=stage/)
    await expect(rows(page).first().getByTestId('deal-stage')).toHaveText('Lost')
  })

  test('pages through results and resets the page when a filter changes', async ({ page }) => {
    await page.goto('deals')
    const firstPageClients = await columnTexts(page, 'deal-client')

    await page.getByRole('link', { name: 'Next page' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByText(`Page 2 of ${SEED_DEAL_COUNT / PAGE_SIZE}`)).toBeVisible()
    await expect.poll(() => columnTexts(page, 'deal-client')).not.toEqual(firstPageClients)

    await page.getByLabel('Rental type').selectOption('long')
    await expect(page).not.toHaveURL(/page=/)
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible()
  })

  test('falls back to defaults for invalid URL values', async ({ page }) => {
    await page.goto('deals?stage=foo&page=0&minValue=-5&sort=nope')
    await expect(page.getByRole('heading', { level: 1, name: 'Deals' })).toBeVisible()
    await expect(page.getByTestId('deal-total')).toHaveText(`${SEED_DEAL_COUNT} deals`)
    await expect(page.getByLabel('Stage', { exact: true })).toHaveValue('')
    await expect(page.getByText(`Page 1 of ${SEED_DEAL_COUNT / PAGE_SIZE}`)).toBeVisible()
  })

  test('shows a loading indicator while a new page of results loads', async ({ page }) => {
    await page.goto('deals')
    await expect(page.getByTestId('deal-total')).toHaveText(`${SEED_DEAL_COUNT} deals`)

    await page.getByLabel('Rental type').selectOption('long')
    await expect(page.locator('[role="progressbar"][data-active="true"]')).toBeAttached()
    await expect(page.locator('[role="progressbar"][data-active="true"]')).not.toBeAttached()
  })

  test('shows an empty state when nothing matches', async ({ page }) => {
    await page.goto('deals?q=%22no%20such%20client%22')
    await expect(page.getByText('No deals match these filters')).toBeVisible()
    await expect(rows(page)).toHaveCount(0)
  })

  test('opens a deal from the list', async ({ page }) => {
    await page.goto('deals')
    const client = rows(page).first().getByTestId('deal-client')
    const name = await client.innerText()
    await client.getByRole('link').click()
    await expect(page).toHaveURL(/\/deals\/D-\d+$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(name)
  })
})
