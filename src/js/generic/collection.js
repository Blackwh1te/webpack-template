/**
 * Класс для коллекций
 * Коллекция нужна для хранения экземпляров одного класса, получения/удаления этого экземпляра
 */

export const defaultCfg = {
  excludedSelector: '[data-js-observer-exclude]',
  observer: {
    attributes: false,
    childList: true,
    subtree: false
  },
  callbacks: {
    add: () => {
    },
    remove: () => {
    }
  }
}

export default class Collection {
  /**
   * Сама коллекция экземпляров
   * @type {Array}
   * @private
   */
  _collection = []

  /**
   * MutationObserver для отслеживания и удаления из коллекции динамически удаляемых экземпляров
   * @type{MutationObserver}
   */
  collectionObserver

  /**
   * Конфигурация для MutationObserver
   * @type {MutationObserverInit}
   */
  collectionObserverConfig = {
    attributes: false,
    childList: true,
    subtree: false
  }

  /**
   * Исключаемый из наблюдаения элемент
   * @type{String}
   */
  collectionObserverExcludedSelector = '[data-js-observer-exclude]'

  /**
   * Наблюдаемый элемент
   * @type{Element}
   */
  collectionObserverTarget = document.body

  /**
   * Селектор по которому отслеживается динамически изменяемый контент
   * @type{String}
   */
  collectionObserverInstance

  /**
   * Класс, экземпляр которого будет создан при появлении в DOM-дереве
   * @type{Class}
   */
  collectionObserverClass

  /**
   *
   * @param instance{String} - см. collectionObserverInstance
   * @param _class{Class} - см. collectionObserverClass
   */
  constructor(instance, _class) {
    this.collectionObserverInstance = instance
    this.collectionObserverClass = _class
    this.collectionObserve()
  }

  /**
   * Добавляет экземпляр в коллекцию. По-умолчанию проверяет, существует ли экземпляр с таким instance.
   * Если существует, то добавления не происходит (возможно, стоит что-то делать в таком случае)
   * @param newCollectionItem{Class}
   */
  set collection(newCollectionItem) {
    const itemInCollection = this.getByDOMElement(newCollectionItem.instance)
    if (!itemInCollection) {
      this._collection = [...this._collection, newCollectionItem]
    }
  }

  /**
   * Публичная коллекция
   * @return {Array}
   */
  get collection() {
    return this._collection
  }


  /**
   * Получает конфигурацию коллекции
   * @return {Object}
   */
  get config() {
    return defaultCfg
  }

  /**
   * Проверяет DOM-исключения для callback-наблюдателя
   * @return {Boolean}
   */
  isExcludedMutationRecord(mutationList) {
    return mutationList.some(({target}) => target.nodeType === 1 && target.closest(this.config.excludedSelector))
  }

  /**
   * Ищет внутри коллекции по DOM-элементу. У экзепляров класса должен быть параметр instance, по нему идет проверка
   * @param DOMElement{Element}
   * @returns {Class}
   */
  getByDOMElement(DOMElement) {
    return this.collection.find(item => item.instance === DOMElement)
  }

  /**
   * Удаление из коллекции по экземпляру класса
   * @param collectionItem{Class}
   * @param callback{function}
   */
  removeFromCollection(collectionItem, callback = this.config.callbacks.remove) {
    const collectionItemIndex = this.collection.indexOf(collectionItem)
    this._collection.splice(collectionItemIndex, 1)
    if (typeof callback === 'function') {
      callback(collectionItem)
    }
  }

  /**
   * Удаление из коллекции по DOMElement'у
   * @param DOMElement{Element}
   * @param callback{function}
   */
  removeFromCollectionByDOMElement(DOMElement, callback = this.config.callbacks.remove) {
    const collectionItemIndex = this.collection.findIndex(collectionItem => collectionItem.instance.isEqualNode(DOMElement))
    this._collection.splice(collectionItemIndex, 1)
    if (typeof callback === 'function') {
      callback(DOMElement)
    }
  }

  /**
   * Инициализириует MutationObserver и запускает наблюдение
   */
  collectionObserve() {
    this.collectionObserver = new MutationObserver(this.collectionObserveCallback.bind(this))
    this.collectionObserver.observe(this.collectionObserverTarget, this.collectionObserverConfig)
  }

  /**
   * Callback-наблюдатель
   * @param mutationsList{MutationRecord}
   * @param observer{MutationObserver}
   */
  collectionObserveCallback(mutationsList, observer) {
    if (!this.isExcludedMutationRecord(mutationsList)) {
      this.collectionObserveRemoving()
      this.collectionObserveAdding()
    }
  }

  /**
   * Метод проверяет присутствует ли DOMElement на странице после изменений
   * и в случае отсутствия удаляет его из коллекции
   */
  collectionObserveRemoving() {
    this.collection.forEach(collectionItem => {
      if (!this.collectionObserverTarget.contains(collectionItem.instance)) {
        this.removeFromCollection(collectionItem)
      }
    })
  }

  /**
   * Добавляет элемент в коллекцию
   * @param instance(Object}
   * @param callback{function}
   */
  addToCollection(instance, callback = this.config.callbacks.add) {
    const itemInCollection = this.getByDOMElement(instance)
    if (!itemInCollection && this.collectionObserverClass) {
      this.collection = new this.collectionObserverClass(instance)
      if (typeof callback === 'function') {
        callback(instance)
      }
    }
  }

  /**
   * Метод проверяет появился ли DOMElement на странице после изменений
   * и в случае его появления добавляет его в коллекцию
   */
  collectionObserveAdding() {
    if (this.collectionObserverInstance) {
      const instances = this.collectionObserverTarget.querySelectorAll(this.collectionObserverInstance)
      for (let instance of instances) {
        this.addToCollection(instance)
      }
    }
  }
}
