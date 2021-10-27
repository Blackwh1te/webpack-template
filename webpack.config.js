const webpack = require('webpack')
const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

// const baseFolder = './src';
const jsExt = ['.js']

const pluginsCfg = {
  webpack: {
    terser: {
      parallel: true,
      extractComments: false
    },
  },
}
const plugins = [
  new HTMLWebpackPlugin({
    template: './index.html',
    minify: false,
  }),
  new CleanWebpackPlugin(),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'src/favicon.ico'),
        to: path.resolve(__dirname, 'build')
      }
    ]
  }),
  new MiniCssExtractPlugin({
    filename: 'styles/[name].css',
  })
]

module.exports = (env, argv) => {
  const {mode} = argv
  const isDev = mode === 'development'
  const isProd = !isDev
  const cfg = {
    mode,
    context: path.resolve(__dirname, 'src'),
    entry: './index.js',
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'bundle.js'
    },
    plugins,
    module: {
      rules: [
        {
          // test: /\.css$/,
          test: /\.(pcss|css)$/i,
          use: [
            // MiniCssExtractPlugin.loader,
            {
              loader: MiniCssExtractPlugin.loader,
              // options: {
              //   hmr: isDev,
              //   reloadAll: true
              // }
            },
            'css-loader'
          ]
        },
        {
          test: /\.(png|jpg|svg|gif)$/,
          type: 'asset/resource'
        },
        {
          test: /\.(ttf|woff|woff2|eot)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[hash][ext]',
          },
        },
      ]
    }
  }

  if (isDev) {
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  if (isProd) {
    return {
      ...cfg,
      optimization: {
        minimize: true,
        minimizer: [
          new CssMinimizerPlugin(),
          new TerserPlugin(pluginsCfg.webpack.terser),
        ],
      },
      resolve: {
        extensions: jsExt,
        alias: {
          '@models': path.resolve(__dirname, 'src/models'),
          '@': path.resolve(__dirname, 'src'),
        }
      },
    }
  } else {
    return {
      ...cfg,
      devServer: {
        port: 4200,
        hot: isDev
      },
      resolve: {
        extensions: jsExt,
        alias: {
          '@models': path.resolve(__dirname, 'src/models'),
          '@': path.resolve(__dirname, 'src'),
        }
      },
    }
  }
}
