import './style.pcss'
import Collection from '../../js/generic/collection'
import {onAjaxContentLoaded} from '../../js/generic/eventing'
import {getRandomString} from '../../js/utils/getRandomString'
import {render} from '../../js/utils/render'
import {getCfg} from '../../js/utils/getCfg'
import {bubble} from '../../js/utils/bubble'

export const instance = '[data-js-my-select]'

export class MySelect {
  els = {
    instance,
    control: '[data-js-my-select-control]',
    openBtn: '[data-js-my-select-open-btn]',
    currentVariantEl: '[data-js-my-select-current-variant]',
    list: '[data-js-my-select-list]',
    optionBtn: '[data-js-my-select-option-btn]',
  }

  stateClasses = {
    isOpen: 'is-open',
    isSelected: 'is-selected',
  }

  constructor(instance) {
    this.instance = instance
    this.control = this.instance.querySelector(this.els.control)
    this.label = this.control.labels[0]
    this.openBtn = undefined
    this.currentVariantEl = undefined
    this.list = undefined
    // this.optionBtn = undefined
    this.state = {
      isOpen: false
    }
    this.init()
    this.bindEvents()
  }

  getDropdownItemMarkup(option, id = false) {
    let optionClasses = 'my-select__option'
    let idAttr = ''
    if (id) {
      optionClasses += ' is-selected'
      idAttr = `id=${id}`
    }

    return `
      <li
        class="my-select__dropdown-item"
        role="presentation"
      >
        <button
          class="${optionClasses}"
          ${idAttr}
          type="button"
          data-js-my-select-option-btn='{"value": "${option.value}"}'
          role="option"
        >
          ${option.textContent}
        </button>
      </li>
    `
  }

  getDropdownItemsMarkup(selectedOption, selectedOptionID, notSelectedOptions) {
    let items = this.getDropdownItemMarkup(selectedOption, selectedOptionID)
    notSelectedOptions.forEach(option => {
      items += this.getDropdownItemMarkup(option)
    })
    return items
  }

  generateMarkup() {
    const id = getRandomString()
    const controlOptions = [...this.control.children]
    const selectedOption = controlOptions.filter(option => option.selected)[0]
    const selectedOptionID = `select-${id}-selected-option`
    const dropdownID = `select-${id}-dropdown`
    const labelID = `select-${id}-label`
    const notSelectedOptions = controlOptions.filter(option => !option.selected)
    const dropdownItems = this.getDropdownItemsMarkup(selectedOption, selectedOptionID, notSelectedOptions)
    this.label.setAttribute('id', labelID)

    const markup = `
      <div class="my-select__body">
        <div
          class="my-select__input form-input"
          data-js-my-select-open-btn
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="false"
          aria-owns="${dropdownID}"     
          aria-activedescendant="${selectedOptionID}"          
          aria-labelledby="${labelID}"
        >
          <span
            class="my-select__current-variant"
            data-js-my-select-current-variant
          >
            Option 1
          </span>
          <svg class="my-select__arrow-icon i-icon">
            <use href="#icon-arrow-down"></use>
          </svg>
        </div>
        <div
          class="my-select__dropdown"
          id="${dropdownID}"
        >
          <ul
            class="my-select__dropdown-list"
            data-js-my-select-list
            role="listbox"
          >
            ${dropdownItems}
          </ul>
        </div>
      </div>
    `

    render(this.control, markup, 'afterend')
  }

  updateEls() {
    this.openBtn = this.instance.querySelector(this.els.openBtn)
    this.currentVariantEl = this.instance.querySelector(this.els.currentVariantEl)
    this.list = this.instance.querySelector(this.els.list)
    // this.optionButtons = this.instance.querySelectorAll(this.els.optionBtn)
  }

  toggleVisibility() {
    this.state.isOpen ?
      this.close() :
      this.open()
  }

  close() {
    this.state.isOpen = false
    this.instance.classList.remove(this.stateClasses.isOpen)
  }

  open() {
    this.state.isOpen = true
    this.instance.classList.add(this.stateClasses.isOpen)
  }

  updateOptionButtons(selectedOptionBtn) {
    const optionButtons = this.instance.querySelectorAll(this.els.optionBtn)
    optionButtons.forEach((optionBtn) => {
      optionBtn === selectedOptionBtn ?
        optionBtn.classList.add(this.stateClasses.isSelected) :
        optionBtn.classList.remove(this.stateClasses.isSelected)
    })
  }

  selectOption(optionBtn) {
    const cfg = getCfg(optionBtn, this.els.optionBtn)
    const {value} = cfg

    this.currentVariantEl.textContent = value
    this.control.value = value
    bubble(this.control, 'change')
    this.updateOptionButtons(optionBtn)
    this.close()
  }

  get value() {
    return this.control.value
  }

  append(option) {
    const item = this.getDropdownItemMarkup(option)
    render(this.list, item)
    this.control.appendChild(option)
  }

  handleOpenBtnClick() {
    this.toggleVisibility()
  }

  handleClick(e) {
    if (!e.target.closest(this.els.instance)) this.close()
  }

  handleInstanceClick(e) {
    if (e.target.matches(this.els.optionBtn)) {
      this.selectOption(e.target)
    }
  }

  init() {
    this.generateMarkup()
    this.updateEls()
  }

  bindEvents() {
    this.openBtn.addEventListener('click', () => this.handleOpenBtnClick())
    document.addEventListener('click', (e) => this.handleClick(e))
    this.instance.addEventListener('click', (e) => this.handleInstanceClick(e))
  }
}

export class MySelectCollection extends Collection {
  constructor() {
    super(instance, MySelect)
    this.init()
    this.bindEvents()
  }

  init(context = document) {
    context.querySelectorAll(instance).forEach((el) => {
      this.collection = new MySelect(el)
    })
  }

  bindEvents() {
    onAjaxContentLoaded((e) => {
      this.init(e.detail.content)
    })
  }
}
