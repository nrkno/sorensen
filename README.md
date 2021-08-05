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
npm i --save sorensen
```
or:

```
yarn add sorensen
```

Use
---

```javascript
import sorensen from 'sorensen'
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