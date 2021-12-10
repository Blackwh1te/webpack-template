// Load icons
import {setCSSVar} from './js/utils/setCSSVar'

const requireAll = (r) => r.keys().forEach(r)
requireAll(require.context('./icons', true, /\.svg$/))

// Load plugins
import svg4everybody from 'svg4everybody'
import {isTouchEnabled} from './js/utils/isTouchEnabled'
import {isMobileDevice} from './js/utils/isMobileDevice'
import {parseJSON} from './js/utils/parseJSON'
import {wait} from './js/utils/wait'
import {debounce} from './js/utils/debounce'
import {getCurrentLang} from './js/utils/getCurrentLang'

window.svg4everybody = svg4everybody

// media queries (if used in js)
export const mq = {
  tabletAbove: '(min-width: 1281px)',
  tablet: '(max-width: 1280px)',
  tabletXsAbove: '(min-width: 921px)',
  tabletXs: '(max-width: 920px)',
  mobileAbove: '(min-width: 768px)',
  mobile: '(max-width: 767px)',
}

// Create global App object
window.App = {
  lang: getCurrentLang(),
  scrollableBody: 'body',
  debug: window.location.port.length || (window.location.search.indexOf('debug') > -1) || window.location.pathname.indexOf('/build/') > -1,
  stateClasses: {
    domReady: 'dom-is-ready',
    pageLoaded: 'page-is-loaded',
    touchscreen: 'is-touchscreen',
    mobileDevice: 'is-mobile-device'
  },
  ...parseJSON(document.body.getAttribute('data-js-app-globals')),
}

// load modules
import SvgUse from './js/svgUse'
import Btn from './components/btn'
import Modals from './js/modals'
import Forms from './js/forms/forms'
import ScrollEffects from './js/scrollEffects'
import Gallery from './js/gallery'
import AdaptiveTables from './js/adaptiveTables'

// Load components
import './components/header'
import './components/footer'
import './components/breadcrumb'
import './components/logo'
import './components/btn'
import './components/input'
import './components/checkbox'
import './components/select'
import './components/table'
import './components/slider-buttons'
import './components/slider-pagination'
import './components/password-btn'
import './components/my-select'
// import './components/map'
// import './components/star-rating'

// Load collections
import {SlidersCollection} from './js/sliders'
import {GoogleCaptchaCollection} from './components/grecaptcha'
import {FileAttachCollection} from './components/file-attach'
import {SelectCollection} from './components/select'
import {MySelectCollection} from './components/my-select'
import {AccordionCollection} from './js/accordion'
import {TabsCollection} from './js/tabs'
import {PasswordCollection} from './js/password'
// import {MapCollection} from './components/map'
// import {StarRatingCollection} from './components/star-rating'

// Load styles
import './styles'

// Utils functions
const setVhVar = () => setCSSVar(document.documentElement, 'vh', `${window.innerHeight * 0.01}px`)

const checkMobile = () => isMobileDevice() ? document.documentElement.classList.add(App.stateClasses.mobileDevice) : document.documentElement.classList.remove(App.stateClasses.mobileDevice)

const checkTouch = () => isTouchEnabled() ? document.documentElement.classList.add(App.stateClasses.touchscreen) : document.documentElement.classList.remove(App.stateClasses.touchscreen)

const checkSpecificBrowser = () => {
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
}

const setScrollbarWidth = () => {
  setCSSVar(document.documentElement, 'scrollbar-width', `${window.innerWidth - document.documentElement.clientWidth}px`)
}

const handleDOMReady = () => {
  // utils
  checkTouch()
  checkMobile()
  checkSpecificBrowser()
  setVhVar()
  setScrollbarWidth()

  // standalone components
  new SvgUse()
  new Btn()
  new Modals()
  new Forms()
  new Gallery()

  // app components
  App.SlidersCollection = new SlidersCollection()
  App.GoogleCaptchaCollection = new GoogleCaptchaCollection()
  App.AdaptiveTables = new AdaptiveTables()
  App.FileAttachCollection = new FileAttachCollection()
  App.SelectCollection = new SelectCollection()
  App.MySelectCollection = new MySelectCollection()
  App.AccordionCollection = new AccordionCollection()
  App.TabsCollection = new TabsCollection()
  App.PasswordCollection = new PasswordCollection()
  // App.MapCollection = new MapCollection()
  // App.StarRatingCollection = new StarRatingCollection()

  // prevent transition flicker
  wait(100).then(() => {
    document.documentElement.classList.add(App.stateClasses.domReady)
    App.ScrollEffects = new ScrollEffects()
  })
}

const debouncedResizeHandler = debounce(setVhVar)
const handleResize = () => {
  checkTouch()
  checkMobile()
  debouncedResizeHandler()
}

const handleWindowLoad = () => document.documentElement.classList.add(App.stateClasses.pageLoaded)

const bindEvents = () => {
  document.addEventListener('DOMContentLoaded', () => handleDOMReady())
  window.addEventListener('resize', () => handleResize())
  window.addEventListener('load', () => handleWindowLoad())
}

bindEvents()
