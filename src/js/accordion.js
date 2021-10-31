import Collection from './generic/collection';
import {getCfg} from './utils/getCfg'
import {onAjaxContentLoaded} from './generic/eventing'

export const instance = '[data-js-accordion]';

export class Accordion {
  els = {
    instance,
    item: '[data-js-accordion-item]',
    summary: '[data-js-accordion-summary]',
    content: '[data-js-accordion-content]',
    btn: '[data-js-accordion-btn]',
  };

  classStates = {
    isOpen: 'is-open',
    isFullyExpanded: 'is-fully-expanded',
  };

  defaultCfg = {
    isAutoClosing: true,
    wholeSummaryClickable: true,
    animationParams: {
      duration: 500,
      easing: 'ease',
    },
  };

  constructor(instance) {
    this.instance = instance;
    this.items = this.instance.querySelectorAll(`:scope > ${this.els.item}`);
    this.summaryEls = this.instance.querySelectorAll(`:scope > ${this.els.item} > ${this.els.summary}`);
    this.cfg = getCfg(this.instance, this.els.instance, this.defaultCfg);
    this.clickableEls = this.getClickableEls()
    this.init();
    this.bindEvents();
  }

  getClickableEls() {
    if (this.cfg.wholeSummaryClickable || this.cfg.isExtraView) {
      return this.summaryEls
    } else {
      return this.instance.querySelectorAll(`:scope > ${this.els.item} > ${this.els.summary} ${this.els.btn}`);
    }
  }

  clearAnimationsArray(arr) {
    arr.forEach((animation) => {
      animation.cancel();
    });
  }

  isOpen = (item) => item.classList.contains(this.classStates.isOpen);

  open(item) {
    const content = item.querySelector(this.els.content);

    this.clearAnimationsArray(content.getAnimations());
    item.open = true;
    item.classList.add(this.classStates.isOpen);

    content.animate([
      {height: '0'},
      {height: `${content.scrollHeight}px`},
    ], this.cfg.animationParams).onfinish = () => {
      item.classList.add(this.classStates.isFullyExpanded);
    };

    if (this.cfg.isAutoClosing) {
      this.closeAllExcludeOne(item);
    }
  }

  close(item) {
    const content = item.querySelector(this.els.content);

    this.clearAnimationsArray(content.getAnimations());
    item.classList.remove(this.classStates.isOpen);
    item.classList.remove(this.classStates.isFullyExpanded);
    content.animate([
      {height: `${content.scrollHeight}px`},
      {height: '0'},
    ], this.cfg.animationParams).onfinish = () => {
      item.open = false;
    };
  }

  closeAllExcludeOne(excludeEl) {
    this.items.forEach((item) => {
      if (item !== excludeEl) {
        this.close(item);
      }
    });
  }

  handleSummaryClick(e) {
    if (e.target instanceof HTMLAnchorElement) {
      return;
    }
    e.preventDefault();
  }

  handleClickableElClick(e) {
    const item = e.target.closest(this.els.item);

    this.isOpen(item) ?
      this.close(item) :
      this.open(item);
  }

  setInitialFullyExpandedState() {
    this.items.forEach(item => {
      if (this.isOpen(item)) {
        item.classList.add(this.classStates.isFullyExpanded);
      }
    });
  }

  init() {
    this.setInitialFullyExpandedState()
  }

  bindEvents() {
    this.summaryEls.forEach((summary) => {
      summary.addEventListener('click', (e) => this.handleSummaryClick(e));
    });
    this.clickableEls.forEach((clickableEl) => {
      clickableEl.addEventListener('click', (e) => this.handleClickableElClick(e));
    });
  }
}

export class AccordionCollection extends Collection {
  constructor() {
    super(instance, Accordion);
    this.init();
    this.bindEvents()
  }

  init(context = document) {
    context.querySelectorAll(instance).forEach((el) => {
      this.collection = new Accordion(el);
    });
  }

  bindEvents() {
    onAjaxContentLoaded((e) => {
      this.init(e.detail.content);
    });
  }
}
