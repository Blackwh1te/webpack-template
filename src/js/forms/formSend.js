import {instance as fileAttachInstance} from '../../components/file-attach'
import FormValidation from './formValidation'
import Forms, {bubbles as formBubbles, els as formEls, stateClasses} from './forms'
import Modals from '../modals'
import {bubble} from '../utils/bubble'
import {render} from '../utils/render'
import {removeChildNodes} from '../utils/removeChildNodes'
import {dispatchAjaxContentLoaded} from '../generic/eventing'
import {parseHTML} from '../utils/parseHTML'
import {getAttr} from '../utils/getAttr'
import {parseJSON} from '../utils/parseJSON'
import {getLocaleMsg} from '../locales'
import {makeRequest} from '../utils/makeRequest'

export default class FormSend {

  constructor() {
    this.bindEvents()
  }

  bindEvents() {
    document.addEventListener(formBubbles.formValid, (e) => {
      this.handleFormValid(e)
    })
  }

  handleFormValid(e) {
    const form = e.target
    const cfg = Forms.getFormCfg(form)
    const {isIgnoreAutoSend, isUseFetch, isConfirmBeforeSubmit, handler} = cfg
    if (!isIgnoreAutoSend) {
      const fn = () => {
        if (isUseFetch) {
          FormSend.send(form, FormSend.getFormData(form, false, [], false))
        } else {
          form.submit()
        }
      }
      if (isConfirmBeforeSubmit) {
        if (handler && handler.matches(formEls.skipConfirmation)) {
          fn()
        } else {
          Modals.openConfirmModal({}, (instance, e) => {
            e.preventDefault()
            fn()
            Modals.closeOnlyModal(instance)
          })
        }
      } else {
        fn()
      }
    }
  }

  static getFormData(form, isGetAll = false, excludedParams = [], isTrim = true) {
    const cfg = Forms.getFormCfg(form)
    const fd = new FormData(form)
    if (cfg.isSerializeDisabledInputs || isGetAll) {
      const disabledInputs = form.querySelectorAll('[disabled]')
      disabledInputs.forEach((input) => {
        fd.set(input.name, input.value)
      })
    }
    for (const field of fd) {
      if ((isTrim && typeof field[1] === 'string' && !field[1].trim().length) || excludedParams.includes(field[0])) {
        fd.delete(field[0])
      }
    }
    return fd
  }

  static extendFiles(form, formData) {
    const files = form.querySelectorAll(fileAttachInstance)
    files.forEach((fileElem) => {
      const fileAttach = App.FileAttachCollection.getByDOMElement(fileElem)
      if (fileAttach) {
        const input = fileAttach.input
        const name = input.getAttribute('name')
        if (fileAttach.isMultiple) {
          formData.delete(name)
          fileAttach.files.forEach(file => {
            formData.append(name, file.file)
          })
        }
      }
    })
  }

  static resetFiles(form) {
    const files = form.querySelectorAll(fileAttachInstance)
    files.forEach((fileElem) => {
      const fileAttach = App.FileAttachCollection.getByDOMElement(fileElem)
      if (fileAttach) {
        fileAttach.clear()
      }
    })
  }

  static appendNodes(elements) {
    elements.forEach((item) => {
      const {to, html} = item
      const position = item.position || undefined
      const dest = document.querySelector(to)
      if (dest) {
        render(dest, html, position)
        dispatchAjaxContentLoaded({
          content: dest
        })
        bubble(dest, formBubbles.formAppendNodes, html)
      } else {
        console.debug('Can\'t find nodes with selector: ', dest)
      }
    })
  }

  static replaceNodes(elements) {
    elements.forEach((item) => {
      const {selector, html} = item
      const dest = document.querySelector(selector)
      const newNodes = parseHTML(html)
      if (dest && newNodes.length) {
        dest.replaceWith(newNodes[0])
        dispatchAjaxContentLoaded({
          content: dest
        })
        bubble(dest, formBubbles.formReplaceNodes, html)
      } else {
        console.debug('Can\'t find nodes with selector: ', dest)
      }
    })
  }

  static hideNodes(selectors) {
    selectors.forEach((selector) => {
      const nodes = document.querySelectorAll(selector)
      if (nodes.length) {
        nodes.forEach((node) => {
          node.classList.add(stateClasses.inactive)
          bubble(node, formBubbles.formRemoveNodes)
        })
      } else {
        console.debug('Can\'t find nodes with selector: ', selector)
      }
    })
  }

  static handleFormSendComplete(cfg, resp) {
    const {form} = cfg
    if (resp.file) {
      window.open(resp.file, 'downloadFile').focus()
    }
    if (resp.reload) {
      window.location.reload()
      return
    }
    if (resp.redirect) {
      window.location.href = resp.redirect
      return
    }
    if (resp.errors) {
      bubble(form, formBubbles.formError, {
        response: resp,
        formCfg: cfg
      })
      if (cfg.isShowErrorsAsModals) {
        Modals.openErrorModal(resp.errors, false)
      } else {
        render(form, cfg.errorsListLayout, cfg.errorsListPosition)
        const errorsBlock = form.querySelector(formEls.errorsList)
        resp.errors.forEach((errorText) => {
          render(errorsBlock, cfg.errorsListItemLayout(errorText), 'afterbegin')
        })
        FormValidation.updateCaptcha(form)
      }
      FormSend.unsetLoading(form, cfg.successTimeOut)
    } else {
      bubble(form, formBubbles.formSuccess, {
        response: resp,
        formCfg: cfg
      })
      if (resp.innerHTML) {
        removeChildNodes(form)
        render(form, resp.innerHTML)
        dispatchAjaxContentLoaded({
          content: form
        })
      }
      if (resp.hideElements) {
        FormSend.hideNodes(resp.hideElements, form)
      }
      if (resp.appendElements) {
        FormSend.appendNodes(resp.appendElements, form)
      }
      if (resp.replaceElements) {
        FormSend.replaceNodes(resp.replaceElements, form)
      }
      if (cfg.isResetAfterSuccess) {
        form.reset()
        FormSend.resetFiles(form)
      }
      if (cfg.isShowModals) {
        Modals.closeAllModals()
        if (typeof resp.modals === 'undefined') {
          Modals.openInlineModal({src: cfg.successModalId})
        } else {
          if (Array.isArray(resp.modals)) {
            resp.modals.forEach((html) => {
              if (html.length) {
                Modals.openHTMLModal({src: html})
              }
            })
          } else {
            Modals.openHTMLModal({src: resp.modals})
          }
        }
      }
    }
  }

  static handleFormSendError(cfg) {
    const {form, isResetAfterSuccess} = cfg
    FormValidation.updateCaptcha(form)
    if (isResetAfterSuccess) {
      form.reset()
      FormSend.resetFiles(form)
    }
    Modals.openErrorModal(getLocaleMsg('NETWORK_ERROR'), false)
  }

  static unsetLoading(form, timeOut = 0) {
    const fn = () => form.classList.remove(stateClasses.loading)
    if (timeOut) {
      window.setTimeout(() => {
        fn()
      }, timeOut)
    } else {
      fn()
    }
  }

  static setLoading(form) {
    form.classList.add(stateClasses.loading)
  }

  static send(form, formData, customComplete = false, customError = false) {
    const cfg = Forms.getFormCfg(form)
    const isFiles = !!form.querySelectorAll(fileAttachInstance).length
    formData = formData || FormSend.getFormData(form)
    FormSend.setLoading(form)
    if (cfg.handler && cfg.handler.matches(formEls.submitAppend)) {
      const extraData = parseJSON(cfg.handler.getAttribute(getAttr(formEls.submitAppend)))
      extraData.forEach((item) => {
        Object.entries(item).forEach((pair) => {
          formData.append(pair[0], pair[1])
        })
      })
    }
    if (isFiles) {
      FormSend.extendFiles(form, formData)
    }
    if (cfg.isClearErrorsBeforeSend) {
      const errorList = form.querySelector(formEls.errorsList)
      if (errorList) {
        errorList.remove()
      }
    }
    if (form.hasAttribute('method')) {
      const method = form.getAttribute('method')
      if (method !== cfg.method) {
        cfg.method = method
      }
    }
    if (!cfg.url) {
      cfg.url = (form.hasAttribute('action')) ? form.getAttribute('action') : window.location.origin + window.location.pathname
    }
    cfg.data = formData
    if (cfg.isReturnJSON) {
      cfg.type = 'json'
    }
    makeRequest(cfg).then((resp) => {
      if (customComplete && typeof customComplete === 'function') {
        customComplete(resp)
      } else {
        if (cfg.isReturnJSON) {
          const fn = () => {
            FormSend.handleFormSendComplete(cfg, resp)
          }
          if (cfg.successTimeOut) {
            window.setTimeout(() => {
              fn()
            }, cfg.successTimeOut)
          } else {
            fn()
          }
        } else {
          FormSend.unsetLoading(form, cfg.successTimeOut)
          return resp
        }
      }
      FormSend.unsetLoading(form, cfg.successTimeOut)
    }, (err) => {
      const fn = () => {
        if (customError && typeof customError === 'function') {
          customError(err)
        } else {
          FormSend.handleFormSendError(cfg)
        }
        FormSend.unsetLoading(form, cfg.successTimeOut)
      }
      if (cfg.successTimeOut) {
        window.setTimeout(() => {
          fn()
        }, cfg.successTimeOut)
      } else {
        fn()
      }
    }).finally(() => {
      if (App.debug) {
        console.debug('Sending form: ', form, cfg, 'with data: ', [...formData.entries()])
      }
    })
  }
}
