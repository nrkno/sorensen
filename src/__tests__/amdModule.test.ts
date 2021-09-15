import expectPuppet from 'expect-puppeteer'

describe('AMD Module export', () => {
	beforeAll(async () => {
		await Promise.all([
			page.goto('http://localhost:9000/requirejs.html'),
			page.waitForNavigation(),
			page.waitForTimeout(1000),
		])
	})

	it('should initialize', async () => {
		await expectPuppet(page).toMatchElement('p', { text: 'Sørensen is initialized' })
	})
})
