
import { getCurrentLang } from '../utils/getCurrentLang'
import { getByPropFromObj } from '../utils/getByPropFromObj'

export const locales = {
  modals: {
      "CLOSE": {
        ru: "Закрыть",
        en: "Close"
      },
      "NEXT": {
        ru: "Далее",
        en: "Next"
      },
      "PREV": {
        ru: "Назад",
        en: "Previous"
      },
      "MODAL": {
        ru: "Вы можете закрыть окно по кнопке ESC",
        en: "You can close this modal by pressing the ESC button"
      },
      "ERROR": {
        ru: "Что-то пошло не так, попробуйте позже x(",
        en: "Something went wrong, please try again later x("
      },
      "IMAGE_ERROR": {
        ru: "Ошибка загрузки картинки x(",
        en: "Image loading error x("
      },
      "ELEMENT_NOT_FOUND": {
        ru: "Ошибка загрузки элемента x(",
        en: "Element loading error x("
      },
      "AJAX_NOT_FOUND": {
        ru: "404: ошибка загрузки контента x(",
        en: "404: content loading error x("
      },
      "AJAX_FORBIDDEN": {
        ru: "403: Ошибка загрузки контента x(",
        en: "403: content loading error x("
      },
      "IFRAME_ERROR": {
        ru: "Ошибка загрузки фрейма x(",
        en: "Frame loading error x("
      },
  },
  forms: {
      "NETWORK_ERROR": {
        ru:  "Ошибка получения данных с сервера. Попробуйте позже.",
        en: "Error retrieving data from the server. Try again later."
      },
      "FILE_UPLOAD_ERROR_FORMAT": {
        ru: "Неверный формат файла",
        en: "Invalid file format"
      },
      "FILE_UPLOAD_ERROR_SIZE": {
        ru: "Слишком большой файл",
        en: "File too large"
      },
      "FILE_UPLOAD_ERROR_MAX": {
        ru: "Загружено максимальное количество файлов",
        en: "Maximum number of files uploaded"
      },
      "EMPTY_FIELD": {
        ru: "Заполните поле",
        en: "Fill in the field"
      },
      "EMPTY_FILE": {
        ru: "Прикрепите файл",
        en: "Attach a file"
      },
      "INVALID_FIELD": {
        ru:  "Неверно",
        en:  "Invalid"
      },
      "FILE_SIZE_BYTE": {
        ru: "Байт",
        en: "Byte"
      },
      "FILE_SIZE_KB": {
        ru: "Кб",
        en: "Kb"
      },
      "FILE_SIZE_MB": {
        ru: "Мб",
        en: "Mb"
      },
      "FILE_SIZE_GB": {
        ru: "Гб",
        en: "Gb"
      },
      "FILE_SIZE_TB": {
        ru: "Tб",
        en: "Tb"
      },
  }
}

/**
 * Получение сообщения в зависимости от языка сайта
 * @param key{String} - ключ
 * @param lang{String=} - наименование языка
 * @return String
 */
export const getLocaleMsg = (key, lang = getCurrentLang()) => {
  const msg = getByPropFromObj(locales, key);
  if(msg.length && msg[0].hasOwnProperty(lang)) {
    return msg[0][lang];
  } else {
    console.debug(`Locale key '${key}' not found for lang '${lang}'`);
    return '';
  }
}
