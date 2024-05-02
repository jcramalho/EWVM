const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
const { library } = require('webpack');

module.exports = {
    mode: 'production',
    entry: './editor/index.js',
    output: {
		library: 'CodeEditor',
        filename: 'editor.js',
        path: path.resolve(__dirname, 'public/monaco'),
    },
    module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				type: 'asset/resource'
			}
		]
	},
    plugins: [
        new MonacoEditorWebpackPlugin(),
    ],
};
