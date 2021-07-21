import expectPuppet from 'expect-puppeteer'

describe('AMD Module export', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:9000/requirejs.html')
		await page.waitForTimeout(300)
	})

	it('should initialize', async () => {
		await expectPuppet(page).toMatchElement('p', { text: 'Simonsson is initialized' })
	})
})
