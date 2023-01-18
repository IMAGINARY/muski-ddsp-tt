const path = require('path');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const PACKAGE = require('./package.json');

module.exports = {
  entry: {
    default: './src/js/main.js',
  },
  output: {
    filename: `${PACKAGE.name}-${PACKAGE.version}.js`,
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: './.babel-cache',
            presets: [
              // Note: to debug Babel, the cache has to be disabled or emptied
              ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3, debug: false }],
            ],
          },
        },
      },
      {
        test: /\.(scss|css)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '',
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: `${PACKAGE.name}-${PACKAGE.version}.css`,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/html/index.html'),
      filename: path.resolve(__dirname, 'index.html'),
      chunks: ['default'],
      minify: true,
    }),
    new CleanWebpackPlugin({
      // todo: temporary measure. Dev builds should be done without hashes in the filename.
      cleanOnceBeforeBuildPatterns: ['**/*'],
    }),
  ],
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
    },
  },
  // Todo: change the source map settings for production builds
  devtool: 'source-map',
};
