const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // development or production
	mode: 'development', 
  entry: `./src/js/webpack.js`,

	output: {
    path: path.join(__dirname, 'dest/assets/js'),
    filename: 'main.js',
	},
	optimization: {
		minimizer: [
			// jsCompress
			new TerserPlugin({
				extractComments: true, //trueでコメント削除
				terserOptions: {
					compress: {
						drop_console: false, // trueでconsole.log削除
					},
				},
			}),
		],
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env',
							],
						},
					},
				],
			},
		],
	},
};

