Sørensen
=========

Sørensen is a modern, i18n-friendly hotkey library for the Web. By *modern*, we mean that it uses the
`KeyboardEvent.code` property for matching keys. That means that physical keys, as opposed to the
character produced by the key, is used for defining key bindings. Other `KeyboardEvent` properties tend to be very
flaky, because they can change depending on the Keyboard Mapping used. By *i18n-friendly*, we mean that it
provides utility methods that use the Keyboard Map API to convert between key `code` values and strings to be
presented to the user, such as converting a `KeyQ` value to `A` on a French keyboard, and then converting `Z` to `KeyW`.

Install
-------
Just install the library using your package manager of choice. Sørensen has no external dependenices, but it assumes
a reasonably modern browser, as it uses ES7 features.

```
npm i --save @sofie-automation/sorensen
```
or:

```
yarn add @sofie-automation/sorensen
```

Use
---

```javascript
import sorensen from '@sofie-automation/sorensen'
await sorensen.init()
sorensen.bind('Tab+KeyT', (e) => {
	// Sorensen extends the KeyboardEvent object with `comboChordCodes` and `comboCodes`
	console.log(e)
	e.preventDefault()
}, {
	ordered: true,
	exclusive: true
})
```

For a comprehensive list of possible KeyboardEvent code values and their corresponding keys see [KeyboardEvent: code values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values) on MDN.

Additionally, Sørensen allows special, "virtual" codes, for conveniance when using modifiers and the Enter key. These are:

| Virtual Code | Matching real Codes                                                               |
| ------------ | --------------------------------------------------------------------------------- |
| `Shift`      | `ShiftLeft`, `ShiftRight`                                                         |
| `Control`    | `ControlLeft`, `ControlRight`                                                     |
| `Ctrl`       | `ControlLeft`, `ControlRight`                                                     |
| `Alt`        | `AltLeft`, `AltRight`                                                             |
| `Meta`       | `MetaLeft`, `MetaRight`                                                           |
| `AnyEnter`   | `Enter`, `NumpadEnter`                                                            |
| `Option`     | `AltLeft`, `AltRight`                                                             |
| `Command`    | `OSLeft`, `OSRight`                                                               |
| `Windows`    | `OSLeft`, `OSRight`                                                               |
| `Accel`      | on a Mac-like system: `OSLeft`, `OSRight`, others: `ControlLeft`, `ControlRight`  |