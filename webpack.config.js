const path = require('path')
const pkg = require('./package.json')
const env = require('yargs').argv.env

const libraryName = pkg.name
const libraryObjName = 'Simonsson'

module.exports = {
	mode: env === 'dev' ? 'development' : 'production',
	entry: __dirname + '/src/index.ts',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: `${libraryName}.js`,
		libraryTarget: 'umd',
		libraryExport: 'default',
		umdNamedDefine: false,
	},
	devtool: 'source-map',
	optimization: env === 'dev'
		? {
			minimize: false,
			moduleIds: 'named',
		}
		: undefined,
	resolve: {
		modules: [path.resolve('./node_modules'), path.resolve('./src')],
		extensions: ['.js', '.ts', '.json']
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'ts-loader',
					options: {
						transpileOnly: false
					}
				}
			}
		]
	},
	devServer: {
		contentBase: [
			path.join(__dirname, 'test'),
		],
		compress: true,
		port: 9000,
		open: env === 'test' ? false : true,
		openPage: 'index.html',
		watchContentBase: true,
		filename: 'index.js'
	},
}
