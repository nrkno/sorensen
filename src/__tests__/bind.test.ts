import { bindCombo, expectToBePrevented, expectToTrigger, resetAllCombos } from './utils/bindCombo'

jest.setTimeout(300000)

describe('Sørensen.bind', () => {
	describe('keydown', () => {
		beforeAll(async () => {
			await Promise.all([page.goto('http://localhost:9000/index.html'), page.waitForNavigation()])

			await page.bringToFront()
		})

		beforeEach(async () => {
			await resetAllCombos()
		})

		describe('basics', () => {
			beforeAll(async () => {
				await bindCombo('KeyA')
				await bindCombo('KeyB')
			})

			it('KeyA fires when pressing KeyA', async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.press('KeyA', {
					delay: 5,
				})

				await expectToTrigger('KeyA', 1)
			})

			it('KeyA fires on keydown', async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.down('KeyA')

				await expectToTrigger('KeyA', 1)
				await page.keyboard.up('KeyA')
			})

			it('KeyA fires once on repeat keydown', async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.down('KeyA')
				await page.waitForTimeout(5)
				await page.keyboard.down('KeyA')
				await page.waitForTimeout(5)
				await page.keyboard.down('KeyA')
				await page.waitForTimeout(5)
				await page.keyboard.down('KeyA')
				await page.waitForTimeout(5)

				await expectToTrigger('KeyA', 1)
				await page.keyboard.up('KeyA')
			})

			it("KeyA doesn't fire on KeyB", async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.down('KeyB')

				await expectToTrigger('KeyA', 0)
				await page.keyboard.up('KeyB')
			})

			it("KeyA doesn't fire when holding Shift", async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.down('ShiftLeft')
				await page.keyboard.down('KeyA')

				await expectToTrigger('KeyA', 0)
				await page.keyboard.up('ShiftLeft')
				await page.keyboard.up('KeyA')
			})

			describe('global', () => {
				beforeAll(async () => {
					await bindCombo('KeyY')
					await bindCombo('KeyZ', {
						global: true,
					})
					await bindCombo('KeyX+KeyK', {
						global: true,
					})
				})

				beforeEach(async () => {
					await page.evaluate(() => {
						const input = document.querySelector('input')
						if (input) {
							input.value = ''
						}
					})
				})

				it("KeyY doesn't fire when inside an input element", async () => {
					await page.focus('input')
					await expectToTrigger('KeyY', 0)
					await page.keyboard.down('KeyY')

					await expectToTrigger('KeyY', 0)
					await page.keyboard.up('KeyY')
				})

				it('KeyZ fires when inside a textarea element', async () => {
					await page.focus('textarea')
					await expectToTrigger('KeyZ', 0)
					await page.keyboard.down('KeyZ')

					await expectToTrigger('KeyZ', 1)
					await page.keyboard.up('KeyZ')
				})

				it("KeyX doesn't cause input into an input element, when pressing KeyX+KeyK", async () => {
					await page.focus('input')
					await expectToTrigger('KeyX+KeyK', 0)
					await page.keyboard.down('KeyX')
					await page.waitForTimeout(5)
					await page.keyboard.down('KeyX')
					await page.waitForTimeout(5)
					await page.keyboard.down('KeyX')
					await page.waitForTimeout(5)
					await page.keyboard.down('KeyK')
					await page.waitForTimeout(5)
					await page.keyboard.down('KeyK')
					await page.waitForTimeout(5)
					await page.keyboard.down('KeyK')
					await page.waitForTimeout(5)
					await page.keyboard.press('KeyA', {
						delay: 5,
					})
					await page.keyboard.press('KeyB', {
						delay: 5,
					})
					await page.keyboard.press('KeyC', {
						delay: 5,
					})

					const inputValue = await page.evaluate(() => document.querySelector('input')?.value)
					// "abc" should still come through, "xxxkkk" should be prevented
					expect(inputValue).toBe('abc')
					// KeyX+KeyK should be triggered once
					await expectToTrigger('KeyX+KeyK', 1)
					await page.keyboard.up('KeyK')
					await page.keyboard.up('KeyX')
				})

				afterAll(async () => {
					await page.focus('button')
				})
			})
		})

		describe('combinations', () => {
			describe('regular keys', () => {
				describe('unordered', () => {
					beforeAll(async () => {
						await bindCombo('KeyC+KeyD')
					})

					it('KeyC+KeyD fires when pressing KeyC, KeyD', async () => {
						await expectToTrigger('KeyC+KeyD', 0)
						await page.keyboard.down('KeyC')
						await page.keyboard.down('KeyD')

						await expectToTrigger('KeyC+KeyD', 1)
						await page.keyboard.up('KeyC')
						await page.keyboard.up('KeyD')
					})

					it('KeyC+KeyD fires when pressing KeyD, KeyC', async () => {
						await expectToTrigger('KeyC+KeyD', 0)
						await page.keyboard.down('KeyD')
						await page.keyboard.down('KeyC')

						await expectToTrigger('KeyC+KeyD', 1)
						await page.keyboard.up('KeyD')
						await page.keyboard.up('KeyC')
					})
				})
				describe('ordered', () => {
					beforeAll(async () => {
						await bindCombo('KeyD+KeyE', {
							ordered: true,
						})
					})

					it('KeyD+KeyE fires when pressing KeyD, KeyE', async () => {
						await expectToTrigger('KeyD+KeyE', 0)
						await page.keyboard.down('KeyD')
						await page.keyboard.down('KeyE')
						await expectToTrigger('KeyD+KeyE', 1)
						await page.keyboard.up('KeyE')
						await page.keyboard.up('KeyD')
					})

					it("KeyD+KeyE doesn't fire when pressing KeyE, KeyD", async () => {
						await expectToTrigger('KeyD+KeyE', 0)
						await page.keyboard.down('KeyE')
						await page.keyboard.down('KeyD')

						await expectToTrigger('KeyD+KeyE', 0)
						await page.keyboard.up('KeyE')
						await page.keyboard.up('KeyD')
					})
				})
			})

			describe('modifier and key', () => {
				describe('unordered', () => {
					beforeAll(async () => {
						await bindCombo('Shift+KeyE')
					})

					it('Shift+KeyE fires when pressing ShiftLeft+KeyE', async () => {
						await expectToTrigger('Shift+KeyE', 0)
						await page.keyboard.down('ShiftLeft')
						await page.keyboard.down('KeyE')

						await expectToTrigger('Shift+KeyE', 1)
						await page.keyboard.up('KeyE')
						await page.keyboard.up('ShiftLeft')
					})

					it('Shift+KeyE fires when pressing ShiftRight+KeyE', async () => {
						await expectToTrigger('Shift+KeyE', 0)
						await page.keyboard.down('ShiftRight')
						await page.keyboard.down('KeyE')

						await expectToTrigger('Shift+KeyE', 1)
						await page.keyboard.up('KeyE')
						await page.keyboard.up('ShiftRight')
					})

					it('Shift+KeyE fires when pressing KeyE+ShiftRight', async () => {
						await expectToTrigger('Shift+KeyE', 0)
						await page.keyboard.down('KeyE')
						await page.keyboard.down('ShiftRight')

						await expectToTrigger('Shift+KeyE', 1)
						await page.keyboard.up('KeyE')
						await page.keyboard.up('ShiftRight')
					})

					it("Shift+KeyE doesn't fire when pressing ShiftRight+KeyC", async () => {
						await expectToTrigger('Shift+KeyE', 0)
						await page.keyboard.down('ShiftRight')
						await page.keyboard.down('KeyC')

						await expectToTrigger('Shift+KeyE', 0)
						await page.keyboard.up('KeyC')
						await page.keyboard.up('ShiftRight')
					})

					it("Shift+KeyE doesn't fire when pressing KeyE", async () => {
						await expectToTrigger('Shift+KeyE', 0)
						await page.keyboard.down('KeyE')
						await page.keyboard.up('KeyE')

						await expectToTrigger('Shift+KeyE', 0)
					})

					it("Shift+KeyE doesn't fire when pressing Shift+Alt+KeyE", async () => {
						await expectToTrigger('Shift+KeyE', 0)
						await page.keyboard.down('ShiftRight')
						await page.keyboard.down('AltRight')
						await page.keyboard.down('KeyE')

						await expectToTrigger('Shift+KeyE', 0)
						await page.keyboard.up('KeyE')
						await page.keyboard.up('AltRight')
						await page.keyboard.up('ShiftRight')
					})
				})

				describe('ordered', () => {
					beforeAll(async () => {
						await bindCombo('Shift+KeyA', {
							ordered: true,
						})
					})

					it('Shift+KeyA fires when pressing ShiftLeft+KeyA', async () => {
						await expectToTrigger('Shift+KeyA', 0)
						await page.keyboard.down('ShiftLeft')
						await page.keyboard.down('KeyA')

						await expectToTrigger('Shift+KeyA', 1)
						await page.keyboard.up('KeyA')
						await page.keyboard.up('ShiftLeft')
					})

					it("Shift+KeyA doesn't fire when pressing KeyA+ShiftLeft", async () => {
						await expectToTrigger('Shift+KeyA', 0)
						await page.keyboard.down('KeyA')
						await page.keyboard.down('ShiftLeft')

						await expectToTrigger('Shift+KeyA', 0)
						await page.keyboard.up('KeyA')
						await page.keyboard.up('ShiftLeft')
					})
				})

				describe('modifiersFirst', () => {
					beforeAll(async () => {
						await bindCombo('Ctrl+Shift+KeyB', {
							ordered: 'modifiersFirst',
						})
					})

					it('Ctrl+Shift+KeyB fires when pressing ShiftLeft+ControlLeft+KeyB', async () => {
						await expectToTrigger('Ctrl+Shift+KeyB', 0)
						await page.keyboard.down('ShiftLeft')
						await page.keyboard.down('ControlLeft')
						await page.keyboard.down('KeyB')

						await expectToTrigger('Ctrl+Shift+KeyB', 1)
						await page.keyboard.up('KeyB')
						await page.keyboard.up('ShiftLeft')
						await page.keyboard.up('ControlLeft')
					})

					it('Ctrl+Shift+KeyB fires when pressing ControlLeft+ShiftLeft+KeyB', async () => {
						await expectToTrigger('Ctrl+Shift+KeyB', 0)
						await page.keyboard.down('ControlLeft')
						await page.keyboard.down('ShiftLeft')
						await page.keyboard.down('KeyB')

						await expectToTrigger('Ctrl+Shift+KeyB', 1)
						await page.keyboard.up('KeyB')
						await page.keyboard.up('ShiftLeft')
						await page.keyboard.up('ControlLeft')
					})

					it("Ctrl+Shift+KeyB doesn't fire when pressing KeyB+ControlLeft+ShiftLeft", async () => {
						await expectToTrigger('Ctrl+Shift+KeyB', 0)
						await page.keyboard.down('KeyB')
						await page.keyboard.down('ControlLeft')
						await page.keyboard.down('ShiftLeft')

						await expectToTrigger('Ctrl+Shift+KeyB', 0)
						await page.keyboard.up('KeyB')
						await page.keyboard.up('ShiftLeft')
						await page.keyboard.up('ControlLeft')
					})

					it("Ctrl+Shift+KeyB doesn't fire when pressing ControlLeft+KeyB+ShiftLeft", async () => {
						await expectToTrigger('Ctrl+Shift+KeyB', 0)
						await page.keyboard.down('ControlLeft')
						await page.keyboard.down('KeyB')
						await page.keyboard.down('ShiftLeft')

						await expectToTrigger('Ctrl+Shift+KeyB', 0)
						await page.keyboard.up('KeyB')
						await page.keyboard.up('ShiftLeft')
						await page.keyboard.up('ControlLeft')
					})
				})

				describe('exclusive: 0', () => {
					beforeAll(async () => {
						await bindCombo('Ctrl+Shift+KeyA', {
							ordered: 'modifiersFirst',
							exclusive: false,
						})
					})

					it('Ctrl+Shift+KeyA fires when pressing ControlLeft+ShiftLeft+KeyL+KeyA', async () => {
						await expectToTrigger('Ctrl+Shift+KeyA', 0)
						await page.keyboard.down('ControlLeft')
						await page.keyboard.down('ShiftLeft')
						await page.keyboard.down('KeyL')
						await page.keyboard.down('KeyA')

						await expectToTrigger('Ctrl+Shift+KeyA', 1)
						await page.keyboard.up('KeyL')
						await page.keyboard.up('ControlLeft')
						await page.keyboard.up('KeyA')
						await page.keyboard.up('ShiftLeft')
					})

					it('Ctrl+Shift+KeyA fires when pressing KeyL+ControlLeft+ShiftLeft+KeyA', async () => {
						await expectToTrigger('Ctrl+Shift+KeyA', 0)
						await page.keyboard.down('KeyL')
						await page.keyboard.down('ControlLeft')
						await page.keyboard.down('ShiftLeft')
						await page.keyboard.down('KeyA')

						await expectToTrigger('Ctrl+Shift+KeyA', 1)
						await page.keyboard.up('ControlLeft')
						await page.keyboard.up('KeyA')
						await page.keyboard.up('ShiftLeft')
						await page.keyboard.up('KeyL')
					})
				})
			})
		})

		describe('chords', () => {
			describe('unordered', () => {
				beforeAll(async () => {
					await bindCombo('KeyA+KeyC KeyB+KeyD')
				})

				it('KeyA+KeyC KeyB+KeyD fires when pressing KeyA+KeyC followed by KeyB+KeyD', async () => {
					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
					await page.keyboard.down('KeyA')
					await page.keyboard.down('KeyC')
					await page.keyboard.up('KeyA')
					await page.keyboard.up('KeyC')
					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
					await page.keyboard.down('KeyB')
					await page.keyboard.down('KeyD')

					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 1)
					await page.keyboard.up('KeyB')
					await page.keyboard.up('KeyD')
				})

				it('KeyA+KeyC KeyB+KeyD fires when pressing KeyC+KeyA followed by KeyD+KeyB', async () => {
					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
					await page.keyboard.down('KeyC')
					await page.keyboard.down('KeyA')
					await page.keyboard.up('KeyA')
					await page.keyboard.up('KeyC')
					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
					await page.keyboard.down('KeyD')
					await page.keyboard.down('KeyB')

					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 1)
					await page.keyboard.up('KeyB')
					await page.keyboard.up('KeyD')
				})

				it("KeyA+KeyC KeyB+KeyD doesn't fire when pressing KeyB+KeyD", async () => {
					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
					await page.keyboard.down('KeyB')
					await page.keyboard.down('KeyD')

					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
					await page.keyboard.up('KeyB')
					await page.keyboard.up('KeyD')
				})

				it("KeyA+KeyC KeyB+KeyD doesn't fire when pressing KeyB+KeyD followed by KeyA+KeyC", async () => {
					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
					await page.keyboard.down('KeyB')
					await page.keyboard.down('KeyD')
					await page.keyboard.up('KeyB')
					await page.keyboard.up('KeyD')
					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
					await page.keyboard.down('KeyA')
					await page.keyboard.down('KeyC')

					await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
					await page.keyboard.up('KeyA')
					await page.keyboard.up('KeyC')
				})
			})

			describe('modifiersFirst', () => {
				beforeAll(async () => {
					await bindCombo('Ctrl+Shift+KeyK KeyC', {
						ordered: 'modifiersFirst',
					})
				})

				it('Ctrl+Shift+KeyK KeyC fires when pressing Ctrl+Shift+KeyK followed by KeyC', async () => {
					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 0)
					await page.keyboard.down('ControlLeft')
					await page.keyboard.down('ShiftLeft')
					await page.keyboard.down('KeyK')
					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 0)
					await page.keyboard.up('KeyK')
					await page.keyboard.up('ControlLeft')
					await page.keyboard.up('ShiftLeft')
					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 0)
					await page.keyboard.down('KeyC')

					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 1)
					await page.keyboard.up('KeyC')
				})

				it('Ctrl+Shift+KeyK KeyC fires when pressing Shift+Ctrl+KeyK followed by KeyC', async () => {
					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 0)
					await page.keyboard.down('ShiftLeft')
					await page.keyboard.down('ControlLeft')
					await page.keyboard.down('KeyK')
					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 0)
					await page.keyboard.up('KeyK')
					await page.keyboard.up('ControlLeft')
					await page.keyboard.up('ShiftLeft')
					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 0)
					await page.keyboard.down('KeyC')

					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 1)
					await page.keyboard.up('KeyC')
				})

				it("Ctrl+Shift+KeyK KeyC doesn't fire when pressing KeyK+Shift+Ctrl followed by KeyC", async () => {
					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 0)
					await page.keyboard.down('KeyK')
					await page.keyboard.down('ShiftLeft')
					await page.keyboard.down('ControlLeft')
					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 0)
					await page.keyboard.up('KeyK')
					await page.keyboard.up('ControlLeft')
					await page.keyboard.up('ShiftLeft')
					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 0)
					await page.keyboard.down('KeyC')

					await expectToTrigger('Ctrl+Shift+KeyK KeyC', 0)
					await page.keyboard.up('KeyC')
				})
			})

			describe('interactions', () => {
				beforeAll(async () => {
					await bindCombo('KeyA KeyB KeyD')
					await bindCombo('KeyA KeyB KeyC')
					await bindCombo('KeyB KeyC')
					await bindCombo('KeyC')
				})

				it('KeyA KeyB KeyD plays well with KeyA KeyB KeyC', async () => {
					await expectToTrigger('KeyA KeyB KeyC', 0)
					await expectToTrigger('KeyA KeyB KeyD', 0)
					await page.keyboard.press('KeyA')
					await page.keyboard.press('KeyB')
					await page.keyboard.press('KeyD')
					await expectToTrigger('KeyA KeyB KeyC', 0)

					await expectToTrigger('KeyA KeyB KeyD', 1)
				})

				it("KeyC doesn't fire when triggering KeyA KeyB KeyC", async () => {
					await expectToTrigger('KeyA KeyB KeyC', 0)
					await expectToTrigger('KeyB KeyC', 0)
					await expectToTrigger('KeyC', 0)
					await page.keyboard.press('KeyA')
					await page.keyboard.press('KeyB')
					await page.keyboard.press('KeyC')
					await expectToTrigger('KeyA KeyB KeyC', 1)
					await expectToTrigger('KeyB KeyC', 0)

					await expectToTrigger('KeyC', 0)
				})
			})

			describe('timeout', () => {
				beforeAll(async () => {
					await bindCombo('KeyD KeyE KeyF')
				})

				it("Chords don't timeout when typing slowly", async () => {
					await expectToTrigger('KeyD KeyE KeyF', 0)
					await page.keyboard.press('KeyD')
					await expectToTrigger('KeyD KeyE KeyF', 0)
					await page.waitForTimeout(500)
					await page.keyboard.press('KeyE')
					await expectToTrigger('KeyD KeyE KeyF', 0)
					await page.waitForTimeout(700)
					await page.keyboard.press('KeyF')

					await expectToTrigger('KeyD KeyE KeyF', 1)
				})

				it('Chords timeout after 2s', async () => {
					await expectToTrigger('KeyD KeyE KeyF', 0)
					await page.keyboard.press('KeyD')
					await expectToTrigger('KeyD KeyE KeyF', 0)
					await page.waitForTimeout(1000)
					await page.keyboard.press('KeyE')
					await expectToTrigger('KeyD KeyE KeyF', 0)
					await page.waitForTimeout(2000)
					await page.keyboard.press('KeyF')

					await expectToTrigger('KeyD KeyE KeyF', 0)
				})
			})
		})

		describe('metacodes', () => {
			it('Shift fires when pressing ShiftLeft and ShiftRight', async () => {
				await bindCombo('Shift')
				await expectToTrigger('Shift', 0)

				await page.keyboard.press('ShiftLeft')
				await expectToTrigger('Shift', 1)

				await page.keyboard.press('ShiftRight')
				await expectToTrigger('Shift', 2)
			})

			it('Ctrl fires when pressing ControlLeft and ControlRight', async () => {
				await bindCombo('Ctrl')
				await expectToTrigger('Ctrl', 0)

				await page.keyboard.press('ControlLeft')
				await expectToTrigger('Ctrl', 1)

				await page.keyboard.press('ControlRight')
				await expectToTrigger('Ctrl', 2)
			})

			it('Control fires when pressing ControlLeft and ControlRight', async () => {
				await bindCombo('Control')
				await expectToTrigger('Control', 0)

				await page.keyboard.press('ControlLeft')
				await expectToTrigger('Control', 1)

				await page.keyboard.press('ControlRight')
				await expectToTrigger('Control', 2)
			})

			it('Alt fires when pressing AltLeft and AltRight', async () => {
				await bindCombo('Alt')
				await expectToTrigger('Alt', 0)

				await page.keyboard.press('AltLeft')
				await expectToTrigger('Alt', 1)

				await page.keyboard.press('AltRight')
				await expectToTrigger('Alt', 2)
			})

			it('Meta fires when pressing MetaLeft and MetaRight', async () => {
				await bindCombo('Meta')
				await expectToTrigger('Meta', 0)

				await page.keyboard.press('MetaLeft')
				await expectToTrigger('Meta', 1)

				await page.keyboard.press('MetaRight')
				await expectToTrigger('Meta', 2)
			})

			it('AnyEnter fires when pressing Enter and NumpadEnter', async () => {
				await bindCombo('AnyEnter')
				await expectToTrigger('AnyEnter', 0)

				await page.keyboard.press('Enter')
				await expectToTrigger('AnyEnter', 1)

				await page.keyboard.press('NumpadEnter')
				await expectToTrigger('AnyEnter', 2)
			})

			it('Option fires when pressing AltLeft and AltRight', async () => {
				await bindCombo('Option')
				await expectToTrigger('Option', 0)

				await page.keyboard.press('AltLeft')
				await expectToTrigger('Option', 1)

				await page.keyboard.press('AltRight')
				await expectToTrigger('Option', 2)
			})
		})
	})

	describe('keyup', () => {
		beforeAll(async () => {
			await page.goto('http://localhost:9000/index.html')
			await page.waitForTimeout(300)
		})

		beforeEach(async () => {
			await resetAllCombos()
		})

		describe('basics', () => {
			beforeAll(async () => {
				await bindCombo('KeyA', {
					up: true,
				})
			})

			it('KeyA fires when pressing KeyA', async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.press('KeyA')

				await expectToTrigger('KeyA', 1)
			})

			it('KeyA fires twice when pressing KeyA twice', async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.press('KeyA')
				await expectToTrigger('KeyA', 1)
				await page.keyboard.press('KeyA')

				await expectToTrigger('KeyA', 2)
			})

			it('KeyA fires on keyup', async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.down('KeyA')
				await expectToTrigger('KeyA', 0)
				await page.keyboard.up('KeyA')

				await expectToTrigger('KeyA', 1)
			})

			it("KeyA doesn't fire on KeyB", async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.down('KeyB')
				await expectToTrigger('KeyA', 0)
				await page.keyboard.up('KeyB')

				await expectToTrigger('KeyA', 0)
			})

			it("KeyA doesn't fire when holding Shift", async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.down('ShiftLeft')
				await page.keyboard.down('KeyA')
				await expectToTrigger('KeyA', 0)
				await page.keyboard.up('KeyA')
				await expectToTrigger('KeyA', 0)
				await page.keyboard.up('ShiftLeft')

				await expectToTrigger('KeyA', 0)
			})

			it('KeyA fires when Shift pressed before releasing KeyA', async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.down('KeyA')
				await page.keyboard.down('ShiftLeft')
				await expectToTrigger('KeyA', 0)
				await page.keyboard.up('ShiftLeft')
				await expectToTrigger('KeyA', 0)
				await page.keyboard.up('KeyA')

				await expectToTrigger('KeyA', 1)
			})
		})

		describe('combinations', () => {
			beforeAll(async () => {
				await bindCombo('Shift+KeyA', {
					up: true,
				})
			})

			it('Shift+KeyA fires once KeyA is depressed in Shift+KeyA', async () => {
				await expectToTrigger('Shift+KeyA', 0)
				await page.keyboard.down('ShiftLeft')
				await page.keyboard.down('KeyA')
				await expectToTrigger('Shift+KeyA', 0)
				await page.keyboard.up('KeyA')
				await expectToTrigger('Shift+KeyA', 1)
				await page.keyboard.up('ShiftLeft')

				await expectToTrigger('Shift+KeyA', 1)
			})

			it('Shift+KeyA fires once Shift is depressed in Shift+KeyA', async () => {
				await expectToTrigger('Shift+KeyA', 0)
				await page.keyboard.down('ShiftLeft')
				await page.keyboard.down('KeyA')
				await expectToTrigger('Shift+KeyA', 0)
				await page.keyboard.up('ShiftLeft')
				await expectToTrigger('Shift+KeyA', 1)
				await page.keyboard.up('KeyA')

				await expectToTrigger('Shift+KeyA', 1)
			})
		})

		describe('chords', () => {
			beforeAll(async () => {
				await bindCombo('KeyA+KeyC KeyB+KeyD', {
					up: true,
				})
			})

			it('KeyA+KeyC KeyB+KeyD fires when pressing KeyA+KeyC followed by KeyB+KeyD', async () => {
				await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
				await page.keyboard.down('KeyA')
				await page.keyboard.down('KeyC')
				await page.keyboard.up('KeyA')
				await page.keyboard.up('KeyC')
				await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
				await page.keyboard.down('KeyB')
				await page.keyboard.down('KeyD')
				await expectToTrigger('KeyA+KeyC KeyB+KeyD', 0)
				await page.keyboard.up('KeyB')
				await page.keyboard.up('KeyD')

				await expectToTrigger('KeyA+KeyC KeyB+KeyD', 1)
			})
		})

		describe('preventDefaultDown', () => {
			beforeAll(async () => {
				await bindCombo('Control+KeyD', { preventDefaultDown: true })
				await bindCombo('KeyA+KeyB', { preventDefaultDown: true })
				await bindCombo('Control+KeyC Shift+KeyD KeyE', { preventDefaultDown: true })
				await bindCombo('KeyK', { preventDefaultDown: true, global: true })
				await bindCombo('KeyL', { preventDefaultDown: true, global: false })
			})
			beforeEach(async () => {
				await page.evaluate(() => {
					const input = document.querySelector('input')
					if (input) {
						input.value = ''
					}
				})
			})
			afterAll(async () => {
				await page.focus('button')
			})

			it('Control+KeyD does trigger preventDefault', async () => {
				await expectToTrigger('Control+KeyD', 0)
				await expectToBePrevented('Control+KeyD', 0)

				await page.keyboard.down('Control')
				await expectToTrigger('Control+KeyD', 0)
				await expectToBePrevented('Control+KeyD', 0)
				await page.keyboard.down('KeyD')
				await expectToTrigger('Control+KeyD', 1)
				await expectToBePrevented('Control+KeyD', 1)

				await page.keyboard.up('Control')
				await page.keyboard.up('KeyD')
				await expectToTrigger('Control+KeyD', 1)
				await expectToBePrevented('Control+KeyD', 1)

				await page.keyboard.down('Control')
				await expectToTrigger('Control+KeyD', 1)
				await expectToBePrevented('Control+KeyD', 1)
				await page.keyboard.down('KeyD')
				await expectToTrigger('Control+KeyD', 2)
				await expectToBePrevented('Control+KeyD', 2)

				await page.keyboard.up('Control')
				await page.keyboard.up('KeyD')
				await expectToTrigger('Control+KeyD', 2)
				await expectToBePrevented('Control+KeyD', 2)
			})

			it('KeyA+KeyB does trigger preventDefault', async () => {
				await expectToTrigger('KeyA+KeyB', 0)
				await expectToBePrevented('KeyA+KeyB', 0)

				await page.keyboard.down('KeyA')
				await expectToTrigger('KeyA+KeyB', 0)
				await expectToBePrevented('KeyA+KeyB', 0)
				await page.keyboard.down('KeyB')
				await expectToTrigger('KeyA+KeyB', 1)
				await expectToBePrevented('KeyA+KeyB', 1)

				await page.keyboard.up('KeyA')
				await page.keyboard.up('KeyB')
				await expectToTrigger('KeyA+KeyB', 1)
				await expectToBePrevented('KeyA+KeyB', 1)

				await page.keyboard.down('KeyA')
				await expectToTrigger('KeyA+KeyB', 1)
				await expectToBePrevented('KeyA+KeyB', 1)
				await page.keyboard.down('KeyB')
				await expectToTrigger('KeyA+KeyB', 2)
				await expectToBePrevented('KeyA+KeyB', 2)

				await page.keyboard.up('KeyA')
				await page.keyboard.up('KeyB')
				await expectToTrigger('KeyA+KeyB', 2)
				await expectToBePrevented('KeyA+KeyB', 2)
			})

			it('Control+KeyC Shift+KeyD KeyE does trigger preventDefault', async () => {
				await expectToTrigger('Control+KeyC Shift+KeyD KeyE', 0)
				await expectToBePrevented('Control+KeyC Shift+KeyD KeyE', 0)

				await page.keyboard.down('Control')
				await page.keyboard.down('KeyC')
				await page.keyboard.up('KeyC')
				await page.keyboard.up('Control')

				await page.keyboard.down('Shift')
				await page.keyboard.down('KeyD')
				await page.keyboard.up('KeyD')
				await page.keyboard.up('Shift')

				await page.keyboard.press('KeyE')
				await expectToTrigger('Control+KeyC Shift+KeyD KeyE', 1)
				await expectToBePrevented('Control+KeyC Shift+KeyD KeyE', 1)
			})

			it('Global KeyK is preventDefault\'ed in input', async () => {
				const input = await page.$('input')
				await page.evaluate(el => el.value = '', input)

				await page.focus('input')
				await expectToBePrevented('KeyK', 0)

				await page.keyboard.down('KeyK')
				await expectToBePrevented('KeyK', 1)

				await page.keyboard.up('KeyK')
				await expectToBePrevented('KeyK', 1)

				let value = await page.evaluate(el => el.value, input)
				expect(value).toBe('')
			})

			it('Non-global KeyL is not preventDefault\'ed in input', async () => {
				const input = await page.$('input')
				await page.evaluate(el => el.value = '', input)

				await page.focus('input')
				await expectToBePrevented('KeyL', 0)

				await page.keyboard.down('KeyL')
				await expectToBePrevented('KeyL', 0)

				await page.keyboard.up('KeyL')
				await expectToBePrevented('KeyL', 0)

				let value = await page.evaluate(el => el.value, input)
				expect(value).toBe('l')
			})
		})

		describe('No preventDefaultDown', () => {
			beforeAll(async () => {
				await bindCombo('Control+KeyD')
				await bindCombo('KeyA+KeyB')
			})

			it('Control+KeyD does not trigger preventDefault', async () => {
				await expectToTrigger('Control+KeyD', 0)
				await expectToBePrevented('Control+KeyD', 0)

				await page.keyboard.down('Control')
				await expectToTrigger('Control+KeyD', 0)
				await expectToBePrevented('Control+KeyD', 0)
				await page.keyboard.down('KeyD')
				await expectToTrigger('Control+KeyD', 1)
				await expectToBePrevented('Control+KeyD', 0)

				await page.keyboard.up('Control')
				await page.keyboard.up('KeyD')
				await expectToTrigger('Control+KeyD', 1)
				await expectToBePrevented('Control+KeyD', 0)

				await page.keyboard.down('Control')
				await expectToTrigger('Control+KeyD', 1)
				await expectToBePrevented('Control+KeyD', 0)
				await page.keyboard.down('KeyD')
				await expectToTrigger('Control+KeyD', 2)
				await expectToBePrevented('Control+KeyD', 0)

				await page.keyboard.up('Control')
				await page.keyboard.up('KeyD')
				await expectToTrigger('Control+KeyD', 2)
				await expectToBePrevented('Control+KeyD', 0)
			})

			it('KeyA+KeyB does not trigger preventDefault', async () => {
				await expectToTrigger('KeyA+KeyB', 0)
				await expectToBePrevented('KeyA+KeyB', 0)

				await page.keyboard.down('KeyA')
				await expectToTrigger('KeyA+KeyB', 0)
				await expectToBePrevented('KeyA+KeyB', 0)
				await page.keyboard.down('KeyB')
				await expectToTrigger('KeyA+KeyB', 1)
				await expectToBePrevented('KeyA+KeyB', 0)

				await page.keyboard.up('KeyA')
				await page.keyboard.up('KeyB')
				await expectToTrigger('KeyA+KeyB', 1)
				await expectToBePrevented('KeyA+KeyB', 0)

				await page.keyboard.down('KeyA')
				await expectToTrigger('KeyA+KeyB', 1)
				await expectToBePrevented('KeyA+KeyB', 0)
				await page.keyboard.down('KeyB')
				await expectToTrigger('KeyA+KeyB', 2)
				await expectToBePrevented('KeyA+KeyB', 0)

				await page.keyboard.up('KeyA')
				await page.keyboard.up('KeyB')
				await expectToTrigger('KeyA+KeyB', 2)
				await expectToBePrevented('KeyA+KeyB', 0)
			})
		})

		describe('Explicit no preventDefaultDown', () => {
			beforeAll(async () => {
				await bindCombo('Control+KeyD', { preventDefaultDown: false })
				await bindCombo('KeyA+KeyB', { preventDefaultDown: false })
			})

			it('Control+KeyD does not trigger preventDefault', async () => {
				await expectToTrigger('Control+KeyD', 0)
				await expectToBePrevented('Control+KeyD', 0)

				await page.keyboard.down('Control')
				await expectToTrigger('Control+KeyD', 0)
				await expectToBePrevented('Control+KeyD', 0)
				await page.keyboard.down('KeyD')
				await expectToTrigger('Control+KeyD', 1)
				await expectToBePrevented('Control+KeyD', 0)

				await page.keyboard.up('Control')
				await page.keyboard.up('KeyD')
				await expectToTrigger('Control+KeyD', 1)
				await expectToBePrevented('Control+KeyD', 0)

				await page.keyboard.down('Control')
				await expectToTrigger('Control+KeyD', 1)
				await expectToBePrevented('Control+KeyD', 0)
				await page.keyboard.down('KeyD')
				await expectToTrigger('Control+KeyD', 2)
				await expectToBePrevented('Control+KeyD', 0)

				await page.keyboard.up('Control')
				await page.keyboard.up('KeyD')
				await expectToTrigger('Control+KeyD', 2)
				await expectToBePrevented('Control+KeyD', 0)
			})

			it('KeyA+KeyB does not trigger preventDefault', async () => {
				await expectToTrigger('KeyA+KeyB', 0)
				await expectToBePrevented('KeyA+KeyB', 0)

				await page.keyboard.down('KeyA')
				await expectToTrigger('KeyA+KeyB', 0)
				await expectToBePrevented('KeyA+KeyB', 0)
				await page.keyboard.down('KeyB')
				await expectToTrigger('KeyA+KeyB', 1)
				await expectToBePrevented('KeyA+KeyB', 0)

				await page.keyboard.up('KeyA')
				await page.keyboard.up('KeyB')
				await expectToTrigger('KeyA+KeyB', 1)
				await expectToBePrevented('KeyA+KeyB', 0)

				await page.keyboard.down('KeyA')
				await expectToTrigger('KeyA+KeyB', 1)
				await expectToBePrevented('KeyA+KeyB', 0)
				await page.keyboard.down('KeyB')
				await expectToTrigger('KeyA+KeyB', 2)
				await expectToBePrevented('KeyA+KeyB', 0)

				await page.keyboard.up('KeyA')
				await page.keyboard.up('KeyB')
				await expectToTrigger('KeyA+KeyB', 2)
				await expectToBePrevented('KeyA+KeyB', 0)
			})
		})
	})
})
