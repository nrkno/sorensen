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

const DEFAULT_CHORD_TIMEOUT = 1000
let CHORD_TIMEOUT = DEFAULT_CHORD_TIMEOUT

export interface BindOptions {
	/** Only fire this hotkey if no other keys are pressed.
	 *  Default: true
	 */
	exclusive?: boolean
	/**
	 * Fire this combo even if a text input or textarea is currently in focus.
	 * If a function is provided, it is evaluated any time this hotkey would fire.
	 * Default: false
	 */
	global?: boolean | ((e: KeyboardEvent, combo: string) => boolean)
	/** Fire this hotkey after a key is depressed from the combo.
	 *  Default: false
	 */
	up?: boolean
	/** Keys must be pressed in the order given in the combo for the hotkey to fire.
	 *
	 *  `modifiersFirst` means that modifiers need to be activated first, in any order, and then subsequent keys
	 *  must be pressed in order.
	 *
	 *  Default: false
	 */
	ordered?: boolean | 'modifiersFirst'

	modifiersPoisonChord?: boolean
}

const MODIFIER_KEYS = [
	'ShiftLeft',
	'ShiftRight',
	'ControlLeft',
	'ControlRight',
	'AltLeft',
	'AltRight',
	'MetaLeft',
	'MetaRight',
]

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
	Option: ['AltLeft', 'AltRight'],
	Command: ['OSLeft', 'OSRight'],
	Windows: ['OSLeft', 'OSRight'],
}
const INVERSE_VIRTUAL_ANY_POSITION_KEYS: Record<string, string> = {}
Object.entries(VIRTUAL_ANY_POSITION_KEYS).forEach((entry) => {
	entry[1].forEach((code) => (INVERSE_VIRTUAL_ANY_POSITION_KEYS[code] = entry[0]))
})

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

function noteIncludesKey(combo: Note, key: string): boolean {
	return (
		combo.includes(key) ||
		(key in INVERSE_VIRTUAL_ANY_POSITION_KEYS ? combo.includes(INVERSE_VIRTUAL_ANY_POSITION_KEYS[key]) : false)
	)
}

function matchNote(combo: Note, options?: BindOptions): boolean {
	if (!!options?.ordered === false) {
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
		const modifiersFirst = options?.ordered === 'modifiersFirst'
		let lastFound = -1
		let lastFoundModifier = -1
		for (let i = 0; i < combo.length; i++) {
			const code = combo[i]
			if (code in VIRTUAL_ANY_POSITION_KEYS) {
				const alternatives = VIRTUAL_ANY_POSITION_KEYS[code]
				let anyMatch = false
				for (let j = 0; j < alternatives.length; j++) {
					// we can start at lastFound, anything before that has already been processed
					const idx = keysDown.indexOf(alternatives[j], lastFound + 1)
					if (idx >= 0 && idx > lastFound) {
						anyMatch = true
						if (modifiersFirst && MODIFIER_KEYS.includes(alternatives[j])) {
							lastFoundModifier = idx
						} else {
							lastFound = idx
						}
						break
					}
				}
				if (!anyMatch) {
					return false
				}
			} else {
				// we can start at lastFound, anything before that has already been processed
				const idx = keysDown.indexOf(combo[i], lastFound + 1)
				if (idx < 0 || idx <= lastFound) {
					return false // break iterations as soon as possible
				}
				if (modifiersFirst && MODIFIER_KEYS.includes(combo[i])) {
					lastFoundModifier = idx
				} else {
					lastFound = idx
				}
			}

			// If modifiersFirst, do not allow modifiers after other keys
			if (modifiersFirst && lastFound >= 0 && lastFoundModifier > lastFound) {
				return false
			}
		}
	}

	if ((options?.exclusive ?? true) && keysDown.length !== combo.length) {
		return false
	}

	return true
}

function callListenerIfAllowed(binding: ComboBinding, e: KeyboardEvent, note = 0) {
	if (
		!binding.global &&
		(document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT')
	) {
		return
	} else if (typeof binding.global === 'function') {
		if (!binding.global(e, stringifyCombo(binding.combo))) {
			return
		}
	}

	binding.listener(
		Object.assign(e, {
			comboChordCodes: binding.combo,
			comboCodes: binding.combo[note],
		})
	)
}

function visitBoundCombos(_key: string, up: boolean, e: KeyboardEvent) {
	const chordsInProgressCount = chordsInProgress.length
	bound.forEach((binding: ComboBinding) => {
		if (matchNote(binding.combo[0], binding) && (binding.up || false) === up) {
			if (chordsInProgressCount === 0 || binding.exclusive === false) {
				if (binding.combo.length === 1) {
					console.log(binding, chordsInProgress, binding.exclusive)
					callListenerIfAllowed(binding, e, 0)
				} else {
					chordsInProgress.push({
						binding,
						note: 1,
					})
				}
			}
		}
	})
}

function visitChordsInProgress(key: string, up: boolean, e: KeyboardEvent) {
	const notInProgress: ChordInProgress[] = []
	chordsInProgress.forEach((chord: ChordInProgress) => {
		if ((chord.binding.up || false) === up) {
			if (chord.binding.combo.length > chord.note) {
				if (matchNote(chord.binding.combo[chord.note], chord.binding)) {
					chord.note = chord.note + 1
					console.log('Did match', chord)
					if (chord.binding.combo.length === chord.note) {
						console.log('Executing', chord)
						callListenerIfAllowed(chord.binding, e, chord.note)
						return // do not set up a new timeout for the chord
					}
				} else if (
					(up || !noteIncludesKey(chord.binding.combo[chord.note], key)) &&
					(chord.binding.modifiersPoisonChord || !MODIFIER_KEYS.includes(key))
				) {
					console.log('No match', chord)
					notInProgress.push(chord)
				}
			} else {
				console.log('Too short', chord)
				notInProgress.push(chord)
			}
		} else {
			console.log('Wrong direction: ', up)
		}
	})

	chordsInProgress = chordsInProgress.filter((chord) => !notInProgress.includes(chord))
}

function cleanUpFinishedChords() {
	chordsInProgress = chordsInProgress.filter((chord) => chord.note < chord.binding.combo.length)
}

let chordTimeout: NodeJS.Timeout | undefined = undefined
function setUpChordTimeout() {
	clearChordTimeout()
	if (CHORD_TIMEOUT > 0) {
		chordTimeout = setTimeout(() => {
			chordsInProgress.length = 0
		}, CHORD_TIMEOUT)
	}
}
function clearChordTimeout() {
	if (chordTimeout) {
		clearTimeout(chordTimeout)
	}
	chordTimeout = undefined
}

/**
 * Cancel all pressed keys and chords in progress
 *
 */
function poison() {
	keysDown.length = 0
	chordsInProgress.length = 0
}

function keyUp(e: KeyboardEvent) {
	let idx = -1
	do {
		idx = keysDown.indexOf(e.code)
		if (idx >= 0) {
			keysDown.splice(idx, 1)
		}
	} while (idx >= 0)

	visitChordsInProgress(e.code, true, e)
	visitBoundCombos(e.code, true, e)
	cleanUpFinishedChords()
	setUpChordTimeout()
}

function keyDown(e: KeyboardEvent) {
	if (!e.repeat) {
		keysDown.push(e.code)
		console.log(keysDown)

		visitChordsInProgress(e.code, false, e)
		visitBoundCombos(e.code, false, e)
		cleanUpFinishedChords()
		clearChordTimeout()
	}
}

async function getKeyboardLayoutMap() {
	if ('keyboard' in navigator && typeof navigator.keyboard.getLayoutMap === 'function') {
		try {
			keyboardLayoutMap = await navigator.keyboard.getLayoutMap()
		} catch (e) {
			console.error('Could not get keyboard layout map.')
		}
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
		let key = keyboardLayoutMap.get(code)
		if (key === undefined) {
			key = code.replace(/^Key/, '')
			if (key.length === 1) {
				key = key.toLowerCase()
			}
		}
		return key
	} else {
		// the fallback position is to return the key string without the "Key" prefix, if present.
		// On US-style keyboards works 9 out of 10 cases.
		let key = code.replace(/^Key/, '')
		if (key.length === 1) {
			key = key.toLowerCase()
		}
		return key
	}
}

/**
 * Attach Simonsson event handlers to the window and get the current keyboard layout map.
 *
 */
async function init(options?: { chordTimeout?: number }) {
	if (!initialized) {
		CHORD_TIMEOUT = options?.chordTimeout ?? DEFAULT_CHORD_TIMEOUT

		window.addEventListener('keyup', keyUp, {
			passive: false,
			capture: true,
		})
		window.addEventListener('keydown', keyDown, {
			passive: false,
			capture: true,
		})
		window.addEventListener('layoutchange', () => {
			getKeyboardLayoutMap().catch(console.error)
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
	poison,
}

if (window) {
	//@ts-ignore this is to work around a bug in webpack DevServer
	window['Simonsson'] = Simonsson
}

export default Simonsson
