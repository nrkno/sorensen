import expectPuppet from 'expect-puppeteer'

describe('Global object injection', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:9000/index.html')
		await page.waitForTimeout(300)
	})

	it('should expose global object', async () => {
		const mounted = await page.evaluate<string>('typeof window.simonsson.bind')
		expect(mounted).toBe('function')
	})

	it('should initialize', async () => {
		await expectPuppet(page).toMatchElement('p', { text: 'Simonsson is initialized' })
	})
})
