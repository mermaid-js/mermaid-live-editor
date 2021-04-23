const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const sveltePreprocess = require('svelte-preprocess');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
const tailwindcss = require('tailwindcss');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
  entry: {
    bundle: ['./src/main.js'],
  },
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
      '@mermaid': 'mermaid',
      //  "@mermaid": '@mermaid-js/mermaid'
    },
    extensions: ['.mjs', '.js', '.svelte', '.ttf'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  output: {
    path: __dirname + '/docs',
    filename: '[name].js',
    chunkFilename: '[name].[id].js',
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
            hotReload: true,
            preprocess: sveltePreprocess({
              sourceMap: !prod,
              postcss: {
                plugins: [
                  tailwindcss,
                  // require("autoprefixer"),
                  // require("postcss-nesting")
                ],
              },
            }),
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          /**
           * MiniCssExtractPlugin doesn't support HMR.
           * For developing, use 'style-loader' instead.
           * */
          prod ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.ttf$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  mode,
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new MonacoWebpackPlugin({
      languages: ['json'],
      features: ['!referenceSearch'],
    }),
  ],
  devtool: prod ? false : 'source-map',
};
