const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const srcpath = path.join(__dirname, 'src');
const distpath = path.join(__dirname, 'dist');
module.exports = {
    mode: 'development',
    entry: {
        index: path.join(srcpath, 'index.js')
    },
    output: {
        filename: 'bundle.[hash:8].js',
        path: distpath
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: ['babel-loader'],
            exclude: /node_modules/
        }, 
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
            include: srcpath
        }]
    },
    plugins: [new HtmlWebpackPlugin({
            template: path.join(srcpath, 'index.html'),
            favicon: path.join(srcpath, 'favicon.ico'),
            filename: 'index.html'
        }),
        new CleanWebpackPlugin(),
    ],
    devServer: {
        port: 3000,
        open: true,
        contentBase: distpath
    }
}