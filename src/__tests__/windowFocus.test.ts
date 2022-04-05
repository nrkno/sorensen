import { bindCombo, expectToTrigger, getPressedKeys, resetAllCombos } from './utils/bindCombo'

jest.setTimeout(300000)

describe('Window focus handling', () => {
	beforeAll(async () => {
		await Promise.all([page.goto('http://localhost:9000/index.html'), page.waitForNavigation()])

		// this test requires exclusive control of the browser, so spin until we're the last test standing
		while (true) {
			const targets = (await browser.targets()).filter((t) => !!t.url() && t.url() !== 'about:blank')
			if (targets.length < 2) {
				break
			}
			await page.waitForTimeout(1000)
		}

		await page.bringToFront()
	})

	beforeEach(async () => {
		await resetAllCombos()
	})

	describe('basics', () => {
		beforeAll(async () => {
			await bindCombo('KeyA')
			await bindCombo('KeyB', {
				up: true,
			})
		})

		it('KeyA fires when pressing KeyA', async () => {
			await expectToTrigger('KeyA', 0)
			await page.keyboard.press('KeyA', {
				delay: 5,
			})

			await expectToTrigger('KeyA', 1)
		})

		it('KeyA fires again, after window looses focus', async () => {
			await expectToTrigger('KeyA', 0)
			await page.keyboard.down('KeyA')
			await expectToTrigger('KeyA', 1)

			await page.evaluate(() => window.dispatchEvent(new Event('blur')))
			expect(await getPressedKeys()).toHaveLength(0)
			await page.keyboard.up('KeyA')
			await page.evaluate(() => window.dispatchEvent(new Event('focus')))

			await expectToTrigger('KeyA', 1)
			await page.keyboard.down('KeyA')

			await expectToTrigger('KeyA', 2)
			await page.keyboard.up('KeyA')
		})

		it('KeyB fires again, after window looses focus', async () => {
			await expectToTrigger('KeyB', 0)
			await page.keyboard.down('KeyB')
			await expectToTrigger('KeyB', 0)
			await page.keyboard.up('KeyB')
			await expectToTrigger('KeyB', 1)

			await page.keyboard.down('KeyB')
			await expectToTrigger('KeyB', 1)
			await page.evaluate(() => window.dispatchEvent(new Event('blur')))

			expect(await getPressedKeys()).toHaveLength(0)
			expect(await page.$('#cancelled-keys').then((el) => el?.evaluate((el) => el.innerHTML))).toBe(',KeyB')
			await page.evaluate(() => window.dispatchEvent(new Event('focus')))
			await page.keyboard.up('KeyB')
			await expectToTrigger('KeyB', 2)
		})
	})
})
