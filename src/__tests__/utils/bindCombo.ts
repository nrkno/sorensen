import expectPuppet from 'expect-puppeteer'
import { BindOptions } from '../../index'

export async function bindCombo(combo: string, options?: BindOptions) {
	await page.evaluate<string>(`bindCombo(${JSON.stringify(combo)}, ${JSON.stringify(options || {})})`)
}

export async function expectToTrigger(combo: string, count: number) {
	await expectPuppet(page).toMatchElement(`#result .binding[data-combo="${combo}"] .hit`, {
		text: count.toString(),
	})
}

export async function resetCombo(combo: string) {
	await page.evaluate<string>(`resetState(${JSON.stringify(combo)})`)
}

export async function resetAllCombos() {
	await page.evaluate<string>(`resetAllStates()`)
}
