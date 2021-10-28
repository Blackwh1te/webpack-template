const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const StylelintPlugin = require('stylelint-webpack-plugin')
const fs = require('fs')

const folders = ['fonts', 'icons', 'json', 'videos', 'images']
const jsExt = ['.js']

const pluginsCfg = {
  webpack: {
    copy: {
      patterns: folders.map((folder) => {
        return {
          from: path.resolve(__dirname, './src/' + folder),
          to: './' + folder,
          noErrorOnMissing: true
        }
      }),
    },
    stats: {
      assets: true,
      children: false,
      warnings: true,
      usedExports: true
    },
    terser: {
      parallel: true,
      extractComments: false
    },
    chunks: {
      maxChunks: 1,
    }
  },
  miniCSS: {
    filename: 'styles/[name].css',
  },
  ejs: [
    {
      filePath: path.resolve(__dirname, './src/pages'),
      outputPath: './',
      inject: true
    },
    {
      filePath: path.resolve(__dirname, './src/templates'),
      outputPath: './templates',
      inject: false
    }
  ],
  svgo: {
    configFile: false,
    plugins: [
      {
        name: 'removeTitle',
        active: true
      },
      {
        name: 'convertColors',
        active: true,
        params: {
          shorthex: true
        }
      },
      {
        name: 'convertPathData',
        active: false
      }
    ]
  },
  prettyHTML: {
    'indent_size': 2,
    'indent_char': ' ',
    'indent_with_tabs': false,
    'editorconfig': false,
    'eol': '\n',
    'end_with_newline': false,
    'indent_level': 0,
    'preserve_newlines': true,
    'max_preserve_newlines': 1,
    'space_in_paren': false,
    'space_in_empty_paren': false,
    'jslint_happy': false,
    'space_after_anon_function': false,
    'space_after_named_function': false,
    'brace_style': 'collapse',
    'unindent_chained_methods': false,
    'break_chained_methods': false,
    'keep_array_indentation': false,
    'unescape_strings': false,
    'wrap_line_length': 0,
    'e4x': false,
    'comma_first': false,
    'operator_position': 'before-newline',
    'indent_empty_lines': false,
    'templating': ['auto']
  },
  svgSprite: {
    plainSprite: true
  },
  webp: {
    config: [
      {
        test: /\.(jpe?g|png|gif)$/i,
        options: {
          quality: 100
        },
      }
    ],
    overrideExtension: false
  },
  imageMin: {
    test: /\.(jpe?g|png|gif)$/i,
    optipng: {
      optimizationLevel: 4
    },
    jpegtran: {
      progressive: true
    }
  }
}

const modulesCfg = {
  js: {
    test: /\.(js|jsx|tsx|ts)$/,
    exclude: /(node_modules)/,
    use: ['babel-loader']
  },
  ejs: {
    test: /\.ejs$/,
    use: ['ejs-compiled-loader']
  },
  css: {
    test: /\.(pcss|css)$/i,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          sourceMap: true,
          url: false
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            config: path.resolve(__dirname, 'postcss.config.js'),
          }
        },
      },
    ]
  },
  imagesAndFonts: {
    test: /\.(png|jpg|gif|svg)($|\?)|\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)/,
    exclude: path.resolve(__dirname, './src/icons/'),
    use: [{
      loader: 'file-loader',
      options: {
        name: '[path][name].[ext]'
      }
    }],
  },
  svg: {
    test: /\.svg$/,
    exclude: path.resolve(__dirname, './src/fonts/'),
    use: [
      {
        loader: 'svg-sprite-loader',
        options: {
          extract: true,
          spriteFilename: 'icons.svg',
        }
      },
      {
        loader: 'svgo-loader',
        options: pluginsCfg.svgo
      }
    ]
  },
}

module.exports = (env, argv) => {
  const {mode} = argv
  const isDev = mode === 'development'
  const isProd = !isDev
  const cfg = {
    mode,
    entry: './src/app.js',
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'bundle.js'
    },
    target: 'web',
    performance: {
      hints: false
    }
  }
  const {js, ejs, css, imagesAndFonts, svg} = modulesCfg

  if (isProd) {
    const generateHtmlPlugins = (files) => {
      const htmlPlugins = []
      files.map(config => {
        const {filePath, outputPath, inject} = config
        const templateFiles = fs.readdirSync(path.resolve(__dirname, filePath))
        templateFiles.map(item => {
          const parts = item.split('.')
          const name = parts[0]
          const extension = parts[1]
          const _filePath = path.resolve(__dirname, `${filePath}/${name}.${extension}`)
          htmlPlugins.push(
            new HtmlWebpackPlugin({
              filename: `${outputPath}/${name}.html`,
              template: `!!ejs-compiled-loader!${_filePath}`,
              scriptLoading: 'blocking',
              minify: false,
              inject
            })
          )
        })
      })
      return htmlPlugins
    }
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    const ImageminPlugin = require('imagemin-webpack-plugin').default
    const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin')
    const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
    const TerserPlugin = require('terser-webpack-plugin')
    const BeautifyHtmlWebpackPlugin = require('beautify-html-webpack-plugin')
    const htmlPlugins = generateHtmlPlugins(pluginsCfg.ejs)

    return {
      ...cfg,
      stats: pluginsCfg.webpack.stats,
      module: {
        rules: [js, ejs, css, imagesAndFonts, svg],
      },
      plugins: [
        new MiniCssExtractPlugin(pluginsCfg.miniCSS),
        new webpack.optimize.LimitChunkCountPlugin(pluginsCfg.webpack.chunks),
        new webpack.ProvidePlugin({}),
        ...htmlPlugins,
        new BeautifyHtmlWebpackPlugin(pluginsCfg.prettyHTML),
        new CopyWebpackPlugin(pluginsCfg.webpack.copy),
        new ESLintPlugin(pluginsCfg.esLint),
        new StylelintPlugin({...pluginsCfg.styleLint, failOnError: true, failOnWarning: true}),
        new ImageminPlugin(pluginsCfg.imageMin),
        new ImageminWebpWebpackPlugin(pluginsCfg.webp),
        new SpriteLoaderPlugin(pluginsCfg.svgSprite),
        new BundleAnalyzerPlugin()
      ],
      optimization: {
        minimize: true,
        minimizer: [
          new CssMinimizerPlugin(),
          new TerserPlugin(pluginsCfg.webpack.terser),
        ],
      }
    }
  } else {
    const pages = pluginsCfg.ejs.map(({filePath, inject, outputPath}) => {
      const files = fs.readdirSync(filePath).filter(item => item.endsWith('.ejs'))
      const instances = new Set()
      files.forEach((name) => {
        const _filePath = path.resolve(__dirname, `${filePath}/${name.split('.')[0]}.${name.split('.')[1]}`)
        const instance = new HtmlWebpackPlugin({
          filename: `${outputPath}/${name.split('.')[0]}.html`,
          template: `!!ejs-compiled-loader!${_filePath}`,
          id: name,
          inject
        })
        instances.add(instance)
      })
      return [...instances]
    }).flat()
    svg.use = svg.use.slice(0, -1)
    css.use[0] = 'style-loader'
    return {
      ...cfg,
      stats: {
        ...pluginsCfg.webpack.stats,
        usedExports: false
      },
      module: {
        rules: [js, ejs, css, imagesAndFonts, svg],
      },
      plugins: [
        new MiniCssExtractPlugin(pluginsCfg.miniCSS),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({}),
        ...pages,
        new CopyWebpackPlugin(pluginsCfg.webpack.copy),
        new SpriteLoaderPlugin(pluginsCfg.svgSprite),
        new ESLintPlugin(pluginsCfg.esLint),
        new StylelintPlugin(pluginsCfg.styleLint)
      ],
      devServer: {
        static: {
          directory: './build',
        },
        watchFiles: './src/**/*.ejs',
        historyApiFallback: true,
        port: 'auto',
        hot: true,
        open: true,
        compress: false,
        onBeforeSetupMiddleware(devServer) {
          const {app} = devServer
          app.post('*', (req, res) => {
            const {originalUrl} = req
            res.redirect(originalUrl)
          })
        },
      },
      devtool: 'source-map',
      resolve: {
        extensions: jsExt,
        modules: ['node_modules'],
        alias: {
          'ScrollMagic': path.resolve('node_modules', 'scrollmagic'),
          'debug.addIndicators': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js')
        },
      },
    }
  }
}
