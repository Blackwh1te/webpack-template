import {getLocaleMsg} from '../locales';
import {getAttr} from '../utils/getAttr';
import {bubble} from '../utils/bubble';
import {isNode} from '../utils/isNode';
import Forms, {els as formEls, stateClasses, bubbles} from './forms';
import {instance as captchaInstance} from '../../components/grecaptcha';
import {els as fileAttachEls} from '../../components/file-attach';

export default class FormValidation {

  constructor() {
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('submit', (e) => {
      this.handleFormSubmit(e);
    });
    document.addEventListener('blur', (e) => {
      this.handleInputBlur(e);
    }, true);
  }

  handleFormSubmit(e) {
    if (e.target.matches(formEls.form)) {
      e.preventDefault();
      FormValidation.validate(e.target);
      return false;
    }
  }

  handleInputBlur(e) {
    const {target} = e;
    if (target.nodeType !== 9 && target.matches(formEls.formInput)) {
      const form = target.closest(formEls.form);
      if (form) {
        const cfg = Forms.getFormCfg(form);
        if (cfg.isLiveValidation) {
          FormValidation.validate(form, target);
        }
      }
    }
  }

  static validateGreCaptcha(textarea) {
    const instance = App.GoogleCaptchaCollection.getByDOMElement(textarea.closest(captchaInstance));
    const isValid = (window.App.debug) ? true : instance.states.verify;
    if (isValid) {
      instance.instance.classList.add(stateClasses.valid);
      instance.instance.classList.remove(stateClasses.invalid);
    } else {
      instance.instance.classList.remove(stateClasses.valid);
      instance.instance.classList.add(stateClasses.invalid);
    }
    return isValid;
  }

  static updateCaptcha(form) {
    const captcha = form.querySelector(captchaInstance);
    if (captcha) {
      const instance = App.GoogleCaptchaCollection.getByDOMElement(captcha);
      if (instance && instance.states.render) {
        instance.reset();
      }
    }
  }

  static validate(form, inputs = false, isBubble = true) {
    const valid = [];
    const cfg = Forms.getFormCfg(form);
    const validateEl = (cfg.validateOnlySelector) ? form.querySelector(cfg.validateOnlySelector) : form;
    const greCaptchaTextArea = `${captchaInstance} textarea`;

    let inputsToValidate = inputs || validateEl.querySelectorAll(`${formEls.formInput}, ${greCaptchaTextArea}`);

    if (isNode(inputsToValidate)) {
      inputsToValidate = [inputsToValidate];
    }

    inputsToValidate.forEach((input) => {
      const isGreCaptcha = input.matches(greCaptchaTextArea);
      const type = (isGreCaptcha) ? 'greCaptcha' : (input.getAttribute(getAttr(formEls.formInput)) || 'text');
      const val = input.value;
      const formBlock = input.closest(formEls.formBlock) || input.parentNode;
      const errorBlock = (formBlock) ? formBlock.querySelector(formEls.formBlockError) : null;
      const errorMsg = (input.hasAttribute(getAttr(formEls.formInputError))) ? (input.getAttribute(getAttr(formEls.formInputError))) : null;
      input.classList.remove(stateClasses.invalid);
      if (errorBlock) {
        errorBlock.innerHTML = '';
      }
      if (val.length || type === 'checkbox' || type === 'radio' || type === 'file' || input.matches(greCaptchaTextArea)) {
        switch (type) {
          case 'greCaptcha':
            valid.push(!!FormValidation.validateGreCaptcha(input));
            break;
          case 'email':
            valid.push(FormValidation.validateEmail(val)
              ? FormValidation.valid(input)
              : FormValidation.invalid(input, getLocaleMsg('INVALID_FIELD'))
            );
            break;
          case 'phone':
            valid.push(FormValidation.validatePhone(val)
              ? FormValidation.valid(input)
              : FormValidation.invalid(input, getLocaleMsg('INVALID_FIELD'))
            );
            break;
          case 'checkbox':
            valid.push(FormValidation.validateCheckbox(input)
              ? FormValidation.valid(input)
              : FormValidation.invalid(input)
            );
            break;
          case 'radio':
            valid.push(FormValidation.validateRadio(input)
              ? FormValidation.valid(input)
              : FormValidation.invalid(input)
            );
            break;
          case 'file':
            valid.push(FormValidation.validateFile(input)
              ? FormValidation.valid(input)
              : FormValidation.invalid(input, getLocaleMsg('EMPTY_FILE'))
            );
            break;
          default:
            valid.push(FormValidation.validateText(input)
              ? FormValidation.valid(input)
              : FormValidation.invalid(input, getLocaleMsg('INVALID_FIELD'))
            );
            break;
        }
      } else {
        valid.push(FormValidation.invalid(input, errorMsg));
      }
    });

    if (!inputs) {
      let validCount = 0;
      valid.forEach((item) => {
        item ? validCount++ : null;
      });
      if (valid.length === validCount && isBubble) {
        bubble(form, bubbles.formValid);
      }
      return valid.length === validCount;
    }
  }

  static validateEmail(email) {
    const re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  static validatePhone(phone) {
    const cleanPhone = phone.replace(/\s/g, '');
    const re = /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/;
    return re.test(cleanPhone) && (cleanPhone.length === 16);
  }

  static validateRadio(radio) {
    const {name} = radio;
    return (name) ? [...document.querySelectorAll(`[name="${name}"]`)].some((item) => item.checked) : false;
  }

  static validateFile(input) {
    const isInputValid = !!(input.files.length && input.value);
    const instance = input.closest(fileAttachEls.instance);
    if (instance) {
      const inst = App.FileAttachCollection.getByDOMElement(instance);
      return inst ? !!inst.files.length : isInputValid;
    } else {
      return isInputValid;
    }
  }

  static validateCheckbox(checkbox) {
    return checkbox.checked;
  }

  static validateText(input) {
    return !!(input.value.length);
  }

  static manageInputError(input, message) {
    const formBlock = input.closest(formEls.formBlock) || input.parentNode;
    if (formBlock) {
      const errorBlock = formBlock.querySelector(formEls.formBlockError);
      if (errorBlock) {
        errorBlock.innerHTML = (message) ? `<span>${message}</span>` : '';
      }
    }
  }

  static invalid(input, errorMessage) {
    const message = errorMessage || getLocaleMsg('EMPTY_FIELD');
    FormValidation.manageInputError(input, message);
    if (input.matches(fileAttachEls.input)) {
      const fileContainer = input.closest(fileAttachEls.instance);
      if (fileContainer) {
        fileContainer.classList.add(stateClasses.invalid);
        fileContainer.classList.remove(stateClasses.valid);
      }
    }
    input.classList.remove(stateClasses.valid);
    input.classList.add(stateClasses.invalid);
    bubble(input, bubbles.inputAppearedError);
    return false;
  }

  static valid(input) {
    FormValidation.manageInputError(input, false);
    const fileContainer = input.closest(fileAttachEls.instance);
    switch (true) {
      case input.matches(fileAttachEls.input):
        if (fileContainer) {
          fileContainer.classList.remove(stateClasses.invalid);
          fileContainer.classList.add(stateClasses.valid);
        }
        break;
      default:
        input.classList.remove(stateClasses.invalid);
        input.classList.add(stateClasses.valid);
        break;
    }
    bubble(input, bubbles.inputRemovedError);
    return true;
  }
}
