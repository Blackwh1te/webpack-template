import './style.pcss'
import {setCSSVar} from '../../js/utils/setCSSVar'
import {wait} from '../../js/utils/wait'

export const instance = '[data-js-btn]'

export default class Btn {
  els = {
    instance,
  }

  stateClasses = {
    isRipple: 'is-ripple',
    isAnimationEnd: 'is-animation-end',
  }

  constructor() {
    this.bindEvents()
  }

  materializeEffect(e) {
    const {
      target,
      layerX,
      layerY,
      offsetX,
      offsetY
    } = e

    let x = `${layerX}px`
    let y = `${layerY}px`

    if (!offsetX && !offsetY) {
      x = '40%'
      y = '45%'
    }

    this.disableAnimationEndState(target)
    target.classList.remove(this.stateClasses.isRipple)
    wait(10).then(() => {
      setCSSVar(target, 'rippleOffsetX', x)
      setCSSVar(target, 'rippleOffsetY', y)
      target.classList.add(this.stateClasses.isRipple)
    })
  }

  enableAnimationEndState(btn) {
    btn.classList.add(this.stateClasses.isAnimationEnd)
  }

  disableAnimationEndState(btn) {
    btn.classList.remove(this.stateClasses.isAnimationEnd)
  }

  handleClick(e) {
    if (e.target.matches(this.els.instance)) {
      this.materializeEffect(e)
    }
  }

  handleAnimationEnd(e) {
    if (e.target.matches(this.els.instance)) {
      this.enableAnimationEndState(e.target)
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => this.handleClick(e))
    document.addEventListener('animationend', (e) => this.handleAnimationEnd(e))
  }
}
