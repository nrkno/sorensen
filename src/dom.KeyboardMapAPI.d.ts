declare module 'dom.keyboardMapAPI' {
	global {
		interface Navigator {
			keyboard: Keyboard
		}

		interface Keyboard {
			// Returns a Promise after enabling the capture of keypresses for any or all of the
			// keys on the physical keyboard.
			lock(): Promise<void>

			// Unlocks all keys captured by the lock() method and returns synchronously.
			unlock(): void

			// Returns a Promise that resolves with an instance of KeyboardLayoutMap which is a map-like object with
			// functions for retrieving the strings associated with specific physical keys
			getLayoutMap(): Promise<KeyboardLayoutMap>
		}

		interface KeyboardLayoutMap extends Map<string, string> {}
	}
}
