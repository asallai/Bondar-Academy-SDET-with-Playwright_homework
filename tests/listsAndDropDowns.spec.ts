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

		await page.getByText(ownerFullName).click()
		await expect(page.locator('.ownerFullName')).toHaveText(ownerFullName)

		await page.getByText('Edit pet').click()
		await expect(page.getByRole('heading')).toHaveText('Pet')
		await expect(page.locator('#owner_name')).toHaveValue(ownerFullName)
		await expect(page.locator('#type1')).toHaveValue('cat')

		const petTypeDropdown = page.locator('select')
		const petTypeItems = petTypeDropdown.locator('option')

		for (const petTypeItem of await petTypeItems.all()) {
			const petTypeItemValue = await petTypeItem.getAttribute('value')
			await petTypeDropdown.selectOption({ value: petTypeItemValue! })

			const petTypeValue = await page.locator('#type1').inputValue()
			expect(petTypeItemValue).toEqual(petTypeValue)
		}
	})

	test('Validate the pet type update', async ({ page }) => {
		const petTypes = [
			{ originalPetType: 'dog', updatedPetType: 'bird' },
			{ originalPetType: 'bird', updatedPetType: 'dog' },
		]

		const petTypeField = page.locator('#type1')
		const petTypeDropdown = page.locator('select')
		const updatePetTypeButton = page.getByRole('button', { name: 'Update Pet' })
		const headingLabel2 = page.getByRole('heading').nth(1)
		const petTypeNameField2 = page.locator('app-pet-list dl').nth(1)
		const editPetTypeButton2 = page.getByRole('button', { name: 'Edit Pet' }).nth(1)

		await page.getByText('Eduardo Rodriquez').click()

		for (const { originalPetType, updatedPetType } of petTypes) {
			//4. In the "Pets and Visits" section, click on "Edit Pet" button for the pet with a name "Rosy"
			await expect(headingLabel2).toHaveText('Pets and Visits')
			await editPetTypeButton2.click()
			// 5. Add the assertion that name "Rosy" is displayed in the input field "Name"
			await expect(page.locator('#name')).toHaveValue('Rosy')
			// 6. Add the assertion the value "dog" is displayed in the "Type" field
			await expect(petTypeField).toHaveValue(originalPetType)
			// 7. From the drop-down menu, select the value "bird"
			await petTypeDropdown.selectOption(updatedPetType)
			// 8. On the "Pet details" page, add the assertion the value "bird" is displayed in the "Type" field as well as drop-down input field
			await expect(page.getByRole('heading')).toHaveText('Pet')
			await expect(petTypeField).toHaveValue(updatedPetType)
			expect(await petTypeDropdown.inputValue()).toEqual(updatedPetType)
			// 9. Select "Update Pet" button
			await updatePetTypeButton.click()
			// 10. On the "Pets and Visits" page, add the assertion that pet "Rosy" has a new value of the Type "bird"
			await expect(headingLabel2).toHaveText('Pets and Visits')
			await expect(petTypeNameField2).toContainText(updatedPetType)
		}
	})
})
