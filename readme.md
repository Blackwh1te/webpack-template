## **Webpack-template 1.0.0**

**Запуск dev-сборки:**
`npm start`

**Запуск build-сборки:**
`npm run build`

**Примечания:**
1) Для корректной работы необходим NodeJS 15+.
2) Данная сборка не поддерживает IE11 и любые иные старые браузеры.

**Работа с формами:**
 
Для включения обработки форм к тегу добавить атрибут ```data-js-form``` и ```novalidate```:
```
<form data-js-form='{ "param": "value" }' novalidate></form>
```

В атрибуте ```data-js-form``` можно указать следующие параметры:

```
{
    isLiveValidation: false, // валидация в лайв-режиме, сразу после заполнения поля
    isUseFetch: true, // отправка при помощи fetch либо обычный браузерный post
    isResetAfterSuccess: false, // очистка данных формы после успешной отправки
    isClearErrorsBeforeSend: true, // очистка ошибок перед отправкой формы
    isReturnJSON: true, // ожидание json-ответа от сервера
    url: false, // адрес для отправки формы (приоритетнее атрибута action)
    successModalId: '#modal-success', // id модального окна об успешной отправке формы
    errorModalId: '#modal-error', // id модального окна об ошибке отправке формы
    method: 'POST',  // метод отправки данных
    isShowModals: true, // обработка модальных окон в ответе от сервера
    validateOnlySelector: false, // селектор для валидации только опредленных частей формы
    isSerializeDisabledInputs: true, // включение в данные input[disabled] при отправке формы
    isSerializeReadOnlyInputs: true, // включение в данные input[readonly] при отправке формы
    isConfirmBeforeSubmit: false // вывод модального окна о подтверждении перед отправкой
    isShowErrorsAsModals: true // вывод ошибок как модальных окон, а не вставка в тело формы
    isIgnoreAutoSend: false // не отправлять форму после успешной валидации (если у вас кастомный обработчик отправки)
}
```


**Обработка ответов с форм:**

```
{ 
  file: 'file-url.php' // ссылка на скачивание файла
  reload: true // обновление страницы
  redirect: '/new-url.php' // редирект на новую страницу
  errors: [ 'html string', 'html string' ] // массив ошибок
  innerHTML: 'html string' // вставка контента в форму
  appendElements: [ // добавление элементов
    {
      to: ".selector-name",
      html: "html string"
    }
  ],
  replaceElements: [ // замена элементов
    {
      selector: ".selector-name",
      html: "html string"
    }
  ],
  hideElements: [ // скрытие элементов
    ".selector-name"
  ]
  modals: [ 'html string', 'html string' ] // массив модальных окон
}
```



**Работа с модальными окнами:**

Все модальные окна должны иметь уникальный ```id```, класс ```.modal``` и атрибут ```data-js-modal```, в который можно передать следующие параметры:

```
  redirectAfterClose: false // ссылка на которую будет перенаправлен пользователь при закрытии окна
  reloadAfterClose: false // обновление страницы при закрытии окна
  bubbleAfterClose: false // всплытие при закрытии окна с указанным событием (принимает String)
```

Для вызова модального окна к элементу следует добавить атрибут ```data-js-modal-open```, куда в JSON-формате добавить ключ ```src``` с нужным значением, например, инлайн-хешем или ссылкой.



**Решение проблем:**

Если что-то не запускается, первым делом выполнить `npm cache clean --force`, удалить папку `/node_modules/` и сделать `npm i` заново. Проверить, чтобы в JS-файлах не было сторонних `import`, а все названия файлов были *в нижнем регистре*.
