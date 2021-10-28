import 'ress'

import('./vars.pcss')
import('./media.pcss')
import('./utils.pcss')
import('./animations.pcss')
import('./icons.pcss')
import('./globals.pcss')
import('./fonts.pcss')
import('./forms.pcss')
import('./typo.pcss')

const requireAll = (requireContext) => {
  return requireContext.keys().map(requireContext)
}

requireAll(require.context('./blocks', false, /.css$/))
