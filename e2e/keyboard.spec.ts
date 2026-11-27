import { expect, test, type Page } from '@playwright/test'

test.skip(({ isMobile }) => isMobile, 'Keyboard checks run on the desktop project')

async function tabUntil(page: Page, isTarget: () => Promise<boolean>, maxSteps = 25): Promise<void> {
  for (let step = 0; step < maxSteps; step++) {
    await page.keyboard.press('Tab')
    if (await isTarget()) return
  }
  throw new Error(`Target not reached after ${maxSteps} Tab presses`)
}

test('search, filters and sorting work from the keyboard', async ({ page }) => {
  await page.goto('deals')
  const search = page.getByLabel('Search')
  await tabUntil(page, () => search.evaluate((el) => el === document.activeElement))

  const outline = await search.evaluate((el) => getComputedStyle(el).outlineStyle)
  expect(outline).not.toBe('none')

  await page.keyboard.type('Silva')
  await expect(page).toHaveURL(/q=Silva/)

  const sortByValue = page.getByRole('button', { name: 'Sort by value' })
  await tabUntil(page, () => sortByValue.evaluate((el) => el === document.activeElement))
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/sort=value/)
})

test('the leave dialog works from the keyboard', async ({ page }) => {
  await page.goto('deals/D-1001')
  await page.getByLabel('Client name').fill('Keyboard Edit')

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Dashboard' }).focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Leave without saving?' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Stay' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.getByLabel('Client name')).toHaveValue('Keyboard Edit')
})
