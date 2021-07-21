/// <referece path="dom.KeyboardMapAPI.ts" />

let initialized = false

let keyboardLayoutMap: KeyboardLayoutMap | undefined = undefined

type Note = string[]
type ComboChord = Note[]

interface EnchancedKeyboardEvent extends KeyboardEvent {
	comboChordCodes: ComboChord
	comboCodes: Note
}

interface ComboBinding extends BindOptions {
	combo: ComboChord
	listener: (e: EnchancedKeyboardEvent) => void
}

interface ChordInProgress {
	binding: ComboBinding
	note: number
}

let bound: ComboBinding[] = []
let chordsInProgress: ChordInProgress[] = []
let keysDown: string[] = []

interface BindOptions {
	/** Only fire this hotkey if no other keys are pressed. */
	exclusive?: boolean
	/**
	 * Fire this combo even if a text input or textarea is currently in focus.
	 * If a function is provided, it is evaluated any time this hotkey would fire.
	 */
	global?: boolean | ((e: KeyboardEvent, combo: string) => boolean)
	/** Fire this hotkey after a key is depressed from the combo. */
	up?: boolean
	/** Keys must be pressed in the order given in the combo for the hotkey to fire. */
	ordered?: boolean
}

/**
 * Special meta-codes that can be used to match for "any" modifer key, like matching for both ShiftLeft and ShiftRight.
 */
export const VIRTUAL_ANY_POSITION_KEYS: Record<string, string[]> = {
	Shift: ['ShiftLeft', 'ShiftRight'],
	Control: ['ControlLeft', 'ControlRight'],
	Ctrl: ['ControlLeft', 'ControlRight'],
	Alt: ['AltLeft', 'AltRight'],
	Meta: ['MetaLeft', 'MetaRight'],
	AnyEnter: ['Enter', 'NumpadEnter'],
}

function parseCombo(combo: string): ComboChord {
	return combo
		.split(/\s+/)
		.filter(Boolean)
		.map((note) => note.split('+').filter(Boolean))
}

function stringifyCombo(combo: ComboChord): string {
	return combo.map((note) => note.join('+')).join(' ')
}

/**
 * Bind a combo or set of combos to a given listener.
 *
 * @param {(string | string[])} combo
 * @param {(e: EnchancedKeyboardEvent) => void} listener
 * @param {BindOptions} [options]
 */
function bind(combo: string | string[], listener: (e: EnchancedKeyboardEvent) => void, options?: BindOptions): void {
	if (!initialized) {
		throw new Error('Simonsson needs to be initialized before binding any combos.')
	}

	if (!Array.isArray(combo)) {
		combo = [combo]
	}

	combo.forEach((variant) => {
		const item = parseCombo(variant)
		if (!item.length || !item[0].length) {
			throw new Error('Combo needs to have at least a single key in it')
		}
		bound.push({
			combo: item,
			listener,
			...options,
		})
	})
}

function unbind(combo: string, listener?: (e: EnchancedKeyboardEvent) => void): void {
	let bindingsToUnbind: ComboBinding[] = []
	let normalizedCombo = stringifyCombo(parseCombo(combo))

	bound.forEach((binding) => {
		if ((!listener || binding.listener === listener) && stringifyCombo(binding.combo) === normalizedCombo) {
			bindingsToUnbind.push(binding)
		}
	})

	bindingsToUnbind.forEach((binding) => {
		const idx = bound.indexOf(binding)
		if (idx >= 0) {
			bound.splice(idx, 1)
		}
	})
}

function matchNote(combo: Note, options?: BindOptions): boolean {
	if (!options?.ordered) {
		for (let i = 0; i < combo.length; i++) {
			const code = combo[i]
			if (code in VIRTUAL_ANY_POSITION_KEYS) {
				const alternatives = VIRTUAL_ANY_POSITION_KEYS[code]
				let anyMatch = false
				for (let j = 0; j < alternatives.length; j++) {
					if (keysDown.includes(alternatives[j])) {
						anyMatch = true
						break
					}
				}
				if (!anyMatch) {
					return false
				}
			} else {
				if (!keysDown.includes(code)) {
					return false // break iterations as soon as possible
				}
			}
		}
	} else {
		let lastFound = -1
		for (let i = 0; i < combo.length; i++) {
			const code = combo[i]
			if (code in VIRTUAL_ANY_POSITION_KEYS) {
				const alternatives = VIRTUAL_ANY_POSITION_KEYS[code]
				let anyMatch = false
				for (let j = 0; j < alternatives.length; j++) {
					const idx = keysDown.indexOf(alternatives[j])
					if (idx >= 0 && idx >= lastFound) {
						anyMatch = true
						lastFound = idx
						break
					}
				}
				if (!anyMatch) {
					return false
				}
			} else {
				const idx = keysDown.indexOf(combo[i])
				if (idx < 0 || idx < lastFound) {
					return false // break iterations as soon as possible
				}
				lastFound = idx
			}
		}
	}

	if (options?.exclusive && keysDown.length !== combo.length) {
		return false
	}

	return true
}

function visitBoundCombos(_key: string, up: boolean, _e: KeyboardEvent) {
	bound.forEach((binding: ComboBinding) => {
		if (matchNote(binding.combo[0], binding) && (binding.up || false) === up) {
			chordsInProgress.push({
				binding,
				note: 1,
			})
		}
	})
}

function visitChordsInProgress(_key: string, _up: boolean, e: KeyboardEvent) {
	const notInProgress: ChordInProgress[] = []
	chordsInProgress.forEach((chord: ChordInProgress) => {
		if (chord.binding.combo.length === chord.note) {
			chord.binding.listener(
				Object.assign(e, {
					comboChordCodes: chord.binding.combo,
					comboCodes: chord.binding.combo[chord.note - 1],
				})
			)
			notInProgress.push(chord)
		} else if (chord.binding.combo.length > chord.note) {
			if (matchNote(chord.binding.combo[chord.note + 1], chord.binding)) {
				chord.note = chord.note + 1
				if (chord.binding.combo.length === chord.note) {
					chord.binding.listener(
						Object.assign(e, {
							comboChordCodes: chord.binding.combo,
							comboCodes: chord.binding.combo[chord.note - 1],
						})
					)
					notInProgress.push(chord)
				}
			} else {
				notInProgress.push(chord)
			}
		} else {
			notInProgress.push(chord)
		}
	})

	notInProgress.forEach((chord) => {
		const idx = chordsInProgress.indexOf(chord)
		if (idx >= 0) {
			chordsInProgress.splice(idx, 1)
		}
	})
}

function keyUp(e: KeyboardEvent) {
	let idx = -1
	do {
		idx = keysDown.indexOf(e.code)
		if (idx >= 0) {
			keysDown.splice(idx, 1)
		}
	} while (idx >= 0)

	visitBoundCombos(e.code, true, e)
	visitChordsInProgress(e.code, true, e)
}

function keyDown(e: KeyboardEvent) {
	if (!e.repeat) {
		keysDown.push(e.code)
		console.log(keysDown)

		visitBoundCombos(e.code, false, e)
		visitChordsInProgress(e.code, false, e)
	}
}

async function getKeyboardLayoutMap() {
	if ('keyboard' in navigator && typeof navigator.keyboard.getLayoutMap === 'function') {
		keyboardLayoutMap = await navigator.keyboard.getLayoutMap()
	}
}

/**
 * Figure out the physical key code for a given label.
 *
 * @param {string} key
 * @return {*}  {(string | undefined)}
 */
function getCodeForKey(key: string): string | undefined {
	if (key.length === 1) {
		key = key.toLowerCase()
	}
	if (keyboardLayoutMap) {
		for (let [code, label] of keyboardLayoutMap.entries()) {
			if (label === key) {
				return code
			}
		}
	}
	return undefined
}

/**
 * Fetch the key label on the given physical key.
 *
 * @param {string} code
 * @return {*}  {string}
 */
function getKeyForCode(code: string): string {
	if (keyboardLayoutMap) {
		return keyboardLayoutMap.get(code) || code.replace(/^Key/, '')
	} else {
		// the fallback position is to return the key string without the "Key" prefix, if present.
		// On US-style keyboards works 9 out of 10 cases.
		return code.replace(/^Key/, '')
	}
}

/**
 * Attach Simonsson event handlers to the window and get the current keyboard layout map.
 *
 */
async function init() {
	if (!initialized) {
		window.addEventListener('keyup', keyUp, {
			passive: false,
		})
		window.addEventListener('keydown', keyDown, {
			passive: false,
		})
		window.addEventListener('layoutchange', () => {
			getKeyboardLayoutMap().catch((reason) => {
				throw new Error(reason)
			})
		})
		await getKeyboardLayoutMap()

		bound = []
		initialized = true
	} else {
		throw new Error('Simonsson already initialized.')
	}
}

/**
 * Remove all Simonsson event handlers from the window.
 *
 */
async function destroy() {
	if (initialized) {
		window.removeEventListener('keyup', keyUp)
		window.removeEventListener('keydown', keyDown)

		initialized = false
	} else {
		throw new Error('Simonsson already destroyed.')
	}
}

const Simonsson = {
	init,
	destroy,
	getCodeForKey,
	getKeyForCode,
	bind,
	unbind,
}

if (window) {
	//@ts-ignore this is to work around a bug in webpack DevServer
	window['Simonsson'] = Simonsson
}

export default Simonsson
