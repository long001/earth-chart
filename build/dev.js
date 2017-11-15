const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { SRC_PATH } = require('./utils')
const base = require('./base')

const dev = {
  devServer: {
    contentBase: SRC_PATH,
    compress: false,
    //webpack 开发服务器 在这里配置
    proxy:{
        '/papp/':'http://ca-core-stg.paic.com.cn'
    },
    port: 8080,
    historyApiFallback: true
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: [ 'style-loader', 'css-loader' ],
      },
	  {
	  	test: /\.scss$/,
          use:[
              {
                loader:'style-loader'
              },
              {
                loader:'css-loader'
              },
              {
                loader:'sass-loader'
              }
          ]
	  }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development")
      }
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(SRC_PATH, 'index.html')
    }),
  ]
}

module.exports = merge.smart(base, dev)
