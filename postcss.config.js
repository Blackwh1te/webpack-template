const functions = require('./src/styles/appFunctions')

module.exports = (env) => {
  const plugins = {
    'postcss-easy-import': {},
    'postcss-functions': {
      functions
    },
    'postcss-mixins': {},
    'postcss-for': {},
    'postcss-nested': {},
    'postcss-modules-extend-rule/pre': {
      onFunctionalSelector: 'warn'
    },
    'postcss-custom-media': {},
    'postcss-color-function': {},
    'postcss-flexbugs-fixes': {},
    'postcss-input-style': {},
    'postcss-gradient-transparency-fix': {},
    'postcss-100vh-fix': {},
    'postcss-momentum-scrolling': ['scroll'],
    'postcss-strip-inline-comments': {},
    'postcss-clamp': {},
  }
  if (env.env === 'production') {
    plugins['autoprefixer'] = {}
  }
  return {plugins}
}
