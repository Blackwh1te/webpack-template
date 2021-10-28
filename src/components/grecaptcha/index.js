import './style.pcss';
import Collection from "../../js/generic/collection";
import { onAjaxContentLoaded } from '../../js/generic/eventing'
import { bubble } from '../../js/utils/bubble'
import { getJS } from '../../js/utils/getJS'
import { getCfg } from "../../js/utils/getCfg";
import { stateClasses as inputStateClasses } from '../../js/forms/forms'

export let state = {
  isScriptLoaded: false,
  isScriptLoading: false,
  isAPIReady: false
}

export const instance = '[data-js-google-captcha]';
export const name = 'g-recaptcha-response';
export const bubbles = {
  ready: 'googleCaptchaReady',
  render: 'googleCaptchaRender',
  reset: 'googleCaptchaReset',
  verify: 'googleCaptchaVerify',
  expire: 'googleCaptchaExpire',
  error: 'googleCaptchaError'
}

export class GoogleCaptcha {

  els = {
    instance
  }

  stateClasses = {
    rendered: 'is-rendered',
    expired: 'is-expired',
    error: 'is-error',
    verify: 'is-verify'
  }

  defaultCfg = {
    'sitekey': window.App.googleCaptchaKey || '0',
    'theme': 'dark',
    'callback': (response) => { this.handleVerify(response) },
    'size': 'normal',
    'error-callback': this.handleError,
    'expired-callback': this.handleExpired
  }

  constructor(instance) {
    if(state.isAPIReady) {
      this.instance = instance;
      this.state = {
        render: false,
        ready: false,
        expired: false,
        error: false,
        verify: false
      }
      if(!this.state.render) {
        this.cfg = getCfg(this.instance, this.els.instance, this.defaultCfg);
        this.bindEvents();
      } else if(App.debug) {
        console.debug('Google Captcha object are not defined or already rendered: ', instance);
      }
    }
  }

  handleError() {
    this.instance.classList.add(this.stateClasses.error);
    this.instance.classList.remove(this.stateClasses.verify, inputStateClasses.valid);
    this.state = {
      ...this.state,
      error: true,
      ready: false,
      verify: false
    }
    bubble(document, bubbles.error, this.instance);
  }

  handleExpired() {
    this.instance.classList.add(this.stateClasses.expired);
    this.instance.classList.remove(this.stateClasses.verify, inputStateClasses.valid);
    this.state = {
      ...this.state,
      ready: false,
      verify: false,
      expired: true
    }

    bubble(document, bubbles.expire, this.instance);
  }

  handleVerify(response) {
    this.instance.classList.add(this.stateClasses.verify, inputStateClasses.valid);
    this.instance.classList.remove(inputStateClasses.invalid);
    this.state.verify = true;
    bubble(document, bubbles.verify, { el: this.instance, response, states: this.state });
  }

  render() {
    window.grecaptcha.render(
      this.instance,
      this.cfg
    );
    this.instance.classList.add(this.stateClasses.rendered);
    this.state.render = true;
    window.grecaptcha.ready(() => {
      bubble(document, bubbles.render, { el: this.instance, states: this.state });
    });
  }

  getResponse() {
    return window.grecaptha.getResponse(this.instance);
  }

  reset() {
    window.grecaptcha.ready(() => {
      window.grecaptcha.reset(this.instance);
    });
    this.state.verify = false;
    this.instance.classList.remove(this.stateClasses.verify);
    bubble(document, bubbles.reset, this.instance);
  }

  handleReady() {
    this.state.ready = true;
    this.render();
  }

  bindEvents() {
    window.grecaptcha.ready(() => {
      this.handleReady();
    });
  }

}

class GoogleCaptchaApiManager {

  static apiUrl = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=bubbleCaptchaAPIReady';

  static instance = null;

  constructor() {
    if(GoogleCaptchaApiManager.instance) {
      return GoogleCaptchaApiManager.instance;
    }
    window.bubbleCaptchaAPIReady = () => GoogleCaptchaApiManager.handleScriptReady();
    GoogleCaptchaApiManager.instance = this;
  }

  static handleScriptReady() {
    state.isAPIReady = true;
    bubble(document, bubbles.ready);
    if(window.App.debug) {
      console.debug('Google Captcha API are ready');
    }
  }

  static async load() {
    if(state.isScriptLoaded) {
      GoogleCaptchaApiManager.handleScriptReady();
    } else if(!this.isScriptLoading) {
      this.isScriptLoading = true;
      return await getJS({
        defer: true,
        src: GoogleCaptchaApiManager.apiUrl
      });
    }
  }

  static handleScriptError(script) {
    console.error('Google Captcha API are not loaded: ', script);
  }

  static handleScriptLoad() {
    state = {
      ...state,
      isScriptLoaded: true,
      isScriptLoading: false
    }
  }

}

export class GoogleCaptchaCollection extends Collection {

  constructor() {
    new GoogleCaptchaApiManager();
    super(instance, GoogleCaptcha);
    this.bindEvents();
    this.init();
  }

  getByDOMElement(DOMElement) {
    return this.collection.find(item => item.instance === DOMElement && state.isAPIReady);
  }

  loadAPI() {
    if(!state.isScriptLoading) {
      GoogleCaptchaApiManager.load().then((script) => {
        GoogleCaptchaApiManager.handleScriptLoad(script);
      }, (script) => {
        GoogleCaptchaApiManager.handleScriptError(script);
      });
    }
  }

  init(context = document) {
    const items = context.querySelectorAll(instance);
    if(items.length) {
      if(state.isAPIReady) {
        items.forEach((el) => {
          this.collection = new GoogleCaptcha(el);
        });
      } else {
        this.loadAPI();
      }
    }
  }

  bindEvents() {
    document.addEventListener(bubbles.ready, () => {
      this.init();
    });
    onAjaxContentLoaded((e) => {
      this.init(e.detail.content);
    });
  }

}

