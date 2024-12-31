import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
	await page.goto('/')
})

test.describe('Web Tables - Owners', async () => {
	test.beforeEach(async ({ page }) => {
		await page.getByText('Owners').click()
		await page.getByText('Search').click()
		await expect(page.getByRole('button', { name: 'Add owner' })).toBeVisible()
	})

	test('Validate the pet name and city of the owner', async ({ page }) => {
		const ownerRow = page.getByRole('row', { name: 'Jeff Black' })
		await expect(ownerRow.locator('td').nth(2)).toHaveText('Monona')
		await expect(ownerRow.locator('td').last()).toHaveText('Lucky')
	})

	test('Validate owners count of the Madison city', async ({ page }) => {
		const targetCity = 'Madison'
		await expect(
			page.getByRole('row', { name: targetCity }).filter({ has: page.locator('td').nth(2).getByText(targetCity) })
		).toHaveCount(4)
	})

	test('Validate search by Last Name', async ({ page }) => {
		const lastNameInputField = page.getByRole('textbox')
		const fullNameTableFields = page.locator('table tr td a')
		const findOwnerButton = page.getByRole('button', { name: 'Find Owner' })

		await lastNameInputField.fill('Black')
		await findOwnerButton.click()
		await expect(page.getByRole('row').locator('td').first()).toContainText(' Black')

		await lastNameInputField.fill('Davis')
		await findOwnerButton.click()

		for (let fullNameField of await fullNameTableFields.all()) {
			await expect(fullNameField).toContainText(' Davis')
		}

		await lastNameInputField.fill('Es')
		await findOwnerButton.click()

		for (let fullNameField of await fullNameTableFields.all()) {
			await expect(fullNameField).toContainText(' Es')
		}

		await lastNameInputField.fill('Playwright')
		await findOwnerButton.click()
		await expect(page.locator('app-owner-list .container div').last()).toHaveText('No owners with LastName starting with "Playwright"')
	})

	test('Validate phone number and pet name on the Owner Information page', async ({ page }) => {
		const ownerPhoneNumber = '6085552765'
		const ownerRow = page.getByRole('row', { name: ownerPhoneNumber })
		const table = page.getByRole('table')

		const petName = await ownerRow.locator('td').last().textContent()
		await ownerRow.getByRole('link').click()
		await expect(table.first().locator('tr').last().locator('td')).toHaveText(ownerPhoneNumber)
		await expect(table.nth(1).locator('dd').first()).toHaveText(petName!)
	})

	test('Validate pets of the Madison city', async ({ page }) => {
		const expectedPetNames = ['Leo', 'George', 'Mulligan', 'Freddy']
		const targetRows = page.getByRole('row', { name: 'Madison' })

		let actualPetNames: string[] = []
		for (let targetRow of await targetRows.all()) {
			let petName = await targetRow.locator('tr').last().textContent()
			actualPetNames.push(petName!.trim())
		}
		expect(actualPetNames).toEqual(expectedPetNames)
	})
})

test('Validate specialty update', async ({ page }) => {
	const originalSpecialty = 'surgery'
	const updatedSpecialty = 'dermatology'

	const targetSpecialtyField = page.getByRole('row', { name: 'Rafael Ortega' }).locator('td').nth(1)
	const heading = page.getByRole('heading')
	const specialtiesMenuItem = page.getByRole('link', { name: 'Specialties' })
	const vetsMenuItem = page.getByRole('button', { name: 'Veterinarians' })
	const allVetsDropdownItem = page.getByRole('link', { name: 'All' })

	const specialtyInputField = page.getByRole('textbox')
	const addSpecialtyButton = page.getByRole('button', { name: 'Add' })
	const updateSpecialtyButton = page.getByRole('button', { name: 'Update' })

	await vetsMenuItem.click()
	await allVetsDropdownItem.click()
	await expect(targetSpecialtyField).toHaveText(originalSpecialty)

	await specialtiesMenuItem.click()
	await expect(heading).toHaveText('Specialties')

	await page.getByRole('row', { name: originalSpecialty }).getByRole('button', { name: 'Edit' }).click()
	await expect(heading).toHaveText('Edit Specialty')

	await specialtyInputField.click()
	await specialtyInputField.fill(updatedSpecialty)
	await updateSpecialtyButton.click()
	await expect(addSpecialtyButton).toBeVisible()
	await expect(specialtyInputField.nth(1)).toHaveValue(updatedSpecialty)

	await vetsMenuItem.click()
	await allVetsDropdownItem.click()
	await expect(targetSpecialtyField).toHaveText(updatedSpecialty)

	await specialtiesMenuItem.click()
	await expect(heading).toHaveText('Specialties')

	await page.getByRole('row', { name: updatedSpecialty }).getByRole('button', { name: 'Edit' }).click()
	await expect(heading).toHaveText('Edit Specialty')

	await specialtyInputField.click()
	await specialtyInputField.fill(originalSpecialty)
	await updateSpecialtyButton.click()
	await expect(addSpecialtyButton).toBeVisible()
	await expect(specialtyInputField.nth(1)).toHaveValue(originalSpecialty)
})

test('Validate specialty lists', async ({ page }) => {
	const targetRow = page.getByRole('row', { name: 'Sharon Jenkins' })
	const specialtiesMenuItem = page.getByRole('link', { name: 'Specialties' })
	const vetsMenuItem = page.getByRole('button', { name: 'Veterinarians' })
	const allVetsDropdownItem = page.getByRole('link', { name: 'All' })

	await specialtiesMenuItem.click()
	await page.getByRole('button', { name: 'Add' }).click()
	await page.locator('#name').fill('oncology')
	await page.getByRole('button', { name: 'Save' }).click()
	await expect(page.getByRole('heading', { name: 'New Specialty' })).not.toBeVisible()

	let specialtyTexts: string[] = []
	const specialtyFields = page.locator('tr input')

	for (let specialtyField of await specialtyFields.all()) {
		let specialty = await specialtyField.inputValue()
		specialtyTexts.push(specialty)
	}

	await vetsMenuItem.click()
	await allVetsDropdownItem.click()
	await targetRow.getByRole('button', { name: 'Edit' }).click()

	await page.locator('.dropdown-arrow').click()

	let specialtyDropdownItems: string[] = []
	const specialtyDropdownElements = page.locator('.dropdown-content label')

	for (let specialtyDropdownElement of await specialtyDropdownElements.all()) {
		let specialtyText = await specialtyDropdownElement.textContent()
		specialtyDropdownItems.push(specialtyText!)
	}
	expect(specialtyTexts).toEqual(specialtyDropdownItems)

	await page.getByRole('checkbox', { name: 'oncology ' }).check()
	await page.locator('.dropdown').last().click()
	await page.getByRole('button', { name: 'Save Vet ' }).click()
	await expect(targetRow.locator('td').nth(1)).toHaveText('oncology')

	await specialtiesMenuItem.click()
	await page.getByRole('row', { name: 'oncology' }).getByRole('button', { name: 'Delete' }).click()

	await vetsMenuItem.click()
	await allVetsDropdownItem.click()
	await expect(targetRow.locator('td').nth(1)).toHaveText('')
})
