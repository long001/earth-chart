const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const {SRC_PATH} = require('./utils')
const base = require('./base')
base.output.publicPath = './'

const prod = {
	module: {
		loaders: [
			{
				test: /\.css$/,
				loader: 'url-loader',
				options: {
					limit:1024,
					name: path.join('[name].css')
				}
			},
			{
				test: /\.scss$/,
				loaders: ExtractTextPlugin.extract([ 'css-loader', 'sass-loader' ]),
			}
		]
	},
	plugins: [
		// new webpack.optimize.CommonsChunkPlugin({ name: 'common', filename: 'common.js' }),
		new ExtractTextPlugin("styles.[hash:7].css"),
		new OptimizeCSSPlugin(),
		new HtmlWebpackPlugin({
			template: path.resolve(SRC_PATH, 'index.html')
		}),
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production")
			}
		}),
		new UglifyJSPlugin()
	]
}

module.exports = merge.smart(base, prod)
