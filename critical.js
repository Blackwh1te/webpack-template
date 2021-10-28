const critical = require('critical')
const fs = require('fs')

critical.generate({
  base: __dirname + '/build',
  src: 'main.html',
  target: 'main.html',
  width: 1920,
  height: 1080,
  inline: false,
  minify: true,
  extract: false
}).then(function (result) {
  let mainPage = __dirname + '/build/main.html'
  fs.readFile(mainPage, 'utf8', (err, data) => {
    if (err) {
      return console.log(err)
    }
    data = data.replace(/\<\/head>/g, `<style id="critical-css">${result.css}</style></head>`)
    fs.writeFile(mainPage, data, 'utf8', (err) => {
      console.debug(err ? err : 'Critical CSS inserted to head.')
    })
  })
})
