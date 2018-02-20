const MinifyPlugin = require("babel-minify-webpack-plugin");
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
var CompressionPlugin = require('compression-webpack-plugin');

const frontend = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.jsx$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/react'],
                        plugins: [ "transform-class-properties" ]
                    }
                },
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff",
                options: {
                    outputPath: 'build/static/'
                }  
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader",
                options: {
                    outputPath: 'build/static/'
                }  
            }
        ]
    },
    entry: './frontend_src/app.jsx',
    devtool: 'source-map',
    output: {
        filename: 'build/static/app.js'
    },
    plugins: [
        // new webpack.DefinePlugin({
        //     'process.env': {
        //         'NODE_ENV': JSON.stringify('production')
        //     }
        // }),
        // new webpack.optimize.UglifyJsPlugin(),
        // new webpack.optimize.AggressiveMergingPlugin(),
        // new CompressionPlugin({
        //     asset: "[path].gz[query]",
        //     algorithm: "gzip",
        //     test: /\.jsx$|\.js$|\.css$|\.html$/,
        //     threshold: 10240,
        //     minRatio: 0.8
        // })
        //new MinifyPlugin({}, {})
    ]
};

const backend = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    devtool: 'source-map',
    entry: './backend_src/index.js',
    output: {
        filename: 'build/index.js'
    },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    externals: [nodeExternals()],
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        //new webpack.optimize.UglifyJsPlugin(),
        //new webpack.optimize.AggressiveMergingPlugin()
        //new MinifyPlugin({}, {})
    ]
};

module.exports = [
    frontend,
    backend
]