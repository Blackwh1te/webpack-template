import 'reset-css'

import('./vars.pcss')
import('./media.pcss')
import('./utils.pcss')
import('./animations.pcss')
import('./icons.pcss')
import('./globals.pcss')
import('./fonts.pcss')
import('./forms.pcss')

const requireAll = (requireContext) => {
  return requireContext.keys().map(requireContext)
}

// requireAll(require.context('./typo', false, /.css$/))
// requireAll(require.context('./blocks', false, /.css$/))
requireAll(require.context('./typo', /\.(pcss|css)$/i));
requireAll(require.context('./blocks', /\.(pcss|css)$/i));
