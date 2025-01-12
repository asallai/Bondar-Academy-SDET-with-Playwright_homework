import { test, expect } from '@playwright/test'

test.describe('Date picker', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.getByText('Owner').click()
		await page.getByText('Search').click()
	})

	test('Select the desired Date in the calendar', async ({ page }) => {
		const nameSection = page.locator('.form-group', { hasText: 'Name' })
		const glyphIcon = nameSection.locator('span')
		const petTypeDropdown = page.getByLabel('Type')
		const petSection = page.locator('app-pet-list', { hasText: 'Tom' })

		await page.getByRole('link', { name: 'Harold Davis' }).click()
		await page.getByRole('button', { name: 'Add New Pet' }).click()

		await expect(glyphIcon).toHaveClass(/glyphicon-remove/)
		await nameSection.getByRole('textbox').fill('Tom')
		await expect(glyphIcon).toHaveClass(/glyphicon-ok/)

		await selectFormerDateFromCalendar('2014', '05', '2', page)

		await petTypeDropdown.selectOption('dog')
		await page.getByRole('button', { name: 'Save Pet' }).click()
		await expect(petSection.locator('dd').first()).toHaveText('Tom')
		await expect(petSection.locator('dd').nth(1)).toHaveText('2014-05-02')
		await expect(petSection.locator('dd').nth(2)).toHaveText('dog')

		await petSection.getByRole('button', { name: 'Delete Pet' }).click()
		await expect(petSection).not.toBeVisible()
	})

	test('Select the dates of visits and validate dates order', async ({ page }) => {
		const petName = 'Samantha'
		const todaysVisitDescription = 'dermatologists visit'
		const precedingVisitDescription = 'massage therapy'

		const petAddVisitButton = page.locator('app-pet-list', { hasText: petName }).getByText('Add Visit')
		const petNewVisitSection = page.locator('app-visit-add', { hasText: petName })
		const petVisitListSection = page.locator('app-pet-list', { hasText: petName }).locator('app-visit-list')
		const petTodaysVisitRow = petVisitListSection.getByRole('row').nth(1)
		const petPrecedingVisitRow = petVisitListSection.getByRole('row').nth(2)

		await page.getByRole('link', { name: 'Jean Coleman' }).click()
		await petAddVisitButton.click()
		await expect(page.getByRole('heading')).toHaveText('New Visit')
		await expect(petNewVisitSection.locator('td').first()).toHaveText(petName)
		await expect(petNewVisitSection.locator('td').nth(3)).toHaveText('Jean Coleman')

		await page.getByLabel('Open calendar').click()
		await page.locator('.mat-calendar-body-today').click()

		let date = new Date()
		const todaysVisitDay = date.getDate().toString()
		const todaysVisitMonth = date.toLocaleString('EN-US', { month: '2-digit' })
		const todaysVisitYear = date.getFullYear()

		await expect(page.locator('[name="date"]')).toHaveValue(`${todaysVisitYear}/${todaysVisitMonth}/${todaysVisitDay}`)

		await page.locator('#description').fill(todaysVisitDescription)
		await page.getByRole('button', { name: 'Add Visit' }).click()
		await expect(page.getByRole('heading').first()).toHaveText('Owner Information')
		await expect(petTodaysVisitRow.locator('td').first()).toHaveText(`${todaysVisitYear}-${todaysVisitMonth}-${todaysVisitDay}`)
		await expect(petTodaysVisitRow.locator('td').nth(1)).toHaveText(todaysVisitDescription)

		await petAddVisitButton.click()

		date.setDate(date.getDate() - 45)
		const precedingVisitDay = date.getDate().toString()
		const precedingVisitMonth = date.toLocaleString('EN-US', { month: '2-digit' })
		const precedingVisitYear = date.getFullYear().toString()

		await selectFormerDateFromCalendar(precedingVisitYear, precedingVisitMonth, precedingVisitDay, page)

		await page.locator('#description').fill(precedingVisitDescription)
		await page.getByRole('button', { name: 'Add Visit' }).click()

		const precedingVisitDateText = await petPrecedingVisitRow.locator('td').first().textContent()
		const pastVisitDateText = await petVisitListSection.getByRole('row').nth(3).locator('td').first().textContent()
		const precedingVisitDate = new Date(precedingVisitDateText!)
		const pastVisitDate = new Date(pastVisitDateText!)
		expect(precedingVisitDate > pastVisitDate).toBeTruthy()

		await petTodaysVisitRow.getByRole('button', { name: 'Delete Visit' }).click()
		await petPrecedingVisitRow.getByRole('button', { name: 'Delete Visit' }).click()
		await expect(petTodaysVisitRow.locator('td').nth(1)).not.toHaveText(todaysVisitDescription)
		await expect(petPrecedingVisitRow.locator('td').nth(1)).not.toHaveText(precedingVisitDescription)
	})
})

async function selectFormerDateFromCalendar(year: string, month: string, day: string, page: any) {
	const calendarChooseYearField = page.getByLabel('Choose date')
	const calendarMonthAndYearField = page.getByLabel('Choose month and year')

	await page.getByLabel('Open calendar').click()
	await calendarMonthAndYearField.click()

	let yearPeriod = await calendarChooseYearField.textContent()

	let [fromYear, toYear] = yearPeriod?.split(' ') ?? []

	while (!(year >= fromYear && year <= toYear)) {
		await page.getByLabel('Previous 24 years').click()
		yearPeriod = await calendarChooseYearField.textContent()
		;[fromYear, toYear] = yearPeriod?.split(' ') ?? []
	}

	await page.getByLabel(year).click()
	await page.getByLabel(`${month} ${year}`).click()

	let calendarMonthAndYear = await calendarMonthAndYearField.textContent()

	while (!calendarMonthAndYear?.includes(`${month} ${year}`)) {
		await page.getByLabel('Previous month').click()
		calendarMonthAndYear = await calendarMonthAndYearField.textContent()
	}

	await page.locator('[class="mat-calendar-body-cell-content mat-focus-indicator"]').getByText(day, { exact: true }).click()
	await expect(page.locator('.mat-datepicker-input')).toHaveValue(`${year}/${month}/${day.padStart(2, '0')}`)
}
