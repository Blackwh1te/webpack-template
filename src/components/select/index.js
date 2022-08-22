import "./style.pcss"
import Collection from "../../js/generic/collection"
import { getLocaleMsg } from "../../js/utils/getLocaleMsg"
import { render } from "../../js/utils/render"
import { classNames } from "../../js/utils/classNames"
import { getRandomString } from "../../js/utils/getRandomString"
import { getParams } from "../../js/utils/getParams"
import { bubble } from "../../js/utils/bubble"

export const instance = "[data-js-select]"

export const bubbles = {
  open: "select-old::open",
  close: "select-old::close",
  change: "select-old::change",
}

export class Select {
  els = {
    instance,
    control: "[data-js-select-control]",
    option: "[data-js-select-option]",
    body: "[data-js-select-body]",
    toggleButton: "[data-js-select-toggle-button]",
    currentVariant: "[data-js-select-current-variant]",
    dropdown: "[data-js-select-dropdown]",
    dropdownList: "[data-js-select-dropdown-list]",
    dropdownItem: "[data-js-select-dropdown-item]",
    dropdownOption: "[data-js-select-dropdown-option]",
  }

  stateClasses = {
    isOpen: "is-open",
    isSelected: "is-selected",
    isDisabled: "is-disabled",
  }

  messages = {
    notSelected: getLocaleMsg("SELECT_NOT_SELECTED"),
    severalOptionsSelected: getLocaleMsg("SELECT_SEVERAL_OPTIONS_SELECTED"),
    open: getLocaleMsg("SELECT_OPEN"),
    close: getLocaleMsg("SELECT_CLOSE"),
  }

  constructor(instance) {
    this.instance = instance
    this.controlNode = this.instance.querySelector(this.els.control)
    this.labelNode = this.controlNode.labels?.[0]
    this.bodyNode = null
    this.toggleButtonNode = null
    this.currentVariantNode = null
    this.dropdownListNode = null
    this.dropdownOptionNodes = []
    this.state = {
      isOpen: false,
    }
    this.init()
  }

  get options() {
    return [ ...this.controlNode.options ]
  }

  get selectedOptions() {
    return [ ...this.controlNode.selectedOptions ]
  }
  
  get selectedDropdownOptions() {
    return [ ...this.dropdownOptionNodes ].filter((dropdownOptionNode) => dropdownOptionNode.classList.contains(this.stateClasses.isSelected))
  }

  get isRequired() {
    return this.controlNode.required
  }

  set isRequired(isRequired) {
    isRequired ?
      this.controlNode.setAttribute("required", "") :
      this.controlNode.removeAttribute("required")
  }

  get isDisabled() {
    return this.controlNode.disabled
  }

  get isMultiple() {
    return this.controlNode.multiple
  }

  set isDisabled(isDisabled) {
    isDisabled ?
      this.controlNode.setAttribute("disabled", "") :
      this.controlNode.removeAttribute("disabled")
  }

  get isEmpty() {
    return !this.options.length
  }

  get currentVariantLabel() {
    const selectedOptionsLength = this.selectedOptions.length

    return selectedOptionsLength > 1 ? this.messages.severalOptionsSelected :
      selectedOptionsLength === 0 ? this.messages.notSelected : this.selectedOptions[0].textContent
  }

  getDropdownOptionIndex(dropdownOptionNode) {
    return [ ...this.dropdownOptionNodes ].indexOf(dropdownOptionNode)
  }

  updateCurrentVariantLabel() {
    this.currentVariantNode.textContent = this.currentVariantLabel
  }

  open() {
    if (this.isDisabled || this.isEmpty) return
    this.state.isOpen = true
    this.instance.classList.add(this.stateClasses.isOpen)
    bubble(this.instance, bubbles.open)
  }

  close() {
    this.state.isOpen = false
    this.instance.classList.remove(this.stateClasses.isOpen)
    bubble(this.instance, bubbles.close)
  }

  toggle() {
    this.state.isOpen ? this.close() : this.open()
  }

  updateDropdownOptionNodes() {
    this.dropdownOptionNodes = this.instance.querySelectorAll(this.els.dropdownOption)
  }

  getDropdownItemMarkup(optionNode) {
    const {
      disabled: isDisabled,
      selected: isSelected,
      textContent: label,
      value,
    } = optionNode

    const optionClassNames = classNames("select__dropdown-option", {
      [this.stateClasses.isSelected]: isSelected,
      [this.stateClasses.isDisabled]: isDisabled,
    })
    const optionID = `select-option-option-${getRandomString()}`
    const optionParams = { value }

    return `
      <li
        class="select__dropdown-item"
        data-js-select-dropdown-item
        role="presentation"
      >
        <button
          class="${optionClassNames}"
          id="${optionID}"
          type="button"
          data-js-select-dropdown-option='${JSON.stringify(optionParams)}'
          role="option"
        >
          ${label}
        </button>
      </li>
    `
  }

  generateMarkup() {
    const iconMarkup = require("../icon/template.ejs")({ name: "arrow-down" })
    const dropdownItemsMarkup = this.options.map((optionNode) => this.getDropdownItemMarkup(optionNode)).join("")

    const markup = `
      <div
        class="select__body"
        data-js-select-body
      >
        <div
          class="select__toggle-button"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="false"
          title="${this.messages.open}"
          ${this.isDisabled && "disabled"}
          data-js-select-toggle-button
        >
          <span
            class="select__current-variant"
            data-js-select-current-variant
          >
            ${this.currentVariantLabel}
          </span>
          ${iconMarkup}
        </div>
        <div class="select__dropdown" data-js-select-dropdown>
          <ul
            class="select__dropdown-list"
            role="listbox"
            data-js-select-dropdown-list
          >
            ${dropdownItemsMarkup}
          </ul>
        </div>
      </div>
    `

    render(this.controlNode, markup, "afterend")
  }

  defineNodes() {
    this.bodyNode = this.instance.querySelector(this.els.body)
    this.toggleButtonNode = this.instance.querySelector(this.els.toggleButton)
    this.currentVariantNode = this.instance.querySelector(this.els.currentVariant)
    this.dropdownNode = this.instance.querySelector(this.els.dropdown)
    this.dropdownListNode = this.instance.querySelector(this.els.dropdownList)
    this.updateDropdownOptionNodes()
  }

  updateToggleButtonAttributes() {
    const firstSelectedDropdownOptionNode = this.selectedDropdownOptions?.[0]

    if (firstSelectedDropdownOptionNode) {
      this.toggleButtonNode.setAttribute("aria-activedescendant", firstSelectedDropdownOptionNode.id)
    }
  }

  setAttributes() {
    const id = getRandomString()
    const dropdownID = `select-dropdown-${id}`
    const labelID = `select-label-${id}`
    
    this.toggleButtonNode.setAttribute("aria-labelledby", labelID)
    this.toggleButtonNode.setAttribute("aria-owns", dropdownID)
    this.label?.setAttribute("id", labelID)
    this.dropdownNode.setAttribute("id", dropdownID)
    this.updateToggleButtonAttributes()
  }

  updateMarkup() {
    this.updateToggleButtonAttributes()
    this.updateCurrentVariantLabel()
  }

  toggleOptionState(optionNode, isSelected = true) {
    isSelected ?
      optionNode.setAttribute("selected", "") :
      optionNode.removeAttribute("selected")
  }

  toggleDropdownOption(dropdownOptionNode) {
    const isSelected = dropdownOptionNode.classList.contains(this.stateClasses.isSelected)
    const relativeOptionNode = this.options[this.getDropdownOptionIndex(dropdownOptionNode)]

    dropdownOptionNode.classList.toggle(this.stateClasses.isSelected, !isSelected)
    this.toggleOptionState(relativeOptionNode, !isSelected)
  }

  selectDropdownOption(selectedDropdownOptionNode) {
    this.dropdownOptionNodes.forEach((dropdownOptionNode, index) => {
      const isSelected = selectedDropdownOptionNode === dropdownOptionNode
      const relativeOptionNode = this.options[index]

      dropdownOptionNode.classList.toggle(this.stateClasses.isSelected, isSelected)
      this.toggleOptionState(relativeOptionNode, isSelected)
    })
  }

  updateDropdownOptions() {
    this.options.forEach((optionNode, index) => {
      const isSelected = optionNode.selected
      const relatedDropdownOptionNode = this.dropdownOptionNodes[index]

      relatedDropdownOptionNode.classList.toggle(this.stateClasses.isSelected, isSelected)
    })
    this.updateMarkup()
  }

  handleClick(event) {
    const isClickOutside = !event.path.includes(this.instance)

    if (isClickOutside) {
      this.close()
    }
  }

  handleDropdownOptionClick(dropdownOptionNode) {
    if (this.isMultiple) {
      this.toggleDropdownOption(dropdownOptionNode)
    } else {
      this.selectDropdownOption(dropdownOptionNode)
      this.close()
    }
    this.updateMarkup()
    bubble(this.control, bubbles.change)
  }

  handleInstanceClick(event) {
    const { target } = event

    if (target.matches(this.els.dropdownOption)) {
      this.handleDropdownOptionClick(target)
    }
  }

  handleToggleButtonClick() {
    this.toggle()
  }

  handleControlChange({ isTrusted }) {
    if (isTrusted) {
      this.updateDropdownOptions()
    }
  }

  init() {
    this.generateMarkup()
    this.defineNodes()
    this.setAttributes()
    this.bindEvents()
  }

  bindEvents() {
    document.addEventListener("click", (event) => this.handleClick(event))
    this.instance.addEventListener("click", (event) => this.handleInstanceClick(event))
    this.toggleButtonNode.addEventListener("click", () => this.handleToggleButtonClick())
    this.controlNode.addEventListener("change", (event) => this.handleControlChange(event))
  }
}

export class SelectCollection extends Collection {
  constructor() {
    super(instance, Select)
  }
}
