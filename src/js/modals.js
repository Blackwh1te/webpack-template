import '@fancyapps/ui/dist/fancybox.css'
import {Fancybox} from '@fancyapps/ui'
import {getLocaleMsg, locales} from './locales'
import {dispatchAjaxContentLoaded} from './generic/eventing'
import {isUrl} from './utils/isUrl'
import {parseJSON} from './utils/parseJSON'
import {getAttr} from './utils/getAttr'
import {bubble} from './utils/bubble'
import {isEmptyObj} from './utils/isEmptyObj'
import {getLastFromNodeList} from './utils/getLastFromNodeList'
import {getFormDataFromObj} from './utils/getFormDataFromObj'
import {makeRequest} from './utils/makeRequest'
import {getCurrentLang} from './utils/getCurrentLang'

export const els = {
  modal: '[data-js-modal]',
  errorText: '[data-js-modal-error-text]',
  open: '[data-js-modal-open]',
  close: '[data-js-modal-close]',
  submit: '[data-js-modal-submit]',
  cancel: '[data-js-modal-cancel]',
  defaultAnchors: {
    success: '#modal-success',
    error: '#modal-error'
  }
}

export const layouts = {
  closeButton: `
    <svg class="i-icon i-icon--medium-plus">
      <use href="#icon-close"></use>
    </svg>
  `,
  nextButton: `
    <svg class="i-icon i-icon--large">
      <use href="#icon-page-next"></use>
    </svg>
  `,
  prevButton: `
    <svg class="i-icon i-icon--large">
      <use href="#icon-page-prev"></use>
    </svg>
  `,
}

const l10n = Object.entries(locales.modals).map((pair) => {
  return {[pair[0]]: pair[1][getCurrentLang()]}
}).reduce((a, b) => Object.assign(a, b), {})

export const modalOptions = {
  animated: true,
  Thumbs: false,
  Image: false,
  hideScrollbar: true,
  infinite: false,
  on: {
    reveal: (instance, slide) => {
      Modals.handleModalReveal(instance, slide)
    },
    closing: (instance) => {
      Modals.handleModalClose(instance)
    }
  },
  l10n,
  template: {
    closeButton: layouts.closeButton
  },
  trapFocus: true,
  autoFocus: false,
  placeFocusBack: false,
  preload: false,
  modal: true,
  touch: false,
  fullScreen: false,
  defaultActionCfg: {
    redirectAfterClose: false,
    reloadAfterClose: false,
    bubbleAfterClose: false,
    afterConfirm: (instance, event) => {
      Modals.handleModalConfirm(instance, event)
    },
    afterCancel: (instance, event) => {
      Modals.handleModalCancel(instance, event)
    }
  },
  draggable: false,
  lockAxis: true,
  method: 'GET',
  data: {},
  showClass: 'modal-show',
  hideClass: 'modal-hide'
}

export default class Modals {
  constructor() {
    this.bindEvents()
  }

  static getActionCfg(modal) {
    return {
      ...modalOptions.defaultActionCfg,
      ...parseJSON(modal.getAttribute(getAttr(els.modal)))
    }
  }

  static getCfg(handler) {
    return {
      handler,
      src: handler.hasAttribute('href') ? handler.getAttribute('href') : '',
      ...modalOptions,
      ...parseJSON(handler.getAttribute(getAttr(els.open)))
    }
  }

  static handleModalConfirm(instance, event) {
    event.preventDefault()
    Modals.closeOnlyModal(instance)
  }

  static handleModalCancel(instance, event) {
    event.preventDefault()
    Modals.closeOnlyModal(instance)
  }

  static handleModalReveal(instance, slide) {
    const modal = slide.$el.querySelector(els.modal)
    if (modal) {
      const slideContent = modal.parentNode
      if (slide.type !== 'inline') {
        const attr = getAttr(els.modal)
        slideContent.setAttribute(attr, (modal.hasAttribute(attr)) ? modal.getAttribute(attr) : '')
        slideContent.classList.add(...modal.classList)
        slideContent.id = modal.id
        modal.replaceWith(...modal.childNodes)
      }
      dispatchAjaxContentLoaded({content: slideContent})
    }
  }

  static getModalContent(instance) {
    return instance.$carousel.querySelector(els.modal)
  }

  static handleModalClose(instance) {
    const modal = Modals.getModalContent(instance)
    if (modal) {
      const cfg = Modals.getActionCfg(modal)
      if (cfg.bubbleAfterClose) {
        bubble(document, cfg.bubbleAfterClose.toString(), modal)
      }
      if (cfg.redirectAfterClose) {
        window.location.href = cfg.redirectAfterClose
      } else if (cfg.reloadAfterClose) {
        window.location.reload()
      }
    }
  }


  static closeAllModals() {
    Fancybox.close(true)
  }

  static closeOnlyModal(instance = Modals.getActiveInstance()) {
    if (instance) {
      instance.close()
    }
  }

  static openInlineModal(cfg) {
    const {src} = cfg
    Fancybox.show([{src, type: 'inline'}], {
      ...modalOptions,
      ...cfg,
    })
  }

  static openConfirmModal(cfg, confirmFn, cancelFn) {
    Modals.openInlineModal({
      src: '#modal-confirm',
      defaultActionCfg: {
        ...modalOptions.defaultActionCfg,
        afterConfirm: (instance, e) => {
          e.preventDefault()
          if (typeof confirmFn === 'function') {
            confirmFn(instance, e)
          } else {
            Modals.handleModalConfirm(instance, e)
          }
        },
        afterCancel: (instance, e) => {
          e.preventDefault()
          if (typeof cancelFn === 'function') {
            cancelFn(instance, e)
          } else {
            Modals.handleModalCancel(instance, e)
          }
        }
      },
      ...cfg
    })
  }

  static openHTMLModal(cfg) {
    const {src} = cfg
    Fancybox.show([{src, type: 'html'}], {
      ...modalOptions,
      ...cfg,
    })
  }

  static openAjaxModal(cfg) {
    const {src = '', method = 'GET'} = cfg
    const fd = getFormDataFromObj(cfg.data)
    const body = (method === 'POST') ? fd : null
    const handleError = () => {
      if (typeof cfg.on.error === 'function') {
        cfg.on.error()
      }
    }
    makeRequest({url: src, type: 'text', method, body}).then((data) => {
      if (cfg.data) {
        delete cfg.data
      }
      const json = parseJSON(data)
      if (isEmptyObj(json)) {
        Modals.openHTMLModal({
          ...cfg,
          src: data
        })
      } else if (json.errors) {
        json.errors.forEach((error) => {
          Modals.openErrorModal(error)
        })
        handleError()
      }
    }, (status) => {
      let msg = getLocaleMsg('ERROR')
      switch (status) {
        case 404:
          msg = getLocaleMsg('AJAX_NOT_FOUND')
          break
        case 403:
          msg = getLocaleMsg('AJAX_FORBIDDEN')
          break
        default:
          break
      }
      Modals.openErrorModal(msg)
      handleError()
    })
  }

  static openErrorModal(errorText = getLocaleMsg('ERROR'), isCloseOthers = true, debugInfo) {
    if (isCloseOthers) {
      Modals.closeAllModals()
    }
    const setErrorText = (slide, isReset = false) => {
      const context = (typeof slide.$content === 'undefined') ? slide : slide.$content
      const errorBlock = context.querySelector(els.errorText)
      if (errorBlock && errorText) {
        errorBlock.innerHTML = (isReset) ? getLocaleMsg('ERROR') : (Array.isArray(errorText) ? errorText.join(`<br />`) : errorText)
      }
    }
    Modals.openInlineModal({
      src: els.defaultAnchors.error,
      on: {
        ...modalOptions.on,
        reveal: (instance, slide) => {
          setErrorText(slide)
        },
        closing: (instance) => {
          Modals.handleModalClose(instance)
          window.setTimeout(() => {
            setErrorText(document.querySelector(els.defaultAnchors.error), true)
          }, 1500)
        }
      }
    })
    if (debugInfo) {
      console.debug(debugInfo)
    }
  }

  static getActiveInstance() {
    let instance = Fancybox.getInstance()
    const modals = document.querySelectorAll('[id^="fancybox-"][aria-modal]')
    if (modals.length && !instance) {
      console.debug(modals)
      const lastModal = getLastFromNodeList(modals)
      instance = lastModal.Fancybox || null
    }
    return instance
  }

  handleOpenClick(e) {
    e.preventDefault()
    const cfg = Modals.getCfg(e.target)
    const {src} = cfg
    if (src) {
      switch (true) {
        case isUrl(src) || src.startsWith('/'):
          Modals.openAjaxModal(cfg)
          break
        case src.startsWith('#'):
          Modals.openInlineModal(cfg)
          break
        default:
          Modals.openHTMLModal(cfg)
          break
      }
    } else {
      throw new Error(`No src for modal`)
    }
  }

  handleCloseClick(e) {
    e.preventDefault()
    window.setTimeout(() => {
      e.target.blur()
    }, 50)
    Modals.closeOnlyModal()
  }

  handleConfirmClick(e) {
    e.preventDefault()
    const instance = Modals.getActiveInstance()
    if (typeof instance.options.defaultActionCfg.afterConfirm === 'function') {
      instance.options.defaultActionCfg.afterConfirm(instance, e)
    }
  }

  handleCancelClick(e) {
    e.preventDefault()
    const instance = Modals.getActiveInstance()
    if (typeof instance.options.defaultActionCfg.afterCancel === 'function') {
      instance.options.defaultActionCfg.afterCancel(instance, e)
    }
  }

  handleMouseDown(e) {
    const {target, button} = e
    if (button === 0) {
      switch (true) {
        case target.matches(els.open):
          this.handleOpenClick(e)
          break
        case target.matches(els.close):
          this.handleCloseClick(e)
          break
        case target.matches(els.cancel):
          this.handleCancelClick(e)
          break
        case target.matches(els.submit):
          this.handleConfirmClick(e)
          break
        default:
          break
      }
    }
  }

  bindEvents() {
    document.addEventListener('mousedown', (e) => {
      this.handleMouseDown(e)
    })
  }
}
