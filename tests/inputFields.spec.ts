import { test, expect } from '@playwright/test'

test.describe('Input fields', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.getByText('Pet Types').click()
		await expect(page.getByRole('heading', { name: 'Pet Types' })).toBeVisible()
	})

	test('Update pet type', async ({ page }) => {
		// Test data
		const originalPetType = 'cat'
		const newPetType = 'rabbit'

		// Locators - Pet Types table page
		const firstEditButton = page.getByRole('button', { name: 'Edit' }).first()
		const firstPetTypeInput = page.locator('[name="pettype_name"]').first()
		// Locators - Edit Pet Types page
		const editPetTypeHeader = page.getByRole('heading', { name: 'Edit Pet Type' })
		const petTypeInput = page.locator('#name')
		const petTypeUpdateButton = page.getByRole('button', { name: 'Update' })

		// Test steps
		await firstEditButton.click()
		await expect(editPetTypeHeader).toBeVisible()

		await petTypeInput.click()
		await petTypeInput.fill(newPetType)
		await petTypeUpdateButton.click()
		let inputValue = await firstPetTypeInput.inputValue()
		expect(inputValue).toBe(newPetType)

		await firstEditButton.click()
		await petTypeInput.click()
		await petTypeInput.fill(originalPetType)
		await petTypeUpdateButton.click()
		inputValue = await firstPetTypeInput.inputValue()
		expect(inputValue).toBe(originalPetType)
	})

	test('Cancel pet type update', async ({ page }) => {
		// Test data
		const originalPetType = 'dog'
		const newPetType = 'moose'

		// Locators - Pet Types table page
		const secondEditButton = page.getByRole('button', { name: 'Edit' }).nth(1)
		const secondPetTypeInput = page.locator('[name="pettype_name"]').nth(1)
		// Locators - Edit Pet Type page
		const petTypeInput = page.locator('#name')
		const petTypeCancelButton = page.getByRole('button', { name: 'Cancel' })

		// Test steps
		await secondEditButton.click()
		await petTypeInput.click()
		await petTypeInput.fill(newPetType)
		let inputValue = await petTypeInput.inputValue()
		expect(inputValue).toBe(newPetType)

		await petTypeCancelButton.click()
		inputValue = await secondPetTypeInput.inputValue()
		expect(inputValue).toBe(originalPetType)
	})

	test('Pet type name is required validation', async ({ page }) => {
		// Locators - Pet Types table page
		const tableHeader = page.getByRole('heading', { name: 'Pet Types' })
		const thirdEditButton = page.getByRole('button', { name: 'Edit' }).nth(2)
		// Locators - Edit Pet Type page
		const editPetTypeHeader = page.getByRole('heading', { name: 'Edit Pet Type' })
		const petTypeInput = page.locator('#name')
		const petTypeUpdateButton = page.getByRole('button', { name: 'Update' })
		const petTypeCancelButton = page.getByRole('button', { name: 'Cancel' })
		const blockMessage = page.locator('.help-block')

		// Test steps
		await thirdEditButton.click()
		await petTypeInput.click()
		await petTypeInput.clear()
		await expect(blockMessage).toHaveText('Name is required')

		await petTypeUpdateButton.click()
		await expect(editPetTypeHeader).toBeVisible()

		await petTypeCancelButton.click()
		await expect(tableHeader).toBeVisible()
	})
})
