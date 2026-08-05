import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
}

test('visitor can move from the landing page into account creation', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Limes/i)
  await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()

  await page.getByRole('link', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/signin/)
  await page.getByRole('link', { name: /sign up now/i }).click()
  await expect(page).toHaveURL(/\/signup|\/register/)
  await expect(page.getByRole('heading', { name: /slice of limes/i })).toBeVisible()
  await expectAccessible(page)
})

test('signup validates required account fields before making a request', async ({ page }) => {
  await page.goto('/signup')
  await page.getByRole('button', { name: /join limes/i }).click()

  await expect(page.getByText('Enter a valid email address')).toBeVisible()
  await expect(page.getByText('Minimum 8 characters')).toBeVisible()
  await expect(page.getByLabel('Email address')).toBeVisible()
  await expect(page.getByRole('checkbox')).not.toBeChecked()
  await expectAccessible(page)
})
