/// <reference types="cypress" />

describe('Basic hotkey', () => {
	it('Activates when key pressed', () => {
		cy.visit('http://localhost:9000/')
		cy.window().then((win) => {
			//@ts-ignore
			win.bindCombo('KeyA', {})
		})
	})
})
