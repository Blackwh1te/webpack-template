import Collection from './generic/collection'
import {onAjaxContentLoaded} from './generic/eventing'
import {getLocaleMsg} from './locales'

export const instance = '[data-js-password]'

export class Password {
  els = {
    instance,
    input: '[data-js-password-input]',
    btn: '[data-js-password-btn]',
  }

  stateClasses = {
    isActive: 'is-active',
  }

  constructor(instance) {
    this.instance = instance
    this.input = this.instance.querySelector(this.els.input)
    this.btn = this.instance.querySelector(this.els.btn)
    this.state = {
      isShown: false
    }
    this.bindEvents()
  }

  toggle() {
    this.state.isShown ?
      this.hide() :
      this.show()
  }

  show() {
    this.state.isShown = true
    this.input.setAttribute('type', 'text')
    this.btn.classList.add(this.stateClasses.isActive)
    this.btn.setAttribute('title', getLocaleMsg('HIDE_PASSWORD'))
    this.btn.setAttribute('aria-label', getLocaleMsg('HIDE_PASSWORD'))
  }

  hide() {
    this.state.isShown = false
    this.input.setAttribute('type', 'password')
    this.btn.classList.remove(this.stateClasses.isActive)
    this.btn.setAttribute('title', getLocaleMsg('SHOW_PASSWORD'))
    this.btn.setAttribute('aria-label', getLocaleMsg('SHOW_PASSWORD'))
  }

  handleBtnClick(e) {
    e.preventDefault()
    this.toggle()
  }

  bindEvents() {
    this.btn.addEventListener('click', (e) => this.handleBtnClick(e))
  }
}

export class PasswordCollection extends Collection {
  constructor() {
    super(instance, Password)
    this.init()
    this.bindEvents()
  }

  init(context = document) {
    context.querySelectorAll(instance).forEach((el) => {
      this.collection = new Password(el)
    })
  }

  bindEvents() {
    onAjaxContentLoaded((e) => {
      this.init(e.detail.content)
    })
  }
}
