// import utils
import {isTouchEnabled} from './js/utils/isTouchEnabled'
import {isMobileDevice} from './js/utils/isMobileDevice'
import {parseJSON} from './js/utils/parseJSON'
import {wait} from './js/utils/wait'
import {debounce} from './js/utils/debounce'
import {setCSSVar} from './js/utils/setCSSVar'
import {onDOMContentLoaded} from './js/utils/onDOMContentLoaded'
import {requireAll} from './js/utils/webpack/requireAll'
import {getScrollBarWidth} from './js/utils/getScrollBarWidth'

// media queries (if used in js)
export const mq = {
  tabletAbove: '(min-width: 1281px)',
  tablet: '(max-width: 1280px)',
  tabletXsAbove: '(min-width: 921px)',
  tabletXs: '(max-width: 920px)',
  mobileAbove: '(min-width: 768px)',
  mobile: '(max-width: 767px)'
}

// Create global App object
window.App = {
  scrollableBody: 'body',
  isDebug: window.location.port.length > 0 || window.location.host === 'localhost' || (window.location.search.indexOf('debug') > -1) || window.location.pathname.indexOf('/build/') > -1,
  isTest: process.env.NODE_ENV === 'test',
  stateClasses: {
    domReady: 'dom-is-ready',
    pageLoaded: 'page-is-loaded',
    touchscreen: 'is-touchscreen',
    mobileDevice: 'is-mobile-device',
  },
  ...parseJSON(document.body.getAttribute('data-js-app-globals')),
  utils: { // utils functions
    setVhVar: () => setCSSVar(document.documentElement, 'vh', `${(window.innerHeight * 0.01).toFixed(3)}px`),
    checkMobile: () => (isMobileDevice()) ? document.documentElement.classList.add(App.stateClasses.mobileDevice) : document.documentElement.classList.remove(App.stateClasses.mobileDevice),
    checkTouch: () => (isTouchEnabled()) ? document.documentElement.classList.add(App.stateClasses.touchscreen) : document.documentElement.classList.remove(App.stateClasses.touchscreen),
    checkSpecificBrowser: () => {
      let browserClass = ''
      switch (true) {
        case !!(navigator.userAgent.match(/Trident/) && !navigator.userAgent.match(/MSIE/)):
          browserClass = 'ie11'
          break
        case !!navigator.userAgent.match(/Version\/[\d.]+.*Safari/):
          browserClass = 'safari'
          break
        case /Edge/.test(navigator.userAgent):
          browserClass = 'edge'
          break
        default:
          break
      }
      if (browserClass) {
        document.documentElement.classList.add(browserClass)
      }
    },
    getScrollBarWidth: () => setCSSVar(document.documentElement, 'scrollBarWidth', `${getScrollBarWidth()}px`)
  }
}

// load icons
if (!window.App.isTest) {
  requireAll(require.context('./icons', true, /\.svg$/))
}

// load modules
import Dispatcher from './js/generic/dispatcher'
import Observer from './js/generic/observer'
import Icons from './js/icons'
import Modals from './js/modals'
import Forms from './js/forms'
import ScrollEffects from './js/scrollEffects'
import Gallery from './js/gallery'
import AdaptiveTables from './js/adaptiveTables'
import Button from './components/button'

// Load components
import './components/header'
import './components/footer'
import './components/breadcrumbs'
import './components/logo'
import './components/button'
import './components/input'
import './components/checkbox'
import './components/select'
import './components/table'
import './components/slider-buttons'
import './components/slider-pagination'
import './components/password-button'
import './components/product-card'
import './components/progress'
import './components/accordion'
// import './components/map'
// import './components/star-rating'

// Load collections
import {SlidersCollection} from './js/sliders'
import {GoogleCaptchaCollection} from './components/grecaptcha'
import {FileAttachCollection} from './components/file-attach'
import {SelectCollection} from './components/select'
import {AccordionCollection} from './components/accordion'
import {TabsCollection} from './js/tabs'
import {PasswordCollection} from './js/password'
// import {MapCollection} from './components/map'
// import {StarRatingCollection} from './components/star-rating'

// Load styles
import './styles'

const handleDOMReady = () => {
  // run utils
  Object.values(App.utils).forEach(fn => typeof fn === 'function' && fn())

  // standalone components
  new Icons()
  new Forms()
  new Modals()
  new Gallery()
  new Button()

  // app components
  App.ScrollEffects = new ScrollEffects()
  App.GoogleCaptchaCollection = new GoogleCaptchaCollection()
  App.AdaptiveTables = new AdaptiveTables()
  App.FileAttachCollection = new FileAttachCollection()
  App.SlidersCollection = new SlidersCollection()
  App.SelectCollection = new SelectCollection()
  App.AccordionCollection = new AccordionCollection()
  App.TabsCollection = new TabsCollection()
  App.PasswordCollection = new PasswordCollection()
  // App.MapCollection = new MapCollection()
  // App.StarRatingCollection = new StarRatingCollection()

  // prevent transition flicker
  wait(100).then(() => document.documentElement.classList.add(App.stateClasses.domReady))
}

const debouncedResizeHandler = debounce(App.utils.setVhVar)
const handleResize = () => {
  debouncedResizeHandler()
  App.utils.checkTouch()
  App.utils.checkMobile()
  App.utils.getScrollBarWidth()
}
const handleWindowLoad = () => document.documentElement.classList.add(App.stateClasses.pageLoaded)

onDOMContentLoaded(() => handleDOMReady())
window.addEventListener('resize', () => handleResize())
window.addEventListener('load', () => handleWindowLoad())
