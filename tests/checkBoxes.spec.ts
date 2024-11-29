import { test, expect } from '@playwright/test'

test.describe('Checkboxes', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.getByText('Veterinarians').click()
		await page.getByText('All').click()
		await expect(page.getByRole('heading')).toHaveText('Veterinarians')
	})

	test('Validate selected specialties', async ({ page }) => {
		const selectedSpecialtyDd = page.locator('.selected-specialties')
		const radiologyCb = page.locator('#radiology')
		const surgeryCb = page.locator('#surgery')
		const dentistryCb = page.locator('#dentistry')

		await page.getByRole('button', { name: 'Edit vet' }).nth(1).click()
		await expect(selectedSpecialtyDd).toHaveText('radiology')

		await selectedSpecialtyDd.click()
		expect(await radiologyCb.isChecked()).toBeTruthy()
		expect(await surgeryCb.isChecked()).toBeFalsy()
		expect(await dentistryCb.isChecked()).toBeFalsy()

		await surgeryCb.check()
		await radiologyCb.uncheck()
		await expect(selectedSpecialtyDd).toHaveText('surgery')

		await dentistryCb.check()
		await expect(selectedSpecialtyDd).toHaveText('surgery, dentistry')
	})

	test('Select all specialties', async ({ page }) => {
		const selectedSpecialtyDd = page.locator('.selected-specialties')

		await page.getByRole('button', { name: 'Edit vet' }).nth(3).click()
		await expect(selectedSpecialtyDd).toHaveText('surgery')

		await selectedSpecialtyDd.click()
		const allCheckbox = page.locator('.dropdown-content label')
		for (const checkbox of await allCheckbox.all()) {
			await checkbox.check()
			expect(await checkbox.isChecked()).toBeTruthy()
		}
		await expect(page.locator('.dropdown-content label')).toHaveText(['radiology', 'surgery', 'dentistry'])
	})

	test('Unselect all specialties', async ({ page }) => {
		const selectedSpecialtyDd = page.locator('.selected-specialties')

		await page.getByRole('button', { name: 'Edit vet' }).nth(2).click()
		await expect(selectedSpecialtyDd).toHaveText('dentistry, surgery')

		await selectedSpecialtyDd.click()
		const allCheckbox = page.locator('.dropdown-content label')
		for (const checkbox of await allCheckbox.all()) {
			await checkbox.uncheck()
			expect(await checkbox.isChecked()).toBeFalsy()
		}
		await expect(selectedSpecialtyDd).toBeEmpty()
	})
})
