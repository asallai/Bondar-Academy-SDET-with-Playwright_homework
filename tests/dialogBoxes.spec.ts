import { test, expect } from '@playwright/test'

test('Add and delete pet type', async ({ page }) => {
	const petTypeListSection = page.locator('app-pettype-list')
	const newPetTypeSection = page.locator('app-pettype-add')
	const lastRow = page.locator('tr').last()

	await page.goto('/')
	await page.getByText('Pet Types').click()
	await expect(petTypeListSection.getByRole('heading')).toHaveText('Pet Types')
	await expect(petTypeListSection.getByRole('table')).toBeVisible()
	
	await page.getByRole('button', { name: 'Add' }).click()
	await expect(newPetTypeSection.getByRole('heading')).toHaveText('New Pet Type')
	await expect(newPetTypeSection.locator('label')).toHaveText('Name')
	await expect(newPetTypeSection.getByRole('textbox')).toBeVisible()
	
	await newPetTypeSection.getByRole('textbox').fill('pig')
	await newPetTypeSection.getByRole('button', { name: 'Save' }).click()
	await expect(lastRow.getByRole('textbox')).toHaveValue('pig')
	
	page.on('dialog', dialog => {
		expect(dialog.message()).toEqual('Delete the pet type?')
		dialog.accept()
	})	
	await lastRow.getByRole('button', { name: 'Delete' }).click()
	await expect(lastRow.getByRole('textbox')).not.toHaveValue('pig')
})
