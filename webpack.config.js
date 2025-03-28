const path = require('path')
const pkg = require('./package.json')
const env = require('yargs').argv.env

const libraryName = 'sorensen'
const libraryObjName = 'sorensen'

module.exports = {
	mode: env === 'dev' ? 'development' : 'production',
	entry: __dirname + '/src/index.ts',
	ignoreWarnings: [
		/require function is used in a way/
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: `${libraryName}.js`,
		library: libraryObjName,
		libraryTarget: 'umd',
		libraryExport: 'default',
		umdNamedDefine: true,
	},
	devtool: 'source-map',
	optimization:
		env === 'dev'
			? {
					minimize: false,
					moduleIds: 'named',
			  }
			: undefined,
	resolve: {
		modules: [path.resolve('./node_modules'), path.resolve('./src')],
		extensions: ['.js', '.ts', '.json'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'ts-loader',
					options: {
						transpileOnly: false,
					},
				},
			},
		],
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'test'),
			watch: true,
		},
		compress: true,
		port: 9000,
		open: env === 'test' ? false : ['/index.html'],
		// filename: 'index.js'
	},
}
