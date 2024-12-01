import { test, expect } from '@playwright/test'

test.describe('Checkboxes', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.getByText('Veterinarians').click()
		await page.getByText('All').click()
		await expect(page.getByRole('heading')).toHaveText('Veterinarians')
	})

	test('Validate selected specialties', async ({ page }) => {
		const selectedSpecialtyDropdown = page.locator('.selected-specialties')
		const radiologyCheckbox = page.getByRole('checkbox', { name: 'radiology' })
		const surgeryCheckbox = page.getByRole('checkbox', { name: 'surgery' })
		const dentistryCheckbox = page.getByRole('checkbox', { name: 'dentistry' })

		await page.getByRole('button', { name: 'Edit vet' }).nth(1).click()
		await expect(selectedSpecialtyDropdown).toHaveText('radiology')

		await selectedSpecialtyDropdown.click()
		expect(await radiologyCheckbox.isChecked()).toBeTruthy()
		expect(await surgeryCheckbox.isChecked()).toBeFalsy()
		expect(await dentistryCheckbox.isChecked()).toBeFalsy()

		await surgeryCheckbox.check()
		await radiologyCheckbox.uncheck()
		await expect(selectedSpecialtyDropdown).toHaveText('surgery')

		await dentistryCheckbox.check()
		await expect(selectedSpecialtyDropdown).toHaveText('surgery, dentistry')
	})

	test('Select all specialties', async ({ page }) => {
		const selectedSpecialtyDropdown = page.locator('.selected-specialties')
		const specialtiesDropdown = page.locator('.dropdown-content label')

		await page.getByRole('button', { name: 'Edit vet' }).nth(3).click()
		await expect(selectedSpecialtyDropdown).toHaveText('surgery')

		await selectedSpecialtyDropdown.click()	
		for (const specialtyItem of await specialtiesDropdown.all()) {
			await specialtyItem.check()
			expect(await specialtyItem.isChecked()).toBeTruthy()
		}
		await expect(specialtiesDropdown).toHaveText(['radiology', 'surgery', 'dentistry'])
	})

	test('Unselect all specialties', async ({ page }) => {
		const selectedSpecialtyDropdown = page.locator('.selected-specialties')
		const specialtiesDropdown = page.locator('.dropdown-content label')

		await page.getByRole('button', { name: 'Edit vet' }).nth(2).click()
		await expect(selectedSpecialtyDropdown).toHaveText('dentistry, surgery')

		await selectedSpecialtyDropdown.click()		
		for (const specialtyItem of await specialtiesDropdown.all()) {
			await specialtyItem.uncheck()
			expect(await specialtyItem.isChecked()).toBeFalsy()
		}
		await expect(selectedSpecialtyDropdown).toBeEmpty()
	})
})
