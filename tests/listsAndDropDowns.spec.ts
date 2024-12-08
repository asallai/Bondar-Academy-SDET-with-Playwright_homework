import { test, expect } from '@playwright/test'

test.describe('Lists and Dropdowns', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.getByText('Owners').click()
		await page.getByText('Search').click()
		await expect(page.getByRole('heading')).toHaveText('Owners')
	})

	// test('Validate selected pet types from the list', async ({ page }) => {
	// 	const ownerFullName = 'George Franklin'
	// 	await page.getByText(ownerFullName).click()
	// 	await expect(page.locator('.ownerFullName')).toHaveText(ownerFullName)

	// 	await page.getByText('Edit pet').click()
	// 	await expect(page.getByRole('heading')).toHaveText('Pet')
	// 	await expect(page.locator('#owner_name')).toHaveValue(ownerFullName)
	// 	await expect(page.locator('#type1')).toHaveValue('cat')

	// 	const petTypeDropdown = page.locator('select')
	// 	const petTypeItems = petTypeDropdown.locator('option')

	// 	for (const petTypeItem of await petTypeItems.all()) {
	// 		const petTypeItemValue = await petTypeItem.getAttribute('value')
	// 		await petTypeDropdown.selectOption({ value: petTypeItemValue! })

	// 		const petTypeValue = await page.locator('#type1').inputValue()
	// 		expect(petTypeItemValue).toEqual(petTypeValue)
	// 	}
	// })

	test('Validate the pet type update', async ({ page }) => {
		// test data
		const originalPetType = 'dog'
		const updatedPetType = 'bird'		
		// locators
		const petTypeField = page.locator('#type1')
		const petTypeDropdown = page.locator('select')
		const updatePetTypeButton = page.getByText('Update Pet')
		const secondHeadingLabel = page.getByRole('heading').nth(1)
		const secondEditPetTypeButton = page.getByText('Edit Pet').nth(1)
		
		// Owners page
		await page.getByText('Eduardo Rodriquez').click()

		// Pets and Visits page
		await expect(secondHeadingLabel).toHaveText('Pets and Visits')
		// 4. In the "Pets and Visits" section, click on "Edit Pet" button for the pet with a name "Rosy"
		await secondEditPetTypeButton.click()

		// Pet page
		await expect(page.getByRole('heading')).toHaveText('Pet')
		// 5. Add the assertion that name "Rosy" is displayed in the input field "Name"
		await expect(page.locator('#name')).toHaveValue('Rosy')
		// 6. Add the assertion the value "dog" is displayed in the "Type" field		
		await expect(petTypeField).toHaveValue(originalPetType)
		// 7. From the drop-down menu, select the value "bird"	
		await petTypeDropdown.selectOption(updatedPetType)
		// 8. On the "Pet detils" page, add the assertion the value "bird" is displayed in the "Type" field as well as drop-down input field
		await expect(petTypeField).toHaveValue(updatedPetType)	
		expect(await petTypeDropdown.inputValue()).toEqual(updatedPetType)
		// 9. Select "Update Pet" button
		await updatePetTypeButton.click()

		// Pets and visits page
		await expect(secondHeadingLabel).toHaveText('Pets and Visits')
		// 10. On the "Owner Information" page, add the assertion that pet "Rosy" has a new value of the Type "bird"
		await expect(page.locator('app-pet-list dl').nth(1)).toContainText(updatedPetType)
		// 11. Select "Edit Pet" button one more time, and perform steps 6-10 to revert the selection of the pet type "bird" to its initial value "dog"
		await secondEditPetTypeButton.click()
	
		// Pet page
		await expect(page.getByRole('heading')).toHaveText('Pet')
		// 7. From the drop-down menu, select the value "dog"
		await petTypeDropdown.selectOption(originalPetType)
		// 8. On the "Pet details" page, add the assertion the value "dog" is displayed in the "Type" field as well as drop-down input field
		await expect(petTypeField).toHaveValue(originalPetType)	
		expect(await petTypeDropdown.inputValue()).toEqual(originalPetType)
		// 9. Select "Update Pet" button
		await updatePetTypeButton.click()

		// Pets and Visits page
		await expect(secondHeadingLabel).toHaveText('Pets and Visits')
		// 10. On the "Owner Information" page, add the assertion that pet "Rosy" has the original value of the Type "dog"
		await expect(page.locator('app-pet-list dl').nth(1)).toContainText(originalPetType)
	})
})
