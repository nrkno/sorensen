Simonsson
=========

Simonsson is a modern, i18n-friendly hotkey library for the Web. By *modern*, we mean that it can use the
`KeyboardEvent.code` property for matching keys. That means that physical keys, as opposed to the
character produced by the key, is used for defining key bindings. By *i18n-friendly*, we mean that it
provides utility methods that use the Keyboard Map API to convert between key `code` values and strings to be
presented to the user, such as converting a `KeyQ` value to `A` on a French keyboard, and then converting `Z` to `KeyW`.

Install
-------
Just install the library using your package manager of choice. Simonsson has no external dependenices, but it assumes
a reasonably modern browser, as it uses ES7 features.

```
npm i --save @nrkno/simonsson
```
or:

```
yarn add @nrkno/simonsson
```

Use
---

```
import Simonsson from '@nrkno/simonsson'
await Simonsson.init()
Simonsson.bind('Tab+KeyT', (e) => {
	// Simonsson extends the KeyboardEvent object with `comboChordCodes` and `comboCodes`
	console.log(e)
	e.preventDefault()
}, {
	ordered: true,
	exclusive: trues
})
```