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
		const petTypeDropdown = page.getByLabel('Type')
		const tomPetSection = page.locator('app-pet-list', { hasText: petName })

		await page.getByRole('link', { name: 'Harold Davis' }).click()
		await page.getByRole('button', { name: 'Add New Pet' }).click()

		await expect(glyphIcon).toHaveClass(/glyphicon-remove/)
		await nameSection.getByRole('textbox').fill('Tom')
		await expect(glyphIcon).toHaveClass(/glyphicon-ok/)

		await selectPreviousDateFromCalendar(petBirthYear, petBirthMonth, petBirthDay, page)

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
		const visitText = 'dermatologists visit'

		const samanthaPetAddVisitButton = page.locator('app-pet-list', { hasText: petName }).getByText('Add Visit')
		const samanthaPetNewVisitSection = page.locator('app-visit-add', { hasText: petName })
		const samanthaPetVisitListSection = page.locator('app-pet-list', { hasText: petName }).locator('app-visit-list')
		const calendarTodayField = page.locator('.mat-calendar-body-today')

		await page.getByRole('link', { name: ownerName }).click()
		await samanthaPetAddVisitButton.click()
		await expect(page.getByRole('heading')).toHaveText('New Visit')
		await expect(samanthaPetNewVisitSection.locator('td').first()).toHaveText(petName)
		await expect(samanthaPetNewVisitSection.locator('td').nth(3)).toHaveText(ownerName)

		await page.getByLabel('Open calendar').click()
		const monthAndYear = await page.getByLabel('Choose month and year').textContent()
		let visitDay1 = (await calendarTodayField.textContent())?.trim()
		await calendarTodayField.click()

		const visitYear1 = getYear(monthAndYear)
		const visitMonth1 = getMonth(monthAndYear)
		visitDay1 = String(visitDay1).padStart(2, '0')
		await expect(page.locator('[name="date"]')).toHaveValue(`${visitYear1}/${visitMonth1}/${visitDay1}`)

		await page.locator('#description').fill('dermatologists visit')
		await page.getByRole('button', { name: 'Add Visit' }).click()
		await expect(page.getByRole('heading').first()).toHaveText('Owner Information')
		await expect(samanthaPetVisitListSection.getByRole('row').nth(1).locator('td').first()).toHaveText(`${visitYear1}-${visitMonth1}-${visitDay1}`)
		await expect(samanthaPetVisitListSection.getByRole('row').nth(1).locator('td').nth(1)).toHaveText(visitText)

		await samanthaPetAddVisitButton.click()
		
		let date = new Date()
		date.setDate(date.getDate() - 45)
		const visitDay2 = date.getDate().toString().padStart(2, '0')
		const visitMonth2 = date.toLocaleString('EN-US', { month: '2-digit' })
		const visitYear2 = date.getFullYear().toString()

		await selectPreviousDateFromCalendar(visitYear2, visitMonth2, visitDay2, page)

		// 12. Type the description in the field, for example, "massage therapy" and click "Add Visit" button
		// 13. Add the assertion, that date added at step 11 is in chronological order in relation to the previous dates for "Samantha" pet on the "Owner Information" page. The date of visit above this date in the table should be greater.
		// Hint: To add the assertion for step 13, Extract both values that you going to compare from the table and assign them to the constants.
		// Convert those "string" type values into the "date" type values and save those new values in the constants. Add assertion with a condition, comparing two dates (constants),
		// that it should be either "truthy" or "falsy"
		// 14. Select the "Delete Visit" button for both newly created visits
		// 15. Add the assertion that deleted visits are no longer displayed in the table on "Owner Information" page
	})
})

async function selectPreviousDateFromCalendar(year: string, month: string, day: string, page: any) {
	const calendarChooseYearField = page.getByLabel('Choose date')
	const calendarMonthAndYearField = page.getByLabel('Choose month and year')
	const calendarDayField = page.locator('[class="mat-calendar-body-cell-content mat-focus-indicator"]')

	await page.getByLabel('Open calendar').click()
	await calendarMonthAndYearField.click()

	let yearPeriod = await calendarChooseYearField.textContent()
	let fromYear = getFromYear(yearPeriod)
	let toYear = getToYear(yearPeriod)

	while (!(year >= fromYear && year <= toYear)) {
		await page.getByLabel('Previous 24 years').click()
		yearPeriod = await calendarChooseYearField.textContent()
		fromYear = getFromYear(yearPeriod)
		toYear = getToYear(yearPeriod)
	}

	await page.getByLabel(year).click()
	await page.getByLabel(`${month} ${year}`).click()

	let calendarMonthAndYear = await calendarMonthAndYearField.textContent()

	while (!calendarMonthAndYear?.includes(`${month} ${year}`)) {
		await page.getByLabel('Previous month').click()
		calendarMonthAndYear = await calendarMonthAndYearField.textContent()
	}

	await calendarDayField.getByText(day, { exact: true }).click()
	await expect(page.locator('.mat-datepicker-input')).toHaveValue(`${year}/${month}/${String(day).padStart(2, '0')}`)
}

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
