const path = require('path')

module.exports = {
    entry: './assets/index.tsx', // path to our input file
    output: {
        filename: 'index-bundle.js', // output bundle file name
        path: path.resolve(__dirname, './static') // path to our Django static directory
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: { presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'] }
            }
        ]
    }
}
