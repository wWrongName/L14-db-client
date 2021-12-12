const path = require('path')
const outPath = path.resolve(__dirname, 'public')
// const webpack = require("webpack")

module.exports = {
    entry : {
        app : [
            path.resolve(__dirname, './src/js/root.js'),
        ]
    },
    output : {
        path : outPath,
        filename : 'db.webpack.js'
    },
    module : {
        rules : [
            {
                test : /\.jsx?$/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-env',
                        '@babel/react',{
                            'plugins': ['@babel/plugin-proposal-class-properties']
                        }
                    ]
                }
            },
            {
                test : /\.css$/,
                use : ['style-loader', 'css-loader']
            },
            {
                test : /\.(png|jpg|ico|svg|jpeg|woff|ttf|eot|otf)$/,
                use : 'file-loader'
            }
        ]
    },
    plugins: [
    ],
    devtool: 'inline-source-map',
    mode : 'development',
    devServer : {
        port : 1234
    }
}
