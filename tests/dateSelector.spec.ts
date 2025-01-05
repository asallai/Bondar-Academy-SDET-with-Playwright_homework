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

		while (!calendarMonthAndYear?.includes(`${petBirthMonth} ${petBirthYear}`)) {
			await page.getByLabel('Previous month').click()
			calendarMonthAndYear = await calendarMonthAndYearField.textContent()
		}

		await calendarDayField.getByText(petBirthDay, { exact: true }).click()
		await expect(page.locator('[name=birthDate]')).toHaveValue(`${petBirthYear}/${petBirthMonth}/0${petBirthDay}`)
		await petTypeDropdown.click()
		await petTypeDropdown.selectOption(petType)
		await page.getByText('Save Pet').click()
		await expect(tomPetSection.locator('dd').first()).toHaveText(petName)
		await expect(tomPetSection.locator('dd').nth(1)).toHaveText(`${petBirthYear}-${petBirthMonth}-0${petBirthDay}`)
		await expect(tomPetSection.locator('dd').nth(2)).toHaveText(petType)

		await tomPetSection.getByText('Delete Pet').click()
		await expect(tomPetSection).not.toBeVisible()
	})

	test('Select the dates of visits and validate dates order', async ({ page }) => {
		const ownerName = 'Jean Coleman'
		const petName = 'Samantha'

		const samanthaPetSection = page.locator('app-visit-add', { hasText: petName })

		await page.getByRole('link', { name: ownerName }).click()
		await page.locator('app-pet-list', { hasText: petName }).getByText('Add Visit').click()
		await expect(page.getByRole('heading')).toHaveText('New Visit')
		await expect(samanthaPetSection.locator('td').first()).toHaveText(petName)
		await expect(samanthaPetSection.locator('td').nth(3)).toHaveText(ownerName)

		await page.getByLabel('Open calendar').click()
        const monthAndYear = await page.getByLabel('Choose month and year').textContent()
		let day = await page.locator('.mat-calendar-body-today').textContent()
		await page.locator('.mat-calendar-body-today').click()
      
        const year = getYear(monthAndYear)
		const month = getMonth(monthAndYear)
		await expect(page.locator('[name="date"]')).toHaveValue(`${year}/${month}/0${day.trim()}`)
       
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

function getMonth(monthAndYear: string | null) {
	let month = monthAndYear!.split(' ')
	return month[0]
}

function getYear(monthAndYear: string | null) {
	let year = monthAndYear!.split(' ')
	return year[1]
}
