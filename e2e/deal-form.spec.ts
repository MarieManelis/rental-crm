import { expect, test, type Page } from '@playwright/test'

async function openFirstDeal(page: Page, type: 'long' | 'short'): Promise<string> {
  await page.goto(`deals?type=${type}`)
  const link = page.getByRole('table', { name: 'Deals' }).locator('tbody tr').first().getByTestId('deal-client').getByRole('link')
  await link.click()
  await expect(page).toHaveURL(/\/deals\/D-\d+$/)
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible()
  return new URL(page.url()).pathname.split('/').pop()!
}

test.describe('deal page', () => {
  test('opens by direct URL', async ({ page }) => {
    await page.goto('deals/D-1001')
    await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty()
    await expect(page.getByLabel('Client name')).not.toHaveValue('')
  })

  test('saves an edit and the list shows it without a reload', async ({ page }) => {
    await openFirstDeal(page, 'long')
    const newName = 'Renata Testova'

    await page.getByLabel('Client name').fill(newName)
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByRole('status')).toHaveText('Changes saved')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(newName)
    await expect(page.getByRole('button', { name: 'Save changes' })).toBeDisabled()

    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Deals' }).click()
    await page.getByLabel('Search').fill(newName)
    await expect(page.getByRole('table', { name: 'Deals' }).getByTestId('deal-client')).toHaveText([newName])
  })

  test('shows fields for the selected rental type', async ({ page }) => {
    await openFirstDeal(page, 'long')
    await expect(page.getByLabel('Monthly rent')).toBeVisible()
    await expect(page.getByLabel('Check-in')).toHaveCount(0)

    await page.getByLabel('Short-term').check()
    await expect(page.getByLabel('Monthly rent')).toHaveCount(0)
    await expect(page.getByLabel('Nightly rate')).toBeVisible()
    await expect(page.getByLabel('Check-in')).toBeVisible()
    await expect(page.getByLabel('Check-out')).toBeVisible()
  })

  test('validates required fields and the stay dates', async ({ page }) => {
    await openFirstDeal(page, 'short')

    await page.getByLabel('Client name').fill('')
    await page.getByLabel('Check-out').fill('2026-01-10')
    await page.getByLabel('Check-in').fill('2026-01-12')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByText('Enter the client name')).toBeVisible()
    await expect(page.getByText('Check-out must be after check-in')).toBeVisible()
    await expect(page.getByLabel('Check-out')).toHaveAttribute('aria-invalid', 'true')
  })

  test('asks before leaving with unsaved changes', async ({ page }) => {
    await openFirstDeal(page, 'long')
    await page.getByLabel('Client name').fill('Unsaved Name')

    const nav = page.getByRole('navigation', { name: 'Main' })
    await nav.getByRole('link', { name: 'Dashboard' }).click()
    const dialog = page.getByRole('dialog', { name: 'Leave without saving?' })
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: 'Stay' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByLabel('Client name')).toHaveValue('Unsaved Name')

    await nav.getByRole('link', { name: 'Dashboard' }).click()
    await page.getByRole('dialog', { name: 'Leave without saving?' }).getByRole('button', { name: 'Leave' }).click()
    await expect(page).toHaveURL(/\/rental-crm\/$/)
  })

  test('keeps the edits and shows an error when saving fails', async ({ page }) => {
    await openFirstDeal(page, 'long')
    await page.getByLabel('Client name').fill('Will Not Save')

    await page.evaluate(() => window.history.replaceState(window.history.state, '', `${window.location.pathname}?demo-fail`))
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByRole('alert').filter({ hasText: 'Could not save the deal' })).toBeVisible()
    await expect(page.getByLabel('Client name')).toHaveValue('Will Not Save')
    await expect(page.getByRole('button', { name: 'Save changes' })).toBeEnabled()
  })

  test('does not ask after the changes are saved', async ({ page }) => {
    await openFirstDeal(page, 'short')
    await page.getByLabel('Guests').fill('3')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByRole('status')).toHaveText('Changes saved')

    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL(/\/rental-crm\/$/)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
