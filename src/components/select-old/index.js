import "./style.pcss"
import Collection from "../../js/generic/collection"
import { getRandomString } from "../../js/utils/getRandomString"
import { render } from "../../js/utils/render"
import { bubble } from "../../js/utils/bubble"
import { isMobileDevice } from "../../js/utils/isMobileDevice"
import { locales } from "../../js/locales"
import { getParams } from "../../js/utils/getParams"
import { wait } from "../../js/utils/wait"

export const instance = "[data-js-select-old]"

export const bubbles = {
  open: "select-old::open",
  close: "select-old::close",
  change: "select-old::change",
}

export class Select {
  els = {
    instance,
    control: "[data-js-select-old-control]",
    body: "[data-js-select-old-body]",
    openButton: "[data-js-select-old-open-button]",
    currentVariantEl: "[data-js-select-old-current-variant]",
    dropdown: "[data-js-select-old-dropdown]",
    list: "[data-js-select-old-list]",
    item: "[data-js-select-old-dropdown-item]",
    optionButton: "[data-js-select-old-option-button]",
    liveSearchInput: "[data-js-select-old-live-search-input]",
    liveSearchClearButton: "[data-js-select-old-live-search-clear-button]",
  }

  defaultCfg = {
    isLiveSearch: false,
  }

  stateClasses = {
    isOpen: "is-open",
    isSelected: "is-selected",
    isHidden: "is-hidden",
    isNotEmpty: "is-not-empty",
    isResultEmpty: "is-result-empty",
  }

  messages = {
    notSelected: locales.select["NOT_SELECTED"],
    severalOptionsSelected: locales.select["SEVERAL_OPTIONS_SELECTED"],
    startTyping: locales.input["START_TYPING"],
    clearInput: locales.input["CLEAR_INPUT"],
  }

  constructor(instance) {
    this.instance = instance
    if (this.instance.querySelector(this.els.body)) return
    this.control = this.instance.querySelector(this.els.control)
    this.label = this.control.labels[0]
    this.openButton = null
    this.dropdown = null
    this.currentVariantEl = null
    this.list = null
    this.optionButtons = []
    this.isMultiple = this.control.multiple
    this.cfg = getParams(this.instance, this.els.instance, this.defaultCfg)
    this.state = {
      isOpen: false,
    }
    this.init()
    this.bindEvents()
  }

  get isOpen() {
    return this.state.isOpen
  }

  set isOpen(value) {
    this.state.isOpen = value
  }

  get isDisabled() {
    return this.control.disabled
  }

  set isDisabled(value) {
    this.control.disabled = value
  }

  get value() {
    return this.control.value
  }

  set value(newValue) {
    this.control.value = newValue
    this.updateOptionButtons()
  }

  get options() {
    return [ ...this.control.options ]
  }

  get selectedOptions() {
    return [ ...this.control.selectedOptions ]
  }

  get selectedOptionButtons() {
    return [ ...this.optionButtons ].filter(optionButton => optionButton.classList.contains(this.stateClasses.isSelected))
  }

  get selectedOptionButtonIndex() {
    return [ ...this.optionButtons ].indexOf(this.selectedOptionButtons[0])
  }

  get isEmpty() {
    return !this.options.length
  }

  appendOption(text, value, isSelected = false) {
    const newOption = new Option(text, value, isSelected, isSelected)
    const newItem = this.getDropdownItemMarkup(newOption)
    this.control.appendChild(newOption)
    render(this.list, newItem)
    bubble(this.control, "change")
    bubble(this.instance, bubbles.change)
    this.updateOptionButtonsEls()
    this.updateOptionButtons()
  }

  removeOption(removedOption) {
    this.options.forEach((option, i) => {
      if (option === removedOption) {
        this.optionButtons[i].closest(this.els.item).remove()
        option.remove()
      }
    })
    bubble(this.control, "change")
    bubble(this.instance, bubbles.change)
    this.updateOptionButtonsEls()
    this.updateOptionButtons()
  }

  empty() {
    this.options.forEach(option => {
      this.removeOption(option)
    })
  }

  toggleVisibility() {
    this.isOpen ?
      this.close() :
      this.open()
  }

  close() {
    this.isOpen = false
    this.instance.classList.remove(this.stateClasses.isOpen)
    bubble(this.instance, bubbles.close)
  }

  open() {
    if (this.isDisabled || this.isEmpty) return
    if (this.liveSearchInput) this.clearLiveSearchInput()
    this.isOpen = true
    this.instance.classList.add(this.stateClasses.isOpen)
    bubble(this.instance, bubbles.open)
    if (this.liveSearchInput) {
      this.instance.classList.remove(this.stateClasses.isResultEmpty)
      wait(100).then(() => {
        this.liveSearchInput.focus()
      })
    }
  }

  updateTabIndex() {
    isMobileDevice() ?
      this.control.removeAttribute("tabindex") :
      this.openButton.setAttribute("tabindex", "0")
  }

  setAttrs() {
    const id = getRandomString()
    const dropdownID = `select-dropdown-${id}`
    const labelID = `select-label-${id}`
    this.openButton.setAttribute("aria-labelledby", labelID)
    this.openButton.setAttribute("aria-owns", dropdownID)
    this.label.setAttribute("id", labelID)
    this.dropdown.setAttribute("id", dropdownID)
    this.updateOpenButtonAttr()
  }

  updateOpenButtonAttr() {
    const firstSelectedOptionButton = this.selectedOptionButtons[0]
    if (firstSelectedOptionButton) {
      this.openButton.setAttribute("aria-activedescendant", firstSelectedOptionButton.id)
    }
  }

  getDropdownItemMarkup(option) {
    const { selected, value, textContent } = option
    const id = `select-option-${getRandomString()}`
    let optionClasses = "select__option"
    if (selected) optionClasses += " is-selected"

    return `
      <li
        class="select__dropdown-item"
        data-js-select-dropdown-item
        role="presentation"
      >
        <button
          class="${optionClasses}"
          id="${id}"
          type="button"
          data-js-select-option-button='{"value": "${value}"}'
          role="option"
        >
          ${textContent}
        </button>
      </li>
    `
  }

  getLiveSearchMarkup() {
    return `
      <input
        class="select__live-search-input form-input"
        type="text"
        autocomplete="off"
        placeholder="${window.App.lang === "ru" ? this.messages.startTyping.ru : this.messages.startTyping.en}"
        data-js-select-live-search-input
      />
      <button
        class="select__live-search-clear-button"
        type="button"
        title="${window.App.lang === "ru" ? this.messages.clearInput.ru : this.messages.clearInput.en}"
        aria-label="${window.App.lang === "ru" ? this.messages.clearInput.ru : this.messages.clearInput.en}"
        data-js-select-live-search-clear-button
      >
        <svg class="i-icon">
          <use href="#icon-close"></use>
        </svg>
      </button>
    `
  }

  generateMarkup() {
    let dropdownItems = ""
    this.options.forEach((option) => {
      dropdownItems += this.getDropdownItemMarkup(option)
    })
    const liveSearchMarkup = this.cfg.isLiveSearch ? this.getLiveSearchMarkup() : ""

    const markup = `
      <div
        class="select__body"
        data-js-select-body
      >
        ${liveSearchMarkup}
        <div
          class="select__input form-input"
          data-js-select-open-button
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="false"
          ${this.isDisabled && "disabled"}
        >
          <span
            class="select__current-variant"
            data-js-select-current-variant
          >
          </span>
          <svg class="select__arrow-icon i-icon">
            <use href="#icon-arrow-down"></use>
          </svg>
        </div>
        <div
          class="select__dropdown"
          data-js-select-dropdown
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
    render(this.control, markup, "afterend")
  }

  updateCurrentVariantCaption() {
    const selectedOptionsLength = this.selectedOptions.length
    let variantCaption
    switch (true) {
      case (selectedOptionsLength > 1): {
        variantCaption = window.App.lang === "ru" ? this.messages.severalOptionsSelected.ru : this.messages.severalOptionsSelected.en
        break
      }
      case (selectedOptionsLength === 0): {
        variantCaption = window.App.lang === "ru" ? this.messages.notSelected.ru : this.messages.notSelected.en
        break
      }
      default: {
        variantCaption = this.selectedOptions[0].textContent
        break
      }
    }
    this.currentVariantEl.textContent = variantCaption ?? ""
  }

  updateOptionButtons() {
    this.options.forEach((option, i) => {
      option.selected ?
        this.selectOptionButton(this.optionButtons[i]) :
        this.unselectOptionButton(this.optionButtons[i])
    })
    this.updateMarkup()
  }

  toggleSelectOptionButton(button) {
    button.classList.contains(this.stateClasses.isSelected) ?
      this.unselectOptionButton(button) :
      this.selectOptionButton(button)
  }

  selectOptionButton(button) {
    button.classList.add(this.stateClasses.isSelected)
    this.control.options[this.getButtonIndex(button)].setAttribute("selected", true)
  }

  unselectOptionButton(button) {
    button.classList.remove(this.stateClasses.isSelected)
    this.control.options[this.getButtonIndex(button)].removeAttribute("selected")
  }

  getButtonIndex(button) {
    return [ ...this.optionButtons ].indexOf(button)
  }

  selectPrevOption() {
    const index = this.selectedOptionButtonIndex

    this.unselectOptionButton(this.optionButtons[index])
    index > 0 ?
      this.selectOptionButton(this.optionButtons[index - 1]) :
      this.selectOptionButton(this.optionButtons[this.optionButtons.length - 1])
    bubble(this.control, "change")
    bubble(this.instance, bubbles.change)
    this.updateMarkup()
  }

  selectNextOption() {
    const index = this.selectedOptionButtonIndex

    this.unselectOptionButton(this.optionButtons[index])
    index < this.optionButtons.length - 1 ?
      this.selectOptionButton(this.optionButtons[index + 1]) :
      this.selectOptionButton(this.optionButtons[0])
    bubble(this.control, "change")
    bubble(this.instance, bubbles.change)
    this.updateMarkup()
  }

  updateMarkup() {
    this.updateOpenButtonAttr()
    this.updateCurrentVariantCaption()
  }

  updateOptionButtonsEls() {
    this.optionButtons = this.instance.querySelectorAll(this.els.optionButton)
  }

  filterResult(searchQuery) {
    this.optionButtons.forEach((optionButton) => {
      const textContent = optionButton.textContent.trim().toLowerCase()

      if (textContent.includes(searchQuery)) {
        optionButton.classList.remove(this.stateClasses.isHidden)
      } else {
        optionButton.classList.add(this.stateClasses.isHidden)
      }
    })

    const hiddenOptionsButtons = [ ...this.optionButtons ].filter((optionButton) => optionButton.classList.contains(this.stateClasses.isHidden))

    if (this.optionButtons.length === hiddenOptionsButtons.length) {
      this.instance.classList.add(this.stateClasses.isResultEmpty)
    } else {
      this.instance.classList.remove(this.stateClasses.isResultEmpty)
    }
  }

  showAllOptionButtons() {
    this.optionButtons.forEach((optionButton) => {
      optionButton.classList.remove(this.stateClasses.isHidden)
    })
  }

  setLiveSearchInputState() {
    if (this.liveSearchInput.value.length) {
      this.liveSearchInput.classList.add(this.stateClasses.isNotEmpty)
    } else {
      this.liveSearchInput.classList.remove(this.stateClasses.isNotEmpty)
    }
  }

  clearLiveSearchInput() {
    this.liveSearchInput.value = ""
    this.liveSearchInput.classList.remove(this.stateClasses.isNotEmpty)
    this.showAllOptionButtons()
  }

  reset() {
    this.value = this.options[0].value
    this.updateOptionButtons()
  }

  handleOptionButtonClick(button) {
    if (this.liveSearchInput) {
      this.clearLiveSearchInput()
      this.showAllOptionButtons()
      this.instance.classList.remove(this.stateClasses.isResultEmpty)
    }
    if (this.isMultiple) {
      this.toggleSelectOptionButton(button)
    } else {
      this.optionButtons.forEach((optionButton) => {
        if (optionButton !== button) {
          this.unselectOptionButton(optionButton)
        }
      })
      this.selectOptionButton(button)
      this.close()
    }
    bubble(this.control, "change")
    bubble(this.instance, bubbles.change)
    this.updateMarkup()
  }

  handleOpenButtonClick() {
    this.toggleVisibility()
  }

  handleClick(event) {
    const isClickOutside = ![ ...event.path ].includes(this.instance)

    if (isClickOutside) {
      this.close()
    }
  }

  handleFormReset() {
    this.reset()
  }

  handleInstanceClick(e) {
    const { target } = e

    if (target.matches(this.els.optionButton)) {
      this.handleOptionButtonClick(target)
    }
  }

  handleInstanceKeyPress(e) {
    if (e.target.matches(this.els.openButton) && e.key === "Enter") {
      this.toggleVisibility()
    }
  }

  handleInstanceKeyDown(e) {
    if (this.isMultiple) return
    switch (e.key) {
      case "ArrowUp": {
        e.preventDefault()
        this.selectPrevOption()
        break
      }
      case "ArrowDown": {
        e.preventDefault()
        this.selectNextOption()
        break
      }
      default: {
        break
      }
    }
  }

  handleControlChange(e) {
    if (e.isTrusted) {
      this.updateOptionButtons()
    }
  }

  handleLabelClick(e) {
    this.isEmpty && e.preventDefault()
    this.open()
  }

  handleLiveSearchInput(event) {
    const searchQuery = event.target.value.trim().toLowerCase()

    if (searchQuery.length > 0) {
      this.filterResult(searchQuery)
    } else {
      this.showAllOptionButtons()
    }

    this.setLiveSearchInputState()
  }

  handleLiveSearchClearButtonClick() {
    this.clearLiveSearchInput()
    this.showAllOptionButtons()
    this.liveSearchInput.focus()
    this.instance.classList.remove(this.stateClasses.isResultEmpty)
  }

  init() {
    this.generateMarkup()
    this.body = this.instance.querySelector(this.els.body)
    this.openButton = this.instance.querySelector(this.els.openButton)
    this.currentVariantEl = this.instance.querySelector(this.els.currentVariantEl)
    this.dropdown = this.instance.querySelector(this.els.dropdown)
    this.list = this.instance.querySelector(this.els.list)
    this.liveSearchInput = this.instance.querySelector(this.els.liveSearchInput)
    this.liveSearchClearButton = this.instance.querySelector(this.els.liveSearchClearButton)
    this.updateOptionButtonsEls()
    this.updateCurrentVariantCaption()
    this.updateTabIndex()
    this.setAttrs()
  }

  destroy() {
    this.body.remove()
  }

  bindEvents() {
    this.openButton.addEventListener("click", () => this.handleOpenButtonClick())
    document.addEventListener("click", (event) => this.handleClick(event))
    this.instance.addEventListener("click", (e) => this.handleInstanceClick(e))
    this.instance.addEventListener("keypress", (e) => this.handleInstanceKeyPress(e))
    this.instance.addEventListener("keydown", (e) => this.handleInstanceKeyDown(e))
    this.control.addEventListener("change", (e) => this.handleControlChange(e))
    this.label.addEventListener("click", (e) => this.handleLabelClick(e))
    if (this.liveSearchInput) {
      this.liveSearchInput.addEventListener("input", (event) => this.handleLiveSearchInput(event))
      this.liveSearchClearButton.addEventListener("click", () => this.handleLiveSearchClearButtonClick())
    }
    if (this.control.form) {
      this.control.form.addEventListener("reset", () => this.handleFormReset())
    }
  }
}

export class SelectCollection extends Collection {
  constructor() {
    super(instance, Select)
  }
}
