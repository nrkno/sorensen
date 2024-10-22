import { expect as expectPuppet} from 'expect-puppeteer'

describe('Global object injection', () => {
	beforeAll(async () => {
		await Promise.all([page.goto('http://localhost:9000/index.html'), page.waitForNavigation()])
	}, 10000)

	it('should expose global object', async () => {
		const mounted = await page.evaluate('typeof window.sorensen.bind')
		expect(mounted).toBe('function')
	})

	it('should initialize', async () => {
		await expectPuppet(page).toMatchElement('p', { text: 'Sørensen is initialized' })
	})
})
