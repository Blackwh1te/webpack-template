import {wrap} from './utils/wrap'

export default class AdaptiveTables {
  els = {
    adaptiveTable: '[data-js-adaptive-table]',
    customAdaptiveTable: '[data-js-adaptive-table-custom]'
  }

  classStates = {
    leftEdge: 'is-left-edge',
    rightEdge: 'is-right-edge'
  }

  layouts = {
    wrap: `<div data-js-adaptive-table class="adaptive-table"><div class="adaptive-table__wrapper"></div></div>`
  }

  constructor() {
    this.tables = document.querySelectorAll('table:not(.no-adaptive-wrap)')
    this.init()
  }

  isAdaptive(table) {
    return !table.parentNode.matches(this.els.adaptiveTable) && !table.matches(this.els.customAdaptiveTable) && !table.closest(this.els.customAdaptiveTable)
  }

  init(tables = this.tables) {
    tables.forEach((table) => {
      if (this.isAdaptive(table)) {
        const wrapped = wrap(table, this.layouts.wrap, true)
        wrapped.scrollLeft = 0
        this.bindEvents(wrapped)
        this.setEdges(this.getContainer(wrapped))
      }
    })
  }

  getContainer(el) {
    return el.closest(this.els.adaptiveTable)
  }

  setEdges(el) {
    const container = this.getContainer(el)
    const {scrollLeft, scrollWidth, offsetWidth} = el;
    (scrollLeft === 0) ? container.classList.add(this.classStates.leftEdge) : container.classList.remove(this.classStates.leftEdge);
    (scrollLeft === scrollWidth - offsetWidth) ? container.classList.add(this.classStates.rightEdge) : container.classList.remove(this.classStates.rightEdge)
  }

  handleScroll(e) {
    this.setEdges(e.target)
  }

  bindEvents(table) {
    table.addEventListener('scroll', (e) => {
      this.handleScroll(e)
    })
  }
}
