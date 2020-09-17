require('dotenv').config(); // Load all ENV vars

const path = require("path");
const webpack = require('webpack');

const entryPath = path.join(__dirname, "app", "index.js");
console.log('entryPath', entryPath);

module.exports = () => {

    // Used to pass ENV vars to webapp
    const envKeys = Object.keys(process.env).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(process.env[next]);
        return prev;
    }, {});

    return {
        entry: entryPath,
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            plugins: ['@babel/plugin-proposal-object-rest-spread']
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        "style-loader", // creates style nodes from JS strings
                        "css-loader", // translates CSS into CommonJS
                        "sass-loader" // compiles Sass to CSS, using Node Sass by default
                    ]
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.jsx']
        },
        output: {
            path: path.join(__dirname, "public"),
            filename: "bundle.js",
            publicPath: "/"
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            // add the plugin to your plugins array
            new webpack.DefinePlugin(envKeys)
        ],
        devServer: {
            hot: true,
            historyApiFallback: true,
            contentBase: path.join(__dirname, "public"),
            proxy: {
                '/api': 'http://127.0.0.1:3000',
            },
            port: 8081,
        }
    };
};
