import { test, expect } from '@playwright/test'

test.describe('Lists and Dropdowns', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.getByText('Owners').click()
		await page.getByText('Search').click()
		await expect(page.getByRole('heading')).toHaveText('Owners')
	})

	test('Validate selected pet types from the list', async ({ page }) => {
		const ownerFullName = 'George Franklin'
		const petTypeField = page.locator('#type1')

		await page.getByRole('link', { name: ownerFullName }).click()
		await expect(page.locator('.ownerFullName')).toHaveText(ownerFullName)

		await page.locator('app-pet-list', { hasText: 'Leo '}).getByRole('button', { name: 'Edit Pet' }).click()
		await expect(page.getByRole('heading')).toHaveText('Pet')
		await expect(page.locator('#owner_name')).toHaveValue(ownerFullName)
		await expect(petTypeField).toHaveValue('cat')

		const petTypeDropdown = page.getByLabel('Type')
		const petTypeItemValues = await petTypeDropdown.locator('option').allTextContents()

		for (const petTypeItemValue of petTypeItemValues) {
			await petTypeDropdown.selectOption(petTypeItemValue)
			await expect(petTypeField).toHaveValue(petTypeItemValue)
		}
	})

	test('Validate the pet type update', async ({ page }) => {
		const petTypes = [
			{ petType1: 'dog', petType2: 'bird' },
			{ petType1: 'bird', petType2: 'dog' },
		]

		const petTypeField = page.locator('#type1')
		const petTypeDropdown = page.getByLabel('Type')
		const petRosySection = page.locator('app-pet-list', { hasText: 'Rosy' })

		await page.getByRole('link', { name: 'Eduardo Rodriquez' }).click()

		for (const { petType1, petType2 } of petTypes) {
			await petRosySection.getByRole('button', { name: 'Edit Pet' }).click()
			await expect(page.getByLabel('Name')).toHaveValue('Rosy')
			await expect(petTypeField).toHaveValue(petType1)

			await petTypeDropdown.selectOption(petType2)
			await expect(page.getByRole('heading')).toHaveText('Pet')
			await expect(petTypeField).toHaveValue(petType2)
			await expect(petTypeDropdown).toHaveValue(petType2)

			await page.getByRole('button', { name: 'Update Pet' }).click()
			await expect(page.getByRole('heading').nth(1)).toHaveText('Pets and Visits')
			await expect(petRosySection.locator('dd').nth(2)).toHaveText(petType2)
		}
	})
})
