import { test, expect } from '@playwright/test'

test.describe('Date picker', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.getByText('Owner').click()
		await page.getByText('Search').click()
	})

	test('Select the desired Date in the calendar', async ({ page }) => {
		const petName = 'Tom'
		const petType = 'dog'
		const petBirthYear = '2014'
		const petBirthMonth = '05'
		const petBirthDay = '2'

		const expectedMonthAndYear = `${petBirthMonth} ${petBirthYear}`
		const expectedDateWithSlash = `${petBirthYear}/${petBirthMonth}/0${petBirthDay}`
		const expectedDateWithDash = `${petBirthYear}-${petBirthMonth}-0${petBirthDay}`

		const nameSection = page.locator('.form-group', { hasText: 'Name' })
		const glyphIcon = nameSection.locator('span')
		const calendarChooseYearField = page.getByLabel('Choose date')
		const calendarMonthAndYearField = page.getByLabel('Choose month and year')
		const calendarDayField = page.locator('[class="mat-calendar-body-cell-content mat-focus-indicator"]')
		const petTypeDropdown = page.getByLabel('Type')
		const tomPetSection = page.locator('app-pet-list', { hasText: petName })

		await page.getByRole('link', { name: 'Harold Davis' }).click()
		await page.getByRole('button', { name: 'Add New Pet' }).click()

		await expect(glyphIcon).toHaveClass(/glyphicon-remove/)
		await nameSection.getByRole('textbox').fill('Tom')
		await expect(glyphIcon).toHaveClass(/glyphicon-ok/)

		await page.getByLabel('Open calendar').click()
		await calendarMonthAndYearField.click()

		let yearPeriod = await calendarChooseYearField.textContent()
		let fromYear = getFromYear(yearPeriod)
        let toYear = getToYear(yearPeriod)

		while (!(petBirthYear >= fromYear && petBirthYear <= toYear)) {
			await page.getByLabel('Previous 24 years').click()
			yearPeriod = await calendarChooseYearField.textContent()
			fromYear = getFromYear(yearPeriod)
            toYear = getToYear(yearPeriod)
		}

		await page.getByLabel(petBirthYear).click()
		await page.getByLabel(`${petBirthMonth} ${petBirthYear}`).click()

		let calendarMonthAndYear = await calendarMonthAndYearField.textContent()

		while (!calendarMonthAndYear?.includes(expectedMonthAndYear)) {
			await page.getByLabel('Previous month').click()
			calendarMonthAndYear = await calendarMonthAndYearField.textContent()
		}

		await calendarDayField.getByText(petBirthDay, { exact: true }).click()
		await expect(page.locator('[name=birthDate]')).toHaveValue(expectedDateWithSlash)

		await petTypeDropdown.click()
		await petTypeDropdown.selectOption(petType)
		await page.getByText('Save Pet').click()
		await expect(tomPetSection.locator('dd').nth(1)).toHaveText(expectedDateWithDash)
		await expect(tomPetSection.locator('dd').nth(2)).toHaveText(petType)

		await tomPetSection.getByText('Delete Pet').click()
		await expect(tomPetSection).not.toBeVisible()
	})
})

function getFromYear(yearPeriod: string | null) {
	let years = yearPeriod!.split(' – ')
	return years[0]
}

function getToYear(yearPeriod: string | null) {
	let years = yearPeriod!.split(' – ')
	return years[1]
}

// Test Case 2: Select the dates of visits and validate dates order.
// 2. In the list of the Owners, locate the owner by the name "Jean Coleman" and select this owner
// 3. In the list of pets, locate the pet with a name "Samantha" and click "Add Visit" button
// 4. Add the assertion that "New Visit" is displayed as header of the page
// 5. Add the assertion that pet name is "Samantha" and owner name is "Jean Coleman"
// 6. Click on the calendar icon and select the current date in date picker
// 7. Add assertion that selected date is displayed and it is in the format "YYYY/MM/DD"
// 8. Type the description in the field, for example, "dermatologists visit" and click "Add Visit" button
// 9. Add assertion that selected date of visit is displayed at the top of the list of visits for "Samantha" pet on the "Owner Information" page and is in the format "YYYY-MM-DD"
// 10. Add one more visit for "Samantha" pet by clicking "Add Visit" button
// 11. Click on the calendar icon and select the date which is 45 days back from the current date
// 12. Type the description in the field, for example, "massage therapy" and click "Add Visit" button
// 13. Add the assertion, that date added at step 11 is in chronological order in relation to the previous dates for "Samantha" pet on the "Owner Information" page. The date of visit above this date in the table should be greater.
// Hint: To add the assertion for step 13, Extract both values that you going to compare from the table and assign them to the constants.
// Convert those "string" type values into the "date" type values and save those new values in the constants. Add assertion with a condition, comparing two dates (constants),
// that it should be either "truthy" or "falsy"
// 14. Select the "Delete Visit" button for both newly created visits
// 15. Add the assertion that deleted visits are no longer displayed in the table on "Owner Information" page
