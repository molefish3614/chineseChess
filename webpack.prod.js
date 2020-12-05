const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const srcpath = path.join(__dirname, 'src');
const distpath = path.join(__dirname, 'dist');
module.exports = {
    mode: 'production',
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
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
                include: srcpath
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(srcpath, 'index.html'),
            favicon: path.join(srcpath, 'favicon.ico'),
            filename: 'index.html',
            inject: true,
            title: '自制象棋',
            minify: {
                removeComments: true
            },
            chunks: ['index', 'common', 'vendor']
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash:8].css'
        })
    ],
    optimization: {
        minimizer: [
            new TerserJSPlugin({}),
            new OptimizeCSSPlugin({}),
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: {
                        drop_debugger: true,
                        drop_console: true
                    }
                }
            })
        ],
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    name: 'vendor',
                    priority: 1,
                    test: /node_modules/,
                    minSize: 10 * 1024,
                    minChunks: 1
                },
                common: {
                    name: 'common',
                    priority: 0,
                    minSize: 5 * 1024,
                    minChunks: 2
                }
            }
        }
    },
    devServer: {
        port: 3000,
        open: true,
        contentBase: distpath
    }
}