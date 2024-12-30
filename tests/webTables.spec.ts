import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
	await page.goto('/')
})

test.describe('Web Tables - Owners', async () => {
	test.beforeEach(async ({ page }) => {
		await page.getByText('Owners').click()
		await page.getByText('Search').click()
		await expect(page.getByText('Add owner')).toBeVisible()
	})

	test('Validate the pet name and city of the owner', async ({ page }) => {
		const targetRow = page.getByRole('row', { name: 'Jeff Black' })
		await expect(targetRow.locator('td').nth(2)).toHaveText('Monona')
		await expect(targetRow.locator('td').last()).toHaveText('Lucky')
	})

	test('Validate owners count of the Madison city', async ({ page }) => {
		const city = 'Madison'
		const targetCities = page.getByRole('row', { name: city }).filter({ has: page.locator('td').nth(2).getByText(city) })
		await expect(targetCities).toHaveCount(4)
	})

	test('Validate search by Last Name', async ({ page }) => {
		const lastNameInputField = page.getByRole('textbox')
		const findOwnerButton = page.getByRole('button', { name: 'Find Owner' })
		const lastNameTableFields = page.locator('table tr td a')

		await lastNameInputField.fill('Black')
		await findOwnerButton.click()
		await expect(page.getByRole('row').locator('td').first()).toContainText(' Black')

		await lastNameInputField.fill('Davis')
		await findOwnerButton.click()
		await page.waitForLoadState('networkidle')

		for (let lastNameField of await lastNameTableFields.all()) {
			let lastNameValue = await lastNameField.textContent()
			expect(lastNameValue).toContain(' Davis')
		}

		await lastNameInputField.fill('Es')
		await findOwnerButton.click()
		await page.waitForLoadState('networkidle')

		for (let lastNameField of await lastNameTableFields.all()) {
			await expect(lastNameField).toContainText(' Es')
		}

		await lastNameInputField.fill('Playwright')
		await findOwnerButton.click()
		await page.waitForLoadState('networkidle')
		await expect(page.locator('app-owner-list .container div').last()).toHaveText('No owners with LastName starting with "Playwright"')
	})

	test('Validate phone number and pet name on the Owner Information page', async ({ page }) => {
		const phoneNumber = '6085552765'
		const targetRow = page.getByRole('row', { name: phoneNumber })
		const table = page.getByRole('table')

		const petName = await targetRow.locator('td').last().textContent()
		await targetRow.getByRole('link').click()
		await expect(table.first().locator('tr').last().locator('td')).toHaveText(phoneNumber)
		await expect(table.nth(1).locator('dd').first()).toHaveText(petName)
	})

	test('Validate pets of the Madison city', async ({ page }) => {
		const expectedPets = ['Leo', 'George', 'Mulligan', 'Freddy']
		const targetRows = page.getByRole('row', { name: 'Madison' })

		let actualPets = []
		for (let row of await targetRows.all()) {
			let petName = await row.locator('tr').last().textContent()
			actualPets.push(petName.trim())
		}
		expect(actualPets).toEqual(expectedPets)
	})
})

test('Validate specialty update', async ({ page }) => {
	const originalSpecialty = 'surgery'
	const updatedSpecialty = 'dermatology'

	await page.getByText('Veterinarians').click()
	await page.getByText('All').click()

	const targetSpecialtyField = page.getByRole('row', { name: 'Rafael Ortega' }).locator('td').nth(1)
	await expect(targetSpecialtyField).toHaveText(originalSpecialty)

	await page.getByRole('link', { name: 'Specialties' }).click()
	await expect(page.getByRole('heading')).toHaveText('Specialties')

	await page.getByRole('row', { name: originalSpecialty }).getByRole('button', { name: 'Edit' }).click()
	await expect(page.getByRole('heading')).toHaveText('Edit Specialty')

	await page.getByRole('textbox').click()
	await page.getByRole('textbox').fill(updatedSpecialty)
	await page.getByRole('button', { name: 'Update' }).click()
	await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()
	await expect(page.getByRole('textbox').nth(1)).toHaveValue(updatedSpecialty)

	await page.getByText('Veterinarians').click()
	await page.getByText('All').click()
	await expect(targetSpecialtyField).toHaveText(updatedSpecialty)

	await page.getByRole('link', { name: 'Specialties' }).click()
	await expect(page.getByRole('heading')).toHaveText('Specialties')

	await page.getByRole('row', { name: updatedSpecialty }).getByRole('button', { name: 'Edit' }).click()
	await expect(page.getByRole('heading')).toHaveText('Edit Specialty')

	await page.getByRole('textbox').click()
	await page.getByRole('textbox').fill(originalSpecialty)
	await page.getByRole('button', { name: 'Update' }).click()
	await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()
	await expect(page.getByRole('textbox').nth(1)).toHaveValue(originalSpecialty)
})

// Test Case 7: Validate specialty lists
// 1. Select the SPECIALTIES menu item in the navigation bar
// 2. On the Specialties page, select "Add" button. Type the new specialty "oncology" and click "Save" button
// 3. Extract all values of specialties and put them into the array.
// Hint: For step 3, create an empty array, then loop through the list of the table rows, getting the value for each row and adding to the array
// 4. Select the VETERINARIANS menu item in the navigation bar, then select "All"
// 5. On the Veterinarians page, locate the "Sharon Jenkins" in the list and click "Edit" button
// 6. Click on the Specialties drop-down menu. Extract all values from the drop-down menu to an array
// 7. Add the assertion that array of specialties collected in the step 3 is equal the the array from drop-down menu
// 8. Select the "oncology" specialty and click "Save vet" button
// 9. On the Veterinarians page, add assertion, that "Sharon Jenkins" has specialty "oncology"
// 10. Navigate to SPECIALTIES page. Click "Delete" for "oncology" specialty
// 11. Navigate to VETERINARIANS page. Add assertion that "Sharon Jenkins" has no specialty assigned
