/// <referece path="dom.KeyboardMapAPI.ts" />

let initialized = false

let keyboardLayoutMap: KeyboardLayoutMap | undefined = undefined

type Note = string[]
type ComboChord = Note[]

interface EnchancedKeyboardEvent extends KeyboardEvent {
	comboChordCodes: ComboChord
	comboCodes: Note
	tag: any | undefined
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
let keyUpIgnoreKeys: string[] = []
let keyRepeatIgnoreKeys: string[] = []
let chordsInProgress: ChordInProgress[] = []
let keysDown: string[] = []

const DEFAULT_CHORD_TIMEOUT = 2000
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

	/**
	 * If this is enabled, events on modifier keys (keyup or keydown, depending on the binding direction), will cause
	 * a chord in progress to be poisoned and terminated.
	 *
	 * Default: false
	 */
	modifiersPoisonChord?: boolean

	/**
	 * Assign any variable to the binding. This will be returned to the event listener as a part of the event object.
	 */
	tag?: any | undefined

	/**
	 * Prevent default behavior on any partial matches and key repeats
	 * Default: true
	 */
	preventDefaultPartials?: boolean
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
	'OSLeft',
	'OSRight',
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
 * Bind a combo or set of combos to a given event listener.
 *
 * @param {(string | string[])} combo
 * @param {(e: EnchancedKeyboardEvent) => void} listener
 * @param {BindOptions} [options]
 */
function bind(combo: string | string[], listener: (e: EnchancedKeyboardEvent) => void, options?: BindOptions): void {
	if (!initialized) {
		throw new Error('Sørensen needs to be initialized before binding any combos.')
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

/**
 * Unbind a combo from a given event listener. If a `tag` is provided, only bindings with a strictly equal binding will
 * be removed
 *
 * @param {string} combo
 * @param {(e: EnchancedKeyboardEvent) => void} [listener]
 */
function unbind(combo: string, listener?: (e: EnchancedKeyboardEvent) => void, tag?: any): void {
	let bindingsToUnbind: ComboBinding[] = []
	let normalizedCombo = stringifyCombo(parseCombo(combo))

	bound.forEach((binding) => {
		if ((!listener || binding.listener === listener) && stringifyCombo(binding.combo) === normalizedCombo) {
			if (tag === undefined || tag === binding.tag) {
				bindingsToUnbind.push(binding)
			}
		}
	})

	bound = bound.filter((binding) => !bindingsToUnbind.includes(binding))
}

function noteIncludesKey(combo: Note, key: string): boolean {
	return (
		combo.includes(key) ||
		(key in INVERSE_VIRTUAL_ANY_POSITION_KEYS ? combo.includes(INVERSE_VIRTUAL_ANY_POSITION_KEYS[key]) : false)
	)
}

function matchNote(combo: Note, keysToMatch: string[], options: BindOptions, outIgnoredKeys: string[]): boolean {
	let match = true
	if (!!options?.ordered === false) {
		for (let i = 0; i < combo.length; i++) {
			const code = combo[i]
			if (code in VIRTUAL_ANY_POSITION_KEYS) {
				const alternatives = VIRTUAL_ANY_POSITION_KEYS[code]
				let anyMatch = false
				for (let j = 0; j < alternatives.length; j++) {
					if (keysToMatch.includes(alternatives[j])) {
						outIgnoredKeys.push(alternatives[j])
						anyMatch = true
						break
					}
				}
				if (!anyMatch) {
					match = false
				}
			} else {
				if (!keysToMatch.includes(code)) {
					match = false
				} else {
					outIgnoredKeys.push(code)
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
					const idx = keysToMatch.indexOf(alternatives[j], lastFound + 1)
					if (idx >= 0 && idx > lastFound) {
						anyMatch = true
						if (modifiersFirst && MODIFIER_KEYS.includes(alternatives[j])) {
							lastFoundModifier = idx
						} else {
							lastFound = idx
						}
						outIgnoredKeys.push(alternatives[j])
						break
					}
				}
				if (!anyMatch) {
					match = false
				}
			} else {
				// we can start at lastFound, anything before that has already been processed
				const idx = keysToMatch.indexOf(combo[i], lastFound + 1)
				if (idx < 0 || idx <= lastFound) {
					match = false
					break
				}
				if (modifiersFirst && MODIFIER_KEYS.includes(combo[i])) {
					lastFoundModifier = idx
				} else {
					lastFound = idx
				}
				outIgnoredKeys.push(combo[i])
			}

			// If modifiersFirst, do not allow modifiers after other keys
			if (modifiersFirst && lastFound >= 0 && lastFoundModifier > lastFound) {
				match = false
			}
		}
	}

	if ((options?.exclusive ?? true) && keysToMatch.length !== combo.length) {
		return false
	}

	return match
}

function isAllowedToExecute(binding: ComboBinding, e: KeyboardEvent): boolean {
	if (
		!binding.global &&
		(document.activeElement?.tagName === 'TEXTAREA' ||
			document.activeElement?.tagName === 'INPUT' ||
			document.activeElement?.shadowRoot)
	) {
		return false
	} else if (typeof binding.global === 'function') {
		if (!binding.global(e, stringifyCombo(binding.combo))) {
			return false
		}
	}
	return true
}

function callListenerIfAllowed(binding: ComboBinding, e: KeyboardEvent, note = 0) {
	if (!isAllowedToExecute(binding, e)) {
		return
	}

	binding.listener(
		Object.assign(e, {
			comboChordCodes: binding.combo,
			comboCodes: binding.combo[note],
			tag: binding.tag,
		})
	)
}

function insertKeyRepeatIgnoreKeys(binding: ComboBinding, e: KeyboardEvent, ignoredKeys: string[]) {
	if (binding.preventDefaultPartials !== false && isAllowedToExecute(binding, e)) {
		keyRepeatIgnoreKeys = [...keyRepeatIgnoreKeys, ...ignoredKeys]
	}
}

function visitBoundCombos(key: string, up: boolean, e: KeyboardEvent) {
	const chordsInProgressCount = chordsInProgress.length
	bound.forEach((binding) => {
		const ignoredKeys: string[] = []
		if (
			matchNote(binding.combo[0], up ? [...keysDown, key] : keysDown, binding, ignoredKeys) &&
			(binding.up || false) === up
		) {
			if (chordsInProgressCount === 0 || binding.exclusive === false) {
				if (binding.combo.length === 1) {
					// DEBUG: console.log(binding, chordsInProgress, binding.exclusive)
					callListenerIfAllowed(binding, e, 0)
				} else {
					// DEBUG: console.log('Begun chord:', binding, binding.exclusive)
					chordsInProgress.push({
						binding,
						note: 1,
					})
					keyUpIgnoreKeys = [...keyUpIgnoreKeys, ...keysDown]
				}
			}
		}
		insertKeyRepeatIgnoreKeys(binding, e, ignoredKeys)
	})
}

function visitChordsInProgress(key: string, up: boolean, e: KeyboardEvent) {
	const notInProgress: ChordInProgress[] = []
	// DEBUG: console.log(chordsInProgress)
	chordsInProgress.forEach((chord) => {
		if ((chord.binding.up || false) === up) {
			if (chord.binding.combo.length > chord.note) {
				const ignoredKeys: string[] = []
				if (
					matchNote(chord.binding.combo[chord.note], up ? [...keysDown, key] : keysDown, chord.binding, ignoredKeys)
				) {
					chord.note = chord.note + 1
					// DEBUG: console.log('Did match', chord)
					if (chord.binding.combo.length === chord.note) {
						// DEBUG: console.log('Executing', chord)
						callListenerIfAllowed(chord.binding, e, chord.note)
						return // do not set up a new timeout for the chord
					}
					keyUpIgnoreKeys = [...keyUpIgnoreKeys, ...keysDown]
				} else if (up && keyUpIgnoreKeys.includes(key)) {
					keyUpIgnoreKeys = keyUpIgnoreKeys.filter((ignoreKey) => ignoreKey !== key)
					// DEBUG: console.log('Ignored key ticked off', key, keyUpIgnoreKeys)
				} else if (
					!noteIncludesKey(chord.binding.combo[chord.note], key) &&
					(chord.binding.modifiersPoisonChord || !MODIFIER_KEYS.includes(key))
				) {
					// DEBUG: console.log('No match', chord)
					notInProgress.push(chord)
				}
				insertKeyRepeatIgnoreKeys(chord.binding, e, ignoredKeys)
			} else {
				// DEBUG: console.log('Too short', chord)
				notInProgress.push(chord)
			}
		} else {
			// DEBUG: console.log('Wrong direction: ', up)
		}
	})

	chordsInProgress = chordsInProgress.filter((chord) => !notInProgress.includes(chord))
}

function cleanUpFinishedChords() {
	chordsInProgress = chordsInProgress.filter((chord) => chord.note < chord.binding.combo.length)
}

function cleanUpKeyUpIgnoreKeys() {
	if (keysDown.length === 0) {
		keyUpIgnoreKeys.length = 0
	}
}

function cleanUpKeyRepeatIgnoreKeys(e?: KeyboardEvent) {
	if (keysDown.length === 0) {
		keyRepeatIgnoreKeys.length = 0
	}
	if (e) {
		keyRepeatIgnoreKeys = keyRepeatIgnoreKeys.filter((key) => key !== e.code)
	}
}

function preventAllDefaults(e: KeyboardEvent) {
	e.preventDefault()
	e.stopPropagation()
	e.stopImmediatePropagation()
}

let chordTimeout: NodeJS.Timeout | undefined = undefined
function setupChordTimeout() {
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
	setupChordTimeout()
	cleanUpKeyUpIgnoreKeys()
	cleanUpKeyRepeatIgnoreKeys(e)
	// DEBUG: console.log(chordsInProgress)
}

function keyDown(e: KeyboardEvent) {
	if (!e.repeat) {
		keysDown.push(e.code)
		// DEBUG: console.log(keysDown)

		visitChordsInProgress(e.code, false, e)
		visitBoundCombos(e.code, false, e)
		cleanUpFinishedChords()
		clearChordTimeout()
	}
	if (keyRepeatIgnoreKeys.includes(e.code)) {
		preventAllDefaults(e)
	}
}

function visibilityChange() {
	if ('visibilityState' in document && document.visibilityState === 'hidden') {
		// reset keysDown when user moved away from the page
		keysDown.length = 0
	}
}

async function getKeyboardLayoutMap() {
	if ('keyboard' in navigator && typeof navigator.keyboard.getLayoutMap === 'function') {
		try {
			keyboardLayoutMap = await navigator.keyboard.getLayoutMap()
		} catch (e) {
			console.error('Could not get keyboard layout map.', e)
		}
	}
}

function getPressedKeys(): string[] {
	return [...keysDown]
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
			key = code.replace(/^Key/, '').replace(/^Digit(?=\d+)/, '')
			if (key.length === 1) {
				key = key.toLowerCase()
			}
		}
		return key
	} else {
		// the fallback position is to return the key string without the "Key" prefix, if present.
		// On US-style keyboards works 9 out of 10 cases.
		let key = code.replace(/^Key/, '').replace(/^Digit(?=\d+)/, '')
		if (key.length === 1) {
			key = key.toLowerCase()
		}
		return key
	}
}

/**
 * Initialize Sørensen, get the current keyboard layout map and attach keyboard event listeners to
 * a root DOM node.
 *
 * Default:
 * * `chordTimeout: 2000` - time in milliseconds waiting for a new keypress in chords
 *
 * @param {{ chordTimeout?: number, shadowRoot?: any }} [options]
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
		window.addEventListener('layoutchange', getKeyboardLayoutMap)
		window.addEventListener('visibilitychange', visibilityChange)
		await getKeyboardLayoutMap()

		bound = []
		keysDown = []
		chordsInProgress = []

		initialized = true
	} else {
		throw new Error('Sørensen already initialized.')
	}
}

/**
 * Remove all Sørensen event handlers from the window.
 *
 */
async function destroy() {
	if (initialized) {
		window.removeEventListener('keyup', keyUp)
		window.removeEventListener('keydown', keyDown)
		window.removeEventListener('layoutchange', getKeyboardLayoutMap)
		window.removeEventListener('visibilitychange', visibilityChange)

		initialized = false
	} else {
		throw new Error('Sørensen already destroyed.')
	}
}

const sorensen = {
	init,
	destroy,
	getCodeForKey,
	getKeyForCode,
	getPressedKeys,
	bind,
	unbind,
	poison,
}

if (window) {
	//@ts-ignore this is to work around a bug in webpack DevServer
	window['sorensen'] = sorensen
}

export default sorensen
