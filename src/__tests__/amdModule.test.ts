import { expect as expectPuppet } from 'expect-puppeteer'

describe('AMD Module export', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:9000/requirejs.html', {
			waitUntil: 'domcontentloaded'
		})
	}, 10000)

	it('should initialize', async () => {
		await page.waitForSelector('p[data-ready]')
		await expectPuppet(page).toMatchElement('p', { text: 'Sørensen is initialized' })
	})
})
