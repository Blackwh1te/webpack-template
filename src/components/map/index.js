import './style.pcss'
import ymaps from 'ymaps'
import {getCfg} from '../../js/utils/getCfg'
import Collection from '../../js/generic/collection'

export const instance = '[data-js-map]'

export class Map {
  els = {
    instance
  }

  stateClasses = {
    isUnlocked: 'is-unlocked',
  }

  defaultCfg = {
    zoom: 15,
    controls: [
      'zoomControl',
    ]
  }

  constructor(instance) {
    this.instance = instance
    if (!this.instance) return
    this.cfg = getCfg(this.instance, this.els.instance, this.defaultCfg)
    this.map = {}
    this.apiKey = App.yandexMapKey
    this.lang = App.lang.toLowerCase() === 'ru' ? 'ru_RU' : 'en_US'
    this.init()
    this.bindEvents()
  }

  initMap() {
    this.map = new this.yMap.Map(this.instance, this.cfg)
  }

  createPlacemark(item) {
    this.myPlacemark = new this.yMap.Placemark(
      item.coords,
      {
        balloonContent: item.iconContent
      },
      {
        iconColor: '#ed1c24'
      }
    )
    this.map.geoObjects.add(this.myPlacemark)
  }

  handleClick() {
    this.instance.classList.add(this.stateClasses.isUnlocked)
  }

  handleMouseLeave() {
    this.instance.classList.remove(this.stateClasses.isUnlocked)
  }

  init() {
    ymaps.load(`https://api-maps.yandex.ru/2.1/?apikey=${this.apiKey}&lang=${this.lang}`).then(maps => {
      this.yMap = maps
      this.initMap()
      if (this.cfg.placemark) {
        this.cfg.placemark.forEach(item => {
          this.createPlacemark(item)
        })
      }
    })
  }

  bindEvents() {
    this.instance.addEventListener('click', () => this.handleClick())
    this.instance.addEventListener('mouseleave', () => this.handleMouseLeave())
  }
}

export class MapCollection extends Collection {
  constructor() {
    super(instance, Map)
  }
}
