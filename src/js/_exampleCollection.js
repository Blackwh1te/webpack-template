import Collection from './generic/collection'
import {onAjaxContentLoaded} from './generic/eventing'

export const instance = '[data-js-example]'

export class Example {
  els = {
    instance,
  }

  constructor(instance) {
    this.instance = instance
    this.bindEvents()
  }

  bindEvents() {

  }
}

export class ExampleCollection extends Collection {
  constructor() {
    super(instance, Example)
    this.init()
    this.bindEvents()
  }

  init(context = document) {
    context.querySelectorAll(instance).forEach((el) => {
      this.collection = new Example(el)
    })
  }

  bindEvents() {
    onAjaxContentLoaded((e) => {
      this.init(e.detail.content)
    })
  }
}
