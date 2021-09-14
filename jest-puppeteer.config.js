module.exports = {
	launch: {
		dumpio: true,
		headless: process.env.HEADLESS === 'true',
		product: 'chrome',
	},
	server: {
		command: 'yarn webpack serve --env test',
		port: 9000,
	},
	browserContext: 'default',
}
