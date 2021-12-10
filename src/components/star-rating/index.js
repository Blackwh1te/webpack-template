import './style.pcss'
import Collection from '../../js/generic/collection'
import {onAjaxContentLoaded} from '../../js/generic/eventing'
import {setCSSVar} from '../../js/utils/setCSSVar'
import {wait} from '../../js/utils/wait'

export const instance = '[data-js-star-rating]'

export class StarRating {
  els = {
    body: '[data-js-star-rating-body]',
    star: '[data-js-star-rating-star]',
    input: '[data-js-star-rating-input]',
  }

  CSSVars = {
    value: 'value',
    valueOnHover: 'valueOnHover',
  }

  stateClasses = {
    isClicked: 'is-clicked',
  }

  constructor(instance) {
    this.instance = instance
    this.body = this.instance.querySelector(this.els.body)
    this.stars = this.instance.querySelectorAll(this.els.star)
    this.input = this.instance.querySelector(this.els.input)
    this.bindEvents()
  }

  setValue(value) {
    setCSSVar(this.instance, this.CSSVars.value, value)
    this.input.value = value
  }

  setValueOnHover(value) {
    setCSSVar(this.body, this.CSSVars.valueOnHover, value)
  }

  removeValueOnHover() {
    this.body.removeAttribute('style')
  }

  starsVisualization(starsCount) {
    this.stars.forEach((star, i) => {
      if (i < starsCount) {
        star.classList.add(this.stateClasses.isClicked)
        wait(500).then(() => {
          star.classList.remove(this.stateClasses.isClicked)
        })
      }
    })
  }

  handleStarMouseEnter(e, index) {
    this.setValueOnHover(index + 1)
  }

  handleStarMouseLeave() {
  }

  handleStarClick(e, index) {
    this.setValue(index + 1)
    this.starsVisualization(index + 1)
  }

  handleInstanceMouseLeave() {
    this.removeValueOnHover()
  }

  bindEvents() {
    this.instance.addEventListener('mouseleave', () => this.handleInstanceMouseLeave())
    this.stars.forEach((star, index) => {
      star.addEventListener('mouseenter', (e) => this.handleStarMouseEnter(e, index))
      if (this.input) {
        star.addEventListener('click', (e) => this.handleStarClick(e, index))
      }
    })
  }
}

export class StarRatingCollection extends Collection {
  constructor() {
    super(instance, StarRating)
    this.init()
    this.bindEvents()
  }

  init(context = document) {
    context.querySelectorAll(instance).forEach((el) => {
      this.collection = new StarRating(el)
    })
  }

  bindEvents() {
    onAjaxContentLoaded((e) => {
      this.init(e.detail.content)
    })
  }
}
