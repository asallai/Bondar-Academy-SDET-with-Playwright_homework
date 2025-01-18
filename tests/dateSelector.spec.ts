import { test, expect } from '@playwright/test'

test.describe('Date picker', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.getByText('Owner').click()
		await page.getByText('Search').click()
	})

	test('Select the desired Date in the calendar', async ({ page }) => {
		const birthYear = '2014'
		const birthMonth = '05'
		const birthDay = '02'
		const birthDate = `${birthYear}/${birthMonth}/${birthDay}`

		const petSection = page.locator('app-pet-list', { hasText: 'Tom' })
		const nameSection = page.locator('.form-group', { hasText: 'Name' })
		const glyphIcon = nameSection.locator('span')

		await page.getByRole('link', { name: 'Harold Davis' }).click()
		await page.getByRole('button', { name: 'Add New Pet' }).click()

		await expect(glyphIcon).toHaveClass(/glyphicon-remove/)
		await nameSection.getByRole('textbox').fill('Tom')
		await expect(glyphIcon).toHaveClass(/glyphicon-ok/)

		await page.getByLabel('Open calendar').click()
		await page.getByLabel('Choose month and year').click()
		await page.getByLabel('Previous 24 years').click()
		await page.getByRole('button', { name: birthYear }).click()
		await page.getByLabel(`${birthMonth} ${birthYear}`).click()
		await page.getByLabel(birthDate).click()
		await expect(page.locator('.mat-datepicker-input')).toHaveValue(birthDate)

		await page.getByLabel('Type').selectOption('dog')
		await page.getByRole('button', { name: 'Save Pet' }).click()
		await expect(petSection.locator('dd').first()).toHaveText('Tom')
		await expect(petSection.locator('dd').nth(1)).toHaveText(`${birthYear}-${birthMonth}-${birthDay}`)
		await expect(petSection.locator('dd').nth(2)).toHaveText('dog')

		await petSection.getByRole('button', { name: 'Delete Pet' }).click()
		await expect(petSection).not.toBeVisible()
	})

	test('Select the dates of visits and validate dates order', async ({ page }) => {
		const date = new Date()
		const todaysVisitYear = date.getFullYear()
		const todaysVisitMonth = date.toLocaleString('en-US', { month: '2-digit' })
		const todaysVisitDay = date.toLocaleString('en-US', { day: '2-digit' })
		const todaysVisitDate = `${todaysVisitYear}-${todaysVisitMonth}-${todaysVisitDay}`

		date.setDate(date.getDate() - 45)
		const previousVisitYear = date.getFullYear()
		const previousVisitMonth = date.toLocaleString('en-US', { month: '2-digit' })
		const previousVisitDay2Digit = date.toLocaleString('en-US', { day: '2-digit' })
		const previousVisitDayNumeric = date.toLocaleString('en-US', { day: 'numeric' })
		const previousVisitDate = `${previousVisitYear}-${previousVisitMonth}-${previousVisitDay2Digit}`

		const petSection = page.locator('app-pet-list', { hasText: 'Samantha' })
		const petVisitRows = petSection.locator('app-visit-list tr')

		await page.getByRole('link', { name: 'Jean Coleman' }).click()
		await petSection.getByText('Add Visit').click()
		await expect(page.getByRole('heading')).toHaveText('New Visit')
		await expect(page.locator('tr td').nth(0)).toHaveText('Samantha')
		await expect(page.locator('tr td').nth(3)).toHaveText('Jean Coleman')

		await page.getByLabel('Open calendar').click()
		await page.locator('.mat-calendar-body-today').click()
		await expect(page.locator('.mat-datepicker-input')).toHaveValue(`${todaysVisitYear}/${todaysVisitMonth}/${todaysVisitDay}`)

		await page.locator('#description').fill('dermatology visit')
		await page.getByRole('button', { name: 'Add Visit' }).click()
		await expect(page.getByRole('heading').nth(0)).toHaveText('Owner Information')
		await expect(petSection.locator('app-visit-list tr td').nth(0)).toHaveText(todaysVisitDate)

		await petSection.getByRole('button', { name: 'Add Visit' }).click()
		await page.getByLabel('Open calendar').click()

		let calendarMonthAndYear = await page.getByLabel('Choose month and year').textContent()

		while (!calendarMonthAndYear?.includes(`${previousVisitMonth} ${previousVisitYear}`)) {
			await page.getByLabel('Previous month').click()
			calendarMonthAndYear = await page.getByLabel('Choose month and year').textContent()
		}

		await page.getByText(previousVisitDayNumeric, { exact: true }).click()

		await page.locator('#description').fill('massage therapy')
		await page.getByRole('button', { name: 'Add Visit' }).click()

		const laterVisitDateText = await petVisitRows.nth(2).locator('td').first().textContent()
		const formerVisitDateText = await petVisitRows.nth(3).locator('td').first().textContent()
		const laterVisitDate = new Date(laterVisitDateText!)
		const formerVisitDate = new Date(formerVisitDateText!)
		expect(laterVisitDate! > formerVisitDate!).toBeTruthy()

		await petVisitRows.filter({ hasText: todaysVisitDate }).getByText('Delete Visit').click()
		await petVisitRows.filter({ hasText: previousVisitDate }).getByText('Delete Visit').click()
		await page.waitForResponse(`https://petclinic-api.bondaracademy.com/petclinic/api/visits/*`)

		const petVisitSectionTexts = await petVisitRows.locator('td').allTextContents()
		expect(petVisitSectionTexts).not.toContain(todaysVisitDate)
		expect(petVisitSectionTexts).not.toContain(previousVisitDate)
	})
})
