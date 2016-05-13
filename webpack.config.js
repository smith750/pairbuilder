var webpack = require('webpack');
module.exports = {
    entry: {
        signup: "./scripts/signup.jsx",
        participantList: "./scripts/participants.jsx"
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    output: {
        path: __dirname + '/views/build',
        filename: "[name].bundle.js"
    },
    module: {
        loaders: [
            { loader: "babel-loader", test: /\.jsx$/, query: { plugins: ['transform-runtime'], presets: ['es2015','stage-0','react'] }, exclude: /node_modules/ }
        ]
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ]

}