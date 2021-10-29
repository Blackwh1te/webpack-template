import { onAjaxContentLoaded } from './generic/eventing';
import { getCopyOfObj } from './utils/getCopyOfObj';
import Collection from './generic/collection';
import { Swiper, Navigation, Pagination, EffectFade, Controller, Keyboard } from 'swiper';
import 'swiper/css/bundle';
import { mq } from '../app';
import { isMedia } from './utils/isMedia';
import { bubble } from './utils/bubble'

Swiper.use([Navigation, Pagination, EffectFade, Controller, Keyboard]);

export const instance = '[data-js-slider]';

export const els = {
  instance,
  container: '.swiper',
  slide: '.swiper-slide',
  counterCurrent: '[data-js-slider-counter-current]',
  counterTotal: '[data-js-slider-counter-total]',
};

const classStates = {
  transition: 'is-transition',
  disabled: 'is-disabled',
};

export const bubbles = {
  sliderInit: 'slider::init',
  sliderChange: 'slider::change',
}

const defaultFns = {
  init() {
    bubble(this.wrapperEl.parentNode, bubbles.sliderInit);
  },
  slideChange() {
    bubble(this.wrapperEl.parentNode, bubbles.sliderChange);
    this.el.closest(els.instance).setAttribute(attrs.slideNumber, this.activeIndex);
  },
  slideChangeTransitionStart() {
    this.el.closest(els.instance).classList.add(classStates.transition);
  },
  slideChangeTransitionEnd() {
    this.el.closest(els.instance).classList.remove(classStates.transition);
  },
};

const defaultParams = {
  slidesPerView: 'auto',
  watchSlidesProgress: true,
  waitForTransition: true,
  followFinger: false,
  preventInteractionOnTransition: true,
  preventClicks: true,
  roundLengths: true,
  touchRatio: .2,
  preloadImages: false,
  updateOnImagesReady: false,
  noSwipingClass: classStates.disabled,
  uniqueNavElements: false,
  navigation: false,
  pagination: false,
  on: defaultFns,
  requiredMediaQuery: false,
};

export const attrs = {
  slideNumber: 'data-js-slider-current-slide',
  multipleInstance: 'data-js-slider-instance'
};

const paginationCfg = {
  type: 'bullets',
  bulletElement: 'button',
  bulletClass: 'slider-pagination__btn',
  bulletActiveClass: 'is-active',
  clickable: true,
};

const counterFns = {
  ...defaultParams.on,
  init() {
    bubble(this.wrapperEl.parentNode, bubbles.sliderInit);
    this.el.closest(els.instance).querySelector(els.counterTotal).textContent = this.slides.length;
  },
  slideChange() {
    bubble(this.wrapperEl.parentNode, bubbles.sliderChange);
    this.el.closest(els.instance).classList.remove(classStates.transition);
    this.el.closest(els.instance).querySelector(els.counterCurrent).textContent = this.activeIndex + 1;
  },
};

export class Slider {
  constructor(sliderDOMElem, options) {
    this.instance = sliderDOMElem;
    this.parentContainer = this.instance.closest(els.instance);
    this.params = getCopyOfObj(options);
    this.sliderDOMElem = sliderDOMElem
    if (this.parentContainer) {
      if (this.parentContainer.hasAttribute(attrs.multipleInstance)) {
        const {pagination, navigation, scrollbar} = this.params;
        if (pagination) {
          this.params.pagination = {
            ...pagination,
            el: this.getUniqueInstanceNode(pagination.el),
          };
        }
        if (navigation) {
          this.params.navigation = {
            ...navigation,
            prevEl: this.getUniqueInstanceNode(navigation.prevEl),
            nextEl: this.getUniqueInstanceNode(navigation.nextEl)
          };
        }
        if (scrollbar) {
          this.params.scrollbar = {
            ...scrollbar,
            el: this.getUniqueInstanceNode(scrollbar.el),
          };
        }
      }
    } else {
      console.debug(`Missed parent attr "${els.instance}" in slider: `, this.instance);
    }
    if (this.params.requiredMediaQuery) {
      this.manageSliderInitialization();
      this.createDynamicSliderInitialization();
    } else {
      this.createSlider();
    }
  }

  createSlider() {
    this.swiperInstance = new Swiper(this.sliderDOMElem, this.params);
  }

  manageSliderInitialization() {
    if (isMedia(this.params.requiredMediaQuery)) {
      if (!this.instance.classList.contains('swiper-initialized')) {
        this.createSlider();
      }
    } else if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
    }
  }

  createDynamicSliderInitialization() {
    const mediaQuery = window.matchMedia(this.params.requiredMediaQuery);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', () => this.manageSliderInitialization());
    } else {
      // Deprecated 'MediaQueryList' API, <Safari 14, IE, <Edge 16
      mediaQuery.addListener(() => this.manageSliderInitialization());
    }
  }

  getUniqueInstanceNode(paginationSelector) {
    let selector = paginationSelector.trim();
    const parent = `[${attrs.multipleInstance}="${this.parentContainer.getAttribute(attrs.multipleInstance)}"]`;
    const splitSelector = selector.split(' ');
    if (splitSelector.length > 1) {
      selector = splitSelector.pop();
    }
    return document.querySelector(`${parent} ${selector}`);
  }
}

export class SlidersCollection extends Collection {
  constructor() {
    super();
    this.sliders = [
      {
        selector: '.slider-gallery__slider .swiper',
        options: {
          ...defaultParams, // use this to add default params and overwrite it
          slidesPerView: 1,
          navigation: {
            prevEl: '.slider-gallery__slider .slider-buttons__btn--prev',
            nextEl: '.slider-gallery__slider .slider-buttons__btn--next'
          },
          pagination: {
            ...paginationCfg,
            el: '.slider-gallery .slider-pagination',
          },
          speed: 500,
          on: counterFns,
          breakpoints: {
            1025: {
              allowTouchMove: false,
            },
          },
        }
      },
      {
        selector: '.slider-gallery__description-slider .swiper',
        options: {
          ...defaultParams, // use this to add default params and overwrite it
          slidesPerView: 1,
          speed: 500,
          autoHeight: true,
          breakpoints: {
            1025: {
              allowTouchMove: false,
            },
          },
        }
      },
      {
        selector: '.tabs-nav__slider .swiper',
        options: {
          ...defaultParams,
          requiredMediaQuery: mq.tabletXsAbove,
          slidesPerView: 'auto',
          navigation: {
            prevEl: '.tabs-nav__slider .slider-buttons__btn--prev',
            nextEl: '.tabs-nav__slider .slider-buttons__btn--next'
          },
          speed: 200,
          breakpoints: {
            1025: {
              allowTouchMove: false,
            },
          },
        }
      },
      {
        'selector': '.hero__slider .swiper',
        'options': {
          ...defaultParams,
          loop: true,
          navigation: {
            prevEl: '.hero__slider .hero__navigation-btn--prev',
            nextEl: '.hero__slider .hero__navigation-btn--next'
          },
          pagination: {
            el: '.hero__slider .hero__fraction',
            type: 'fraction',
          },
          keyboard: {
            enabled: true,
          },
          effect: 'fade',
          fadeEffect: {
            crossFade: true
          },
        }
      },
      {
        'selector': '.brands-slider .swiper',
        'options': {
          ...defaultParams,
          spaceBetween: 4,
          navigation: {
            prevEl: '.brands-slider .slider-buttons__btn--prev',
            nextEl: '.brands-slider .slider-buttons__btn--next'
          },
          breakpoints: {
            1281: {
              spaceBetween: 0,
            }
          }
        }
      },
      {
        selector: '.calendar__period-slider .swiper',
        options: {
          ...defaultParams,
          speed: 500,
          slidesPerView: 'auto',
          slidesPerGroupAuto: true,
          slideToClickedSlide: true,
          centeredSlides: true,
          centeredSlidesBounds: true,
          navigation: {
            prevEl: '.calendar__period-slider .calendar__nav-btn--prev',
            nextEl: '.calendar__period-slider .calendar__nav-btn--next'
          },
          breakpoints: {
            1025: {
              allowTouchMove: false,
            },
          },
          on: {
            update() {
              console.debug(this);
            }
          }
        }
      },
      {
        selector: '.services-slider .swiper',
        options: {
          ...defaultParams,
          requiredMediaQuery: mq.tabletXsAbove,
          speed: 400,
          spaceBetween: 24,
          navigation: {
            prevEl: '.services-slider .slider-buttons__btn--prev',
            nextEl: '.services-slider .slider-buttons__btn--next'
          },
          breakpoints: {
            1161: {
              slidesPerView: 3,
              allowTouchMove: false,
            },
            1025: {
              slidesPerView: 2,
              allowTouchMove: false,
            },
            921: {
              slidesPerView: 2,
            },
          },
        }
      },
      {
        selector: '.services-selection__slider .swiper',
        options: {
          ...defaultParams,
          slidesPerView: 1,
          speed: 300,
          autoHeight: true,
          allowTouchMove: false,
          navigation: {
            prevEl: '.services-selection__slider .services-selection__btn--prev',
            nextEl: '.services-selection__slider .services-selection__btn--next'
          },
          on: {
            ...defaultParams.on,
            init() {
              bubble(this.wrapperEl.parentNode, bubbles.sliderInit);
              this.updateAutoHeight(0);
            },
          },
        }
      },
      {
        selector: '.sponsors-slider .swiper',
        options: {
          ...defaultParams,
          speed: 400,
          navigation: {
            prevEl: '.sponsors-slider .slider-buttons__btn--prev',
            nextEl: '.sponsors-slider .slider-buttons__btn--next'
          },
          breakpoints: {
            1440: {
              slidesPerView: 4,
              spaceBetween: 24,
              allowTouchMove: false,
            },
            1025: {
              slidesPerView: 3,
              spaceBetween: 24,
              allowTouchMove: false,
            },
            921: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            581: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            0: {
              slidesPerView: 1,
              spaceBetween: 16,
            },
          },
        }
      },
      {
        selector: '.video-materials-slider .swiper',
        options: {
          ...defaultParams,
          speed: 400,
          spaceBetween: 24,
          navigation: {
            prevEl: '.video-materials-slider .slider-buttons__btn--prev',
            nextEl: '.video-materials-slider .slider-buttons__btn--next'
          },
          breakpoints: {
            1161: {
              slidesPerView: 3,
              allowTouchMove: false,
            },
            1025: {
              slidesPerView: 2,
              allowTouchMove: false,
            },
            921: {
              slidesPerView: 2,
            },
          },
        }
      },
    ];
    this.init();
    this.bindEvents();
  }

  init(context = document) {
    this.sliders.forEach((slider) => {
      const sliders = context.querySelectorAll(slider.selector);
      sliders.forEach((sliderDOMElem, i) => {
        if (typeof sliderDOMElem.swiper === 'undefined') {
          if (sliders.length > 1) {
            const parentContainer = sliderDOMElem.closest(els.instance);
            if (parentContainer) {
              parentContainer.setAttribute(attrs.multipleInstance, i.toString());
            }
          }
          this.collection = new Slider(sliderDOMElem, slider.options);
        } else {
          sliderDOMElem.swiper.update();
        }
      });
    });
  }

  bindEvents() {
    onAjaxContentLoaded((e) => {
      this.init(e.detail.content);
    });
  }
}
