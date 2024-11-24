import { test, expect } from '@playwright/test'

test.describe('Input fields', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.getByText('Pet Types').click()
		await expect(page.getByRole('heading')).toHaveText('Pet Types')
	})

	test('Update pet type', async ({ page }) => {
		// Test data
		const originalPetType = 'cat'
		const newPetType = 'rabbit'

		// Locators - Pet Types table page
		const firstEditButton = page.getByRole('button', { name: 'Edit' }).first()
		const firstPetTypeInput = page.locator('[name="pettype_name"]').first()
		// Locators - Edit Pet Types page
		const petTypeInput = page.locator('#name')
		const petTypeUpdateButton = page.getByRole('button', { name: 'Update' })

		// Test steps
		await firstEditButton.click()
		await expect(page.getByRole('heading')).toHaveText('Edit Pet Type')

		await petTypeInput.click()
		await petTypeInput.fill(newPetType)
		await petTypeUpdateButton.click()
		await expect(firstPetTypeInput).toHaveValue(newPetType)

		await firstEditButton.click()
		await petTypeInput.click()
		await petTypeInput.fill(originalPetType)
		await petTypeUpdateButton.click()
		await expect(firstPetTypeInput).toHaveValue(originalPetType)
	})

	test('Cancel pet type update', async ({ page }) => {
		// Test data
		const originalPetType = 'dog'
		const newPetType = 'moose'

		// Locator - Edit Pet Type page
		const petTypeInput = page.locator('#name')

		// Test steps
		await page.getByRole('button', { name: 'Edit' }).nth(1).click()
		await petTypeInput.click()
		await petTypeInput.fill(newPetType)
		await expect(petTypeInput).toHaveValue(newPetType)

		await page.getByRole('button', { name: 'Cancel' }).click()
		await expect(page.locator('[name="pettype_name"]').nth(1)).toHaveValue(originalPetType)
	})

	test('Pet type name is required validation', async ({ page }) => {
		// Locator - Edit Pet Type page
		const petTypeInput = page.locator('#name')

		// Test steps
		await page.getByRole('button', { name: 'Edit' }).nth(2).click()
		await petTypeInput.click()
		await petTypeInput.clear()
		await expect(page.locator('.help-block')).toHaveText('Name is required')

		await page.getByRole('button', { name: 'Update' }).click()
		await expect(page.getByRole('heading')).toHaveText('Edit Pet Type')

		await page.getByRole('button', { name: 'Cancel' }).click()
		await expect(page.getByRole('heading')).toHaveText('Pet Types')
	})
})
