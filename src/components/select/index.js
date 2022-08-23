import "./style.pcss"
import Collection from "../../js/generic/collection"
import { getLocaleMsg } from "../../js/utils/getLocaleMsg"
import { render } from "../../js/utils/render"
import { classNames } from "../../js/utils/classNames"
import { getRandomString } from "../../js/utils/getRandomString"
import { bubble } from "../../js/utils/bubble"
import { getParams } from "../../js/utils/getParams"
import { wait } from "../../js/utils/wait"

export const instance = "[data-js-select]"

export const bubbles = {
  open: "select::open",
  close: "select::close",
  change: "select::change",
}

export class Select {
  els = {
    instance,
    control: "[data-js-select-control]",
    option: "[data-js-select-option]",
    body: "[data-js-select-body]",
    searchInput: "[data-js-select-search-input]",
    searchClearButton: "[data-js-select-search-clear-button]",
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
    isNotEmpty: "is-not-empty",
    isHidden: "is-hidden",
    isResultEmpty: "is-result-empty",
  }

  messages = {
    notSelected: getLocaleMsg("SELECT_NOT_SELECTED"),
    severalOptionsSelected: getLocaleMsg("SELECT_SEVERAL_OPTIONS_SELECTED"),
    open: getLocaleMsg("SELECT_OPEN"),
    close: getLocaleMsg("SELECT_CLOSE"),
    startTyping: getLocaleMsg("START_TYPING"),
    clearInput: getLocaleMsg("CLEAR_INPUT"),
  }

  defaultParams = {
    hasSearch: false,
  }

  constructor(instance) {
    this.instance = instance
    this.controlNode = this.instance.querySelector(this.els.control)
    this.labelNode = this.controlNode.labels?.[0]
    this.bodyNode = null
    this.searchInputNode = null
    this.searchClearButtonNode = null
    this.toggleButtonNode = null
    this.currentVariantNode = null
    this.dropdownListNode = null
    this.dropdownOptionNodes = []
    this.state = {
      isOpen: false,
    }
    this.params = getParams(this.instance, this.els.instance, this.defaultParams)
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
    this.controlNode.toggleAttribute("required", isRequired)
  }

  get isDisabled() {
    return this.controlNode.disabled
  }

  get isMultiple() {
    return this.controlNode.multiple
  }

  set isDisabled(isDisabled) {
    this.controlNode.toggleAttribute("disabled", isDisabled)
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

  showAllOptionButtons() {
    this.dropdownOptionNodes.forEach((dropdownOptionNode) => {
      dropdownOptionNode.classList.remove(this.stateClasses.isHidden)
    })
  }

  setSearchInputState() {
    const isNotEmpty = this.searchInputNode.value.length > 0

    this.searchInputNode.classList.toggle(this.stateClasses.isNotEmpty, isNotEmpty)
  }

  clearSearchInput() {
    this.instance.classList.remove(this.stateClasses.isResultEmpty)
    this.searchInputNode.value = ""
    this.searchInputNode.classList.remove(this.stateClasses.isNotEmpty)
    this.showAllOptionButtons()
  }

  filterResult(searchQuery) {
    this.dropdownOptionNodes.forEach((dropdownOptionNode) => {
      const textContent = dropdownOptionNode.textContent.trim().toLowerCase()
      const hasMatches = textContent.includes(searchQuery)

      dropdownOptionNode.classList.toggle(this.stateClasses.isHidden, !hasMatches)
    })

    const hiddenDropdownOptionNodes = [ ...this.dropdownOptionNodes ].filter((dropdownOptionNode) => dropdownOptionNode.classList.contains(this.stateClasses.isHidden))
    const isAllDropdownOptionsHidden = this.dropdownOptionNodes.length === hiddenDropdownOptionNodes.length

    this.instance.classList.toggle(this.stateClasses.isResultEmpty, isAllDropdownOptionsHidden)
  }

  open() {
    if (this.isDisabled || this.isEmpty) return

    this.state.isOpen = true
    this.instance.classList.add(this.stateClasses.isOpen)
    this.toggleButtonNode.setAttribute("title", this.messages.close)
    bubble(this.instance, bubbles.open)

    if (this.searchInputNode) {
      this.clearSearchInput()
      wait(100).then(() => this.searchInputNode.focus())
    }
  }

  close() {
    this.state.isOpen = false
    this.instance.classList.remove(this.stateClasses.isOpen)
    this.toggleButtonNode.setAttribute("title", this.messages.open)
    bubble(this.instance, bubbles.close)

    if (this.searchInputNode) {
      this.clearSearchInput()
    }
  }

  toggleOpenState() {
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
    } = optionNode

    const optionClassNames = classNames("select__dropdown-option", {
      [this.stateClasses.isSelected]: isSelected,
      [this.stateClasses.isDisabled]: isDisabled,
    })
    const optionID = `select-option-option-${getRandomString()}`

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
          data-js-select-dropdown-option
          role="option"
        >
          ${label}
        </button>
      </li>
    `
  }

  getSearchMarkup() {
    const clearButtonIconMarkup = require("../icon/template.ejs")({ name: "close" })

    return `
      <input
        class="select__search-input"
        type="text"
        autocomplete="off"
        placeholder="${this.messages.startTyping}"
        data-js-select-search-input
      />
      <button
        class="select__search-clear-button"
        type="button"
        title="${this.messages.clearInput}"
        aria-label="${this.messages.clearInput}"
        data-js-select-search-clear-button
      >
        ${clearButtonIconMarkup}
      </button>
    `
  }

  generateMarkup() {
    const iconMarkup = require("../icon/template.ejs")({ name: "arrow-down" })
    const dropdownItemsMarkup = this.options.map((optionNode) => this.getDropdownItemMarkup(optionNode)).join("")
    const searchMarkup = this.params.hasSearch ? this.getSearchMarkup() : ""

    const markup = `
      <div
        class="select__body"
        data-js-select-body
      >
        ${searchMarkup}
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
    this.searchInputNode = this.instance.querySelector(this.els.searchInput)
    this.searchClearButtonNode = this.instance.querySelector(this.els.searchClearButton)
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
    optionNode.toggleAttribute("selected", isSelected)
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

  handleClick({ path }) {
    const isClickOutside = !path.includes(this.instance)

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

  handleInstanceClick({ target }) {
    if (target.matches(this.els.dropdownOption)) {
      this.handleDropdownOptionClick(target)
    }
  }

  handleToggleButtonClick() {
    this.toggleOpenState()
  }

  handleControlChange({ isTrusted }) {
    if (isTrusted) {
      this.updateDropdownOptions()
    }
  }

  handleLabelClick(event) {
    if (this.isEmpty) {
      event.preventDefault()
    }

    this.open()
  }

  handleInstanceKeyPress({ target, key }) {
    const isControlNodeFocused = target.matches(this.els.control)
    const isEnterPressed = key === "Enter"

    if (isControlNodeFocused && isEnterPressed) {
      this.toggleOpenState()
    }
  }

  handleSearchInput({ target }) {
    const searchQuery = target.value.trim().toLowerCase()

    if (searchQuery.length > 0) {
      this.filterResult(searchQuery)
    } else {
      this.showAllOptionButtons()
    }

    this.setSearchInputState()
  }

  handleSearchClearButtonClick() {
    this.clearSearchInput()
    this.searchInputNode.focus()
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
    this.instance.addEventListener("keypress", (event) => this.handleInstanceKeyPress(event))
    this.toggleButtonNode.addEventListener("click", () => this.handleToggleButtonClick())
    this.controlNode.addEventListener("change", (event) => this.handleControlChange(event))
    this.labelNode.addEventListener("click", (event) => this.handleLabelClick(event))
    this.searchInputNode?.addEventListener("input", (event) => this.handleSearchInput(event))
    this.searchClearButtonNode?.addEventListener("click", () => this.handleSearchClearButtonClick())
  }
}

export class SelectCollection extends Collection {
  constructor() {
    super(instance, Select)
  }
}
