import { bindCombo, expectToTrigger, resetCombo } from './bindCombo'

jest.setTimeout(30000)

describe('Hotkey binding', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:9000/index.html')
		await page.waitForTimeout(300)
	})

	it('single key', async () => {
		await bindCombo('KeyA')
		await bindCombo('KeyB')
		await expectToTrigger('KeyA', false)
		await expectToTrigger('KeyB', false)
		await page.keyboard.press('KeyA')
		await expectToTrigger('KeyA', true)
		await expectToTrigger('KeyB', false)
	})

	it('two regular keys', async () => {
		await bindCombo('KeyC+KeyD')
		await expectToTrigger('KeyC+KeyD', false)
		await page.keyboard.down('KeyC')
		await page.keyboard.down('KeyD')
		await page.keyboard.up('KeyC')
		await page.keyboard.up('KeyD')
		await expectToTrigger('KeyC+KeyD', true)
	})

	it('key and modifier', async () => {
		await bindCombo('Shift+KeyE')
		await expectToTrigger('Shift+KeyE', false)
		await page.keyboard.down('ShiftLeft')
		await page.keyboard.down('KeyE')
		await page.keyboard.up('KeyE')
		await page.keyboard.up('ShiftLeft')
		await expectToTrigger('Shift+KeyE', true)

		await resetCombo('Shift+KeyE')

		await expectToTrigger('Shift+KeyE', false)
		await page.keyboard.down('ShiftRight')
		await page.keyboard.down('KeyE')
		await page.keyboard.up('KeyE')
		await page.keyboard.up('ShiftRight')
		await expectToTrigger('Shift+KeyE', true)

		await resetCombo('Shift+KeyE')

		await expectToTrigger('Shift+KeyE', false)
		await page.keyboard.down('ShiftRight')
		await page.keyboard.down('KeyC')
		await page.keyboard.up('KeyC')
		await page.keyboard.up('ShiftRight')
		await expectToTrigger('Shift+KeyE', false)
	})

	it('double note, double key chord', async () => {
		await bindCombo('KeyA+KeyC KeyB+KeyD')
		await expectToTrigger('KeyA+KeyC KeyB+KeyD', false)
		await page.keyboard.down('KeyA')
		await page.keyboard.down('KeyC')
		await page.keyboard.up('KeyA')
		await page.keyboard.up('KeyC')
		await page.keyboard.down('KeyB')
		await page.keyboard.down('KeyD')
		await page.keyboard.up('KeyB')
		await page.keyboard.up('KeyD')
		await expectToTrigger('KeyA+KeyC KeyB+KeyD', true)
	})
})
