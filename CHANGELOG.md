# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.4.2](https://github.com/nrkno/sorensen/compare/v1.4.1...v1.4.2) (2022-05-05)


### Bug Fixes

* `preventDefaultDown` does not respect `global` flag ([#3](https://github.com/nrkno/sorensen/issues/3)) ([fd71948](https://github.com/nrkno/sorensen/commit/fd719486679d0963df562c238658e09d12eea2a8))

### [1.4.1](https://github.com/nrkno/sorensen/compare/v1.4.0...v1.4.1) (2022-04-08)

## [1.4.0](https://github.com/nrkno/sorensen/compare/v1.3.2...v1.4.0) (2022-04-05)


### Features

* add `preventDefaultDown` option - prevent default behavior on `down` events for an `up` Combo. ([#2](https://github.com/nrkno/sorensen/issues/2)) ([d68b968](https://github.com/nrkno/sorensen/commit/d68b96871ee82a2578d839393969047f3152834b))

### [1.3.2](https://github.com/nrkno/sorensen/compare/v1.3.1...v1.3.2) (2022-03-11)


### Bug Fixes

* AnyEnter doesn't fire on NumpadEnter ([#1](https://github.com/nrkno/sorensen/issues/1)) ([6fb3917](https://github.com/nrkno/sorensen/commit/6fb3917718d1a3333ffbe1da8ae728add179a6d6))

### [1.3.1](https://github.com/nrkno/sorensen/compare/v1.3.0...v1.3.1) (2022-03-02)


### Bug Fixes

* clear `getPressedKeys()` array before sending out keycancel events ([57c47e1](https://github.com/nrkno/sorensen/commit/57c47e1d6dd76299917738d203479ed7226f1d32))

## [1.3.0](https://github.com/nrkno/sorensen/compare/v1.2.0...v1.3.0) (2022-02-16)


### Features

* send 'keycancel' event when it's not possible to track pressed keys ([e227f0f](https://github.com/nrkno/sorensen/commit/e227f0f526b6dad7c48124b9ce1afb9b70ae4354))

## [1.2.0](https://github.com/nrkno/simonsson/compare/v1.1.2...v1.2.0) (2021-09-14)


### Features

* simple fallback for getCodeForKey ([cecda62](https://github.com/nrkno/simonsson/commit/cecda62a717db9b02d7a2f4f09bb900efb51f581))


### Bug Fixes

* reset hotkeys on window blur ([abcda0a](https://github.com/nrkno/simonsson/commit/abcda0a660b6fc02f23d06746de04749d91982a0))

### [1.1.2](https://github.com/nrkno/simonsson/compare/v1.1.1...v1.1.2) (2021-08-19)


### Bug Fixes

* package tarball to contain types ([ea32551](https://github.com/nrkno/simonsson/commit/ea3255151ce402808419f856a20017ab6644f74d))

### [1.1.1](https://github.com/nrkno/simonsson/compare/v1.1.0...v1.1.1) (2021-08-19)

## [1.1.0](https://github.com/nrkno/simonsson/compare/v0.0.1-0...v1.1.0) (2021-08-19)


### Features

* add Accel virtual modifier ([fecfecb](https://github.com/nrkno/simonsson/commit/fecfecb066b73c32696395811e5fdc5597092496))
* add chord timeout ([7ab80e5](https://github.com/nrkno/simonsson/commit/7ab80e510acd214426b1af39ba3d6b5e27fa2e50))
* add events for layoutchange ([a938fba](https://github.com/nrkno/simonsson/commit/a938fbaa390724cc365867762fa078f02d20dbdb))
* add getPressedKeys() function ([f20a9d8](https://github.com/nrkno/simonsson/commit/f20a9d8510f5dd416439dd2b3ee83ba7e16bba89))
* add prepend mode for bindings ([1d511f4](https://github.com/nrkno/simonsson/commit/1d511f4da31bc4e6a6c3459c8a8f697027d2ee28))
* by default, prevent default on partial hits ([cc2b9f9](https://github.com/nrkno/simonsson/commit/cc2b9f9559fb51994846394df2a5db6cd2bb4f7d))
* getKeyForCode tests ([84d37fb](https://github.com/nrkno/simonsson/commit/84d37fb368da844289fcb64265e702b94a8bfc00))
* global hotkeys ([671296f](https://github.com/nrkno/simonsson/commit/671296f9c4dc71bb7172c9b65cad75016b6a2712))
* initial cypress tests ([47a25c9](https://github.com/nrkno/simonsson/commit/47a25c931e746f784fd4b0071c777be4bbb72ff8))
* keyup handling ([69e6774](https://github.com/nrkno/simonsson/commit/69e6774145ce8064096f0d7c3a37614b11fb64f2))
* prepare to release first version ([268cc2c](https://github.com/nrkno/simonsson/commit/268cc2c4bbe622240e166fd48f592e9cb03aaae4))
* remove cypress, set up jest+puppeteer for automated tests ([836ef72](https://github.com/nrkno/simonsson/commit/836ef7285ee9fc3e1e4753ae7ad3729443ae6e50))


### Bug Fixes

* chords, ordered combos ([9a82417](https://github.com/nrkno/simonsson/commit/9a824179a4e46f757aa19e349e9d7701378e6326))
* create a fallback for Digit keys in getKeyForCode ([73da980](https://github.com/nrkno/simonsson/commit/73da9809ba196bb79adef852fbb3a18f1a25d611))
* layoutchange event, combo poisoning ([249aa84](https://github.com/nrkno/simonsson/commit/249aa847ff360f46e552a17e4016a9cff1dcbeb4))
* resolve stack overflow on stopImmediatePropagation() ([e9d8a61](https://github.com/nrkno/simonsson/commit/e9d8a61e942a96d143e560eb1f31f2bef2947b89))
* update docs ([dc19256](https://github.com/nrkno/simonsson/commit/dc19256bb3d5163b03bb72e42868982cdbd9cd8f))

## [1.0.0](https://github.com/nrkno/simonsson/compare/v0.0.1-0...v1.0.0) (2021-08-19)


### Features

* add Accel virtual modifier ([fecfecb](https://github.com/nrkno/simonsson/commit/fecfecb066b73c32696395811e5fdc5597092496))
* add chord timeout ([7ab80e5](https://github.com/nrkno/simonsson/commit/7ab80e510acd214426b1af39ba3d6b5e27fa2e50))
* add events for layoutchange ([a938fba](https://github.com/nrkno/simonsson/commit/a938fbaa390724cc365867762fa078f02d20dbdb))
* add getPressedKeys() function ([f20a9d8](https://github.com/nrkno/simonsson/commit/f20a9d8510f5dd416439dd2b3ee83ba7e16bba89))
* add prepend mode for bindings ([1d511f4](https://github.com/nrkno/simonsson/commit/1d511f4da31bc4e6a6c3459c8a8f697027d2ee28))
* by default, prevent default on partial hits ([cc2b9f9](https://github.com/nrkno/simonsson/commit/cc2b9f9559fb51994846394df2a5db6cd2bb4f7d))
* getKeyForCode tests ([84d37fb](https://github.com/nrkno/simonsson/commit/84d37fb368da844289fcb64265e702b94a8bfc00))
* global hotkeys ([671296f](https://github.com/nrkno/simonsson/commit/671296f9c4dc71bb7172c9b65cad75016b6a2712))
* initial cypress tests ([47a25c9](https://github.com/nrkno/simonsson/commit/47a25c931e746f784fd4b0071c777be4bbb72ff8))
* keyup handling ([69e6774](https://github.com/nrkno/simonsson/commit/69e6774145ce8064096f0d7c3a37614b11fb64f2))
* prepare to release first version ([268cc2c](https://github.com/nrkno/simonsson/commit/268cc2c4bbe622240e166fd48f592e9cb03aaae4))
* remove cypress, set up jest+puppeteer for automated tests ([836ef72](https://github.com/nrkno/simonsson/commit/836ef7285ee9fc3e1e4753ae7ad3729443ae6e50))


### Bug Fixes

* chords, ordered combos ([9a82417](https://github.com/nrkno/simonsson/commit/9a824179a4e46f757aa19e349e9d7701378e6326))
* create a fallback for Digit keys in getKeyForCode ([73da980](https://github.com/nrkno/simonsson/commit/73da9809ba196bb79adef852fbb3a18f1a25d611))
* layoutchange event, combo poisoning ([249aa84](https://github.com/nrkno/simonsson/commit/249aa847ff360f46e552a17e4016a9cff1dcbeb4))
* resolve stack overflow on stopImmediatePropagation() ([e9d8a61](https://github.com/nrkno/simonsson/commit/e9d8a61e942a96d143e560eb1f31f2bef2947b89))

### 0.0.1-0 (2021-07-21)


### Features

* add support for "virtual" any position modifiers ([c5e5b6a](https://github.com/nrkno/simonsson/commit/c5e5b6a0e45229608c2f6be7203cfe417708f063))
* initial implementation, some features still lacking ([ab335b9](https://github.com/nrkno/simonsson/commit/ab335b9b84505f104c84c33c94df494ceac39e3c))
