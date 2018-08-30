const webpack = require('webpack');
const nodeEnv = process.env.NODE_ENV || 'production';

module.exports = {
    devtool: 'source-map',
    entry: './src/app.js',
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['env']
                }
            }
        ]
    },
};
