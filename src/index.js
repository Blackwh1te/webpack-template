import Post from '@models/Post'
import './styles/styles.css'
import json from './assets/json.json'
import WebpackLogo from './assets/webpack-logo.png'
// import xml from './assets/data.xml'
import * as $ from 'jquery'

const post = new Post('Webpack Post Title', WebpackLogo)

console.debug('Post to String')
console.debug(post.toString())
console.debug('JSON:')
console.debug(json)
// console.debug(xml)

// $('body').html(post.toString())
