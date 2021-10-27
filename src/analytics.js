const createAnalytics = () => {
  let counter = 0
  let isDestroyed = false

  const handleClick = () => counter++

  document.addEventListener('click', handleClick)

  return {
    destroy() {
      document.removeEventListener('click', handleClick)
      isDestroyed = true
    },

    getClicks() {
      if (isDestroyed) {
        return 'Analytics is destroyed'
      }
      return counter
    }
  }
}


window.analyntics = createAnalytics()
