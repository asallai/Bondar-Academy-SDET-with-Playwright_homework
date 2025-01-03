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
		await expect(page.getByRole('row', { name: 'Madison' })).toHaveCount(4)
	})

	test('Validate search by Last Name', async ({ page }) => {
		const lastNames = ['Black', 'Davis', 'Es', 'Playwright']

		for (let lastName of lastNames) {
			await page.getByRole('textbox').fill(lastName)
			await page.getByRole('button', { name: 'Find Owner' }).click()

			if (lastName == 'Playwright') {
				await expect(page.locator('app-owner-list .container div').last()).toHaveText('No owners with LastName starting with "Playwright"')
			} else {
				for (let nameField of await page.getByRole('row').locator('td').first().all()) {
					await expect(nameField).toContainText(lastName)
				}
			}
		}
	})

	test('Validate phone number and pet name on the Owner Information page', async ({ page }) => {
		const ownerPhoneNumber = '6085552765'

		const ownerRow = page.getByRole('row', { name: ownerPhoneNumber })
		const petNameField = await ownerRow.locator('td').last().textContent()

		await ownerRow.getByRole('link').click()
		await expect(page.locator('tr', { hasText: 'Telephone' }).locator('td')).toHaveText(ownerPhoneNumber)
		await expect(page.locator('tr', { hasText: 'Name' }).locator('dd').first()).toHaveText(petNameField!)
	})

	test('Validate pets of the Madison city', async ({ page }) => {
		const expectedPetNames = ['Leo', 'George', 'Mulligan', 'Freddy']
		const madisonCityRows = page.getByRole('row', { name: 'Madison' })

		let actualPetNames: string[] = []
		for (let madisonCityRow of await madisonCityRows.all()) {
			let petName = await madisonCityRow.locator('tr').last().textContent()
			actualPetNames.push(petName!.trim())
		}
		expect(actualPetNames).toEqual(expectedPetNames)
	})
})

test('Validate specialty update', async ({ page }) => {
	const specialtyInputField = page.getByRole('textbox')

	const specialties = [
		{ specialty: 'surgery', newSpecialty: 'dermatology' },
		{ specialty: 'dermatology', newSpecialty: 'surgery' },
	]

	for (let { specialty, newSpecialty } of specialties) {
		await page.getByRole('button', { name: 'Veterinarians' }).click()
		await page.getByRole('link', { name: 'All' }).click()
		await expect(page.getByRole('row', { name: 'Rafael Ortega' }).locator('td').nth(1)).toHaveText(specialty)

		await page.getByRole('link', { name: 'Specialties' }).click()
		await expect(page.getByRole('heading')).toHaveText('Specialties')

		await page.getByRole('row', { name: specialty }).getByRole('button', { name: 'Edit' }).click()
		await expect(page.getByRole('heading')).toHaveText('Edit Specialty')

		await specialtyInputField.click()
		await specialtyInputField.fill(newSpecialty)
		await page.getByRole('button', { name: 'Update' }).click()
		await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()
		await expect(specialtyInputField.nth(1)).toHaveValue(newSpecialty)
	}
})

test('Validate specialty lists', async ({ page }) => {
	const testVetRow = page.getByRole('row', { name: 'Sharon Jenkins' })
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
	await testVetRow.getByRole('button', { name: 'Edit' }).click()

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
	await expect(testVetRow.locator('td').nth(1)).toHaveText('oncology')

	await specialtiesMenuItem.click()
	await page.getByRole('row', { name: 'oncology' }).getByRole('button', { name: 'Delete' }).click()

	await vetsMenuItem.click()
	await allVetsDropdownItem.click()
	await expect(testVetRow.locator('td').nth(1)).toHaveText('')
})
