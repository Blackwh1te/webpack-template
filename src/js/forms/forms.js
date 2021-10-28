import IMask from 'imask';
import FormValidation from './formValidation';
import FormSend from './formSend';
import {onAjaxContentLoaded} from '../generic/eventing';
import {getAttr} from '../utils/getAttr';
import {parseJSON} from '../utils/parseJSON';
import {bubble} from '../utils/bubble';

export const bubbles = {
  formValid: 'form::valid',
  formSuccess: 'form::successful',
  formError: 'form::error',
  formReplaceNodes: 'form::replaceNodes',
  formAppendNodes: 'form::appendNodes',
  formRemoveNodes: 'form::removeNodes',
  inputAppearedError: 'input:appearedError',
  inputRemovedError: 'input:removedError'
};

export const els = {
  form: '[data-js-form]',
  errorsList: '[data-js-form-errors]',
  formInput: '[data-js-input-required]',
  formBlockError: '[data-js-form-error-msg]',
  formInputError: '[data-js-input-error-text]',
  formInputPlaceholder: '[data-js-input-placeholder]',
  formBlock: '.form__block',
  formRow: '.form__row',
  formCol: '.form__col',
  customCfg: '[data-js-form-cfg]',
  inputs: 'input, select, textarea',
  submitAppend: '[data-js-form-append-params]',
  skipConfirmation: '[data-js-form-skip-confirmation]',
};

const defaultCfg = {
  isLiveValidation: false, // true for validation after inputs blur event
  isUseFetch: true, // false for direct sending
  isShowLoader: false, // true for showing loader
  isResetAfterSuccess: false, // false for keeping data after sending
  isClearErrorsBeforeSend: true, // false for keeping errors before sending
  isReturnJSON: true, // false for returning text
  url: false,
  successModalId: '#modal-success', // id of success modal window
  errorModalId: '#modal-error', // id of error modal window
  method: 'POST',  // sending method,
  cache: 'default', // fetch cache param,
  errorsListLayout: `<div ${getAttr(els.errorsList)} class="form__row form__row--large-offset form__row--errors"></div>`, // errors list wrapper tpl
  errorsListPosition: 'afterbegin', // see insertAdjacentElement() positions
  errorsListItemLayout: (errorText) => {
    return `<div class="form-error" title="${errorText}"><span>${errorText}</span></div>`;
  },
  isShowModals: true,
  validateOnlySelector: false,
  isIgnoreAutoSend: false,
  successTimeOut: 0,
  isSerializeDisabledInputs: true,
  isSerializeReadOnlyInputs: true,
  isConfirmBeforeSubmit: false,
  handler: null,
  isShowErrorsAsModals: true
};

export const stateClasses = {
  passwordShown: 'is-password-visible',
  hidden: 'is-hidden',
  invalid: 'is-invalid',
  valid: 'is-valid',
  loading: 'is-loading',
  passwordWarn: 'is-active',
  inactive: 'is-inactive',
};

export const masks = [
  {
    selector: '.input-phone',
    options: {
      mask: '+{7} (000) 000-00-00'
    }
  },
  {
    selector: '[data-js-mask-date]',
    options: {
      mask: Date
    }
  },
  {
    selector: '[data-js-mask-date-period]',
    options: {
      mask: 'from - to',
      blocks: {
        from: {
          mask: Date,
        },
        to: {
          mask: Date,
        }
      }
    }
  },
];

export default class Forms {

  FormValidation = new FormValidation();

  FormSend = new FormSend();

  constructor() {
    defaultCfg.url = (typeof window.App.tplPath !== 'undefined') ? `${window.App.tplPath}/ajax/form.php` : false;
    this.appendMasks();
    this.bindEvents();
  }

  static getFormCfg(form) {
    const isCustomCfg = form.matches(els.customCfg);
    return {
      form,
      ...defaultCfg,
      ...parseJSON(form.getAttribute(getAttr(
        (isCustomCfg) ? els.customCfg : els.form
      ))),
      handler: (typeof form.handler === 'undefined') ? null : form.handler
    };
  }

  static updateMaskOptions(input, options = {}, isUpdateValue = true) {
    const maskInstance = (typeof input.iMask !== 'undefined') ? input.iMask : false;
    if (maskInstance) {
      maskInstance.updateOptions(options);
      if (isUpdateValue) {
        Forms.updateMaskValue(input, input.value);
      }
    } else {
      [...input.classList].forEach((className) => {
        masks.forEach((maskParam) => {
          if (className === maskParam.selector.substring(1)) {
            Forms.createMaskInstance(input, {
              ...maskParam.options,
              ...options
            });
          }
        });
      });
    }
  }

  static createMaskInstance(input, options) {
    if (typeof input.iMask === 'undefined') {
      input.iMask = new IMask(input, options);
      if (options.on) {
        Object.entries(options.on).forEach((pair) => {
          input.addEventListener(pair[0], (e) => pair[1](e, input.iMask));
        });
      }
    } else {
      this.updateMaskValue(input, input.value);
    }
  }

  static getMaskInstance(input) {
    return (typeof input.iMask === 'undefined') ? false : input.iMask;
  }

  appendMasks(context = document) {
    masks.forEach((maskObject) => {
      context.querySelectorAll(maskObject.selector).forEach((input) => {
        Forms.createMaskInstance(input, maskObject.options);
      });
    });
  }

  handleAjaxContentLoaded(e) {
    this.appendMasks(e.detail.content);
  }

  handleClick(e) {
    const {target} = e;
    if (target.matches('[type="submit"]')) {
      const fn = (form) => {
        e.preventDefault();
        form.handler = target;
        bubble(form, 'submit');
      };
      const closestForm = target.closest(els.form);
      if (closestForm) {
        fn(closestForm);
      } else if (target.hasAttribute('form')) {
        const delegatedForm = document.getElementById(target.getAttribute('form'));
        fn(delegatedForm);
      }
    }
  }

  static updateMaskValue(input, value) {
    const maskInstance = Forms.getMaskInstance(input);
    if (maskInstance) {
      if (value === '') {
        maskInstance.masked.reset();
        maskInstance.typedValue = '';
      } else if (!value) {
        maskInstance.updateValue();
        maskInstance.value = input.value;
      } else {
        maskInstance.updateValue();
        maskInstance.value = value.toString();
      }
    }
  }

  bindEvents() {
    onAjaxContentLoaded((e) => {
      this.handleAjaxContentLoaded(e);
    });
    document.addEventListener('click', (e) => {
      this.handleClick(e);
    });
  }
}
