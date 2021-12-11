import './style.pcss'
import Collection from '../../js/generic/collection'
import {onAjaxContentLoaded} from '../../js/generic/eventing'
import {getRandomString} from '../../js/utils/getRandomString'
import {render} from '../../js/utils/render'
import {getCfg} from '../../js/utils/getCfg'
import {bubble} from '../../js/utils/bubble'
import {isMobileDevice} from '../../js/utils/isMobileDevice'
import {getLocaleMsg} from '../../js/locales'
import {wait} from '../../js/utils/wait'

export const instance = '[data-js-select]'

export class Select {
  els = {
    instance,
    body: '[data-js-select-body]',
    control: '[data-js-select-control]',
    openBtn: '[data-js-select-open-btn]',
    currentVariantEl: '[data-js-select-current-variant]',
    list: '[data-js-select-list]',
    optionBtn: '[data-js-select-option-btn]',
    checkbox: '[data-js-select-checkbox]',
  }

  stateClasses = {
    isOpen: 'is-open',
    isSelected: 'is-selected',
  }

  constructor(instance) {
    this.instance = instance
    if (this.instance.querySelector(this.els.body)) return
    this.control = this.instance.querySelector(this.els.control)
    this.label = this.control.labels[0]
    this.openBtn = null
    this.currentVariantEl = null
    this.list = null
    this.optionButtons = []
    this.checkboxes = []
    this.state = {
      isOpen: false
    }
    this.init()
    this.bindEvents()
  }

  get value() {
    return this.control.value
  }

  get selectedOptionBtn() {
    return [...this.optionButtons].filter(optionBtn => optionBtn.classList.contains(this.stateClasses.isSelected))[0]
  }

  get selectedOptionBtnIndex() {
    return [...this.optionButtons].indexOf(this.selectedOptionBtn)
  }

  setValue(value = '') {
    let newValue = value
    if (this.control.multiple) {
      const checkedEls = [...this.checkboxes].filter(checkbox => checkbox.checked)
      const checkedValues = checkedEls.map(checkedEl => checkedEl.name)
      if (checkedValues.length) newValue = `["${checkedValues.join(`", "`)}"]`
      if (checkedValues.length === 0) {
        this.currentVariantEl.textContent = getLocaleMsg('NOT_SELECTED')
      } else if (checkedValues.length === 1) {
        this.currentVariantEl.textContent = checkedEls[0].labels[0].textContent
      } else if (checkedValues.length > 1) {
        this.currentVariantEl.textContent = getLocaleMsg('SEVERAL_OPTIONS_SELECTED')
      }
    }
    this.control.value = newValue
  }

  updateValue() {
    if (this.control.multiple) {
      if (isMobileDevice()) {
        const checkedOptions = [...this.control.options].filter(option => option.selected).map(option => option.value)
        if (checkedOptions.length === 0) {
          this.currentVariantEl.textContent = getLocaleMsg('NOT_SELECTED')
        } else if (checkedOptions.length === 1) {
          this.currentVariantEl.textContent = checkedOptions[0]
        } else if (checkedOptions.length > 1) {
          this.currentVariantEl.textContent = getLocaleMsg('SEVERAL_OPTIONS_SELECTED')
        }
      }
    } else {
      this.optionButtons.forEach((optionBtn) => {
        const optionBtnValue = getCfg(optionBtn, this.els.optionBtn).value
        if (optionBtnValue === this.value) {
          this.selectOption(optionBtn)
          this.close()
        }
      })
    }
  }

  append(option) {
    const item = this.getDropdownItemMarkup(option)
    render(this.list, item)
    this.control.appendChild(option)
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
    if (this.control.disabled) return
    this.state.isOpen = true
    this.instance.classList.add(this.stateClasses.isOpen)
  }

  getDropdownItemMarkup(option, id = false) {
    let optionClasses = 'select__option'
    let idAttr = ''
    if (id) {
      optionClasses += ' is-selected'
      idAttr = `id=${id}`
    }

    return `
      <li
        class="select__dropdown-item"
        role="presentation"
      >
        <button
          class="${optionClasses}"
          ${idAttr}
          type="button"
          data-js-select-option-btn='{"value": "${option.value}"}'
          role="option"
        >
          ${option.textContent}
        </button>
      </li>
    `
  }

  getDropdownItemsMarkup(selectedOptions, notSelectedOptions) {
    let items = this.getDropdownItemMarkup(selectedOptions[0].el, selectedOptions[0].id)
    notSelectedOptions.forEach(option => {
      items += this.getDropdownItemMarkup(option)
    })
    return items
  }

  getDropdownMultipleItemsMarkup(controlOptions) {
    let items = ''

    controlOptions.forEach((option) => {
      const {value, textContent, selected} = option
      const id = `${this.control.name}[${value}]`

      items += `
        <li
          class="select__dropdown-item"
          role="presentation"
        >
          <label class="select__checkbox checkbox checkbox--checkbox">
            <input
              class="checkbox__input visually-hidden"
              id="${id}"
              name="${id}"
              type="checkbox"
              value="Y"
              autocomplete="off"
              ${selected ? 'checked' : ''}
              data-js-select-checkbox
            >
            <span class="checkbox__emulator">
              <svg class="i-icon icon-check" data-js-svg-id="icon-check" viewBox="0 0 12 8">
                <path d="M10.1301 0.324862L4.08948 5.92795L1.86995 3.86917C1.76234 3.76935 1.58786 3.76935 1.48023 3.86917L0.830708 4.47165C0.723097 4.57146 0.723097 4.73331 0.830708 4.83314L3.89461 7.67514C4.00222 7.77495 4.1767 7.77495 4.28434 7.67514L11.1693 1.28884C11.2769 1.18902 11.2769 1.02718 11.1693 0.927338L10.5198 0.324862C10.4122 0.225046 10.2377 0.225046 10.1301 0.324862Z" fill="#1C75BC"></path>
              </svg>
            </span>
            <span class="checkbox__label">${textContent}</span>
          </label>
        </li>
      `
    })
    return items
  }

  generateMarkup() {
    const id = getRandomString()
    const controlOptions = [...this.control.options]
    const selectedOptions = controlOptions.filter(option => option.selected)
      .map((option, index) => {
        return {
          el: option,
          id: index === 0 ? `select-${id}-selected-option` : `select-${getRandomString()}-selected-option`
        }
      })
    const selectedOptionID = selectedOptions.length === 1 ? selectedOptions[0].id : ''
    const ariaActivedescendant = selectedOptionID ? `aria-activedescendant="${selectedOptionID}"` : ''

    let currentVariantText = getLocaleMsg('NOT_SELECTED')
    if (selectedOptions.length > 1) {
      currentVariantText = getLocaleMsg('SEVERAL_OPTIONS_SELECTED')
    } else if (selectedOptions.length === 1) {
      currentVariantText = selectedOptions[0].el.textContent
    }

    const dropdownID = `select-${id}-dropdown`
    const labelID = `select-${id}-label`
    const notSelectedOptions = controlOptions.filter(option => !option.selected)
    const dropdownItems = this.control.multiple ?
      this.getDropdownMultipleItemsMarkup(controlOptions) :
      this.getDropdownItemsMarkup(selectedOptions, notSelectedOptions)
    let openBtnTabIndex = ''
    this.label.setAttribute('id', labelID)

    isMobileDevice() ?
      this.control.removeAttribute('tabindex') :
      openBtnTabIndex = 'tabindex="0"'

    const markup = `
      <div
        class="select__body"
        data-js-select-body
      >
        <div
          class="select__input form-input"
          data-js-select-open-btn
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="false"
          aria-owns="${dropdownID}"     
          ${ariaActivedescendant}
          aria-labelledby="${labelID}"
          ${openBtnTabIndex}
          ${this.control.disabled && 'disabled'}
        >
          <span
            class="select__current-variant"
            data-js-select-current-variant
          >
            ${currentVariantText}
          </span>
          <svg class="select__arrow-icon i-icon">
            <use href="#icon-arrow-down"></use>
          </svg>
        </div>
        <div
          class="select__dropdown"
          id="${dropdownID}"
        >
          <ul
            class="select__dropdown-list"
            data-js-select-list
            role="listbox"
          >
            ${dropdownItems}
          </ul>
        </div>
      </div>
    `

    render(this.control, markup, 'afterend')
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

    this.currentVariantEl.textContent = optionBtn.textContent
    this.setValue(value)
    bubble(this.control, 'change')
    this.updateOptionButtons(optionBtn)
  }

  selectPrevOption() {
    const index = this.selectedOptionBtnIndex

    index > 0 ?
      this.selectOption(this.optionButtons[index - 1]) :
      this.selectOption(this.optionButtons[this.optionButtons.length - 1])
  }

  selectNextOption() {
    const index = this.selectedOptionBtnIndex

    index < this.optionButtons.length - 1 ?
      this.selectOption(this.optionButtons[index + 1]) :
      this.selectOption(this.optionButtons[0])
  }

  handleOpenBtnClick() {
    this.toggleVisibility()
  }

  handleClick(e) {
    if (!e.target.closest(this.els.instance)) this.close()
  }

  handleInstanceClick(e) {
    const {target} = e

    if (target.matches(this.els.optionBtn)) {
      this.selectOption(target)
      this.close()
    }
  }

  handleInstanceKeyPress(e) {
    const {target, key} = e

    if (target.matches(this.els.openBtn) && key === 'Enter') {
      this.toggleVisibility()
    }

    if (target.matches(this.els.checkbox)) {
      wait(100).then(() => {
        this.setValue()
      })
    }
  }

  handleInstanceKeyDown(e) {
    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault()
        if (!this.control.multiple) this.selectPrevOption()
        break
      }
      case 'ArrowDown': {
        e.preventDefault()
        if (!this.control.multiple) this.selectNextOption()
        break
      }
      default: {
        break
      }
    }
  }

  handleControlChange(e) {
    if (!this.state.isOpen) {
      wait(100).then(() => {
        this.updateValue()
      })
    }
  }

  handleInstanceChange(e) {
    if (e.target.matches(this.els.checkbox)) {
      this.setValue()
    }
  }

  handleLabelClick() {
    this.open()
  }

  init() {
    this.generateMarkup()
    this.openBtn = this.instance.querySelector(this.els.openBtn)
    this.currentVariantEl = this.instance.querySelector(this.els.currentVariantEl)
    this.list = this.instance.querySelector(this.els.list)
    this.optionButtons = this.instance.querySelectorAll(this.els.optionBtn)
    this.checkboxes = this.instance.querySelectorAll(this.els.checkbox)
  }

  bindEvents() {
    this.openBtn.addEventListener('click', () => this.handleOpenBtnClick())
    document.addEventListener('click', (e) => this.handleClick(e))
    this.instance.addEventListener('click', (e) => this.handleInstanceClick(e))
    this.instance.addEventListener('keypress', (e) => this.handleInstanceKeyPress(e))
    this.instance.addEventListener('keydown', (e) => this.handleInstanceKeyDown(e))
    this.control.addEventListener('change', (e) => this.handleControlChange(e))
    if (this.control.multiple) {
      this.instance.addEventListener('change', (e) => this.handleInstanceChange(e))
    }
    this.label.addEventListener('click', () => this.handleLabelClick())
  }
}

export class SelectCollection extends Collection {
  constructor() {
    super(instance, Select)
    this.init()
    this.bindEvents()
  }

  init(context = document) {
    context.querySelectorAll(instance).forEach((el) => {
      this.collection = new Select(el)
    })
  }

  bindEvents() {
    onAjaxContentLoaded((e) => {
      this.init(e.detail.content)
    })
  }
}
