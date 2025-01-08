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
		const petSection = page.locator('app-pet-list', { hasText: petName })

		await page.getByRole('link', { name: 'Harold Davis' }).click()
		await page.getByRole('button', { name: 'Add New Pet' }).click()

		await expect(glyphIcon).toHaveClass(/glyphicon-remove/)
		await nameSection.getByRole('textbox').fill('Tom')
		await expect(glyphIcon).toHaveClass(/glyphicon-ok/)

		await selectFormerDateFromCalendar(petBirthYear, petBirthMonth, petBirthDay, page)

		await petTypeDropdown.click()
		await petTypeDropdown.selectOption(petType)
		await page.getByRole('button', { name: 'Save Pet' }).click()
		await expect(petSection.locator('dd').first()).toHaveText(petName)
		await expect(petSection.locator('dd').nth(1)).toHaveText(`${petBirthYear}-${petBirthMonth}-0${petBirthDay}`)
		await expect(petSection.locator('dd').nth(2)).toHaveText(petType)

		await petSection.getByRole('button', { name: 'Delete Pet' }).click()
		await expect(petSection).not.toBeVisible()
	})

	test('Select the dates of visits and validate dates order', async ({ page }) => {
		const ownerName = 'Jean Coleman'
		const petName = 'Samantha'
		const todaysVisitText = 'dermatologists visit'
		const pastVisitText = 'massage therapy'

		const visitDescriptionInputField = page.locator('#description')
		const addVisitButton = page.getByRole('button', { name: 'Add Visit' })
		const calendarTodayField = page.locator('.mat-calendar-body-today')
		const petAddVisitButton = page.locator('app-pet-list', { hasText: petName }).getByText('Add Visit')
		const petNewVisitSection = page.locator('app-visit-add', { hasText: petName })
		const petVisitListSection = page.locator('app-pet-list', { hasText: petName }).locator('app-visit-list')
		const petTodaysVisitRow = petVisitListSection.getByRole('row').nth(1)
		const petPastVisitRow = petVisitListSection.getByRole('row').nth(2)

		await page.getByRole('link', { name: ownerName }).click()
		await petAddVisitButton.click()
		await expect(page.getByRole('heading')).toHaveText('New Visit')
		await expect(petNewVisitSection.locator('td').first()).toHaveText(petName)
		await expect(petNewVisitSection.locator('td').nth(3)).toHaveText(ownerName)

		await page.getByLabel('Open calendar').click()
		const monthAndYear = await page.getByLabel('Choose month and year').textContent()
		let todaysVisitDay = (await calendarTodayField.textContent())?.trim().padStart(2, '0')
		await calendarTodayField.click()

		const [todaysVisitMonth, todaysVisitYear] = monthAndYear?.split(' ') ?? [];

		await expect(page.locator('[name="date"]')).toHaveValue(`${todaysVisitYear}/${todaysVisitMonth}/${todaysVisitDay}`)

		await visitDescriptionInputField.fill(todaysVisitText)
		await addVisitButton.click()
		await expect(page.getByRole('heading').first()).toHaveText('Owner Information')
		await expect(petTodaysVisitRow.locator('td').first()).toHaveText(`${todaysVisitYear}-${todaysVisitMonth}-${todaysVisitDay}`)
		await expect(petTodaysVisitRow.locator('td').nth(1)).toHaveText(todaysVisitText)

		await petAddVisitButton.click()

		let date = new Date()
		date.setDate(date.getDate() - 45)
		const pastVisitDay = date.getDate().toString().padStart(2, '0')
		const pastVisitMonth = date.toLocaleString('EN-US', { month: '2-digit' })
		const pastVisitYear = date.getFullYear().toString()

		await selectFormerDateFromCalendar(pastVisitYear, pastVisitMonth, pastVisitDay, page)

		await visitDescriptionInputField.fill(pastVisitText)
		await addVisitButton.click()

		await expect(petTodaysVisitRow.locator('td').first()).toHaveText(`${todaysVisitYear}-${todaysVisitMonth}-${todaysVisitDay}`)
		await expect(petPastVisitRow.locator('td').first()).toHaveText( `${pastVisitYear}-${pastVisitMonth}-${pastVisitDay}`)

		await petTodaysVisitRow.getByRole('button', { name: 'Delete Visit' }).click()
		await petPastVisitRow.getByRole('button', { name: 'Delete Visit' }).click()

		await expect(petTodaysVisitRow.locator('td').nth(1)).not.toHaveText(todaysVisitText)
		await expect(petPastVisitRow.locator('td').nth(1)).not.toHaveText(pastVisitText)
	})
})

async function selectFormerDateFromCalendar(year: string, month: string, day: string, page: any) {
	const calendarMonthAndYearField = page.getByLabel('Choose month and year')
	
	await page.getByLabel('Open calendar').click()

	let calendarMonthAndYear = await calendarMonthAndYearField.textContent()

	while (!calendarMonthAndYear?.includes(`${month} ${year}`)) {
		await page.getByLabel('Previous month').click()
		calendarMonthAndYear = await calendarMonthAndYearField.textContent()
	}

	await page.locator('[class="mat-calendar-body-cell-content mat-focus-indicator"]').getByText(day, { exact: true }).click()
	await expect(page.locator('.mat-datepicker-input')).toHaveValue(`${year}/${month}/${String(day).padStart(2, '0')}`)
}
