/*
 * @Author: Eleven 
 * @Date: 2017-12-11 10:51:03 
 * @Last Modified by: Eleven
 * @Last Modified time: 2018-07-13 10:24:19
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')

const ROOT_PATH = path.resolve(__dirname);
const SRC_PATH = path.resolve(ROOT_PATH, 'src');
const DIST_PATH = path.resolve(ROOT_PATH, 'dist');

let isProd = process.env.NODE_ENV === 'production' ? true : false

let config = {
    entry: {
        index: './src/index.js'
    },
    output: {
        path: DIST_PATH,
        filename: 'js/[name].js',
        publicPath: '/'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.json', '.css', '.less'],
        alias: {
            'src': SRC_PATH,
            'zepto': path.resolve(__dirname, './src/js/lib/zepto.min.js')
        }
    },
    devServer: {
        contentBase: './dist',
        host: 'localhost',
        openPage: 'index.html', // 指定默认启动浏览器时打开的页面
        port: 8686, // 默认8080
        inline: true, // 可以监控js变化
        hot: true, // 热启动
        open: true // 自动打开浏览器
    },
    module: {
        rules: [
            // 处理less/css文件(从右到左依次调用less、css、style加载器，前一个的输出是后一个的输入)
            {
                test: /\.(less|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader', 'postcss-loader', 'less-loader'
                ]
            },
            /**
             * es6转码
             *  (npm install babel-core babel-loader babel-preset-env babel-plugin-transform-runtime babel-runtime babel-preset-stage-2 -D)
             */
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: SRC_PATH,
                exclude: /node_modules/ // 排除 node_modules中的文件，否则所有外部库都会通过babel编译，将会降低编译速度
            },
            // html中引用的静态资源在这里处理,默认配置参数attrs=img:src,处理图片的src引用的资源.
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    // 除了img的src,还可以继续配置处理更多html引入的资源(不能在页面直接写路径,又需要webpack处理怎么办?先require再js写入).
                    attrs: ['img:src', 'img:data-src', 'audio:src', 'source:src'],
                    minimize: false,
                    removeComments: true,
                    collapseWhitespace: false
                }
            },
            // 处理图片(雷同file-loader，更适合图片)
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000, // 小图转成base64
                    name: 'assets/img/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'assets/media/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'assets/fonts/[name].[hash:7].[ext]'
                }
            },
            // zepto未模块化(是AMD规范,不可以),借助loader处理成webpack需要的模块化规范
            {
                // require.resolve()是nodejs用来查找模块位置的发放,返回模块的入口文件
                test: require.resolve('./src/js/lib/zepto.min.js'),
                loader: 'exports-loader?window.Zepto!script-loader'
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'zepto',
            Zepto: 'zepto'
        }),
        new HtmlWebpackPlugin({
            title: '2017味全校园招聘',
            filename: './index.html',
            template: './src/index.html',
            inject: 'body',
            hash: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css'
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
}

// 生产环境
if (isProd) {
    config.devtool = false
    config.plugins.push(
        new CleanPlugin(['dist']),
        new UglifyJsPlugin({
            cache: true,
            parallel: true,
            sourceMap: false
        })
    )
}

module.exports = config