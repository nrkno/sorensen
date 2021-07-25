import { bindCombo, expectToTrigger, resetAllCombos } from './utils/bindCombo'

jest.setTimeout(300000)

describe('Simonsson.bind', () => {
	describe('keydown', () => {
		beforeAll(async () => {
			await page.goto('http://localhost:9000/index.html')
			await page.waitForTimeout(300)
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
				await page.keyboard.press('KeyA')

				await expectToTrigger('KeyA', 1)
			})

			it('KeyA fires on keydown', async () => {
				await expectToTrigger('KeyA', 0)
				await page.keyboard.down('KeyA')

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

					it('Ctrl+Shift+KeyA fires when pressing KeyA+ControlLeft+ShiftLeft+KeyL', async () => {
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
	})
})
