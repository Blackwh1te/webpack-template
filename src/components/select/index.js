import './style.pcss';
import Collection from './../../js/generic/collection';
import customSelect from 'custom-select';
import {onAjaxContentLoaded} from '../../js/generic/eventing';
import {bubble} from '../../js/utils/bubble';
import {getCfg} from '../../js/utils/getCfg'
import {render} from '../../js/utils/render'

export const instance = '[data-js-select]';

export class Select {
  classStates = {
    isOpen: 'is-open',
    isFullyExpanded: 'is-fully-expanded'
  };

  bubbles = {
    change: 'change',
  };

  customCfg = {
    containerClass: 'select__container',
    iconWrapperClass: 'select__icon-wrapper',
    openerClass: 'select__input form-input',
    panelClass: 'select__dropdown',
    optionClass: 'select__option',
  }

  constructor(instance) {
    this.instance = instance;
    this.customSelect = null;
    this.init();
    this.bindEvents();
  }

  isOpen() {
    return this.customSelect.container.classList.contains(this.classStates.isOpen);
  }

  setReadyState() {
    this.customSelect.panel.classList.add(this.classStates.isFullyExpanded);
  }

  removeReadyState() {
    this.customSelect.panel.classList.remove(this.classStates.isFullyExpanded);
  }

  renderIcon() {
    let iconLayout = `
      <span class=${this.customCfg.iconWrapperClass}>
        <svg class="i-icon">
          <use href="#icon-arrow-down"></use>
        </svg>
      </span>
    `
    render(this.customSelect.opener, iconLayout)
  }

  handleTransitionEnd() {
    this.isOpen() ? this.setReadyState() : this.removeReadyState();
  }

  handleChange() {
    bubble(this.instance.closest('form') || document, this.bubbles.change);
  }

  init() {
    this.customSelect = customSelect(this.instance, this.customCfg)[0];
    this.renderIcon()
  }

  bindEvents() {
    this.customSelect.panel.addEventListener('transitionend', () => this.handleTransitionEnd());
    this.instance.addEventListener('change', (e) => this.handleChange(e));
  }
}

export class SelectCollection extends Collection {
  constructor() {
    super(instance, Select);
    this.init();
    this.bindEvents();
  }

  init(context = document) {
    context.querySelectorAll(instance).forEach(el => {
      this.collection = new Select(el);
    });
  }

  bindEvents() {
    onAjaxContentLoaded((e) => {
      this.init(e.detail.content);
    });
  }
}
